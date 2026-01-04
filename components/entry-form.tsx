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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-muted/30 px-6 py-6 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {entry ? 'Edit Opportunity' : 'New Opportunity'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track job applications, networking outreach, and interview stages.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {entry && <input type="hidden" name="id" value={entry.id} />}

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Company & Role Section */}
              <Section title="Opportunity Details">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Company Name" required>
                    <Input
                      name="companyName"
                      defaultValue={entry?.companyName ?? ''}
                      placeholder="e.g. Google, Stripe, or Early-stage Startup"
                      required
                      className="bg-background"
                    />
                  </Field>

                  <Field label="Job Role / Title" required>
                    <Input
                      name="jobRole"
                      defaultValue={entry?.jobRole ?? ''}
                      placeholder="e.g. Senior Frontend Engineer"
                      required
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-4">
                  <Field label="Work Location">
                    <Input
                      name="location"
                      defaultValue={entry?.location ?? ''}
                      placeholder="e.g. Remote, Bangalore, or Hybrid"
                      className="bg-background"
                    />
                  </Field>

                  <Field label="Job Posting URL">
                    <Input
                      name="jobLink"
                      type="url"
                      defaultValue={entry?.jobLink ?? ''}
                      placeholder="e.g. https://linkedin.com/jobs/..."
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-4">
                  <Field label="Contact Person Name">
                    <Input
                      name="contactName"
                      defaultValue={entry?.contactName ?? ''}
                      placeholder="e.g. Arinjay Bhola"
                      className="bg-background"
                    />
                  </Field>

                  <Field label="Contact Designation">
                    <Select
                      name="designation"
                      defaultValue={entry?.designation ?? ''}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="e.g. Recruiter, Founder" />
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

                <div className="grid gap-5 md:grid-cols-2 mt-4">
                  <Field label="Contact Email">
                    <Input
                      name="email"
                      type="email"
                      defaultValue={entry?.email ?? ''}
                      placeholder="e.g. arinjay@example.com"
                      className="bg-background"
                    />
                  </Field>

                  <Field label="Contact LinkedIn Profile">
                    <Input
                      name="linkedinUrl"
                      type="url"
                      defaultValue={entry?.linkedinUrl ?? ''}
                      placeholder="e.g. https://linkedin.com/in/..."
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-4">
                  {/* Duplicate jobLink field removed here */}
                </div>
              </Section>

              {/* Outreach & Classification */}
              <Section title="Classification">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Opportunity Type" required>
                    <Select
                      name="opportunityType"
                      defaultValue={entry?.opportunityType ?? 'JobApplication'}
                    >
                      <SelectTrigger className="bg-background">
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
                </div>
              </Section>

              {/* Tracking & Timeline */}
              <Section title="Status & Timeline">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Application / Contact Date" required>
                    <Input
                      type="date"
                      name="dateAppliedOrContacted"
                      defaultValue={entry?.dateAppliedOrContacted ?? today}
                      required
                      className="bg-background"
                    />
                  </Field>

                  <Field label="Interview Date (if any)">
                    <Input
                      type="date"
                      name="interviewDate"
                      defaultValue={entry?.interviewDate ?? ''}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2 mt-4">
                  <Field label="Application Status">
                    <Select
                      name="applicationStatus"
                      defaultValue={entry?.applicationStatus ?? 'Draft'}
                    >
                      <SelectTrigger className="bg-background">
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
                      defaultValue={entry?.responseStatus ?? 'NoResponse'}
                    >
                      <SelectTrigger className="bg-background">
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

                {entry && (
                  <div className="grid gap-5 md:grid-cols-2 mt-4 pt-4 border-t border-dashed">
                    <Field label="Last Follow-up Date">
                      <Input
                        type="date"
                        name="lastFollowupDate"
                        defaultValue={entry.lastFollowupDate ?? ''}
                        className="bg-background"
                      />
                    </Field>

                    <Field label="Follow-up Count">
                      <Input
                        type="number"
                        name="followupCount"
                        min={0}
                        defaultValue={entry.followupCount ?? 0}
                        className="bg-background"
                        placeholder="e.g. 1"
                      />
                    </Field>
                  </div>
                )}
              </Section>

              {/* Notes */}
              <Section title="Additional Notes">
                <Textarea
                  name="notes"
                  rows={4}
                  defaultValue={entry?.notes ?? ''}
                  placeholder="Paste job description highlights, interview prep notes, or follow-up strategies here..."
                  className="bg-background resize-none"
                />
              </Section>
            </div>
          </div>

          <footer className="border-t bg-muted/20 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Saving opportunity...</span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Form Ready
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="hover:bg-background"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px] font-semibold shadow-sm">
                {entry ? 'Update Entry' : 'Create Opportunity'}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  )
}
