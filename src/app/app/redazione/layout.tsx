import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorialNav } from "@/components/app/EditorialNav";
import { signOutEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RedazioneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getApplicationSession();

  if (!session) {
    redirect("/accedi?next=/app/redazione");
  }
  if (!session.isActiveAccount) {
    redirect("/accedi?error=account&next=/app/redazione");
  }
  if (!session.isEditor && !session.isApplicationAdmin) {
    redirect("/accedi?error=role&next=/app/redazione");
  }

  const supabase = await createClient();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error || assurance.data.currentLevel !== "aal2") {
    redirect("/app/mfa?next=/app/redazione");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex justify-end">
        <form action={signOutEditorialAction}>
          <button
            type="submit"
            className="text-ink-muted hover:text-ink text-sm font-medium"
          >
            Esci
          </button>
        </form>
      </div>
      <EditorialNav />
      {children}
    </div>
  );
}
