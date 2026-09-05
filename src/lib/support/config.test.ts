import assert from "node:assert/strict";
import test from "node:test";
import { canAcceptOnlineDonations, SUPPORT_CONFIGURATION } from "@/lib/support/config";

test("online donations use the verified live payment configuration", () => {
  assert.equal(canAcceptOnlineDonations(), true);
  assert.equal(SUPPORT_CONFIGURATION.donationsOnlineEnabled, true);
  assert.equal(SUPPORT_CONFIGURATION.provider, "stripe");
  assert.match(SUPPORT_CONFIGURATION.paymentUrl ?? "", /^https:\/\/donate\.stripe\.com\//);
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
  assert.equal(
    canAcceptOnlineDonations({
      donationsOnlineEnabled: false,
      provider: "stripe",
      paymentUrl: "https://payments.example.test/support",
      partnershipEmail: "direzione@example.test",
    }),
    false,
  );
  assert.equal(
    canAcceptOnlineDonations({
      donationsOnlineEnabled: true,
      provider: "stripe",
      paymentUrl: "http://payments.example.test/support",
      partnershipEmail: "direzione@example.test",
    }),
    false,
  );
});
