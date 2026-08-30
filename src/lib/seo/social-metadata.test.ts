import assert from "node:assert/strict";
import test from "node:test";
import { pageSocialMetadata, profileSocialMetadata } from "./social-metadata";

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
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "Cultura",
    description: "Descrizione Cultura",
    images: ["/logo-immigrati-imprenditori.png"],
  });
});

test("profile social metadata uses canonical www URL and an avatar when available", () => {
  const metadata = profileSocialMetadata({
    title: "Ada Rossi",
    description: "Profilo pubblico di Ada Rossi.",
    pathname: "/contributori/ada-rossi",
    image: "https://images.example.org/ada.jpg",
    imageAlt: "Ada Rossi",
  });

  assert.equal(metadata.openGraph?.url, "https://www.immigratiimprenditori.it/contributori/ada-rossi");
  assert.equal(metadata.openGraph?.type, "profile");
  assert.equal(metadata.openGraph?.description, "Profilo pubblico di Ada Rossi.");
  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "https://images.example.org/ada.jpg",
      alt: "Ada Rossi",
    },
  ]);
  assert.deepEqual(metadata.twitter, {
    card: "summary",
    title: "Ada Rossi",
    description: "Profilo pubblico di Ada Rossi.",
    images: ["https://images.example.org/ada.jpg"],
  });
});

test("profile social metadata falls back to the shared social image", () => {
  const metadata = profileSocialMetadata({
    title: "Ada Rossi",
    description: "Profilo pubblico di Ada Rossi.",
    pathname: "/autori/ada-rossi",
  });

  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "/logo-immigrati-imprenditori.png",
      alt: "Ada Rossi",
    },
  ]);
  assert.deepEqual(metadata.twitter, {
    card: "summary",
    title: "Ada Rossi",
    description: "Profilo pubblico di Ada Rossi.",
    images: ["/logo-immigrati-imprenditori.png"],
  });
});
