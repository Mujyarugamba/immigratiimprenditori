import Link from "next/link";
import { notFound } from "next/navigation";
import { updateContributorProfileAction } from "@/lib/contributor/profile-actions";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ salvato?: string; errore?: string }>;
};

export default async function ContributorProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, slug, bio, organization_name, organization_type, role_description, city, province, region, country, website, phone, is_public")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <main className="py-8">
        <Link href="/app/contributore" className="text-sm font-semibold underline underline-offset-4">← Le mie proposte</Link>
        <section className="mt-6 border border-black p-6">
          <h2 className="text-xl font-semibold text-black">Profilo non disponibile</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Il tuo account contributore non dispone ancora di un profilo modificabile. Le proposte editoriali restano comunque accessibili dalla tua area riservata.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/app/contributore" className="text-sm font-semibold underline underline-offset-4">← Le mie proposte</Link>
        {profile.is_public ? (
          <Link href={`/contributori/${profile.slug}`} className="text-sm font-semibold underline underline-offset-4">Vedi profilo pubblico →</Link>
        ) : null}
      </div>

      <header className="mt-6 border-b border-black pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Spazio contributore</p>
        <h2 className="mt-2 text-3xl font-semibold text-black">Profilo</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
          Puoi mantenere il profilo privato oppure renderlo pubblico. Le informazioni pubbliche servono ad attribuire contributi e presentare competenze e affiliazioni in modo trasparente.
        </p>
      </header>

      {params.salvato === "1" ? <p className="mt-5 border border-black p-3 text-sm" role="status">Profilo aggiornato.</p> : null}
      {params.errore ? <p className="mt-5 border border-black p-3 text-sm" role="alert">Impossibile salvare il profilo. Controlla i campi inseriti.</p> : null}

      <form action={updateContributorProfileAction} className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="text-sm font-semibold text-black md:col-span-2">
          Nome pubblico
          <input name="display_name" required maxLength={160} defaultValue={profile.display_name} className="mt-2 w-full border border-black px-3 py-2 font-normal" />
        </label>

        <label className="text-sm font-semibold text-black md:col-span-2">
          Bio
          <textarea name="bio" maxLength={4000} rows={6} defaultValue={profile.bio ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" />
        </label>

        <label className="text-sm font-semibold text-black">
          Organizzazione
          <input name="organization_name" maxLength={240} defaultValue={profile.organization_name ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold text-black">
          Tipo organizzazione
          <input name="organization_type" maxLength={120} defaultValue={profile.organization_type ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold text-black md:col-span-2">
          Ruolo / attività
          <input name="role_description" maxLength={240} defaultValue={profile.role_description ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" />
        </label>

        <label className="text-sm font-semibold text-black">Città<input name="city" maxLength={120} defaultValue={profile.city ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-black">Provincia<input name="province" maxLength={120} defaultValue={profile.province ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-black">Regione<input name="region" maxLength={120} defaultValue={profile.region ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-black">Paese<input name="country" required maxLength={120} defaultValue={profile.country} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-black">Sito web<input name="website" type="url" maxLength={2048} defaultValue={profile.website ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>
        <label className="text-sm font-semibold text-black">Telefono<input name="phone" maxLength={80} defaultValue={profile.phone ?? ""} className="mt-2 w-full border border-black px-3 py-2 font-normal" /></label>

        <label className="flex items-start gap-3 border border-black p-4 text-sm md:col-span-2">
          <input name="is_public" type="checkbox" defaultChecked={profile.is_public} className="mt-1" />
          <span><strong>Rendi pubblico il profilo</strong><span className="mt-1 block text-neutral-600">Se disattivato, il profilo resta visibile soltanto a te e alle funzioni autorizzate.</span></span>
        </label>

        <div className="md:col-span-2">
          <button type="submit" className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">Salva profilo</button>
        </div>
      </form>
    </main>
  );
}
