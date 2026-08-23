import type { NextConfig } from "next";
import { resolveDeploymentEnvironment } from "./src/lib/deployment/environment";
import { validateHostedProductionEnv } from "./src/lib/deployment/production-env";

const deployment = resolveDeploymentEnvironment(process.env);

if (deployment.isHostedProduction) {
  const validation = validateHostedProductionEnv(process.env);
  if (!validation.ok) throw new Error(validation.error);
}

function configuredSupabaseConnectSources() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return [];

  try {
    const httpUrl = new URL(raw);
    if (httpUrl.protocol !== "https:" && httpUrl.protocol !== "http:") return [];

    const websocketUrl = new URL(httpUrl.origin);
    websocketUrl.protocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
    return [httpUrl.origin, websocketUrl.origin];
  } catch {
    return [];
  }
}

// Hosted previews have no reason to talk directly to Supabase. Public data is
// rendered server-side and every non-safe HTTP method is blocked by src/proxy.ts.
// Keeping connect-src at self adds a second barrier against client-side writes.
const connectSources = deployment.isReadOnlyPreview
  ? "'self'"
  : ["'self'", ...configuredSupabaseConnectSources()].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources}`,
  "media-src 'self' https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(deployment.isHostedPreview
    ? [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Inline the computed preview mode so client-only code (analytics/forms) sees
  // the same fail-closed state as the server proxy on Netlify and Vercel.
  env: {
    NEXT_PUBLIC_PREVIEW_READ_ONLY: deployment.isReadOnlyPreview ? "true" : "false",
  },
  transpilePackages: ["@immigrati/product-config", "@immigrati/ui-foundation"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
