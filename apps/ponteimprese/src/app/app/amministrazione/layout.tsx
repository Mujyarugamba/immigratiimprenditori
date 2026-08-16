import { redirect } from "next/navigation";
import { AdminNav } from "@/components/app/AdminNav";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireApplicationAdmin } from "@/lib/session/guards";

export default async function AmministrazioneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getApplicationSession();
  const guard = requireApplicationAdmin(session);
  if (!guard.ok) {
    redirect(guard.redirectTo);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminNav />
      {children}
    </div>
  );
}
