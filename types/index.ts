export const OPPORTUNITY_TYPES = ["JobApplication", "ColdEmail", "LinkedInDM"] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const DESIGNATIONS = ["CTO", "CEO", "HR", "Recruiter", "Founder", "Other"] as const;
export type Designation = (typeof DESIGNATIONS)[number];

export const APPLICATION_STATUSES = [
  "Draft",
  "Applied",
  "UnderReview",
  "InterviewScheduled",
  "Offer",
  "Rejected",
  "Closed",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const RESPONSE_STATUSES = ["NoResponse", "Responded", "Rejected", "Ghosted"] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

// Display labels for enums
export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  JobApplication: "Job Application",
  ColdEmail: "Cold Email",
  LinkedInDM: "LinkedIn DM",
};

export const DESIGNATION_LABELS: Record<Designation, string> = {
  CTO: "CTO",
  CEO: "CEO",
  HR: "HR",
  Recruiter: "Recruiter",
  Founder: "Founder",
  Other: "Other",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  Draft: "Draft",
  Applied: "Applied",
  UnderReview: "Under Review",
  InterviewScheduled: "Interview Scheduled",
  Offer: "Offer",
  Rejected: "Rejected",
  Closed: "Closed",
};

export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  NoResponse: "No Response",
  Responded: "Responded",
  Rejected: "Rejected",
  Ghosted: "Ghosted",
};
