export type SupportConfiguration = {
  donationsOnlineEnabled: boolean;
  provider: "stripe" | "sumup" | null;
  paymentUrl: string | null;
  bankAccountHolder: string | null;
  bankIban: string | null;
  bankTransferReason: string | null;
  partnershipEmail: string;
};

/**
 * Fail-closed public support configuration.
 *
 * Online support is enabled only after verifying the receiving Stripe account,
 * account holder, live payment capability and public Payment Link.
 * Bank details are published only after the account holder and IBAN have been
 * explicitly provided and the IBAN passes a formal checksum validation.
 * Fiscal/deductibility claims remain intentionally absent until separately verified.
 */
export const SUPPORT_CONFIGURATION: SupportConfiguration = {
  donationsOnlineEnabled: true,
  provider: "stripe",
  paymentUrl: "https://donate.stripe.com/8x25kFgrI4F8ejA1we2Ji00",
  bankAccountHolder:
    "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia",
  bankIban: "IT77Y3688801600100000119423",
  bankTransferReason: "Contributo libero – Centro Studi Immigrati Imprenditori",
  partnershipEmail: "direzione@immigratiimprenditori.it",
};

export function canAcceptOnlineDonations(config = SUPPORT_CONFIGURATION) {
  return Boolean(
    config.donationsOnlineEnabled &&
      config.provider &&
      config.paymentUrl?.startsWith("https://"),
  );
}
