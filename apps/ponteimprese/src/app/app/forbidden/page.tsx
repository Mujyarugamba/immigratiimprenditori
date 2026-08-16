import type { Metadata } from "next";
import { ForbiddenState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Accesso negato",
};

export default function AppForbiddenPage() {
  return <ForbiddenState />;
}
