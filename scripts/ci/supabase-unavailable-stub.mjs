import http from "node:http";

const host = "127.0.0.1";
const port = Number(process.env.CI_SUPABASE_STUB_PORT ?? 54329);

const server = http.createServer((request, response) => {
  if (request.url === "/__health") {
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(503, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(
    JSON.stringify({
      message: "CI Supabase is intentionally unavailable for public-shell tests.",
    }),
  );
});

server.listen(port, host, () => {
  console.log(`CI Supabase unavailable stub listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
