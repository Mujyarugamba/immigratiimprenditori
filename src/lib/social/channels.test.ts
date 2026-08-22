import assert from "node:assert/strict";
import test from "node:test";
import {
  enabledInstitutionalSocialChannels,
  INSTITUTIONAL_SOCIAL_CHANNELS,
} from "@/lib/social/channels";

test("institutional social v1 is limited to LinkedIn, X and YouTube", () => {
  assert.deepEqual(
    INSTITUTIONAL_SOCIAL_CHANNELS.map((channel) => channel.id),
    ["linkedin", "x", "youtube"],
  );
});

test("planned social URLs stay disabled until accounts are verified", () => {
  assert.equal(enabledInstitutionalSocialChannels().length, 0);
});
