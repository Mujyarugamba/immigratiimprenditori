const apiUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

if (!apiUrl || !publishableKey) {
  throw new Error("Missing local Supabase URL or publishable key");
}

if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(apiUrl)) {
  throw new Error(`Refusing non-local Supabase URL: ${apiUrl}`);
}

const endpoint = `${apiUrl}/auth/v1/token?grant_type=password`;
let sawCredentialFailure = false;
let rateLimitedAt = null;

for (let attempt = 1; attempt <= 12; attempt += 1) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: "ci-login-rate-limit@example.invalid",
      password: "definitely-wrong-password",
    }),
  });

  if (response.status === 429) {
    rateLimitedAt = attempt;
    break;
  }

  if (response.status === 400 || response.status === 401) {
    sawCredentialFailure = true;
    continue;
  }

  const body = await response.text();
  throw new Error(`Unexpected Auth response ${response.status}: ${body.slice(0, 300)}`);
}

if (!sawCredentialFailure) {
  throw new Error("Login rate-limit smoke never observed a normal credential failure before throttling");
}

if (rateLimitedAt === null) {
  throw new Error("Login rate-limit smoke did not receive HTTP 429 within 12 attempts");
}

console.log(`AUTH_LOGIN_RATE_LIMIT_429 = PASS (attempt ${rateLimitedAt})`);
console.log("AUTH_LOGIN_RATE_LIMIT_LOCAL_ONLY = PASS");
