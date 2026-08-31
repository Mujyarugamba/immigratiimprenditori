"use server";

import { revalidatePath } from "next/cache";
import {
  approveEditorialInterview,
  declineEditorialInterview,
  markEditorialInterviewContacted,
  markEditorialInterviewInterviewed,
  scheduleEditorialInterview,
  startEditorialInterviewFactCheck,
  updateEditorialInterviewConsent,
} from "@/lib/data/editorial/interviews";
import {
  isInterviewConsentStatus,
  type InterviewConsentKind,
} from "@/lib/editorial/interview-workflow";
import { toUserMessage } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";

export type InterviewWorkflowActionState = {
  ok: boolean;
  message?: string;
};

const OPERATIONS = [
  "mark_contacted",
  "schedule",
  "mark_interviewed",
  "start_fact_check",
  "approve",
  "decline",
  "update_consent",
] as const;

type InterviewWorkflowOperation = (typeof OPERATIONS)[number];

async function requireEditorialSession() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    return { ok: false as const, message: "Accesso redazionale richiesto." };
  }
  if (!session.accountId) {
    return { ok: false as const, message: "Account redazionale non risolto." };
  }
  return { ok: true as const, session };
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseOperation(value: string): InterviewWorkflowOperation | null {
  return (OPERATIONS as readonly string[]).includes(value)
    ? (value as InterviewWorkflowOperation)
    : null;
}

function parseConsentKind(value: string): InterviewConsentKind | null {
  return ["publication", "quote", "image", "video"].includes(value)
    ? (value as InterviewConsentKind)
    : null;
}

function revalidateInterview(contentId: string) {
  revalidatePath(`/app/redazione/contenuti/${contentId}`);
  revalidatePath("/app/redazione/lancio");
  revalidatePath("/app/redazione/voci-candidate");
}

export async function updateInterviewWorkflowAction(
  _prev: InterviewWorkflowActionState,
  formData: FormData,
): Promise<InterviewWorkflowActionState> {
  const gate = await requireEditorialSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const contentId = str(formData, "content_id");
  const operation = parseOperation(str(formData, "operation"));
  if (!contentId || !operation) {
    return { ok: false, message: "Operazione intervista non valida." };
  }

  let result;
  let successMessage: string;

  switch (operation) {
    case "mark_contacted":
      result = await markEditorialInterviewContacted(contentId);
      successMessage = "Contatto registrato. Nessun messaggio è stato inviato dal sistema.";
      break;

    case "schedule": {
      const scheduledForRaw = str(formData, "scheduled_for_iso");
      const scheduledFor = new Date(scheduledForRaw);
      if (!scheduledForRaw || Number.isNaN(scheduledFor.getTime())) {
        return { ok: false, message: "Data e ora dell’intervista non valide." };
      }
      if (scheduledFor.getTime() <= Date.now()) {
        return { ok: false, message: "La programmazione deve essere nel futuro." };
      }
      result = await scheduleEditorialInterview(contentId, scheduledFor.toISOString());
      successMessage = "Intervista programmata.";
      break;
    }

    case "mark_interviewed":
      result = await markEditorialInterviewInterviewed(contentId);
      successMessage = "Intervista registrata come svolta.";
      break;

    case "start_fact_check":
      result = await startEditorialInterviewFactCheck(contentId);
      successMessage = "Fact-check avviato.";
      break;

    case "approve":
      result = await approveEditorialInterview(contentId);
      successMessage = "Workflow intervista approvato. La pubblicazione del contenuto resta separata.";
      break;

    case "decline":
      result = await declineEditorialInterview(contentId);
      successMessage = "Intervista registrata come declinata. Nessun contenuto è stato pubblicato.";
      break;

    case "update_consent": {
      const kind = parseConsentKind(str(formData, "consent_kind"));
      const statusRaw = str(formData, "consent_status");
      if (!kind || !isInterviewConsentStatus(statusRaw)) {
        return { ok: false, message: "Consenso non valido." };
      }
      if ((kind === "publication" || kind === "quote") && statusRaw === "not_required") {
        return {
          ok: false,
          message: "Pubblicazione e citazioni richiedono una decisione esplicita: concesso o negato.",
        };
      }
      result = await updateEditorialInterviewConsent(contentId, kind, statusRaw);
      successMessage = "Consenso aggiornato.";
      break;
    }
  }

  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error) };
  }

  revalidateInterview(contentId);
  return { ok: true, message: successMessage };
}
