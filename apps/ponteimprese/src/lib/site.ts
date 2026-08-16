import { ponteImpreseConfig } from "@immigrati/product-config";

/**
 * Product identity for PonteImprese (code-level brand).
 * `domain` remains the current public contact host until BRAND_DOMAIN_CUTOVER.
 * Do not treat plannedDomain as a live DNS change.
 */
export const siteConfig = {
  name: ponteImpreseConfig.name,
  domain: "immigratiimprenditori.it",
  description: ponteImpreseConfig.description,
} as const;
