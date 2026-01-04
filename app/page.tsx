import { db } from '@/db';
import { getEntries } from '@/actions/job-tracker';
import { JobTrackerClient } from '@/components/job-tracker-client';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { Header } from '@/components/header';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  // If database is not configured, show setup message
  if (!db) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Job Tracker</h1>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-yellow-600 mb-2">Database Not Configured</h2>
              <p className="text-muted-foreground mb-4">
                Please set up your database to get started:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a PostgreSQL database (e.g., on Neon)</li>
                <li>Set the <code className="bg-muted px-1 rounded">DATABASE_URL</code> environment variable</li>
                <li>Run <code className="bg-muted px-1 rounded">npm run db:push</code> to create tables</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Briefcase className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Track your job hunt with <span className="text-primary italic">Precision.</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              A minimalist, high-performance dashboard to manage your applications, outreach, and follow-ups.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const entries = await getEntries('all');
  
  return <JobTrackerClient initialEntries={entries} />;
}
