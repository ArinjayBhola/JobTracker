"use server";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { users, jobTracker, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function setUserPassword(password: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = getDb();

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  return { success: true };
}

export async function getUserSecurityStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    return { isGoogleUser: false, hasPassword: false };
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      accounts: true,
    } as any, // Cast to any because the schema export might not show relations but drizzle-queries work
  });

  // Alternatively, query accounts table directly to be safe
  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, session.user.id), eq(accounts.provider, "google")),
  });

  return {
    isGoogleUser: !!account,
    hasPassword: !!user?.password,
  };
}

export async function getExportData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  const data = await db.query.jobTracker.findMany({
    where: eq(jobTracker.userId, session.user.id),
  });

  return data;
}

export async function registerUser({ name, email, password }: any) {
  const db = getDb();

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
}
