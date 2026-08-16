import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizationEditForm } from "@/components/app/editorial/OrganizationForms";
import {
  listActiveOrganizationScopes,
  listActiveOrganizationTypes,
} from "@/lib/data/editorial/catalogs";
import {
  getEditorialOrganizationById,
  listEditorialOrganizationOfficials,
} from "@/lib/data/editorial/organizations";

export const metadata: Metadata = {
  title: "Modifica organizzazione — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function OrganizzazioneRedazionePage({ params }: Props) {
  const { id } = await params;
  const [org, orgTypes, scopes, officials] = await Promise.all([
    getEditorialOrganizationById(id),
    listActiveOrganizationTypes(),
    listActiveOrganizationScopes(),
    listEditorialOrganizationOfficials(id),
  ]);

  if (!org) notFound();

  return (
    <div>
      <Link href="/app/redazione/organizzazioni" className="text-ink-muted hover:text-ink text-sm">
        ← Organizzazioni
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">{org.name}</h1>
      <p className="text-ink-muted mt-1 text-sm">
        {org.publication_status} · {org.operational_status}
      </p>
      <OrganizationEditForm
        org={org}
        orgTypes={orgTypes}
        scopes={scopes}
        officials={officials}
      />
    </div>
  );
}
