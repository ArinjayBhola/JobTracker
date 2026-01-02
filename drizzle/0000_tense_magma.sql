CREATE TYPE "public"."application_status" AS ENUM('Draft', 'Applied', 'UnderReview', 'InterviewScheduled', 'Offer', 'Rejected', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."designation" AS ENUM('CTO', 'CEO', 'HR', 'Recruiter', 'Founder', 'Other');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('JobApplication', 'ColdEmail', 'LinkedInDM');--> statement-breakpoint
CREATE TYPE "public"."response_status" AS ENUM('NoResponse', 'Responded', 'Rejected', 'Ghosted');--> statement-breakpoint
CREATE TABLE "job_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"job_role" text NOT NULL,
	"location" text,
	"opportunity_type" "opportunity_type" DEFAULT 'JobApplication' NOT NULL,
	"contact_name" text,
	"designation" "designation",
	"email" text,
	"linkedin_url" text,
	"date_applied_or_contacted" date NOT NULL,
	"last_followup_date" date,
	"next_followup_date" date,
	"followup_count" integer DEFAULT 0 NOT NULL,
	"application_status" "application_status" DEFAULT 'Draft' NOT NULL,
	"response_status" "response_status" DEFAULT 'NoResponse' NOT NULL,
	"interview_date" date,
	"resume_version" text,
	"email_template_version" text,
	"job_link" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
