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
  Linkedin,
  Mail,
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
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden p-4">
        {entries.map((entry) => (
          <div 
            key={entry.id}
            className="p-4 bg-card border rounded-xl shadow-sm space-y-4"
            onClick={() => onEdit(entry)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-bold text-base leading-tight">{entry.companyName}</h4>
                <p className="text-sm text-muted-foreground">{entry.jobRole}</p>
              </div>
              <Badge variant="secondary" className="font-medium shrink-0">
                {APPLICATION_STATUS_LABELS[entry.applicationStatus]}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {entry.location && (
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                    </span>
                )}
                {entry.linkedinUrl && <Linkedin className="h-3 w-3 text-blue-600" />}
                {entry.opportunityType === 'ColdEmail' && <Mail className="h-3 w-3 text-emerald-600" />}
            </div>

            <div className="pt-3 border-t border-dashed flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {entry.applicationStatus === 'InterviewScheduled' && entry.interviewDate ? (
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    Interview: {format(new Date(entry.interviewDate), 'MMM d')}
                  </span>
                ) : entry.nextFollowupDate && (
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Follow-up*: {format(new Date(entry.nextFollowupDate), 'MMM d')}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  Applied {format(new Date(entry.dateAppliedOrContacted), 'MMM d')}
                </span>
              </div>
              
              <div onClick={(e) => e.stopPropagation()}>
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
                    {entry.responseStatus === 'NoResponse' && entry.followupCount < 3 && (
                      <DropdownMenuItem disabled={isPending} onClick={() => handleFollowup(entry.id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Log follow-up
                      </DropdownMenuItem>
                    )}
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table className="min-w-[800px]">
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
                    <Badge variant="secondary" className="w-fit font-medium text-[11px]">
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
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold text-[10px] bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full w-fit border border-orange-100 dark:border-orange-900/50 uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        Int: {format(new Date(entry.interviewDate), 'MMM d')}
                      </div>
                    ) : entry.nextFollowupDate ? (
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[10px] bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full w-fit border border-blue-100 dark:border-blue-900/50 uppercase tracking-wider">
                        <History className="h-3 w-3" />
                        Next F/U*: {format(new Date(entry.nextFollowupDate), 'MMM d')}
                      </div>
                    ) : null}

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 px-1">
                      Applied: {format(
                        new Date(entry.dateAppliedOrContacted),
                        'MMM d',
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-medium">{entry.followupCount} Follow-Ups</span>
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
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        isPending={isPending}
        title="Delete Job Entry"
        description="Are you sure you want to delete this job entry? This action cannot be undone and all associated data will be lost."
      />

      <div className="mt-8 px-6 py-4 bg-muted/30 rounded-lg border border-dashed">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Glossary</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">F/U*</span>
            <span>Follow-up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">Int</span>
            <span>Interview</span>
          </div>
        </div>
      </div>
    </div>
  )
}
