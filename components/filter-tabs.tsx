"use client";

import { FilterType } from "@/actions/job-tracker";
import { List, Clock, Hourglass, Calendar, Ghost, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: {
  value: FilterType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All", icon: List },
  { value: "followups", label: "Follow-ups", icon: Clock },
  { value: "waiting", label: "Pipeline", icon: Hourglass },
  { value: "interviews", label: "Interviews", icon: Calendar },
  { value: "ghosted", label: "Ghosted", icon: Ghost },
  { value: "archived", label: "Archived", icon: Archive },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
      {FILTERS.map(({ value, label, icon: Icon }) => {
        const isActive = activeFilter === value;

        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={cn(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}>
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
