import http from "node:http";

const host = "127.0.0.1";
const port = Number(process.env.CI_SUPABASE_STUB_PORT ?? 54329);

function jsonHeaders(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extra,
  };
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (url.pathname === "/__health") {
    response.writeHead(200, jsonHeaders());
    response.end(JSON.stringify({ ok: true, mode: "healthy-empty-postgrest" }));
    return;
  }

  // Public-shell CI needs a deterministic, healthy-but-empty data plane.
  // Supabase/PostgREST list queries receive an immediate successful empty
  // result so frontend rendering and Lighthouse do not measure an intentional
  // backend failure/retry path. Real local Supabase E2E covers the data-backed
  // path; resilience/high-latency behavior is tested separately.
  if (url.pathname.startsWith("/rest/v1/")) {
    response.writeHead(
      200,
      jsonHeaders({
        "content-range": "*/0",
      }),
    );
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    response.end("[]");
    return;
  }

  response.writeHead(503, jsonHeaders());
  response.end(
    JSON.stringify({
      message: "Unsupported endpoint in the public-shell CI Supabase stub.",
    }),
  );
});

server.listen(port, host, () => {
  console.log(`CI healthy-empty Supabase stub listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
