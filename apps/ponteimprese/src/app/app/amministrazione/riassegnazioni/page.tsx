import type { Metadata } from "next";
import { ReassignmentCasesPanel } from "@/components/app/ReassignmentCasesPanel";
import { listPendingReassignmentCases } from "@/lib/data/admin/reassignment";

export const metadata: Metadata = {
  title: "Gestione da riassegnare — Amministrazione",
};

export default async function AdminRiassegnazioniPage() {
  const cases = await listPendingReassignmentCases();

  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Gestione da riassegnare
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Casi aperti dopo la perdita dell’ultimo gestore di un’impresa o del
        titolare persona di un’organizzazione. Assegna esplicitamente una nuova
        gestione; non avviene alcun trasferimento automatico.
      </p>
      <ReassignmentCasesPanel cases={cases} />
    </div>
  );
}
