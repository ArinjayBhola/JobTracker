import { pgTable, uuid, text, date, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

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

// Main job_tracker table
export const jobTracker = pgTable('job_tracker', {
  id: uuid('id').primaryKey().defaultRandom(),
  
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
});

// Type inference
export type JobEntry = typeof jobTracker.$inferSelect;
export type NewJobEntry = typeof jobTracker.$inferInsert;
