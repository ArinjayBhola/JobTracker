"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { JobEntry } from "@/db/schema";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  entries: JobEntry[];
  onEdit: (entry: JobEntry) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ id, title, entries, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col w-70 shrink-0 bg-muted/30 rounded-2xl border">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-sm rounded-t-2xl z-10">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {title}
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono">{entries.length}</span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={cn("flex-1 p-3 space-y-3 min-h-[500px] transition-colors", isOver && "bg-primary/5 rounded-b-2xl")}>
        {entries.map((entry) => (
          <KanbanCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {entries.length === 0 && (
          <div className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
            Drop here to update status
          </div>
        )}
      </div>
    </div>
  );
}
