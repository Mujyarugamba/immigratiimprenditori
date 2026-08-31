export const INTERVIEW_WORKFLOW_STATUSES = [
  "candidate",
  "contacted",
  "scheduled",
  "interviewed",
  "fact_check",
  "approved",
  "declined",
  "closed",
] as const;

export type InterviewWorkflowStatus = (typeof INTERVIEW_WORKFLOW_STATUSES)[number];

export const INTERVIEW_CONSENT_STATUSES = [
  "pending",
  "granted",
  "declined",
  "not_required",
] as const;

export type InterviewConsentStatus = (typeof INTERVIEW_CONSENT_STATUSES)[number];
export type InterviewConsentKind = "publication" | "quote" | "image" | "video";

const TRANSITIONS: Record<InterviewWorkflowStatus, readonly InterviewWorkflowStatus[]> = {
  candidate: ["contacted"],
  contacted: ["scheduled", "interviewed", "declined"],
  scheduled: ["interviewed", "declined"],
  interviewed: ["fact_check"],
  fact_check: ["approved"],
  approved: [],
  declined: [],
  closed: [],
};

export function isInterviewWorkflowStatus(value: string): value is InterviewWorkflowStatus {
  return (INTERVIEW_WORKFLOW_STATUSES as readonly string[]).includes(value);
}

export function isInterviewConsentStatus(value: string): value is InterviewConsentStatus {
  return (INTERVIEW_CONSENT_STATUSES as readonly string[]).includes(value);
}

export function canTransitionInterview(
  from: InterviewWorkflowStatus,
  to: InterviewWorkflowStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function canEditInterviewConsents(status: InterviewWorkflowStatus): boolean {
  return ["contacted", "scheduled", "interviewed", "fact_check"].includes(status);
}

export function canApproveInterview(input: {
  workflowStatus: InterviewWorkflowStatus;
  publicationConsentStatus: InterviewConsentStatus;
  quoteApprovalStatus: InterviewConsentStatus;
}): boolean {
  return (
    input.workflowStatus === "fact_check" &&
    input.publicationConsentStatus === "granted" &&
    input.quoteApprovalStatus === "granted"
  );
}
