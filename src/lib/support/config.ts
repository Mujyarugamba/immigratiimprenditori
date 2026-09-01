export type SupportConfiguration = {
  donationsOnlineEnabled: boolean;
  provider: "stripe" | "sumup" | null;
  paymentUrl: string | null;
  partnershipEmail: string;
};

/**
 * Fail-closed public support configuration.
 *
 * Online support is enabled only after verifying the receiving Stripe account,
 * account holder, live payment capability and public Payment Link.
 * Fiscal/deductibility claims remain intentionally absent until separately verified.
 */
export const SUPPORT_CONFIGURATION: SupportConfiguration = {
  donationsOnlineEnabled: true,
  provider: "stripe",
  paymentUrl: "https://donate.stripe.com/8x25kFgrI4F8ejA1we2Ji00",
  partnershipEmail: "direzione@immigratiimprenditori.it",
};

export function canAcceptOnlineDonations(config = SUPPORT_CONFIGURATION) {
  return Boolean(
    config.donationsOnlineEnabled &&
      config.provider &&
      config.paymentUrl?.startsWith("https://"),
  );
}
