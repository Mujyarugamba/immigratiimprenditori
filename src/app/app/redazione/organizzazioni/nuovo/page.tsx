import type { Metadata } from "next";
import Link from "next/link";
import { OrganizationCreateForm } from "@/components/app/editorial/OrganizationForms";
import {
  listActiveOrganizationScopes,
  listActiveOrganizationTypes,
} from "@/lib/data/editorial/catalogs";

export const metadata: Metadata = {
  title: "Nuova organizzazione — Redazione",
};

export default async function NuovaOrganizzazionePage() {
  const [orgTypes, scopes] = await Promise.all([
    listActiveOrganizationTypes(),
    listActiveOrganizationScopes(),
  ]);

  return (
    <div>
      <Link href="/app/redazione/organizzazioni" className="text-ink-muted hover:text-ink text-sm">
        ← Organizzazioni
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        Nuova organizzazione editoriale
      </h1>
      <OrganizationCreateForm orgTypes={orgTypes} scopes={scopes} />
    </div>
  );
}
