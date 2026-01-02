import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function resetDatabase() {
  console.log('Dropping existing enums and table if they exist...');
  
  // Drop table first (depends on enums)
  await sql`DROP TABLE IF EXISTS job_tracker CASCADE`;
  
  // Drop enums
  await sql`DROP TYPE IF EXISTS opportunity_type CASCADE`;
  await sql`DROP TYPE IF EXISTS designation CASCADE`;
  await sql`DROP TYPE IF EXISTS application_status CASCADE`;
  await sql`DROP TYPE IF EXISTS response_status CASCADE`;
  
  console.log('Creating enums...');
  
  // Create enums
  await sql`CREATE TYPE opportunity_type AS ENUM ('JobApplication', 'ColdEmail', 'LinkedInDM')`;
  await sql`CREATE TYPE designation AS ENUM ('CTO', 'CEO', 'HR', 'Recruiter', 'Founder', 'Other')`;
  await sql`CREATE TYPE application_status AS ENUM ('Draft', 'Applied', 'UnderReview', 'InterviewScheduled', 'Offer', 'Rejected', 'Closed')`;
  await sql`CREATE TYPE response_status AS ENUM ('NoResponse', 'Responded', 'Rejected', 'Ghosted')`;
  
  console.log('Creating job_tracker table...');
  
  // Create table
  await sql`
    CREATE TABLE job_tracker (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name TEXT NOT NULL,
      job_role TEXT NOT NULL,
      location TEXT,
      opportunity_type opportunity_type NOT NULL DEFAULT 'JobApplication',
      contact_name TEXT,
      designation designation,
      email TEXT,
      linkedin_url TEXT,
      date_applied_or_contacted DATE NOT NULL,
      last_followup_date DATE,
      next_followup_date DATE,
      followup_count INTEGER NOT NULL DEFAULT 0,
      application_status application_status NOT NULL DEFAULT 'Draft',
      response_status response_status NOT NULL DEFAULT 'NoResponse',
      interview_date DATE,
      resume_version TEXT,
      email_template_version TEXT,
      job_link TEXT,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  
  console.log('✅ Database schema created successfully!');
}

resetDatabase().catch(console.error);
