import assert from "node:assert/strict";
import test from "node:test";
import { pageSocialMetadata } from "./social-metadata";

test("page social metadata uses the canonical www URL and preserves the shared social image", () => {
  const metadata = pageSocialMetadata({
    title: "Cultura",
    description: "Descrizione Cultura",
    pathname: "/cultura",
  });

  assert.equal(metadata.openGraph?.url, "https://www.immigratiimprenditori.it/cultura");
  assert.equal(metadata.openGraph?.title, "Cultura");
  assert.equal(metadata.openGraph?.description, "Descrizione Cultura");
  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "/logo-immigrati-imprenditori.png",
      alt: "Immigrati Imprenditori",
    },
  ]);
  assert.equal(metadata.twitter?.card, "summary_large_image");
  assert.equal(metadata.twitter?.title, "Cultura");
  assert.equal(metadata.twitter?.description, "Descrizione Cultura");
  assert.deepEqual(metadata.twitter?.images, ["/logo-immigrati-imprenditori.png"]);
});
