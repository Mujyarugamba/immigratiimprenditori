import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ContributorLayout({ children }: { children: React.ReactNode }) {
  const session = await getApplicationSession();
  if (!session) redirect("/accedi?next=/app/contributore");
  if (!session.isActiveAccount) redirect("/accedi?error=account");

  const supabase = await createClient();
  const { data: isContributor, error } = await supabase.rpc("access_is_contributor");
  if (error || !isContributor) redirect("/accedi?error=role");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Area riservata</p>
          <h1 className="mt-2 text-2xl font-semibold text-black">Spazio contributore</h1>
        </div>
        <form action={signOutEditorialAction}>
          <button type="submit" className="text-sm font-semibold underline underline-offset-4">Esci</button>
        </form>
      </div>
      {children}
    </div>
  );
}
