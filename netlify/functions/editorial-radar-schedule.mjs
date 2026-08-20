export default async function editorialRadarSchedule() {
  const secret = process.env.CRON_SECRET?.trim();
  const siteUrl = process.env.URL?.trim()?.replace(/\/$/, "");

  if (!secret || !siteUrl) {
    console.log("editorial-radar-schedule skipped: missing CRON_SECRET or URL");
    return;
  }

  const response = await fetch(
    `${siteUrl}/.netlify/functions/editorial-radar-background`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
        "user-agent": "immigrati-imprenditori-netlify-scheduler/1.0",
      },
      body: JSON.stringify({ source: "scheduled-radar" }),
    },
  );

  if (response.status !== 202 && !response.ok) {
    const body = await response.text();
    throw new Error(
      `editorial-radar background dispatch failed with ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  console.log(`editorial-radar background dispatch accepted: ${response.status}`);
}

export const config = {
  schedule: "0 3 * * *",
};
