"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelTotpEnrollmentAction,
  getMfaSecurityStateAction,
  removeTotpFactorAction,
  startTotpEnrollmentAction,
  verifyExistingTotpAction,
  verifyTotpEnrollmentAction,
} from "@/lib/auth/mfa-actions";

type TotpFactor = {
  id: string;
  friendlyName: string | null;
  status: string;
};

type MfaState = {
  currentLevel: string | null;
  nextLevel: string | null;
  factors: TotpFactor[];
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

function validTotp(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function MfaSecurityPanel({
  required = false,
  nextPath = "/app/redazione",
}: MfaSecurityPanelProps = {}) {
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

  const applyState = useCallback((state: MfaState) => {
    setCurrentLevel(state.currentLevel);
    setNextLevel(state.nextLevel);
    setFactors(state.factors);
  }, []);

  const refresh = useCallback(async () => {
    const result = await getMfaSecurityStateAction();
    if (!result.ok) {
      throw new Error(result.error);
    }
    applyState(result.state);
  }, [applyState]);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Impossibile verificare lo stato MFA.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  function finishSuccessfulVerification(state: MfaState, message: string) {
    applyState(state);
    if (required) {
      // The Server Action response has already written the AAL2 cookie. A full
      // navigation deliberately re-enters the server-side redazione gate.
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
      const result = await startTotpEnrollmentAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPending(result.enrollment);
      setEnrollCode("");
    } catch {
      setError("Impossibile avviare la registrazione TOTP.");
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
      const result = await cancelTotpEnrollmentAction(pending.factorId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPending(null);
      setEnrollCode("");
      applyState(result.state);
    } catch {
      setError("Impossibile annullare la registrazione TOTP.");
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
      const result = await verifyTotpEnrollmentAction(pending.factorId, enrollCode.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPending(null);
      setEnrollCode("");
      finishSuccessfulVerification(
        result.state,
        "Autenticatore TOTP verificato. La sessione corrente è stata elevata ad AAL2.",
      );
    } catch {
      setError("Codice TOTP non valido o scaduto.");
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
      const result = await verifyExistingTotpAction(factor.id, challengeCode.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setChallengeCode("");
      finishSuccessfulVerification(
        result.state,
        "Secondo fattore verificato. La sessione corrente è AAL2.",
      );
    } catch {
      setError("Codice TOTP non valido o scaduto.");
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
      const result = await removeTotpFactorAction(factorId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      applyState(result.state);
      setNotice("Autenticatore rimosso.");
    } catch {
      setError("Impossibile rimuovere l’autenticatore TOTP.");
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
