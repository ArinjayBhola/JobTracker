import { db } from '@/db';
import { getEntries } from '@/actions/job-tracker';
import { JobTrackerClient } from '@/components/job-tracker-client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // If database is not configured, show setup message
  if (!db) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    );
  }

  const entries = await getEntries('all');
  
  return <JobTrackerClient initialEntries={entries} />;
}
