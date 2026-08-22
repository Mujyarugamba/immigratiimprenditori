import type { Metadata } from "next";
import { MfaSecurityPanel } from "@/components/app/MfaSecurityPanel";

export const metadata: Metadata = {
  title: "Sicurezza account",
  description: "Configurazione MFA TOTP per gli account autorizzati del Centro Studi.",
};

export default function EditorialSecurityPage() {
  return (
    <section className="pb-12">
      <header className="mb-6">
        <p className="text-ink-muted text-sm font-medium uppercase tracking-[0.12em]">Area riservata</p>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">Sicurezza account</h1>
        <p className="text-ink-muted mt-3 max-w-2xl text-sm leading-6">
          Registrazione e verifica dell’autenticazione a più fattori per redattori e amministratori.
          In questa fase la configurazione è disponibile ma non ancora obbligatoria.
        </p>
      </header>
      <MfaSecurityPanel />
    </section>
  );
}
