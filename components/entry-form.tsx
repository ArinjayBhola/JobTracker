'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobEntry } from '@/db/schema';
import {
  OPPORTUNITY_TYPES,
  DESIGNATIONS,
  APPLICATION_STATUSES,
  RESPONSE_STATUSES,
  OPPORTUNITY_TYPE_LABELS,
  DESIGNATION_LABELS,
  APPLICATION_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
} from '@/types';
import { X, Loader2, ChevronRight, Plus } from 'lucide-react';

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JobEntry | null;
  onSubmit: (data: FormData) => Promise<void>;
}

// Animated field component
function FormField({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number;
}) {
  return (
    <div 
      className="animate-slide-in-bottom"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Section component with modern solid design
function Section({ 
  title, 
  children,
  delay = 0
}: { 
  title: string; 
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div 
      className="animate-slide-in-bottom"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[11px] font-bold text-muted-foreground/60 tracking-[0.1em] uppercase">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Styled input with premium focus ring
function StyledInput({ 
  className = '', 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      className={`h-9 bg-background/50 border-border/40 hover:border-border/60 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-xs font-medium placeholder:text-muted-foreground/40 ${className}`}
      {...props}
    />
  );
}

// Styled select trigger
function StyledSelectTrigger({ children }: { children: React.ReactNode }) {
  return (
    <SelectTrigger className="h-9 bg-background/50 border-border/40 hover:border-border/60 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-xs font-medium">
      {children}
    </SelectTrigger>
  );
}

export function EntryForm({ open, onOpenChange, entry, onSubmit }: EntryFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-background border-border/40 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-sm font-bold tracking-tight">
              {entry ? 'Edit Opportunity' : 'New Opportunity'}
            </DialogTitle>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            {entry ? 'Update existing tracking details.' : 'Log a new application or outreach event.'}
          </p>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {entry && <input type="hidden" name="id" value={entry.id} />}
          
          <div className="px-6 py-6 max-h-[65vh] overflow-y-auto space-y-8 custom-scrollbar">
            {/* Company Info */}
            <Section title="Company info" delay={0}>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={50}>
                    <Label htmlFor="companyName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Company <span className="text-destructive">*</span>
                    </Label>
                    <StyledInput
                      id="companyName"
                      name="companyName"
                      required
                      defaultValue={entry?.companyName ?? ''}
                      placeholder="e.g. OpenAI"
                    />
                  </FormField>
                  <FormField delay={80}>
                    <Label htmlFor="jobRole" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <StyledInput
                      id="jobRole"
                      name="jobRole"
                      required
                      defaultValue={entry?.jobRole ?? ''}
                      placeholder="e.g. Frontend Engineer"
                    />
                  </FormField>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={110}>
                    <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Location
                    </Label>
                    <StyledInput
                      id="location"
                      name="location"
                      defaultValue={entry?.location ?? ''}
                      placeholder="Remote, NYC..."
                    />
                  </FormField>
                  <FormField delay={140}>
                    <Label htmlFor="jobLink" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Job URL
                    </Label>
                    <StyledInput
                      id="jobLink"
                      name="jobLink"
                      type="url"
                      defaultValue={entry?.jobLink ?? ''}
                      placeholder="https://..."
                    />
                  </FormField>
                </div>
              </div>
            </Section>

            {/* Outreach Info */}
            <Section title="Outreach" delay={100}>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={170}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      name="opportunityType"
                      defaultValue={entry?.opportunityType ?? 'JobApplication'}
                    >
                      <StyledSelectTrigger>
                        <SelectValue />
                      </StyledSelectTrigger>
                      <SelectContent className="border-border/40">
                        {OPPORTUNITY_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs font-medium focus:bg-primary/5">
                            {OPPORTUNITY_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField delay={200}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Designation
                    </Label>
                    <Select
                      name="designation"
                      defaultValue={entry?.designation ?? ''}
                    >
                      <StyledSelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </StyledSelectTrigger>
                      <SelectContent className="border-border/40">
                        {DESIGNATIONS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs font-medium focus:bg-primary/5">
                            {DESIGNATION_LABELS[d]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={230}>
                    <Label htmlFor="contactName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Contact Name
                    </Label>
                    <StyledInput
                      id="contactName"
                      name="contactName"
                      defaultValue={entry?.contactName ?? ''}
                      placeholder="Name"
                    />
                  </FormField>
                  <FormField delay={260}>
                    <Label htmlFor="linkedinUrl" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      LinkedIn
                    </Label>
                    <StyledInput
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      defaultValue={entry?.linkedinUrl ?? ''}
                      placeholder="Profile URL"
                    />
                  </FormField>
                </div>
              </div>
            </Section>

            {/* Tracking Status */}
            <Section title="Tracking" delay={200}>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={290}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Date Applied <span className="text-destructive">*</span>
                    </Label>
                    <StyledInput
                      name="dateAppliedOrContacted"
                      type="date"
                      required
                      defaultValue={entry?.dateAppliedOrContacted ?? today}
                    />
                  </FormField>
                  <FormField delay={320}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Interview
                    </Label>
                    <StyledInput
                      name="interviewDate"
                      type="date"
                      defaultValue={entry?.interviewDate ?? ''}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField delay={350}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Pipeline
                    </Label>
                    <Select
                      name="applicationStatus"
                      defaultValue={entry?.applicationStatus ?? 'Draft'}
                    >
                      <StyledSelectTrigger>
                        <SelectValue />
                      </StyledSelectTrigger>
                      <SelectContent className="border-border/40">
                        {APPLICATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs font-medium focus:bg-primary/5">
                            {APPLICATION_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField delay={380}>
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Response
                    </Label>
                    <Select
                      name="responseStatus"
                      defaultValue={entry?.responseStatus ?? 'NoResponse'}
                    >
                      <StyledSelectTrigger>
                        <SelectValue />
                      </StyledSelectTrigger>
                      <SelectContent className="border-border/40">
                        {RESPONSE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs font-medium focus:bg-primary/5">
                            {RESPONSE_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>
            </Section>

            {/* Notes */}
            <Section title="Notes" delay={300}>
              <FormField delay={410}>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  defaultValue={entry?.notes ?? ''}
                  placeholder="Any additional notes..."
                  className="resize-none bg-background/50 border-border/40 hover:border-border/60 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200 text-xs font-medium placeholder:text-muted-foreground/40"
                />
              </FormField>
            </Section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/20 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                {loading ? 'Processing...' : 'Ready to save'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-8 text-[11px] font-bold uppercase tracking-tight hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-8 px-4 text-[11px] font-bold uppercase tracking-tight bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
              >
                {entry ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
