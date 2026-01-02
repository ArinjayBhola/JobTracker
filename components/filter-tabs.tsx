'use client';

import { FilterType } from '@/actions/job-tracker';
import { 
  List, 
  Clock, 
  Hourglass, 
  Calendar, 
  Ghost, 
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: Record<FilterType, number>;
}

const FILTERS: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Jobs', icon: List },
  { value: 'followups', label: 'Follow-ups', icon: Clock },
  { value: 'waiting', label: 'In Pipeline', icon: Hourglass },
  { value: 'interviews', label: 'Interviews', icon: Calendar },
  { value: 'ghosted', label: 'Ghosted', icon: Ghost },
  { value: 'closed', label: 'Archived', icon: XCircle },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg w-fit">
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-tight transition-all duration-200",
              isActive 
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-3.5 w-3.5 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground/60"
            )} />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
