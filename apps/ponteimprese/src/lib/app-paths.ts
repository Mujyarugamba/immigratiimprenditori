import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Absolute root of apps/ponteimprese, independent of process.cwd().
 * Never resolves to the monorepo legacy `docs/` or `src/` trees.
 */
export function ponteImpreseAppRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

export function ponteImpreseLegalDocsDir(): string {
  const dir = join(ponteImpreseAppRoot(), "docs", "architecture", "legal");
  if (!existsSync(join(dir, "privacy-policy.md"))) {
    throw new Error(
      `PonteImprese legal documents missing at ${dir} (app-local docs required)`,
    );
  }
  return dir;
}

export function ponteImpreseMigrationsDir(): string {
  return join(ponteImpreseAppRoot(), "supabase", "migrations");
}
