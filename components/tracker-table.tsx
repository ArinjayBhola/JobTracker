'use client';

import { useTransition } from 'react';
import { JobEntry } from '@/db/schema';
import { FilterType, recordFollowup, deleteEntry } from '@/actions/job-tracker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  APPLICATION_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
} from '@/types';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Trash2, 
  Pencil, 
  Bell, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  RotateCcw,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';

interface TrackerTableProps {
  entries: JobEntry[];
  filter: FilterType;
  onEdit: (entry: JobEntry) => void;
}

export function TrackerTable({ entries, filter, onEdit }: TrackerTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleFollowup = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      await recordFollowup(id);
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry?')) {
      startTransition(async () => {
        await deleteEntry(id);
      });
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No opportunities found</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Try changing your filters or add a new entry.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
      Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
      UnderReview: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50',
      InterviewScheduled: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
      Offer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
      Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800/50',
      Closed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    };
    return (
      <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider px-2 py-0 h-5 inline-flex items-center justify-center ${styles[status] || ''}`}>
        {APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] || status}
      </Badge>
    );
  };

  const getResponseBadge = (status: string) => {
    const styles: Record<string, string> = {
      NoResponse: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      Responded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      Ghosted: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900',
    };
    return (
      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm inline-flex items-center ${styles[status] || ''}`}>
        {RESPONSE_STATUS_LABELS[status as keyof typeof RESPONSE_STATUS_LABELS] || status}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <Table className="min-w-[800px] lg:min-w-full">
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[300px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 py-4 pl-6">Company & Role</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 py-4">Status & Pipeline</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 py-4">Timeline</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 py-4">Follow-up</TableHead>
            <TableHead className="w-[60px] py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow 
              key={entry.id} 
              className="group cursor-pointer border-border/40 hover:bg-muted/30 transition-all duration-200"
              onClick={() => onEdit(entry)}
            >
              <TableCell className="py-4 pl-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {entry.companyName}
                    </span>
                    {entry.jobLink && (
                      <a 
                        href={entry.jobLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    {entry.jobRole}
                    {entry.location && (
                      <span className="flex items-center gap-1 opacity-70">
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <MapPin className="h-3 w-3 inline" />
                        {entry.location}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1.5 align-start">
                  {getStatusBadge(entry.applicationStatus)}
                  <div className="flex items-center gap-2">
                    {getResponseBadge(entry.responseStatus)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(new Date(entry.dateAppliedOrContacted), 'MMM d, yyyy')}
                  </div>
                  {entry.interviewDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">
                      <Clock className="h-3 w-3" />
                      Interview: {format(new Date(entry.interviewDate), 'MMM d')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground/80">
                      {entry.followupCount} {entry.followupCount === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  {entry.nextFollowupDate && entry.responseStatus === 'NoResponse' && (
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${
                      new Date(entry.nextFollowupDate) <= new Date() 
                        ? 'text-rose-500 animate-pulse' 
                        : 'text-muted-foreground/60'
                    }`}>
                      Due: {format(new Date(entry.nextFollowupDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted-foreground/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 border-border/50">
                    <DropdownMenuItem onClick={() => onEdit(entry)} className="gap-2 text-xs font-medium py-2">
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Details
                    </DropdownMenuItem>
                    {entry.responseStatus === 'NoResponse' && entry.followupCount < 3 && (
                      <DropdownMenuItem 
                        onClick={(e) => handleFollowup(e, entry.id)} 
                        disabled={isPending}
                        className="gap-2 text-xs font-bold py-2 text-primary focus:text-primary transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Log Follow-up
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem 
                      onClick={(e) => handleDelete(e, entry.id)}
                      disabled={isPending}
                      className="gap-2 text-xs font-medium py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Entry
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
