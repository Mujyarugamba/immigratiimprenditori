import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_PAGE_SIZE,
  buildQueryString,
  paginated,
  param,
  parsePageParams,
  type PaginatedResult,
  type PublicBusinessListItem,
  type PublicContentListItem,
  type PublicEventListItem,
} from "@/lib/data/public";

const here = dirname(fileURLToPath(import.meta.url));

/** Filter query keys used by public list pages — must stay aligned with data modules. */
export const PUBLIC_LIST_FILTER_PARAMS = {
  businesses: ["q", "forma", "settore"],
  professionals: ["q", "pratica", "categoria"],
  opportunities: ["q", "origine", "stato", "ambito"],
  service_offers: ["q", "categoria", "erogazione"],
  service_requests: ["q", "categoria", "erogazione"],
  events: ["q", "tipo", "modalita"],
  collaborations: ["q", "forma", "stato", "ambito"],
  markets: ["q", "tipo"],
  organizations: ["q", "tipo", "ambito"],
  indicators: ["q"],
  contents: ["q", "tipo", "categoria", "in_evidenza"],
} as const;

const EXPECTED_FILTER_KEYS = [
  "q",
  "forma",
  "pratica",
  "origine",
  "stato",
  "tipo",
  "categoria",
  "erogazione",
  "modalita",
  "in_evidenza",
  "ambito",
  "settore",
] as const;

function readModuleSource(name: string): string {
  return readFileSync(join(here, `${name}.ts`), "utf8");
}

function assertUsesParamKeys(source: string, keys: readonly string[]) {
  for (const key of keys) {
    assert.match(
      source,
      new RegExp(`param\\(\\s*searchParams\\s*,\\s*["']${key}["']\\s*\\)`),
      `expected param(searchParams, "${key}") in module`,
    );
  }
}

describe("paging helpers", () => {
  it("parsePageParams defaults to page 1 and DEFAULT_PAGE_SIZE range", () => {
    const p = parsePageParams({});
    assert.equal(p.page, 1);
    assert.equal(p.pageSize, DEFAULT_PAGE_SIZE);
    assert.equal(p.from, 0);
    assert.equal(p.to, DEFAULT_PAGE_SIZE - 1);
  });

  it("parsePageParams clamps invalid page to 1 and honors custom pageSize", () => {
    const p = parsePageParams({ page: "0" }, 5);
    assert.equal(p.page, 1);
    assert.equal(p.pageSize, 5);
    assert.equal(p.from, 0);
    assert.equal(p.to, 4);
  });

  it("parsePageParams reads first value when page is an array", () => {
    const p = parsePageParams({ page: ["3", "9"] }, 10);
    assert.equal(p.page, 3);
    assert.equal(p.from, 20);
    assert.equal(p.to, 29);
  });

  it("param trims and returns empty string for missing keys", () => {
    assert.equal(param({}, "q"), "");
    assert.equal(param({ q: "  foo  " }, "q"), "foo");
    assert.equal(param({ q: ["  bar  ", "ignored"] }, "q"), "bar");
  });

  it("buildQueryString merges base and overrides, omitting empty values", () => {
    const qs = buildQueryString({ q: "x", forma: "" }, { page: "2", forma: "company" });
    assert.ok(qs.startsWith("?"));
    const params = new URLSearchParams(qs.slice(1));
    assert.equal(params.get("q"), "x");
    assert.equal(params.get("page"), "2");
    assert.equal(params.get("forma"), "company");
    assert.equal(buildQueryString({ q: "" }), "");
  });

  it("paginated computes pageCount with minimum of 1", () => {
    const empty = paginated<string>([], 0, 1, 12);
    assert.equal(empty.pageCount, 1);
    assert.deepEqual(empty.items, []);

    const partial = paginated(["a"], 25, 2, 10);
    assert.equal(partial.pageCount, 3);
    assert.equal(partial.total, 25);
  });
});

describe("public list filter param contracts", () => {
  it("documents every expected filter key across domains", () => {
    const used = new Set<string>();
    for (const keys of Object.values(PUBLIC_LIST_FILTER_PARAMS)) {
      for (const key of keys) used.add(key);
    }
    assert.deepEqual([...used].sort(), [...EXPECTED_FILTER_KEYS].sort());
  });

  it("businesses module uses q, forma, and settore", () => {
    assertUsesParamKeys(readModuleSource("businesses"), PUBLIC_LIST_FILTER_PARAMS.businesses);
  });

  it("professionals module uses q, pratica, and categoria", () => {
    assertUsesParamKeys(
      readModuleSource("professionals"),
      PUBLIC_LIST_FILTER_PARAMS.professionals,
    );
  });

  it("opportunities module uses q, origine, stato, and ambito", () => {
    assertUsesParamKeys(
      readModuleSource("opportunities"),
      PUBLIC_LIST_FILTER_PARAMS.opportunities,
    );
  });

  it("services module uses q, categoria, and erogazione for offers and requests", () => {
    const source = readModuleSource("services");
    assertUsesParamKeys(source, PUBLIC_LIST_FILTER_PARAMS.service_offers);
    const requestMatches = [
      ...source.matchAll(/param\(\s*searchParams\s*,\s*["']([^"']+)["']\s*\)/g),
    ].map((m) => m[1]);
    assert.ok(requestMatches.includes("categoria"));
    assert.ok(requestMatches.includes("erogazione"));
  });

  it("events module uses q, tipo, and modalita", () => {
    assertUsesParamKeys(readModuleSource("events"), PUBLIC_LIST_FILTER_PARAMS.events);
  });

  it("collaborations module uses q, forma, stato, and ambito", () => {
    assertUsesParamKeys(
      readModuleSource("collaborations"),
      PUBLIC_LIST_FILTER_PARAMS.collaborations,
    );
  });

  it("markets module uses q and tipo", () => {
    assertUsesParamKeys(readModuleSource("markets"), PUBLIC_LIST_FILTER_PARAMS.markets);
  });

  it("organizations module uses q, tipo, and ambito", () => {
    assertUsesParamKeys(
      readModuleSource("organizations"),
      PUBLIC_LIST_FILTER_PARAMS.organizations,
    );
  });

  it("observatory module uses q only", () => {
    assertUsesParamKeys(readModuleSource("observatory"), PUBLIC_LIST_FILTER_PARAMS.indicators);
  });

  it("contents module uses q, tipo, categoria, and in_evidenza", () => {
    assertUsesParamKeys(readModuleSource("contents"), PUBLIC_LIST_FILTER_PARAMS.contents);
  });
});

describe("exported public list item types (visibility contract)", () => {
  it("PublicBusinessListItem exposes public-facing business fields only", () => {
    const sample: PublicBusinessListItem = {
      id: "00000000-0000-0000-0000-000000000001",
      public_name: "Pub",
      legal_name: "Legal",
      summary: null,
      organization_form: null,
      substantial_status: "active",
      founding_year: null,
    };
    assert.equal(sample.public_name, "Pub");
  });

  it("PublicEventListItem includes optional next_edition without internal axes", () => {
    const sample: PublicEventListItem = {
      id: "00000000-0000-0000-0000-000000000002",
      title: "Event",
      summary: null,
      type_code: "networking",
      delivery_mode: "in_presence",
      audience_kind: "both",
      economic_kind: "free",
      external_organization_label: null,
      next_edition: null,
    };
    assert.equal(sample.next_edition, null);
  });

  it("PublicContentListItem exposes slug and featured flag for public listings", () => {
    const sample: PublicContentListItem = {
      id: "00000000-0000-0000-0000-000000000003",
      slug: "story",
      title: "Story",
      abstract: null,
      type_code: "news",
      primary_category_code: null,
      language_id: 1,
      is_featured: false,
      published_at: null,
    };
    assert.equal(sample.is_featured, false);
  });

  it("PaginatedResult shape matches paging helper output", () => {
    const result: PaginatedResult<string> = paginated(["x"], 1, 1, 12);
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 12);
    assert.equal(result.pageCount, 1);
  });
});
