'use client'

import { useEffect, useState, useTransition } from 'react'
import { JobEntry } from '@/db/schema'
import {
  FilterType,
  getEntries,
  createEntry,
  updateEntry,
} from '@/actions/job-tracker'
import { FilterTabs } from '@/components/filter-tabs'
import { TrackerTable } from '@/components/tracker-table'
import { EntryForm } from '@/components/entry-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Plus,
  Loader2,
  Target,
  Send,
  Video,
  Bell,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard-stats'
import { cn } from '@/lib/utils'

export function JobTrackerClient({
  initialEntries,
}: {
  initialEntries: JobEntry[]
}) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [entries, setEntries] = useState<JobEntry[]>(initialEntries)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JobEntry | null>(null)
  const [isPending, startTransition] = useTransition()

  /* ----------------------------- */
  /* Stats (always from ALL data)  */
  /* ----------------------------- */

  const stats = {
    total: initialEntries.length,
    pipeline: initialEntries.filter(
      (e) =>
        e.applicationStatus === 'Applied' ||
        e.applicationStatus === 'UnderReview',
    ).length,
    interviews: initialEntries.filter(
      (e) => e.applicationStatus === 'InterviewScheduled',
    ).length,
    followups: initialEntries.filter((e) => {
      if (e.responseStatus !== 'NoResponse' || !e.nextFollowupDate) return false
      return new Date(e.nextFollowupDate) <= new Date()
    }).length,
  }

  /* ----------------------------- */
  /* Data Fetching                 */
  /* ----------------------------- */

  useEffect(() => {
    startTransition(async () => {
      const data = await getEntries(filter)
      setEntries(data)
    })
  }, [filter])

  /* ----------------------------- */
  /* Actions                       */
  /* ----------------------------- */

  const handleAdd = () => {
    setEditingEntry(null)
    setFormOpen(true)
  }

  const handleEdit = (entry: JobEntry) => {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  const handleFormSubmit = async (formData: FormData) => {
    const id = formData.get('id') as string | null

    const payload = {
      companyName: formData.get('companyName') as string,
      jobRole: formData.get('jobRole') as string,
      location: (formData.get('location') as string) || null,
      opportunityType: formData.get('opportunityType') as string,
      contactName: (formData.get('contactName') as string) || null,
      designation: (formData.get('designation') as string) || null,
      email: (formData.get('email') as string) || null,
      linkedinUrl: (formData.get('linkedinUrl') as string) || null,
      dateAppliedOrContacted: formData.get(
        'dateAppliedOrContacted',
      ) as string,
      applicationStatus: formData.get('applicationStatus') as string,
      responseStatus: formData.get('responseStatus') as string,
      interviewDate: (formData.get('interviewDate') as string) || null,
      resumeVersion: (formData.get('resumeVersion') as string) || null,
      emailTemplateVersion:
        (formData.get('emailTemplateVersion') as string) || null,
      jobLink: (formData.get('jobLink') as string) || null,
      notes: (formData.get('notes') as string) || null,
    }

    if (id) {
      await updateEntry(id, payload as any)
    } else {
      await createEntry(payload as any)
    }

    const refreshed = await getEntries(filter)
    setEntries(refreshed)
  }

  /* ----------------------------- */
  /* UI                            */
  /* ----------------------------- */

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Job Tracker</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button size="sm" onClick={handleAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Track applications, interviews, and follow-ups.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Target}
            description="All opportunities"
          />
          <StatsCard
            title="In Pipeline"
            value={stats.pipeline}
            icon={Send}
            description="Awaiting response"
          />
          <StatsCard
            title="Interviews"
            value={stats.interviews}
            icon={Video}
            description="Scheduled"
          />
          <StatsCard
            title="Follow-ups"
            value={stats.followups}
            icon={Bell}
            description="Action needed"
          />
        </div>

        {/* Filters + Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <FilterTabs
              activeFilter={filter}
              onFilterChange={setFilter}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? 'Updating…' : `${entries.length} results`}
            </div>
          </div>

          <div
            className={cn(
              'rounded-lg border bg-card overflow-hidden transition-opacity',
              isPending && 'opacity-60',
            )}
          >
            <TrackerTable
              entries={entries}
              filter={filter}
              onEdit={handleEdit}
            />
          </div>
        </section>
      </main>

      {/* Entry Form */}
      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
