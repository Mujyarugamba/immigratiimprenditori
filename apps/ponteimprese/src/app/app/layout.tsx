import { redirect } from "next/navigation";
import { AppNav } from "@/components/app/AppNav";
import { getApplicationSession } from "@/lib/session/get-application-session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getApplicationSession();
  if (!session) {
    redirect("/accedi?next=/app");
  }

  return (
    <div className="bg-surface flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <AppNav session={session} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
