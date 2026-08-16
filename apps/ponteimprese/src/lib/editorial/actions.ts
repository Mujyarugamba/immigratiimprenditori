"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createEditorialContent,
  publishEditorialContent,
  updateEditorialContent,
  withdrawEditorialContent,
} from "@/lib/data/editorial/contents";
import {
  createObservatoryIndicator,
  createObservatoryIndicatorValue,
  createObservatorySource,
  publishObservatoryIndicator,
  reviseObservatoryIndicatorValue,
  updateObservatoryIndicator,
  updateObservatorySource,
  withdrawObservatoryIndicator,
} from "@/lib/data/editorial/observatory";
import {
  addEditorialOrganizationOfficial,
  createEditorialOrganization,
  publishEditorialOrganization,
  updateEditorialOrganization,
  withdrawEditorialOrganization,
} from "@/lib/data/editorial/organizations";
import {
  publishEditorialOpportunity,
  rejectEditorialOpportunity,
  updateEditorialOpportunity,
  withdrawEditorialOpportunity,
} from "@/lib/data/editorial/opportunities";
import {
  markQuestionableEditorialMarketResource,
  publishEditorialMarketResource,
  rejectEditorialMarketResource,
  withdrawEditorialMarketResource,
} from "@/lib/data/editorial/markets";
import {
  publishEditorialEvent,
  updateEditorialEvent,
  updateEditorialEventEdition,
  withdrawEditorialEvent,
} from "@/lib/data/editorial/events";
import { getDefaultLanguageId } from "@/lib/data/editorial/catalogs";
import { slugify } from "@/lib/editorial/slug";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function requireEditorSession() {
  const session = await getApplicationSession();
  if (!session) {
    return { ok: false as const, message: "Sessione scaduta. Accedi di nuovo." };
  }
  if (!session.isEditor && !session.isApplicationAdmin) {
    return { ok: false as const, message: "Accesso riservato ai redattori." };
  }
  if (!session.isActiveAccount || !session.personId) {
    return { ok: false as const, message: "Completa il profilo per usare la redazione." };
  }
  return { ok: true as const, session, personId: session.personId };
}

function fail(error: AppError): FormActionState {
  return {
    ok: false,
    message: toUserMessage(error),
    fieldErrors: error.fieldErrors,
  };
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v || null;
}

// ---------------------------------------------------------------------------
// Contents
// ---------------------------------------------------------------------------

export async function createEditorialContentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const title = str(formData, "title");
  const body = str(formData, "body");
  const type_code = str(formData, "type_code");
  let slug = str(formData, "slug");
  const languageRaw = str(formData, "language_id");

  if (!title) {
    return {
      ok: false,
      message: "Il titolo è obbligatorio.",
      fieldErrors: { title: "Obbligatorio" },
    };
  }
  if (!body) {
    return {
      ok: false,
      message: "Il corpo è obbligatorio.",
      fieldErrors: { body: "Obbligatorio" },
    };
  }
  if (!type_code) {
    return {
      ok: false,
      message: "Seleziona un tipo.",
      fieldErrors: { type_code: "Obbligatorio" },
    };
  }

  if (!slug) slug = slugify(title);
  if (!slug) {
    return {
      ok: false,
      message: "Lo slug è obbligatorio.",
      fieldErrors: { slug: "Obbligatorio" },
    };
  }

  let language_id = languageRaw ? Number(languageRaw) : NaN;
  if (!Number.isFinite(language_id)) {
    const fallback = await getDefaultLanguageId();
    if (!fallback) {
      return { ok: false, message: "Lingua predefinita non disponibile." };
    }
    language_id = fallback;
  }

  const result = await createEditorialContent({
    type_code,
    language_id,
    title,
    slug,
    body,
    subtitle: optionalStr(formData, "subtitle"),
    abstract: optionalStr(formData, "abstract"),
    primary_category_code: optionalStr(formData, "primary_category_code"),
    cover_url: optionalStr(formData, "cover_url"),
    source_url: optionalStr(formData, "source_url"),
    source_label: optionalStr(formData, "source_label"),
  });

  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/contenuti");
  redirect(`/app/redazione/contenuti/${result.id}`);
}

export async function updateEditorialContentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Contenuto non valido." };

  const languageRaw = str(formData, "language_id");
  const patch = {
    type_code: str(formData, "type_code") || undefined,
    title: str(formData, "title") || undefined,
    slug: str(formData, "slug") || undefined,
    body: str(formData, "body") || undefined,
    subtitle: optionalStr(formData, "subtitle"),
    abstract: optionalStr(formData, "abstract"),
    primary_category_code: optionalStr(formData, "primary_category_code"),
    cover_url: optionalStr(formData, "cover_url"),
    source_url: optionalStr(formData, "source_url"),
    source_label: optionalStr(formData, "source_label"),
    editorial_status: str(formData, "editorial_status") || undefined,
    language_id: languageRaw ? Number(languageRaw) : undefined,
    is_featured: formData.get("is_featured") === "true",
  };

  const result = await updateEditorialContent(id, patch);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/contenuti");
  revalidatePath(`/app/redazione/contenuti/${id}`);
  return { ok: true, message: "Contenuto aggiornato." };
}

export async function publishEditorialContentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Contenuto non valido." };

  const result = await publishEditorialContent(id, gate.personId);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/contenuti");
  revalidatePath(`/app/redazione/contenuti/${id}`);

  let message = "Contenuto pubblicato.";
  if (result.authorError) {
    message += ` Nota: inserimento editorial_responsible non riuscito (${result.authorError}); la pubblicazione è comunque stata tentata.`;
  } else if (result.authorInserted) {
    message += " Responsabile editoriale registrato.";
  }

  return { ok: true, message };
}

export async function withdrawEditorialContentAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Contenuto non valido." };

  const result = await withdrawEditorialContent(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/contenuti");
  revalidatePath(`/app/redazione/contenuti/${id}`);
  return { ok: true, message: "Contenuto ritirato." };
}

// ---------------------------------------------------------------------------
// Observatory — indicators
// ---------------------------------------------------------------------------

export async function createIndicatorAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const title = str(formData, "title");
  let code = str(formData, "code");
  let slug = str(formData, "slug");
  if (!code) code = slugify(title).replace(/-/g, "_");
  if (!slug) slug = slugify(title);

  const result = await createObservatoryIndicator({
    code,
    slug,
    title,
    description: str(formData, "description"),
    purpose_text: str(formData, "purpose_text"),
    methodology_summary: str(formData, "methodology_summary"),
    value_nature: str(formData, "value_nature"),
    unit_code: str(formData, "unit_code"),
    periodicity: str(formData, "periodicity"),
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/indicatori");
  redirect(`/app/redazione/osservatorio/indicatori/${result.id}`);
}

export async function updateIndicatorAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Indicatore non valido." };

  const result = await updateObservatoryIndicator(id, {
    code: str(formData, "code") || undefined,
    slug: str(formData, "slug") || undefined,
    title: str(formData, "title") || undefined,
    description: str(formData, "description") || undefined,
    purpose_text: str(formData, "purpose_text") || undefined,
    methodology_summary: str(formData, "methodology_summary") || undefined,
    value_nature: str(formData, "value_nature") || undefined,
    unit_code: str(formData, "unit_code") || undefined,
    periodicity: str(formData, "periodicity") || undefined,
    operational_status: str(formData, "operational_status") || undefined,
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/indicatori");
  revalidatePath(`/app/redazione/osservatorio/indicatori/${id}`);
  return { ok: true, message: "Indicatore aggiornato." };
}

export async function publishIndicatorAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await publishObservatoryIndicator(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/osservatorio/indicatori");
  revalidatePath(`/app/redazione/osservatorio/indicatori/${id}`);
  return { ok: true, message: "Indicatore pubblicato." };
}

export async function withdrawIndicatorAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await withdrawObservatoryIndicator(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/osservatorio/indicatori");
  revalidatePath(`/app/redazione/osservatorio/indicatori/${id}`);
  return { ok: true, message: "Indicatore ritirato." };
}

// ---------------------------------------------------------------------------
// Observatory — sources
// ---------------------------------------------------------------------------

export async function createSourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const result = await createObservatorySource({
    name: str(formData, "name"),
    producer_name: str(formData, "producer_name"),
    publication_title: str(formData, "publication_title"),
    url: optionalStr(formData, "url"),
    external_identifier: optionalStr(formData, "external_identifier"),
    lifecycle_status: str(formData, "lifecycle_status") || "active",
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/fonti");
  return { ok: true, message: "Fonte creata." };
}

export async function updateSourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await updateObservatorySource(id, {
    name: str(formData, "name") || undefined,
    producer_name: str(formData, "producer_name") || undefined,
    publication_title: str(formData, "publication_title") || undefined,
    url: optionalStr(formData, "url"),
    lifecycle_status: str(formData, "lifecycle_status") || undefined,
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/fonti");
  return { ok: true, message: "Fonte aggiornata." };
}

// ---------------------------------------------------------------------------
// Observatory — values
// ---------------------------------------------------------------------------

export async function createValueAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const indicator_id = str(formData, "indicator_id");
  const numericRaw = str(formData, "numeric_value");
  const numeric_value = Number(numericRaw);

  if (!indicator_id || !Number.isFinite(numeric_value)) {
    return { ok: false, message: "Indicatore e valore numerico obbligatori." };
  }

  const result = await createObservatoryIndicatorValue({
    indicator_id,
    source_id: str(formData, "source_id"),
    numeric_value,
    period_start: str(formData, "period_start"),
    period_end: str(formData, "period_end"),
    quality_code: str(formData, "quality_code"),
    status: str(formData, "status") || "provisional",
    territory_level: optionalStr(formData, "territory_level"),
    territory_label: optionalStr(formData, "territory_label"),
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/valori");
  return { ok: true, message: "Valore creato." };
}

export async function reviseValueAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const oldId = str(formData, "old_id");
  const statusRaw = str(formData, "status");
  const status = statusRaw === "final" ? "final" : "revised";
  const numeric_value = Number(str(formData, "numeric_value"));

  if (!oldId || !Number.isFinite(numeric_value)) {
    return { ok: false, message: "Dati revisione non validi." };
  }

  const result = await reviseObservatoryIndicatorValue(oldId, {
    indicator_id: str(formData, "indicator_id"),
    source_id: str(formData, "source_id"),
    numeric_value,
    period_start: str(formData, "period_start"),
    period_end: str(formData, "period_end"),
    quality_code: str(formData, "quality_code"),
    status,
    territory_level: optionalStr(formData, "territory_level"),
    territory_label: optionalStr(formData, "territory_label"),
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/osservatorio/valori");
  return { ok: true, message: "Valore revisionato; precedente ritirato." };
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export async function createOrganizationAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const name = str(formData, "name");
  let slug = str(formData, "slug");
  if (!slug) slug = slugify(name);

  const result = await createEditorialOrganization({
    type_code: str(formData, "type_code"),
    name,
    slug,
    description: str(formData, "description"),
    short_name: optionalStr(formData, "short_name"),
    summary: optionalStr(formData, "summary"),
    primary_scope_code: optionalStr(formData, "primary_scope_code"),
    website_url: optionalStr(formData, "website_url"),
    email: optionalStr(formData, "email"),
    phone: optionalStr(formData, "phone"),
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/organizzazioni");
  redirect(`/app/redazione/organizzazioni/${result.id}`);
}

export async function updateOrganizationAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await updateEditorialOrganization(id, {
    type_code: str(formData, "type_code") || undefined,
    name: str(formData, "name") || undefined,
    slug: str(formData, "slug") || undefined,
    description: str(formData, "description") || undefined,
    short_name: optionalStr(formData, "short_name"),
    summary: optionalStr(formData, "summary"),
    primary_scope_code: optionalStr(formData, "primary_scope_code"),
    website_url: optionalStr(formData, "website_url"),
    email: optionalStr(formData, "email"),
    phone: optionalStr(formData, "phone"),
    editorial_status: str(formData, "editorial_status") || undefined,
    operational_status: str(formData, "operational_status") || undefined,
  });

  if (!result.ok) return fail(result.error);
  revalidatePath("/app/redazione/organizzazioni");
  revalidatePath(`/app/redazione/organizzazioni/${id}`);
  return { ok: true, message: "Organizzazione aggiornata." };
}

export async function publishOrganizationAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await publishEditorialOrganization(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/organizzazioni");
  revalidatePath(`/app/redazione/organizzazioni/${id}`);
  return { ok: true, message: "Organizzazione pubblicata." };
}

export async function withdrawOrganizationAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  const result = await withdrawEditorialOrganization(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/organizzazioni");
  revalidatePath(`/app/redazione/organizzazioni/${id}`);
  return { ok: true, message: "Organizzazione ritirata." };
}

export async function addOrganizationOfficialAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const organization_id = str(formData, "organization_id");
  const result = await addEditorialOrganizationOfficial({
    organization_id,
    role_kind: str(formData, "role_kind"),
    person_id: optionalStr(formData, "person_id"),
    display_label: optionalStr(formData, "display_label"),
    email: optionalStr(formData, "email"),
    phone: optionalStr(formData, "phone"),
  });

  if (!result.ok) return fail(result.error);
  revalidatePath(`/app/redazione/organizzazioni/${organization_id}`);
  return { ok: true, message: "Referente aggiunto." };
}

// ---------------------------------------------------------------------------
// Opportunities (D1-B.2 editorial queue)
// ---------------------------------------------------------------------------

export async function updateEditorialOpportunityAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Opportunità non valida." };

  const result = await updateEditorialOpportunity(id, {
    summary: optionalStr(formData, "summary"),
    description: optionalStr(formData, "description"),
    purpose: optionalStr(formData, "purpose"),
  });
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/opportunita");
  revalidatePath(`/app/redazione/opportunita/${id}`);
  return { ok: true, message: "Opportunità aggiornata (campi editoriali)." };
}

export async function publishEditorialOpportunityAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Opportunità non valida." };

  const result = await publishEditorialOpportunity(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/opportunita");
  revalidatePath(`/app/redazione/opportunita/${id}`);
  revalidatePath("/opportunita");
  return { ok: true, message: "Opportunità pubblicata." };
}

export async function withdrawEditorialOpportunityAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Opportunità non valida." };

  const result = await withdrawEditorialOpportunity(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/opportunita");
  revalidatePath(`/app/redazione/opportunita/${id}`);
  revalidatePath("/opportunita");
  return { ok: true, message: "Opportunità ritirata." };
}

export async function rejectEditorialOpportunityAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Opportunità non valida." };

  const result = await rejectEditorialOpportunity(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/opportunita");
  revalidatePath(`/app/redazione/opportunita/${id}`);
  return { ok: true, message: "Opportunità esclusa dalla coda attiva." };
}

// ---------------------------------------------------------------------------
// Mercati internazionali (D1-C.4 World Bank M1)
// ---------------------------------------------------------------------------

export async function publishEditorialMarketResourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Risorsa mercato non valida." };

  const result = await publishEditorialMarketResource(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/mercati-internazionali");
  revalidatePath(`/app/redazione/mercati-internazionali/${id}`);
  revalidatePath("/mercati");
  return { ok: true, message: "Risorsa pubblicata (READY)." };
}

export async function markQuestionableEditorialMarketResourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Risorsa mercato non valida." };

  const result = await markQuestionableEditorialMarketResource(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/mercati-internazionali");
  revalidatePath(`/app/redazione/mercati-internazionali/${id}`);
  return {
    ok: true,
    message: "Risorsa mantenuta in revisione (QUESTIONABLE, non pubblica).",
  };
}

export async function rejectEditorialMarketResourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Risorsa mercato non valida." };

  const result = await rejectEditorialMarketResource(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/mercati-internazionali");
  revalidatePath(`/app/redazione/mercati-internazionali/${id}`);
  return { ok: true, message: "Risorsa esclusa (REJECT, non pubblica)." };
}

export async function withdrawEditorialMarketResourceAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Risorsa mercato non valida." };

  const result = await withdrawEditorialMarketResource(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/mercati-internazionali");
  revalidatePath(`/app/redazione/mercati-internazionali/${id}`);
  revalidatePath("/mercati");
  return { ok: true, message: "Risorsa ritirata dalla pubblicazione." };
}

// ---------------------------------------------------------------------------
// Eventi
// ---------------------------------------------------------------------------

export async function updateEditorialEventAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Evento non valido." };

  const editorialStatus = str(formData, "editorial_status");
  if (editorialStatus && editorialStatus !== "draft" && editorialStatus !== "ready") {
    return { ok: false, message: "Stato redazionale non valido." };
  }

  const result = await updateEditorialEvent(id, {
    title: str(formData, "title") || undefined,
    summary: optionalStr(formData, "summary"),
    description: str(formData, "description") || undefined,
    type_code: str(formData, "type_code") || undefined,
    delivery_mode: str(formData, "delivery_mode") || undefined,
    audience_kind: str(formData, "audience_kind") || undefined,
    economic_kind: str(formData, "economic_kind") || undefined,
    external_organization_label: optionalStr(
      formData,
      "external_organization_label",
    ),
    source_url: optionalStr(formData, "source_url"),
    source_label: optionalStr(formData, "source_label"),
    editorial_status: editorialStatus
      ? (editorialStatus as "draft" | "ready")
      : undefined,
    editorial_internal_notes: optionalStr(formData, "editorial_internal_notes"),
  });
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/eventi");
  revalidatePath(`/app/redazione/eventi/${id}`);
  return { ok: true, message: "Evento aggiornato." };
}

function toIsoOrNull(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toISOString();
}

export async function updateEditorialEventEditionAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const eventId = str(formData, "event_id");
  const editionId = str(formData, "edition_id");
  if (!eventId || !editionId) {
    return { ok: false, message: "Edizione non valida." };
  }

  const startsRaw = str(formData, "starts_at");
  const endsRaw = optionalStr(formData, "ends_at");

  const result = await updateEditorialEventEdition(eventId, editionId, {
    starts_at: startsRaw ? (toIsoOrNull(startsRaw) ?? startsRaw) : undefined,
    ends_at: endsRaw === null ? null : toIsoOrNull(endsRaw),
    timezone: str(formData, "timezone") || undefined,
    delivery_mode: str(formData, "delivery_mode") || undefined,
    venue_label: optionalStr(formData, "venue_label"),
    address_text: optionalStr(formData, "address_text"),
    city_text: optionalStr(formData, "city_text"),
    country_ref: optionalStr(formData, "country_ref"),
    online_reference: optionalStr(formData, "online_reference"),
    occurrence_status: str(formData, "occurrence_status") || undefined,
  });
  if (!result.ok) return fail(result.error);

  revalidatePath(`/app/redazione/eventi/${eventId}`);
  return { ok: true, message: "Edizione aggiornata." };
}

export async function publishEditorialEventAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Evento non valido." };

  const result = await publishEditorialEvent(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/eventi");
  revalidatePath(`/app/redazione/eventi/${id}`);
  revalidatePath("/eventi");
  revalidatePath(`/eventi/${id}`);
  return { ok: true, message: "Evento pubblicato." };
}

export async function withdrawEditorialEventAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireEditorSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Evento non valido." };

  const result = await withdrawEditorialEvent(id);
  if (!result.ok) return fail(result.error);

  revalidatePath("/app/redazione/eventi");
  revalidatePath(`/app/redazione/eventi/${id}`);
  revalidatePath("/eventi");
  revalidatePath(`/eventi/${id}`);
  return { ok: true, message: "Evento ritirato dalla pubblicazione." };
}
