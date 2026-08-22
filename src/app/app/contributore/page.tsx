import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  new: "Ricevuta",
  triage: "In valutazione",
  in_review: "In revisione",
  accepted: "Accettata",
  rejected: "Non accolta",
  published: "Pubblicata",
  archived: "Archiviata",
};

export default async function ContributorPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_inbox_items")
    .select("id, title, item_kind, status, priority, received_at, reviewed_at, linked_content_id, linked_event_id")
    .order("received_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  const items = data ?? [];

  return (
    <main className="py-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="max-w-3xl text-sm leading-6 text-neutral-700">
            Qui trovi le proposte associate al tuo account e il loro stato editoriale. La pubblicazione non è automatica:
            ogni contributo resta soggetto a verifica e revisione della redazione.
          </p>
        </div>
        <Link href="/contribuisci" className="border border-black px-4 py-2 text-sm font-semibold">
          Nuova proposta
        </Link>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-black pb-3">
          <h2 className="text-xl font-semibold text-black">Le mie proposte</h2>
          <span className="text-sm text-neutral-500">{items.length}</span>
        </div>
        <div className="divide-y divide-neutral-300">
          {items.map((item) => (
            <article key={item.id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {item.item_kind.replaceAll("_", " ")}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-black">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Ricevuta il {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(new Date(item.received_at))}
                  {item.reviewed_at
                    ? ` · verificata il ${new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(new Date(item.reviewed_at))}`
                    : ""}
                </p>
              </div>
              <div className="md:text-right">
                <span className="inline-block border border-black px-3 py-1 text-xs font-semibold">
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
            </article>
          ))}
          {items.length === 0 ? (
            <p className="py-8 text-sm text-neutral-600">Non risultano ancora proposte associate a questo account.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
