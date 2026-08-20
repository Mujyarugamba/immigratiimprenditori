import { runEditorialRadar } from "@/lib/radar/run";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return Response.json({ ok: false, error: "cron_not_configured" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEditorialRadar();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("editorial-radar failed", error);
    return Response.json({ ok: false, error: "radar_failed" }, { status: 500 });
  }
}
