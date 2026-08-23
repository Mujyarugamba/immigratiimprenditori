export type DeploymentEnv = Readonly<Record<string, string | undefined>>;

export type DeploymentEnvironment = {
  isNetlifyPreview: boolean;
  isVercelPreview: boolean;
  isHostedPreview: boolean;
  isNetlifyProduction: boolean;
  isVercelProduction: boolean;
  isHostedProduction: boolean;
  isReadOnlyPreview: boolean;
};

/**
 * Resolve deployment safety mode from provider-owned environment variables.
 * Keep this function pure so CI can prove preview/production boundaries without
 * depending on either hosting provider at test time.
 */
export function resolveDeploymentEnvironment(env: DeploymentEnv): DeploymentEnvironment {
  const isNetlify = env.NETLIFY === "true";
  const isVercel = env.VERCEL === "1";

  const isNetlifyPreview = isNetlify && env.CONTEXT !== "production";
  const isVercelPreview = isVercel && env.VERCEL_ENV === "preview";
  const isHostedPreview = isNetlifyPreview || isVercelPreview;

  const isNetlifyProduction = isNetlify && env.CONTEXT === "production";
  const isVercelProduction = isVercel && env.VERCEL_ENV === "production";
  const isHostedProduction = isNetlifyProduction || isVercelProduction;

  return {
    isNetlifyPreview,
    isVercelPreview,
    isHostedPreview,
    isNetlifyProduction,
    isVercelProduction,
    isHostedProduction,
    isReadOnlyPreview:
      env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true" || isHostedPreview,
  };
}
