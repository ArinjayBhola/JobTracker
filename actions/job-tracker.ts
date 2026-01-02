'use server';

import { getDb } from '@/db';
import { jobTracker, JobEntry, NewJobEntry } from '@/db/schema';
import { eq, lte, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

export type FilterType = 'all' | 'followups' | 'waiting' | 'interviews' | 'ghosted' | 'closed';

export async function getEntries(filter: FilterType = 'all'): Promise<JobEntry[]> {
  const db = getDb();
  const today = getToday();
  
  switch (filter) {
    case 'followups':
      // next_followup_date <= today AND response_status = NoResponse
      return await db.select().from(jobTracker)
        .where(and(
          lte(jobTracker.nextFollowupDate, today),
          eq(jobTracker.responseStatus, 'NoResponse')
        ))
        .orderBy(jobTracker.nextFollowupDate);
    
    case 'waiting':
      // application_status IN (Applied, UnderReview)
      return await db.select().from(jobTracker)
        .where(inArray(jobTracker.applicationStatus, ['Applied', 'UnderReview']))
        .orderBy(jobTracker.dateAppliedOrContacted);
    
    case 'interviews':
      // application_status = InterviewScheduled
      return await db.select().from(jobTracker)
        .where(eq(jobTracker.applicationStatus, 'InterviewScheduled'))
        .orderBy(jobTracker.interviewDate);
    
    case 'ghosted':
      // response_status = Ghosted
      return await db.select().from(jobTracker)
        .where(eq(jobTracker.responseStatus, 'Ghosted'))
        .orderBy(jobTracker.dateAppliedOrContacted);
    
    case 'closed':
      // application_status IN (Rejected, Closed)
      return await db.select().from(jobTracker)
        .where(inArray(jobTracker.applicationStatus, ['Rejected', 'Closed']))
        .orderBy(jobTracker.dateAppliedOrContacted);
    
    default:
      return await db.select().from(jobTracker)
        .orderBy(jobTracker.createdAt);
  }
}

export async function createEntry(
  data: Omit<NewJobEntry, 'id' | 'createdAt' | 'nextFollowupDate' | 'followupCount'>
): Promise<JobEntry> {
  const db = getDb();
  // Auto-set next_followup_date = date_applied_or_contacted + 3 days
  const nextFollowupDate = addDays(data.dateAppliedOrContacted, 3);
  
  const [entry] = await db.insert(jobTracker).values({
    ...data,
    nextFollowupDate,
    followupCount: 0,
  }).returning();
  
  revalidatePath('/');
  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<NewJobEntry, 'id' | 'createdAt'>>
): Promise<JobEntry> {
  const db = getDb();
  const [entry] = await db.update(jobTracker)
    .set(data)
    .where(eq(jobTracker.id, id))
    .returning();
  
  revalidatePath('/');
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = getDb();
  await db.delete(jobTracker).where(eq(jobTracker.id, id));
  revalidatePath('/');
}

export async function recordFollowup(id: string): Promise<JobEntry> {
  const db = getDb();
  // Get current entry
  const [current] = await db.select().from(jobTracker).where(eq(jobTracker.id, id));
  
  if (!current) {
    throw new Error('Entry not found');
  }
  
  const today = getToday();
  const newFollowupCount = current.followupCount + 1;
  const newNextFollowupDate = addDays(today, 3);
  
  // Auto-mark as Ghosted if followup_count >= 3 and still no response
  const shouldMarkGhosted = newFollowupCount >= 3 && current.responseStatus === 'NoResponse';
  
  const [entry] = await db.update(jobTracker)
    .set({
      followupCount: newFollowupCount,
      lastFollowupDate: today,
      nextFollowupDate: newNextFollowupDate,
      ...(shouldMarkGhosted && { responseStatus: 'Ghosted' }),
    })
    .where(eq(jobTracker.id, id))
    .returning();
  
  revalidatePath('/');
  return entry;
}
