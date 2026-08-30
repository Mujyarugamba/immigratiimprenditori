import assert from "node:assert/strict";
import test from "node:test";
import { authorsWithPublishedContent } from "./sitemap-authors";

test("sitemap authors include only profiles linked to published public content", () => {
  const profiles = [
    { id: "author-a", slug: "author-a" },
    { id: "author-b", slug: "author-b" },
    { id: "author-c", slug: "author-c" },
  ];
  const links = [
    { author_profile_id: "author-a", content_id: "published-1" },
    { author_profile_id: "author-b", content_id: "draft-1" },
    { author_profile_id: "author-c", content_id: null },
  ];

  assert.deepEqual(
    authorsWithPublishedContent(profiles, links, new Set(["published-1"])),
    [{ id: "author-a", slug: "author-a" }],
  );
});

test("sitemap authors ignore malformed or unlinked author rows", () => {
  const profiles = [{ id: "author-a", slug: "author-a" }];
  const links = [
    { author_profile_id: null, content_id: "published-1" },
    { author_profile_id: "author-a", content_id: null },
  ];

  assert.deepEqual(
    authorsWithPublishedContent(profiles, links, new Set(["published-1"])),
    [],
  );
});
