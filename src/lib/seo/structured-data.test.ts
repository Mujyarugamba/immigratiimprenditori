import assert from "node:assert/strict";
import test from "node:test";
import { breadcrumbStructuredData, schemaEventStatus } from "./structured-data";

test("breadcrumb structured data preserves user hierarchy and canonical www URLs", () => {
  assert.deepEqual(
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Osservatorio", path: "/osservatorio" },
      { name: "Indicatore", path: "/osservatorio/example" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.immigratiimprenditori.it/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Osservatorio",
          item: "https://www.immigratiimprenditori.it/osservatorio",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Indicatore",
          item: "https://www.immigratiimprenditori.it/osservatorio/example",
        },
      ],
    },
  );
});

test("event schema status distinguishes postponed and cancelled editions", () => {
  assert.equal(schemaEventStatus("scheduled"), "https://schema.org/EventScheduled");
  assert.equal(schemaEventStatus("ongoing"), "https://schema.org/EventScheduled");
  assert.equal(schemaEventStatus("concluded"), "https://schema.org/EventScheduled");
  assert.equal(schemaEventStatus("postponed"), "https://schema.org/EventPostponed");
  assert.equal(schemaEventStatus("cancelled"), "https://schema.org/EventCancelled");
});
