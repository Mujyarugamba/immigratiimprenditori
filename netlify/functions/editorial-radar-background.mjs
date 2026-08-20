export default async function editorialRadarBackground(request) {
  const secret = process.env.CRON_SECRET?.trim();
  const siteUrl = process.env.URL?.trim()?.replace(/\/$/, "");

  if (!secret || !siteUrl) {
    console.log("editorial-radar-background skipped: missing CRON_SECRET or URL");
    return;
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    console.warn("editorial-radar-background rejected unauthorized invocation");
    return;
  }

  const response = await fetch(`${siteUrl}/api/cron/editorial-radar`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${secret}`,
      "user-agent": "immigrati-imprenditori-netlify-radar/1.0",
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `editorial-radar endpoint failed with ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  console.log(`editorial-radar completed: ${body.slice(0, 1000)}`);
}

export const config = {
  background: true,
};
