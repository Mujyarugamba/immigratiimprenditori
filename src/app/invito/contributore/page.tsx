import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { InviteContributorClient } from "./InviteContributorClient";

export const metadata: Metadata = {
  title: "Invito contributore",
  robots: { index: false, follow: false },
};

export default function InvitoContributorePage() {
  return (
    <Container className="py-12 sm:py-16">
      <main className="mx-auto max-w-md border border-neutral-300 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">Immigrati Imprenditori</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black">Attiva il tuo accesso contributore</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          L’account contributore è riservato ai collaboratori abituali. Consente di inviare e seguire le proprie proposte; non dà accesso alla redazione e non pubblica automaticamente contenuti.
        </p>
        <div className="mt-6"><InviteContributorClient /></div>
      </main>
    </Container>
  );
}
