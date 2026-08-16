import { redirect } from "next/navigation";
import { EditorialNav } from "@/components/app/EditorialNav";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireEditor } from "@/lib/session/guards";

export default async function RedazioneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getApplicationSession();
  const guard = requireEditor(session);
  if (!guard.ok) {
    redirect(guard.redirectTo);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <EditorialNav />
      {children}
    </div>
  );
}
