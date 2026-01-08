"use client";

import { useTransition, useState } from "react";
import { JobEntry } from "@/db/schema";
import { FilterType, recordFollowup, deleteEntry, archiveEntry } from "@/actions/job-tracker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APPLICATION_STATUS_LABELS, RESPONSE_STATUS_LABELS, DESIGNATION_LABELS } from "@/types";
import {
  MoreHorizontal,
  MapPin,
  Calendar,
  ExternalLink,
  History,
  Edit2,
  RotateCcw,
  Trash2,
  Archive,
  Linkedin,
  Mail,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmModal } from "./confirm-modal";
import { cn } from "@/lib/utils";

interface TrackerTableProps {
  entries: JobEntry[];
  filter: FilterType;
  onEdit: (entry: JobEntry) => void;
  onDelete?: () => void;
}

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  let colorClass = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  let dotClass = "bg-zinc-400";

  switch (status) {
    case "Applied":
      colorClass = "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-900/50";
      dotClass = "bg-blue-500";
      break;
    case "InterviewScheduled":
      colorClass = "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-900/50";
      dotClass = "bg-orange-500 animate-pulse";
      break;
    case "OfferReceived":
      colorClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50";
      dotClass = "bg-emerald-500";
      break;
    case "Rejected":
      colorClass = "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-900/50";
      dotClass = "bg-red-500";
      break;
    // Add other cases as needed
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border", colorClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  );
};

export function TrackerTable({ entries, filter, onEdit, onDelete }: TrackerTableProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleFollowup = (id: string) => {
    startTransition(async () => {
      await recordFollowup(id);
    });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    startTransition(async () => {
      await deleteEntry(deleteConfirmId);
      setDeleteConfirmId(null);
      onDelete?.();
    });
  };

  if (entries.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <PlusCircle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">No opportunities found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Your pipeline is empty right now. Start adding roles to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden p-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group relative p-4 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => onEdit(entry)}>
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{entry.companyName}</h4>
                <p className="text-sm text-muted-foreground">{entry.jobRole}</p>
              </div>
              <StatusBadge status={entry.applicationStatus} label={APPLICATION_STATUS_LABELS[entry.applicationStatus]} />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              {entry.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {entry.location}
                </span>
              )}
              {entry.linkedinUrl && <Linkedin className="h-3 w-3 text-blue-600" />}
              {entry.opportunityType === "ColdEmail" && <Mail className="h-3 w-3 text-emerald-600" />}
            </div>

            <div className="pt-3 border-t border-border/50 border-dashed flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {entry.applicationStatus === "InterviewScheduled" && entry.interviewDate ? (
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(entry.interviewDate), "MMM d")}
                  </span>
                ) : (
                  entry.nextFollowupDate && (
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                       <History className="h-3 w-3" />
                      {format(new Date(entry.nextFollowupDate), "MMM d")}
                    </span>
                  )
                )}
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {entry.responseStatus === "NoResponse" && entry.followupCount < 3 && (
                      <DropdownMenuItem
                        disabled={isPending}
                        onClick={() => handleFollowup(entry.id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Log follow-up
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={isPending}
                      onClick={() => handleDelete(entry.id)}>
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
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="pl-6 h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Company</TableHead>
              <TableHead className="h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Status</TableHead>
              <TableHead className="h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Timeline</TableHead>
              <TableHead className="h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Metrics</TableHead>
              <TableHead className="w-[48px] h-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.id}
                className="group cursor-pointer hover:bg-muted/30 border-b border-border/50 transition-colors"
                onClick={() => onEdit(entry)}>
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{entry.companyName}</span>
                      {entry.linkedinUrl && (
                        <a
                          href={entry.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary p-0.5 transition-all"
                          onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.jobRole}
                      {entry.location && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3 opacity-70" />
                          {entry.location}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    <StatusBadge status={entry.applicationStatus} label={APPLICATION_STATUS_LABELS[entry.applicationStatus]} />
                    <span className="text-[10px] text-muted-foreground font-medium px-1">
                      {RESPONSE_STATUS_LABELS[entry.responseStatus]}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5">
                    {entry.applicationStatus === "InterviewScheduled" && entry.interviewDate ? (
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold text-[10px] bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full w-fit border border-orange-100 dark:border-orange-900/50 uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        Int: {format(new Date(entry.interviewDate), "MMM d")}
                      </div>
                    ) : entry.nextFollowupDate ? (
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[10px] bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full w-fit border border-blue-100 dark:border-blue-900/50 uppercase tracking-wider">
                        <History className="h-3 w-3" />
                        Due: {format(new Date(entry.nextFollowupDate), "MMM d")}
                      </div>
                    ) : (
                         <div className="h-5"></div> /* Spacer if no badge */
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 px-1">
                      Applied: {format(new Date(entry.dateAppliedOrContacted), "MMM d")}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <Badge variant="outline" className="font-normal text-[10px] h-5 hover:bg-transparent">
                     {entry.followupCount} Follow-Ups
                  </Badge>
                </TableCell>

                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  className="text-right pr-4 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {entry.responseStatus === "NoResponse" && entry.followupCount < 3 && (
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleFollowup(entry.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Log follow-up
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={isPending}
                        onClick={() => handleDelete(entry.id)}>
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
        description="Are you sure you want to delete this job entry? This action cannot be undone."
      />
    </div>
  );
}
