'use client';

import { useState, useEffect, useTransition } from 'react';
import { JobEntry } from '@/db/schema';
import { FilterType, getEntries, createEntry, updateEntry } from '@/actions/job-tracker';
import { FilterTabs } from '@/components/filter-tabs';
import { TrackerTable } from '@/components/tracker-table';
import { EntryForm } from '@/components/entry-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Loader2, Target, Send, Video, Trophy } from 'lucide-react';
import { StatsCard } from '@/components/dashboard-stats';
import { cn } from '@/lib/utils';

export function JobTrackerClient({ initialEntries }: { initialEntries: JobEntry[] }) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [entries, setEntries] = useState<JobEntry[]>(initialEntries);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JobEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  // Calculate stats based on ALL entries (not filtered)
  const stats = {
    total: initialEntries.length,
    applied: initialEntries.filter(e => e.applicationStatus === 'Applied' || e.applicationStatus === 'UnderReview').length,
    interviews: initialEntries.filter(e => e.applicationStatus === 'InterviewScheduled').length,
    offers: initialEntries.filter(e => e.applicationStatus === 'Offer').length,
    followups: initialEntries.filter(e => {
      if (e.responseStatus !== 'NoResponse' || !e.nextFollowupDate) return false;
      const today = new Date();
      const nextFU = new Date(e.nextFollowupDate);
      return nextFU <= today;
    }).length
  };

  // Fetch entries when filter changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getEntries(filter);
      setEntries(data);
    });
  }, [filter]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleEdit = (entry: JobEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const id = formData.get('id') as string | null;
    
    const data = {
      companyName: formData.get('companyName') as string,
      jobRole: formData.get('jobRole') as string,
      location: formData.get('location') as string || null,
      opportunityType: formData.get('opportunityType') as string,
      contactName: formData.get('contactName') as string || null,
      designation: formData.get('designation') as string || null,
      email: formData.get('email') as string || null,
      linkedinUrl: formData.get('linkedinUrl') as string || null,
      dateAppliedOrContacted: formData.get('dateAppliedOrContacted') as string,
      applicationStatus: formData.get('applicationStatus') as string,
      responseStatus: formData.get('responseStatus') as string,
      interviewDate: formData.get('interviewDate') as string || null,
      resumeVersion: formData.get('resumeVersion') as string || null,
      emailTemplateVersion: formData.get('emailTemplateVersion') as string || null,
      jobLink: formData.get('jobLink') as string || null,
      notes: formData.get('notes') as string || null,
    };

    if (id) {
      await updateEntry(id, data as any);
    } else {
      await createEntry(data as any);
    }

    // Refresh entries
    const refreshed = await getEntries(filter);
    setEntries(refreshed);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight uppercase px-2 py-0.5 bg-muted rounded">Job Hunter</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-px bg-border/40" />
            <Button 
              onClick={handleAdd} 
              size="sm" 
              className="h-7 gap-1.5 px-3 bg-foreground text-background hover:bg-foreground/90 rounded text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95"
            >
              <Plus className="h-3 w-3" />
              New Entry
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-10">
          {/* Hero Section */}
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Job Search Analytics & Pipeline</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Outreach" 
              value={stats.total} 
              icon={Target} 
              description="Gross applications"
              colorClass="bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            />
            <StatsCard 
              title="In Pipeline" 
              value={stats.applied} 
              icon={Send} 
              description="Awaiting feedback"
              colorClass="bg-indigo-600 text-white"
            />
            <StatsCard 
              title="Interviews" 
              value={stats.interviews} 
              icon={Video} 
              description="Active discussions"
              colorClass="bg-amber-500 text-white"
            />
            <StatsCard 
              title="Follow-ups" 
              value={stats.followups} 
              icon={Loader2} 
              description="Next steps required"
              colorClass="bg-rose-600 text-white"
            />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border/20 pb-4 gap-4">
              <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-2 sm:pb-0">
                <FilterTabs
                  activeFilter={filter}
                  onFilterChange={handleFilterChange}
                />
              </div>
              <div className="flex items-center justify-end gap-2 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  {isPending ? 'Syncing...' : `${entries.length} Opportunities`}
                </span>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )} />
              </div>
            </div>

            {/* Main Viewport */}
            <div className={cn(
              "rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300",
              isPending && "opacity-60 grayscale-[0.5] scale-[1.002]"
            )}>
              <TrackerTable
                entries={entries}
                filter={filter}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Entry Form */}
      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
