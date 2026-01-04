"use client";

import { JobEntry } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Mail, Linkedin, ExternalLink, Calendar, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  entry: JobEntry;
  onEdit: (entry: JobEntry) => void;
  onDelete: (id: string) => void;
}

export function KanbanCard({ entry, onEdit, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const daysSince = formatDistanceToNow(new Date(entry.dateAppliedOrContacted), { addSuffix: true });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative p-3 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary z-50 shadow-xl",
      )}
      {...attributes}
      {...listeners}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-sm truncate">{entry.companyName}</h4>
            <p className="text-xs text-muted-foreground truncate">{entry.jobRole}</p>
          </div>

          <div
            className="flex gap-1"
            onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(entry)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(entry.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{daysSince}</span>
          {entry.opportunityType === "LinkedInDM" && <Linkedin className="h-3 w-3 text-blue-600" />}
          {entry.opportunityType === "ColdEmail" && <Mail className="h-3 w-3 text-emerald-600" />}
        </div>

        {/* Footer/Meta */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed">
          <div className="flex -space-x-1">
            {entry.interviewDate && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1 bg-blue-50 border-blue-200 text-blue-700">
                <Calendar className="h-3 w-3 mr-1" />
                Interview
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {entry.jobLink && (
              <a
                href={entry.jobLink}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
