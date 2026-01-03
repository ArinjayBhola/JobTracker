'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JobEntry } from '@/db/schema'
import {
  OPPORTUNITY_TYPES,
  DESIGNATIONS,
  APPLICATION_STATUSES,
  RESPONSE_STATUSES,
  OPPORTUNITY_TYPE_LABELS,
  DESIGNATION_LABELS,
  APPLICATION_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
} from '@/types'
import { Loader2 } from 'lucide-react'

interface EntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: JobEntry | null
  onSubmit: (data: FormData) => Promise<void>
}

/* ----------------------------- */
/* Small UI helpers              */
/* ----------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="rounded-md border bg-muted/30 p-4 space-y-4">
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </Label>
      {children}
    </div>
  )
}

/* ----------------------------- */
/* EntryForm                     */
/* ----------------------------- */

export function EntryForm({
  open,
  onOpenChange,
  entry,
  onSubmit,
}: EntryFormProps) {
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base">
            {entry ? 'Edit Opportunity' : 'New Opportunity'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Track job applications and outreach.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {entry && (
            <input type="hidden" name="id" value={entry.id} />
          )}

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-8">
            {/* Company */}
            <Section title="Company">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company" required>
                  <Input
                    name="companyName"
                    defaultValue={entry?.companyName ?? ''}
                    required
                  />
                </Field>

                <Field label="Role" required>
                  <Input
                    name="jobRole"
                    defaultValue={entry?.jobRole ?? ''}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Location">
                  <Input
                    name="location"
                    defaultValue={entry?.location ?? ''}
                  />
                </Field>

                <Field label="Job URL">
                  <Input
                    name="jobLink"
                    type="url"
                    defaultValue={entry?.jobLink ?? ''}
                  />
                </Field>
              </div>
            </Section>

            {/* Outreach */}
            <Section title="Outreach">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Opportunity Type" required>
                  <Select
                    name="opportunityType"
                    defaultValue={
                      entry?.opportunityType ?? 'JobApplication'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPPORTUNITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {OPPORTUNITY_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Designation">
                  <Select
                    name="designation"
                    defaultValue={entry?.designation ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {DESIGNATION_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            {/* Tracking */}
            <Section title="Tracking">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date Applied" required>
                  <Input
                    type="date"
                    name="dateAppliedOrContacted"
                    defaultValue={
                      entry?.dateAppliedOrContacted ?? today
                    }
                    required
                  />
                </Field>

                <Field label="Interview Date">
                  <Input
                    type="date"
                    name="interviewDate"
                    defaultValue={entry?.interviewDate ?? ''}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Application Status">
                  <Select
                    name="applicationStatus"
                    defaultValue={
                      entry?.applicationStatus ?? 'Draft'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {APPLICATION_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Response Status">
                  <Select
                    name="responseStatus"
                    defaultValue={
                      entry?.responseStatus ?? 'NoResponse'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {RESPONSE_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Notes">
              <Textarea
                name="notes"
                rows={3}
                defaultValue={entry?.notes ?? ''}
              />
            </Section>
          </div>

          <footer className="border-t px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {loading && (
                <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
              )}
              {loading ? 'Saving…' : 'Ready'}
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {entry ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  )
}
