import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: "Identità, missione e direzione editoriale di Immigrati Imprenditori, Osservatorio e Centro Studi AIPEL.",
};

export default function ChiSiamoPage() {
  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Identità istituzionale</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Chi siamo</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Immigrati Imprenditori è l&apos;Osservatorio e Centro Studi di AIPEL dedicato all&apos;imprenditoria generata dalle migrazioni.
          </p>
        </header>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-2xl font-semibold text-black">Missione</h2>
          <div className="space-y-5 text-sm leading-7 text-neutral-700">
            <p>
              Studiamo, misuriamo, documentiamo e raccontiamo le persone che fanno impresa fuori dal proprio Paese d&apos;origine e il contributo economico, sociale e culturale che producono nei territori di destinazione.
            </p>
            <p>
              Il perimetro è internazionale: un imprenditore italiano negli Stati Uniti, un imprenditore marocchino in Italia o un imprenditore indiano nel Regno Unito appartengono allo stesso oggetto di studio. L&apos;Italia non è assunta come destinazione obbligatoria.
            </p>
            <p>
              L&apos;Osservatorio non è una piattaforma commerciale e non è una sede di propaganda politica. Distingue dati, fonti, analisi e opinioni e sottopone i materiali pubblicati a cura redazionale.
            </p>
          </div>
        </section>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-2xl font-semibold text-black">Governance editoriale</h2>
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">Ente promotore e proprietario</dt>
              <dd className="mt-1 font-semibold text-black">AIPEL</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Presidente AIPEL e Direzione editoriale</dt>
              <dd className="mt-1 font-semibold text-black">Ing. Augustin Mujyarugamba</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Forma iniziale</dt>
              <dd className="mt-1 text-black">Osservatorio e Centro Studi associativo</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Testata giornalistica</dt>
              <dd className="mt-1 text-black">Non registrata nella fase iniziale</dd>
            </div>
          </dl>
        </section>

        <section className="py-10">
          <h2 className="text-2xl font-semibold text-black">Trasparenza</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
            La denominazione completa di AIPEL, sede, dati fiscali e ulteriori informazioni amministrative saranno inseriti nei documenti istituzionali non appena consolidati. Questa pagina non sostituisce privacy policy, condizioni di utilizzo o informative specifiche sui contributi inviati alla redazione.
          </p>
        </section>
      </Container>
    </main>
  );
}
