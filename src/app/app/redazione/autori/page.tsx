import type { Metadata } from "next";
import Link from "next/link";
import { AuthorProfileForm } from "@/components/app/editorial/AuthorProfileForm";
import { listEditorialAuthorProfiles } from "@/lib/data/editorial/authors";

export const metadata: Metadata = {
  title: "Autori — Redazione",
};

export default async function EditorialAuthorsPage() {
  const profiles = await listEditorialAuthorProfiles();

  return (
    <div>
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">Profili autore</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Identità editoriali verificate. I profili nuovi restano privati finché non sono completi e collegati a contenuti reali.
        </p>
      </div>

      <div className="table-scroll mt-6">
        <table className="border-line w-full min-w-[640px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Nome</th>
              <th className="border-line border px-3 py-2 font-medium">Tipo</th>
              <th className="border-line border px-3 py-2 font-medium">Stato</th>
              <th className="border-line border px-3 py-2 font-medium">Azione</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-ink-muted border-line border px-3 py-6 text-center">
                  Nessun profilo autore reale ancora registrato.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="border-line border px-3 py-2">
                    <span className="text-ink font-medium">{profile.display_name}</span>
                    <span className="text-ink-muted mt-0.5 block text-xs">{profile.slug}</span>
                  </td>
                  <td className="border-line border px-3 py-2">{profile.profile_kind}</td>
                  <td className="border-line border px-3 py-2">
                    {profile.is_public ? "Pubblico" : "Privato / in revisione"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    <Link href={`/app/redazione/autori/${profile.id}`} className="text-brand hover:underline">
                      Gestisci
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="border-line mt-8 border-t pt-8" aria-labelledby="new-author-title">
        <h2 id="new-author-title" className="text-ink text-xl font-semibold">
          Nuovo profilo privato
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Inserisci solo identità e informazioni già verificate dalla redazione.
        </p>
        <AuthorProfileForm />
      </section>
    </div>
  );
}
