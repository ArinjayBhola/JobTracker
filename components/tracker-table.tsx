'use client'

import { useTransition } from 'react'
import { JobEntry } from '@/db/schema'
import {
  FilterType,
  recordFollowup,
  deleteEntry,
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
} from '@/types'
import {
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Edit2,
  RotateCcw,
  Calendar,
  MapPin,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TrackerTableProps {
  entries: JobEntry[]
  filter: FilterType
  onEdit: (entry: JobEntry) => void
}

export function TrackerTable({
  entries,
  filter,
  onEdit,
}: TrackerTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleFollowup = (id: string) => {
    startTransition(async () => {
      await recordFollowup(id)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this entry?')) return
    startTransition(async () => {
      await deleteEntry(id)
    })
  }

  if (entries.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p className="text-sm font-medium">No opportunities found</p>
        <p className="text-xs mt-1">
          Adjust filters or add a new entry.
        </p>
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
              {/* Company */}
              <TableCell className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {entry.companyName}
                    </span>
                    {entry.jobLink && (
                      <a
                        href={entry.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
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
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">
                    {
                      APPLICATION_STATUS_LABELS[
                        entry.applicationStatus as keyof typeof APPLICATION_STATUS_LABELS
                      ]
                    }
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {
                      RESPONSE_STATUS_LABELS[
                        entry.responseStatus as keyof typeof RESPONSE_STATUS_LABELS
                      ]
                    }
                  </span>
                </div>
              </TableCell>

              {/* Timeline */}
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(
                    new Date(entry.dateAppliedOrContacted),
                    'MMM d, yyyy',
                  )}
                </div>
              </TableCell>

              {/* Follow-ups */}
              <TableCell>
                <span className="text-sm">
                  {entry.followupCount} follow-ups
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell
                onClick={(e) => e.stopPropagation()}
                className="text-right pr-4"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
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
  )
}
