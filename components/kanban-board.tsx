'use client'

import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors, 
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core'
import { useState } from 'react'
import { JobEntry } from '@/db/schema'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

const COLUMNS = [
  { id: 'Draft', title: 'Draft' },
  { id: 'Applied', title: 'Applied' },
  { id: 'UnderReview', title: 'Under Review' },
  { id: 'InterviewScheduled', title: 'Interview' },
  { id: 'Offer', title: 'Offer' },
  { id: 'Rejected', title: 'Rejected' },
  { id: 'Closed', title: 'Closed' },
]

interface KanbanBoardProps {
  entries: JobEntry[]
  onStatusChange: (id: string, newStatus: string) => void
  onEdit: (entry: JobEntry) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ entries, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const activeEntry = entries.find(e => e.id === active.id)
      if (activeEntry && activeEntry.applicationStatus !== over.id) {
        onStatusChange(active.id as string, over.id as string)
      }
    }
  }

  const activeEntry = activeId ? entries.find(e => e.id === activeId) : null

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 p-1 min-w-max">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              entries={entries.filter(e => e.applicationStatus === col.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeEntry ? (
          <KanbanCard 
            entry={activeEntry} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
