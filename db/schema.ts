import { pgTable, uuid, text, date, integer, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from "next-auth/adapters"

// Enums
export const opportunityTypeEnum = pgEnum('opportunity_type', [
  'JobApplication',
  'ColdEmail',
  'LinkedInDM'
]);

export const designationEnum = pgEnum('designation', [
  'CTO',
  'CEO',
  'HR',
  'Recruiter',
  'Founder',
  'Other'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'Draft',
  'Applied',
  'UnderReview',
  'InterviewScheduled',
  'Offer',
  'Rejected',
  'Closed'
]);

export const responseStatusEnum = pgEnum('response_status', [
  'NoResponse',
  'Responded',
  'Rejected',
  'Ghosted'
]);

// Auth.js Tables
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // Added for credential login
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    }
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    }
  ]
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePk: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    }
  ]
)

// Main job_tracker table
export const jobTracker = pgTable('job_tracker', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Relate to user
  
  // Company Info
  companyName: text('company_name').notNull(),
  jobRole: text('job_role').notNull(),
  location: text('location'),
  
  // Outreach Info
  opportunityType: opportunityTypeEnum('opportunity_type').notNull().default('JobApplication'),
  contactName: text('contact_name'),
  designation: designationEnum('designation'),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  
  // Tracking
  dateAppliedOrContacted: date('date_applied_or_contacted').notNull(),
  lastFollowupDate: date('last_followup_date'),
  nextFollowupDate: date('next_followup_date'),
  followupCount: integer('followup_count').notNull().default(0),
  
  // Status
  applicationStatus: applicationStatusEnum('application_status').notNull().default('Draft'),
  responseStatus: responseStatusEnum('response_status').notNull().default('NoResponse'),
  
  // Interview
  interviewDate: date('interview_date'),
  
  // Assets
  resumeVersion: text('resume_version'),
  emailTemplateVersion: text('email_template_version'),
  jobLink: text('job_link'),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  
  // Archiving
  isArchived: text('is_archived', { enum: ['true', 'false'] }).notNull().default('false'),
});

// Type inference
export type JobEntry = typeof jobTracker.$inferSelect;
export type NewJobEntry = typeof jobTracker.$inferInsert;
export type User = typeof users.$inferSelect;
