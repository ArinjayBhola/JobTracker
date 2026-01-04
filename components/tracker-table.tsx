'use client'

import { useTransition, useState } from 'react'
import { JobEntry } from '@/db/schema'
import {
  FilterType,
  recordFollowup,
  deleteEntry,
  archiveEntry,
} from '@/actions/job-tracker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  APPLICATION_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
  DESIGNATION_LABELS,
} from '@/types'
import {
  MoreHorizontal,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  ExternalLink,
  History,
  Edit2,
  RotateCcw,
  Trash2,
  Archive,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ConfirmModal } from './confirm-modal'

interface TrackerTableProps {
  entries: JobEntry[]
  filter: FilterType
  onEdit: (entry: JobEntry) => void
  onDelete?: () => void
}

export function TrackerTable({
  entries,
  filter,
  onEdit,
  onDelete,
}: TrackerTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleFollowup = (id: string) => {
    startTransition(async () => {
      await recordFollowup(id)
    })
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    startTransition(async () => {
      await deleteEntry(deleteConfirmId)
      setDeleteConfirmId(null)
      onDelete?.()
    })
  }

  if (entries.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p className="text-sm font-medium">No opportunities found</p>
        <p className="text-xs mt-1">Adjust filters or add a new entry.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Follow-ups</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => onEdit(entry)}
            >
              <TableCell className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">
                      {entry.companyName}
                    </span>
                    {entry.linkedinUrl && (
                      <a
                        href={entry.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary p-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.jobRole}
                    {entry.location && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </span>
                    )}
                  </div>
                  {(entry.contactName || entry.designation) && (
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">
                      {entry.contactName && `Contact: ${entry.contactName}`}
                      {entry.designation && (
                        <span className="ml-1 opacity-80">
                          (
                          {
                            DESIGNATION_LABELS[
                              entry.designation as keyof typeof DESIGNATION_LABELS
                            ]
                          }
                          )
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary" className="w-fit font-medium">
                    {APPLICATION_STATUS_LABELS[entry.applicationStatus]}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {RESPONSE_STATUS_LABELS[entry.responseStatus]}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  {entry.applicationStatus === 'InterviewScheduled' &&
                  entry.interviewDate ? (
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold text-xs bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full w-fit border border-orange-100 dark:border-orange-900/50">
                      <Calendar className="h-3 w-3" />
                      Int: {format(new Date(entry.interviewDate), 'MMM d, yyyy')}
                    </div>
                  ) : entry.nextFollowupDate ? (
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full w-fit border border-blue-100 dark:border-blue-900/50">
                      <History className="h-3 w-3" />
                      Next F/U: {format(new Date(entry.nextFollowupDate), 'MMM d, yyyy')}
                    </div>
                  ) : null}

                  {entry.lastFollowupDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 px-1 italic">
                      Last F/U: {format(new Date(entry.lastFollowupDate), 'MMM d')}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 px-1">
                    Applied: {format(
                      new Date(entry.dateAppliedOrContacted),
                      'MMM d',
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm">{entry.followupCount} follow-ups</span>
              </TableCell>

              <TableCell
                onClick={(e) => e.stopPropagation()}
                className="text-right pr-4"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {entry.responseStatus === 'NoResponse' &&
                      entry.followupCount < 3 && (
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleFollowup(entry.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Log follow-up
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuSeparator />
                    {entry.isArchived === 'true' ? (
                      <DropdownMenuItem
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await archiveEntry(entry.id, false)
                            onDelete?.()
                          })
                        }}
                      >
                        <History className="h-4 w-4 mr-2" />
                        Restore from Archive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await archiveEntry(entry.id, true)
                            onDelete?.()
                          })
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={isPending}
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        isPending={isPending}
        title="Delete Job Entry"
        description="Are you sure you want to delete this job entry? This action cannot be undone and all associated data will be lost."
      />
    </div>
  )
}
