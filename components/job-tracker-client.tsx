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
import { KanbanBoard } from '@/components/kanban-board'
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
  LayoutGrid,
  List as ListIcon,
  RefreshCcw,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard-stats'
import { cn } from '@/lib/utils'
import { Header } from '@/components/header'

export function JobTrackerClient({
  initialEntries,
}: {
  initialEntries: JobEntry[]
}) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [entries, setEntries] = useState<JobEntry[]>(initialEntries)
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JobEntry | null>(null)
  const [isPending, startTransition] = useTransition()

  /* ----------------------------- */
  /* Stats (always from ALL data)  */
  /* ----------------------------- */

  const activeEntries = initialEntries.filter((e) => e.isArchived === 'false')

  const stats = {
    total: activeEntries.length,
    pipeline: activeEntries.filter(
      (e) =>
        e.applicationStatus === 'Draft' ||
        e.applicationStatus === 'Applied' ||
        e.applicationStatus === 'UnderReview',
    ).length,
    interviews: activeEntries.filter(
      (e) => e.applicationStatus === 'InterviewScheduled',
    ).length,
    followups: activeEntries.filter((e) => {
      if (e.responseStatus !== 'NoResponse') return false

      // Keep outreach items in follow-up focus if they haven't responded
      if (
        e.opportunityType === 'ColdEmail' ||
        e.opportunityType === 'LinkedInDM'
      ) {
        return true
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return e.nextFollowupDate && new Date(e.nextFollowupDate) <= today
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

    const lastFollowupDate = formData.get('lastFollowupDate') as string | null
    const dateAppliedOrContacted = formData.get('dateAppliedOrContacted') as string
    
    // Calculate nextFollowupDate based on the most recent activity
    let nextFollowupDate = null
    const referenceDate = lastFollowupDate || dateAppliedOrContacted
    if (referenceDate) {
      const d = new Date(referenceDate)
      d.setDate(d.getDate() + 3)
      nextFollowupDate = d.toISOString().split('T')[0]
    }

    const payload = {
      companyName: formData.get('companyName') as string,
      jobRole: formData.get('jobRole') as string,
      location: (formData.get('location') as string) || null,
      opportunityType: formData.get('opportunityType') as string,
      contactName: (formData.get('contactName') as string) || null,
      designation: (formData.get('designation') as string) || null,
      email: (formData.get('email') as string) || null,
      linkedinUrl: (formData.get('linkedinUrl') as string) || null,
      dateAppliedOrContacted: dateAppliedOrContacted,
      applicationStatus: formData.get('applicationStatus') as string,
      responseStatus: formData.get('responseStatus') as string,
      interviewDate: (formData.get('interviewDate') as string) || null,
      resumeVersion: (formData.get('resumeVersion') as string) || null,
      emailTemplateVersion:
        (formData.get('emailTemplateVersion') as string) || null,
      jobLink: (formData.get('jobLink') as string) || null,
      notes: (formData.get('notes') as string) || null,
      lastFollowupDate: lastFollowupDate || null,
      followupCount: parseInt(formData.get('followupCount') as string) || 0,
      nextFollowupDate,
    }

    if (id) {
      await updateEntry(id, payload as any)
    } else {
      await createEntry(payload as any)
    }

    const refreshed = await getEntries(filter)
    setEntries(refreshed)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
        try {
            await updateEntry(id, { applicationStatus: newStatus } as any)
            const refreshed = await getEntries(filter)
            setEntries(refreshed)
        } catch (error) {
            console.error("Failed to update status:", error)
        }
    })
  }

  const handleRefresh = async () => {
    startTransition(async () => {
      const refreshed = await getEntries(filter)
      setEntries(refreshed)
    })
  }

  /* ----------------------------- */
  /* UI                            */
  /* ----------------------------- */

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 h-8">
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </Header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-10">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-full overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    <FilterTabs
                        activeFilter={filter}
                        onFilterChange={setFilter}
                    />
                </div>
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border w-fit">
                    <Button 
                        variant={view === 'table' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setView('table')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant={view === 'kanban' ? 'secondary' : 'ghost'} 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setView('kanban')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleRefresh}
                disabled={isPending}
              >
                <RefreshCcw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
              </Button>
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
            {view === 'table' ? (
                <TrackerTable
                    entries={entries}
                    filter={filter}
                    onEdit={handleEdit}
                    onDelete={async () => {
                        const refreshed = await getEntries(filter)
                        setEntries(refreshed)
                    }}
                />
            ) : (
                <div className="p-4 overflow-hidden">
                    <KanbanBoard 
                        entries={entries}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        onDelete={async (id) => {
                            // Using the existing delete logic pattern from TrackerTable context if needed
                            // But usually onDelete here just needs to refresh or handle the call
                            // Let's keep it consistent with the parent's delete handling
                            const refreshed = await getEntries(filter)
                            setEntries(refreshed)
                        }}
                    />
                </div>
            )}
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
