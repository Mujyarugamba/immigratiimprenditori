import assert from "node:assert/strict";
import test from "node:test";
import { canAcceptOnlineDonations, SUPPORT_CONFIGURATION } from "@/lib/support/config";

test("online donations are disabled until payment configuration is complete", () => {
  assert.equal(canAcceptOnlineDonations(), false);
  assert.equal(SUPPORT_CONFIGURATION.paymentUrl, null);
});

test("online donations require enabled flag, provider and HTTPS URL", () => {
  assert.equal(
    canAcceptOnlineDonations({
      donationsOnlineEnabled: true,
      provider: "stripe",
      paymentUrl: "https://payments.example.test/support",
      partnershipEmail: "direzione@example.test",
    }),
    true,
  );
  assert.equal(
    canAcceptOnlineDonations({
      donationsOnlineEnabled: true,
      provider: null,
      paymentUrl: "https://payments.example.test/support",
      partnershipEmail: "direzione@example.test",
    }),
    false,
  );
});
