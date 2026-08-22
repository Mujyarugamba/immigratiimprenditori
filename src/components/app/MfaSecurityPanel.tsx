"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TotpFactor = {
  id: string;
  friendlyName: string | null;
  status: string;
};

type PendingEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

type MfaSecurityPanelProps = {
  required?: boolean;
  nextPath?: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Operazione MFA non riuscita.";
}

function validTotp(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function MfaSecurityPanel({
  required = false,
  nextPath = "/app/redazione",
}: MfaSecurityPanelProps = {}) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [nextLevel, setNextLevel] = useState<string | null>(null);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [pending, setPending] = useState<PendingEnrollment | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [challengeCode, setChallengeCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [aalResult, factorsResult] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);

    if (aalResult.error) throw aalResult.error;
    if (factorsResult.error) throw factorsResult.error;

    setCurrentLevel(aalResult.data.currentLevel ?? null);
    setNextLevel(aalResult.data.nextLevel ?? null);
    setFactors(
      factorsResult.data.totp.map((factor) => ({
        id: factor.id,
        friendlyName: factor.friendly_name ?? null,
        status: factor.status,
      })),
    );
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } catch (cause) {
        setError(errorMessage(cause));
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  async function completeVerification(message: string) {
    // Ensure the SSR cookie carries the new AAL2 session before navigating to
    // the server-protected redazione layout.
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;
    await refresh();

    if (required) {
      window.location.assign(nextPath);
      return;
    }
    setNotice(message);
  }

  async function startEnrollment() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (enrollError) throw enrollError;
      setPending({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setEnrollCode("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancelEnrollment() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: pending.factorId,
      });
      if (unenrollError) throw unenrollError;
      setPending(null);
      setEnrollCode("");
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnrollment() {
    if (!pending || !validTotp(enrollCode)) {
      setError("Inserisci il codice a 6 cifre generato dall’app di autenticazione.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: pending.factorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId: pending.factorId,
        challengeId: challenge.data.id,
        code: enrollCode.trim(),
      });
      if (verify.error) throw verify.error;

      setPending(null);
      setEnrollCode("");
      await completeVerification(
        "Autenticatore TOTP verificato. La sessione corrente è stata elevata ad AAL2.",
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function verifyExistingFactor() {
    const factor = factors.find((candidate) => candidate.status === "verified");
    if (!factor) {
      setError("Non risulta ancora un autenticatore TOTP verificato.");
      return;
    }
    if (!validTotp(challengeCode)) {
      setError("Inserisci il codice a 6 cifre generato dall’app di autenticazione.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.data.id,
        code: challengeCode.trim(),
      });
      if (verify.error) throw verify.error;

      setChallengeCode("");
      await completeVerification("Secondo fattore verificato. La sessione corrente è AAL2.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function removeFactor(factorId: string) {
    if (currentLevel !== "aal2") {
      setError("Per rimuovere un autenticatore verificato devi prima elevare la sessione ad AAL2.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollError) throw unenrollError;
      setNotice("Autenticatore rimosso.");
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  const verifiedFactors = factors.filter((factor) => factor.status === "verified");
  const needsChallenge = currentLevel === "aal1" && nextLevel === "aal2" && verifiedFactors.length > 0;

  if (loading) {
    return <p className="text-ink-muted text-sm">Verifica stato MFA…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border-line rounded-md border p-4">
        <h2 className="text-ink text-lg font-semibold">Stato autenticazione</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Livello corrente</dt>
            <dd className="text-ink font-semibold">{currentLevel ?? "non disponibile"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Livello disponibile</dt>
            <dd className="text-ink font-semibold">{nextLevel ?? "non disponibile"}</dd>
          </div>
        </dl>
        <p className="text-ink-muted mt-3 text-sm">
          {required
            ? "L’MFA TOTP è obbligatoria per accedere alle funzioni di redazione e amministrazione."
            : "L’MFA TOTP è obbligatoria per le sessioni con ruolo redattore o amministratore."}
        </p>
      </div>

      {error ? (
        <p className="rounded-md border px-3 py-2 text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-md border px-3 py-2 text-sm" role="status">
          {notice}
        </p>
      ) : null}

      {needsChallenge ? (
        <div className="border-line rounded-md border p-4">
          <h2 className="text-ink text-lg font-semibold">Verifica il secondo fattore</h2>
          <p className="text-ink-muted mt-1 text-sm">
            Questo account ha già un autenticatore verificato, ma la sessione corrente è ancora AAL1.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="mfa-challenge-code">
              Codice TOTP
            </label>
            <input
              id="mfa-challenge-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={challengeCode}
              onChange={(event) => setChallengeCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="border-line bg-surface rounded-md border px-3 py-2 text-sm"
              placeholder="000000"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void verifyExistingFactor()}
              className="bg-brand text-brand-fg rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Verifica MFA
            </button>
          </div>
        </div>
      ) : null}

      <div className="border-line rounded-md border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-ink text-lg font-semibold">Autenticatori TOTP</h2>
            <p className="text-ink-muted mt-1 text-sm">
              Usa un’app compatibile TOTP, per esempio Google Authenticator, Microsoft Authenticator o 1Password.
            </p>
          </div>
          {!pending ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void startEnrollment()}
              className="border-line rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              Aggiungi autenticatore
            </button>
          ) : null}
        </div>

        {verifiedFactors.length ? (
          <ul className="mt-4 space-y-2">
            {verifiedFactors.map((factor, index) => (
              <li key={factor.id} className="border-line flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
                <span>
                  {factor.friendlyName || `Autenticatore ${index + 1}`} · verificato
                </span>
                <button
                  type="button"
                  disabled={busy || currentLevel !== "aal2"}
                  onClick={() => void removeFactor(factor.id)}
                  className="text-ink-muted underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Rimuovi
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted mt-4 text-sm">Nessun autenticatore TOTP verificato.</p>
        )}

        {pending ? (
          <div className="border-line mt-5 border-t pt-5">
            <h3 className="text-ink font-semibold">Completa la registrazione</h3>
            <p className="text-ink-muted mt-1 text-sm">
              Scansiona il QR code con l’app di autenticazione, poi inserisci il codice a 6 cifre.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-start">
              <img
                src={pending.qrCode}
                alt="QR code per registrare l’autenticatore TOTP"
                width={180}
                height={180}
                className="border-line border bg-white p-2"
              />
              <div>
                <p className="text-ink-muted text-sm">Se non puoi scansionare il QR code, usa questo segreto:</p>
                <code className="mt-2 block break-all rounded-sm bg-surface-muted p-2 text-sm">{pending.secret}</code>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <label className="sr-only" htmlFor="mfa-enroll-code">
                    Codice TOTP di verifica
                  </label>
                  <input
                    id="mfa-enroll-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={enrollCode}
                    onChange={(event) => setEnrollCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="border-line bg-surface rounded-md border px-3 py-2 text-sm"
                    placeholder="000000"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void verifyEnrollment()}
                    className="bg-brand text-brand-fg rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Verifica e attiva
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void cancelEnrollment()}
                    className="border-line rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
