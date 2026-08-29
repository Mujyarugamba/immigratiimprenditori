export type AppErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "validation"
  | "conflict"
  | "not_found"
  | "account_state"
  | "unexpected";

export type AppError = {
  code: AppErrorCode;
  message: string;
  /** Safe field-level hints for forms */
  fieldErrors?: Record<string, string>;
  /** Server-only detail (never render raw to users) */
  cause?: unknown;
};

export function appError(
  code: AppErrorCode,
  message: string,
  extras?: Pick<AppError, "fieldErrors" | "cause">,
): AppError {
  return { code, message, ...extras };
}

const SQLSTATE_MAP: Record<string, { code: AppErrorCode; message: string }> = {
  "42501": { code: "forbidden", message: "Operazione non autorizzata." },
  "22004": { code: "validation", message: "Dati obbligatori mancanti." },
  "23505": { code: "conflict", message: "Esiste già un elemento con questi dati." },
  P0002: { code: "not_found", message: "Elemento non trovato." },
  "55000": {
    code: "account_state",
    message: "Il tuo account non consente questa operazione.",
  },
};

export function mapPostgresError(error: unknown): AppError {
  const err = error as {
    code?: string;
    message?: string;
    details?: string;
  } | null;

  const msg = `${err?.message ?? ""} ${err?.details ?? ""}`.toLowerCase();
  const sqlstate = err?.code;

  // Prefer semantic message matches over generic SQLSTATE labels.
  if (msg.includes("editorial_review_self_approval_forbidden")) {
    return appError(
      "forbidden",
      "La seconda approvazione deve essere registrata da un altro redattore.",
      { cause: err },
    );
  }
  if (msg.includes("editorial_review_stale")) {
    return appError(
      "conflict",
      "Il contenuto è cambiato dopo la richiesta di revisione. Richiedi una nuova seconda revisione.",
      { cause: err },
    );
  }
  if (
    msg.includes("content_publication_requires_secondary_review") ||
    msg.includes("observatory_publication_requires_secondary_review") ||
    msg.includes("substantive_correction_requires_secondary_review")
  ) {
    return appError(
      "forbidden",
      "Serve una seconda approvazione valida prima della pubblicazione.",
      { cause: err },
    );
  }
  if (msg.includes("editorial_review_entity_not_found")) {
    return appError("not_found", "Elemento da revisionare non trovato.", {
      cause: err,
    });
  }
  if (
    msg.includes("editorial_review_transition_not_allowed") ||
    msg.includes("editorial_review_request_is_immutable")
  ) {
    return appError(
      "conflict",
      "Lo stato della review non consente questa operazione.",
      { cause: err },
    );
  }
  if (msg.includes("self-grant")) {
    return appError("forbidden", "Non puoi assegnarti la gestione.", {
      cause: err,
    });
  }
  if (msg.includes("self-elevate")) {
    return appError(
      "forbidden",
      "Non puoi assegnarti un ruolo elevato.",
      { cause: err },
    );
  }
  if (msg.includes("not bootstrapped") || msg.includes("first grant already")) {
    return appError(
      "account_state",
      "La prima autorizzazione di gestione va abilitata da un amministratore.",
      { cause: err },
    );
  }
  if (
    msg.includes("membership not available") ||
    msg.includes("authorization not available")
  ) {
    return appError("not_found", "Non disponibile.", { cause: err });
  }
  if (msg.includes("membership state incompatible")) {
    return appError(
      "account_state",
      "Il collegamento all'impresa non consente questa operazione.",
      { cause: err },
    );
  }
  if (
    msg.includes("profiles_slug_key") ||
    msg.includes("profiles_slug") ||
    (sqlstate === "23505" &&
      msg.includes("slug") &&
      msg.includes("profiles"))
  ) {
    return appError(
      "conflict",
      "Questo indirizzo è già utilizzato. Scegline un altro.",
      { cause: err },
    );
  }
  if (
    msg.includes("profiles_slug_check") ||
    (sqlstate === "23514" && msg.includes("slug") && msg.includes("profiles"))
  ) {
    return appError(
      "validation",
      "L'indirizzo contiene caratteri non consentiti.",
      { cause: err },
    );
  }
  if (msg.includes("already exists")) {
    return appError("conflict", "Esiste già un elemento con questi dati.", {
      cause: err,
    });
  }
  if (msg.includes("account state") || msg.includes("not operational")) {
    return appError(
      "account_state",
      "Il tuo account non consente questa operazione.",
      {
        cause: err,
      },
    );
  }

  if (sqlstate && SQLSTATE_MAP[sqlstate]) {
    return appError(SQLSTATE_MAP[sqlstate].code, SQLSTATE_MAP[sqlstate].message, {
      cause: err,
    });
  }
  if (msg.includes("not authorized") || msg.includes("not authenticated")) {
    return appError("forbidden", "Operazione non autorizzata.", { cause: err });
  }

  return appError("unexpected", "Si è verificato un errore. Riprova più tardi.", {
    cause: err,
  });
}

export function toUserMessage(error: AppError): string {
  return error.message;
}
