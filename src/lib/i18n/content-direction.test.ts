import assert from "node:assert/strict";
import test from "node:test";
import { getPlatformLanguage } from "./config";
import {
  localizedCtaArrow,
  originalContentLanguageAttrs,
  writingDirectionForLanguageCode,
  writingDirectionForLanguageId,
} from "./content-direction";

test("Arabic UI locale stays RTL while LTR locales stay LTR", () => {
  assert.equal(getPlatformLanguage("ar").direction, "rtl");
  assert.equal(getPlatformLanguage("it").direction, "ltr");
  assert.equal(getPlatformLanguage("en").direction, "ltr");
  assert.equal(getPlatformLanguage("zh").direction, "ltr");
});

test("Italian and English original editorial language_id isolate as LTR", () => {
  assert.equal(writingDirectionForLanguageId(1), "ltr");
  assert.equal(writingDirectionForLanguageId(2), "ltr");
  assert.equal(writingDirectionForLanguageCode("it"), "ltr");
  assert.equal(writingDirectionForLanguageCode("en"), "ltr");
  assert.equal(writingDirectionForLanguageCode("fr"), "ltr");
  assert.equal(writingDirectionForLanguageCode("de"), "ltr");
  assert.deepEqual(originalContentLanguageAttrs(1), { dir: "ltr", lang: "it" });
  assert.deepEqual(originalContentLanguageAttrs(2), { dir: "ltr", lang: "en" });
});

test("Arabic original editorial language_id remains RTL", () => {
  assert.equal(writingDirectionForLanguageId(7), "rtl");
  assert.equal(writingDirectionForLanguageCode("ar"), "rtl");
  assert.equal(writingDirectionForLanguageCode("ar-SA"), "rtl");
  assert.deepEqual(originalContentLanguageAttrs(7), { dir: "rtl", lang: "ar" });
});

test("other catalog RTL languages isolate as RTL and unknown ids default to LTR", () => {
  assert.equal(writingDirectionForLanguageId(16), "rtl");
  assert.equal(writingDirectionForLanguageId(19), "rtl");
  assert.equal(writingDirectionForLanguageId(999), "ltr");
  assert.equal(writingDirectionForLanguageId(null), "ltr");
  assert.deepEqual(originalContentLanguageAttrs(undefined), { dir: "ltr", lang: undefined });
});

test("CTA arrows mirror on Arabic and stay forward on LTR locales", () => {
  assert.equal(localizedCtaArrow("ar"), "←");
  assert.equal(localizedCtaArrow("it"), "→");
  assert.equal(localizedCtaArrow("en"), "→");
  assert.equal(localizedCtaArrow("fr"), "→");
  assert.equal(localizedCtaArrow("zh"), "→");
});
