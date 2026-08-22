export type SupportConfiguration = {
  donationsOnlineEnabled: boolean;
  provider: "stripe" | "sumup" | null;
  paymentUrl: string | null;
  partnershipEmail: string;
};

/**
 * Fail-closed public support configuration.
 *
 * Do not enable online donations until the receiving account, legal holder,
 * provider onboarding, fiscal wording and public payment URL have all been
 * verified. A missing/partial configuration must never render a payment CTA.
 */
export const SUPPORT_CONFIGURATION: SupportConfiguration = {
  donationsOnlineEnabled: false,
  provider: null,
  paymentUrl: null,
  partnershipEmail: "direzione@immigratiimprenditori.it",
};

export function canAcceptOnlineDonations(config = SUPPORT_CONFIGURATION) {
  return Boolean(
    config.donationsOnlineEnabled &&
      config.provider &&
      config.paymentUrl?.startsWith("https://"),
  );
}
