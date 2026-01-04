'use server';

import { getDb } from '@/db';
import { jobTracker, JobEntry, NewJobEntry } from '@/db/schema';
import { eq, lte, and, inArray, or, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Helper to add days to a date string
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Get today's date string
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export type FilterType = 'all' | 'followups' | 'waiting' | 'interviews' | 'ghosted' | 'archived';

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

export async function getEntries(
  filter: FilterType = 'all',
): Promise<JobEntry[]> {
  const db = getDb()
  const userId = await getUserId()
  const today = getToday()

  // Base condition: common for all active filters (they should NOT be archived)
  const isActive = eq(jobTracker.isArchived, 'false');

  switch (filter) {
    case 'followups':
      return await db
        .select()
        .from(jobTracker)
        .where(
          and(
            eq(jobTracker.userId, userId),
            isActive,
            eq(jobTracker.responseStatus, 'NoResponse'),
            or(
              inArray(jobTracker.opportunityType, ['ColdEmail', 'LinkedInDM']),
              lte(jobTracker.nextFollowupDate, today),
            ),
          ),
        )
        .orderBy(desc(jobTracker.createdAt))

    case 'waiting':
      return await db
        .select()
        .from(jobTracker)
        .where(
          and(
            eq(jobTracker.userId, userId),
            isActive,
            inArray(jobTracker.applicationStatus, [
              'Draft',
              'Applied',
              'UnderReview',
            ]),
          ),
        )
        .orderBy(desc(jobTracker.createdAt))

    case 'interviews':
      return await db
        .select()
        .from(jobTracker)
        .where(
          and(
            eq(jobTracker.userId, userId),
            isActive,
            eq(jobTracker.applicationStatus, 'InterviewScheduled'),
          ),
        )
        .orderBy(desc(jobTracker.createdAt))

    case 'ghosted':
      return await db
        .select()
        .from(jobTracker)
        .where(
          and(
            eq(jobTracker.userId, userId),
            isActive,
            eq(jobTracker.responseStatus, 'Ghosted'),
          ),
        )
        .orderBy(desc(jobTracker.createdAt))

    case 'archived':
      return await db
        .select()
        .from(jobTracker)
        .where(
          and(
            eq(jobTracker.userId, userId),
            eq(jobTracker.isArchived, 'true'),
          ),
        )
        .orderBy(desc(jobTracker.createdAt))

    default: // 'all' filter - strictly non-archived
      return await db
        .select()
        .from(jobTracker)
        .where(and(eq(jobTracker.userId, userId), isActive))
        .orderBy(desc(jobTracker.createdAt))
  }
}

export async function createEntry(
  data: Omit<NewJobEntry, 'id' | 'createdAt' | 'nextFollowupDate' | 'followupCount' | 'userId'>
): Promise<JobEntry> {
  const db = getDb();
  const userId = await getUserId();
  const nextFollowupDate = addDays(data.dateAppliedOrContacted, 3);
  
  const [entry] = await db.insert(jobTracker).values({
    ...data,
    userId,
    nextFollowupDate,
    followupCount: 0,
    isArchived: 'false',
  }).returning();
  
  revalidatePath('/');
  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<NewJobEntry, 'id' | 'createdAt' | 'userId'>>
): Promise<JobEntry> {
  const db = getDb();
  const userId = await getUserId();
  const [entry] = await db.update(jobTracker)
    .set(data)
    .where(and(eq(jobTracker.id, id), eq(jobTracker.userId, userId)))
    .returning();
  
  revalidatePath('/');
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = getDb();
  const userId = await getUserId();
  await db.delete(jobTracker).where(and(eq(jobTracker.id, id), eq(jobTracker.userId, userId)));
  revalidatePath('/');
}

export async function recordFollowup(id: string): Promise<JobEntry> {
  const db = getDb();
  const userId = await getUserId();
  
  const [current] = await db.select().from(jobTracker)
    .where(and(eq(jobTracker.id, id), eq(jobTracker.userId, userId)));
  
  if (!current) {
    throw new Error('Entry not found');
  }
  
  const today = getToday();
  const newFollowupCount = current.followupCount + 1;
  const newNextFollowupDate = addDays(today, 3);
  const shouldMarkGhosted = newFollowupCount >= 3 && current.responseStatus === 'NoResponse';
  
  const [entry] = await db.update(jobTracker)
    .set({
      followupCount: newFollowupCount,
      lastFollowupDate: today,
      nextFollowupDate: newNextFollowupDate,
      ...(shouldMarkGhosted && { responseStatus: 'Ghosted' }),
    })
    .where(and(eq(jobTracker.id, id), eq(jobTracker.userId, userId)))
    .returning();
  
  revalidatePath('/');
  return entry;
}

export async function archiveEntry(id: string, archive: boolean): Promise<void> {
  const db = getDb();
  const userId = await getUserId();
  await db
    .update(jobTracker)
    .set({ isArchived: archive ? 'true' : 'false' })
    .where(and(eq(jobTracker.id, id), eq(jobTracker.userId, userId)));
  revalidatePath('/');
}
