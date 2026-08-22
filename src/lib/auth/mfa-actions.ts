"use server";

import { createClient } from "@/lib/supabase/server";

type MfaFactorSnapshot = {
  id: string;
  friendlyName: string | null;
  status: string;
};

type MfaStateSnapshot = {
  currentLevel: string | null;
  nextLevel: string | null;
  factors: MfaFactorSnapshot[];
};

type MfaStateResult =
  | { ok: true; state: MfaStateSnapshot }
  | { ok: false; error: string };

type MfaEnrollmentResult =
  | {
      ok: true;
      enrollment: {
        factorId: string;
        qrCode: string;
        secret: string;
      };
    }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOTP_RE = /^\d{6}$/;

function publicFailure(message = "Operazione MFA non riuscita.") {
  return message;
}

async function requirePrivilegedAssignedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("MFA_SESSION_REQUIRED");
  }

  const [active, editorAssigned, adminAssigned] = await Promise.all([
    supabase.rpc("access_is_active_account"),
    supabase.rpc("access_is_editor_assigned"),
    supabase.rpc("access_is_application_admin_assigned"),
  ]);

  if (
    active.error ||
    editorAssigned.error ||
    adminAssigned.error ||
    !active.data ||
    !Boolean(editorAssigned.data || adminAssigned.data)
  ) {
    throw new Error("MFA_PRIVILEGED_ROLE_REQUIRED");
  }

  return supabase;
}

async function readStateFromClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<MfaStateSnapshot> {
  const [assurance, factors] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (assurance.error) throw assurance.error;
  if (factors.error) throw factors.error;

  return {
    currentLevel: assurance.data.currentLevel ?? null,
    nextLevel: assurance.data.nextLevel ?? null,
    factors: factors.data.totp.map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name ?? null,
      status: factor.status,
    })),
  };
}

function logMfaFailure(operation: string, cause: unknown) {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(`[MFA] ${operation} failed: ${message}`);
}

export async function getMfaSecurityStateAction(): Promise<MfaStateResult> {
  try {
    const supabase = await requirePrivilegedAssignedClient();
    return { ok: true, state: await readStateFromClient(supabase) };
  } catch (cause) {
    logMfaFailure("state", cause);
    return { ok: false, error: publicFailure("Impossibile verificare lo stato MFA.") };
  }
}

export async function startTotpEnrollmentAction(): Promise<MfaEnrollmentResult> {
  try {
    const supabase = await requirePrivilegedAssignedClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Centro Studi",
    });
    if (error) throw error;

    return {
      ok: true,
      enrollment: {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      },
    };
  } catch (cause) {
    logMfaFailure("enroll", cause);
    return { ok: false, error: publicFailure("Impossibile avviare la registrazione TOTP.") };
  }
}

export async function cancelTotpEnrollmentAction(factorId: string): Promise<MfaStateResult> {
  if (!UUID_RE.test(factorId)) {
    return { ok: false, error: publicFailure("Autenticatore non valido.") };
  }

  try {
    const supabase = await requirePrivilegedAssignedClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    return { ok: true, state: await readStateFromClient(supabase) };
  } catch (cause) {
    logMfaFailure("cancel enrollment", cause);
    return { ok: false, error: publicFailure("Impossibile annullare la registrazione TOTP.") };
  }
}

async function challengeAndVerify(
  factorId: string,
  code: string,
): Promise<MfaStateResult> {
  if (!UUID_RE.test(factorId) || !TOTP_RE.test(code)) {
    return { ok: false, error: publicFailure("Inserisci un codice TOTP valido a 6 cifre.") };
  }

  try {
    const supabase = await requirePrivilegedAssignedClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });
    if (verify.error) throw verify.error;

    // verify() promotes the current session and @supabase/ssr persists the new
    // AAL2 access/refresh tokens through this Server Action's response cookies.
    return { ok: true, state: await readStateFromClient(supabase) };
  } catch (cause) {
    logMfaFailure("verify", cause);
    return { ok: false, error: publicFailure("Codice TOTP non valido o scaduto.") };
  }
}

export async function verifyTotpEnrollmentAction(
  factorId: string,
  code: string,
): Promise<MfaStateResult> {
  return challengeAndVerify(factorId, code.trim());
}

export async function verifyExistingTotpAction(
  factorId: string,
  code: string,
): Promise<MfaStateResult> {
  return challengeAndVerify(factorId, code.trim());
}

export async function removeTotpFactorAction(factorId: string): Promise<MfaStateResult> {
  if (!UUID_RE.test(factorId)) {
    return { ok: false, error: publicFailure("Autenticatore non valido.") };
  }

  try {
    const supabase = await requirePrivilegedAssignedClient();
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) throw assurance.error;
    if (assurance.data.currentLevel !== "aal2") {
      return {
        ok: false,
        error: publicFailure("Verifica prima il secondo fattore per rimuovere un autenticatore."),
      };
    }

    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;

    // Supabase notes that unenrollment can leave a stale AAL2 JWT until refresh.
    // Refresh immediately so both browser and server receive the downgraded state.
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;

    return { ok: true, state: await readStateFromClient(supabase) };
  } catch (cause) {
    logMfaFailure("remove factor", cause);
    return { ok: false, error: publicFailure("Impossibile rimuovere l’autenticatore TOTP.") };
  }
}
