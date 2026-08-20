import { redirect } from "next/navigation";
import { signOutEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";

export default async function ContributoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getApplicationSession();

  if (!session) {
    redirect("/accedi?next=/app/contributore");
  }
  if (!session.isActiveAccount) {
    redirect("/accedi?error=account&next=/app/contributore");
  }
  if (!session.isContributor) {
    redirect("/accedi?error=role");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-black pb-4">
        <p className="text-sm font-semibold text-black">Area contributore</p>
        <form action={signOutEditorialAction}>
          <button
            type="submit"
            className="text-ink-muted hover:text-ink text-sm font-medium underline underline-offset-4"
          >
            Esci
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
