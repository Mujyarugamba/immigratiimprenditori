import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyRouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/atlante/rotte/${encodeURIComponent(slug)}`);
}
