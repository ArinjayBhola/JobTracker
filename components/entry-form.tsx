"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { JobEntry } from "@/db/schema";
import {
  OPPORTUNITY_TYPES,
  DESIGNATIONS,
  APPLICATION_STATUSES,
  RESPONSE_STATUSES,
  OPPORTUNITY_TYPE_LABELS,
  DESIGNATION_LABELS,
  APPLICATION_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
} from "@/types";
import { Loader2, Building2, MapPin, Globe, User, Briefcase, Calendar, FileText, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JobEntry | null;
  onSubmit: (data: FormData) => Promise<void>;
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <div className="p-1.5 rounded-md bg-primary/5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="grid gap-5 px-1">{children}</div>
    </section>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function EntryForm({ open, onOpenChange, entry, onSubmit }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        <DialogHeader className="px-6 py-6 border-b border-border/50 bg-muted/10">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            {entry ? (
               <>
                 <Briefcase className="h-5 w-5 text-primary" />
                 Edit Opportunity
               </>
            ) : (
                <>
                  <Send className="h-5 w-5 text-primary" />
                  New Opportunity
                </>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {entry ? "Update the details of your application." : "Track a new job application or networking outreach."}
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-h-[80vh]">
          {entry && (
            <input
              type="hidden"
              name="id"
              value={entry.id}
            />
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
            <Section title="Company & Role" icon={Building2}>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Company Name"
                  required>
                  <Input
                    name="companyName"
                    defaultValue={entry?.companyName ?? ""}
                    placeholder="Reviewing Tech, Google, etc."
                    required
                    className="font-medium"
                  />
                </Field>

                <Field
                  label="Job Role"
                  required>
                  <Input
                    name="jobRole"
                    defaultValue={entry?.jobRole ?? ""}
                    placeholder="Senior Frontend Engineer"
                    required
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Location">
                   <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                      <Input
                        name="location"
                        defaultValue={entry?.location ?? ""}
                        placeholder="Remote, Bengaluru"
                        className="pl-9"
                      />
                   </div>
                </Field>

                <Field label="Job URL">
                   <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                      <Input
                        name="jobLink"
                        type="url"
                        defaultValue={entry?.jobLink ?? ""}
                        placeholder="https://lnkd.in/..."
                        className="pl-9 text-blue-600 underline-offset-4 hover:underline"
                      />
                   </div>
                </Field>
              </div>
            </Section>

            <Section title="Point of Contact" icon={User}>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name">
                  <Input
                    name="contactName"
                    defaultValue={entry?.contactName ?? ""}
                    placeholder="Recruiter or Hiring Manager"
                  />
                </Field>

                <Field label="Designation">
                  <Select
                    name="designation"
                    defaultValue={entry?.designation ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem
                          key={d}
                          value={d}>
                          {DESIGNATION_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email">
                  <Input
                    name="email"
                    type="email"
                    defaultValue={entry?.email ?? ""}
                    placeholder="person@company.com"
                  />
                </Field>

                <Field label="LinkedIn">
                  <Input
                    name="linkedinUrl"
                    type="url"
                    defaultValue={entry?.linkedinUrl ?? ""}
                    placeholder="https://linkedin.com/in/..."
                  />
                </Field>
              </div>
            </Section>

            <Section title="Status & Classification" icon={Briefcase}>
               <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Type" required>
                    <Select
                      name="opportunityType"
                      defaultValue={entry?.opportunityType ?? "JobApplication"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_TYPES.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}>
                            {OPPORTUNITY_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Current Status">
                    <Select
                      name="applicationStatus"
                      defaultValue={entry?.applicationStatus ?? "Draft"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         {APPLICATION_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}>
                            {APPLICATION_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-5">
                 <Field label="Response">
                    <Select
                      name="responseStatus"
                      defaultValue={entry?.responseStatus ?? "NoResponse"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESPONSE_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}>
                            {RESPONSE_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </Field>
               </div>
            </Section>

            <Section title="Timeline" icon={Calendar}>
                <div className="grid sm:grid-cols-2 gap-5">
                   <Field label="Applied / Contacted On" required>
                      <Input
                        type="date"
                        name="dateAppliedOrContacted"
                        defaultValue={entry?.dateAppliedOrContacted ?? today}
                        required
                      />
                   </Field>

                   <Field label="Interview Date">
                      <Input
                        type="date"
                        name="interviewDate"
                        defaultValue={entry?.interviewDate ?? ""}
                      />
                   </Field>
                </div>
                
                 {entry && (
                  <div className="grid sm:grid-cols-2 gap-5 pt-2">
                    <Field label="Last Follow-up">
                      <Input
                        type="date"
                        name="lastFollowupDate"
                        defaultValue={entry.lastFollowupDate ?? ""}
                      />
                    </Field>

                    <Field label="Follow-up Count">
                      <Input
                        type="number"
                        name="followupCount"
                        min={0}
                        defaultValue={entry.followupCount ?? 0}
                      />
                    </Field>
                  </div>
                )}
            </Section>

            <Section title="Notes" icon={FileText}>
              <Textarea
                name="notes"
                rows={4}
                defaultValue={entry?.notes ?? ""}
                placeholder="Key details, next steps, or specific things to remember..."
                className="resize-none"
              />
            </Section>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/5 sm:justify-between items-center">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <span>Press Save to update your pipeline.</span>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none min-w-[100px] shadow-md hover:shadow-lg transition-all">
                {entry ? "Update Entry" : "Create Entry"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
