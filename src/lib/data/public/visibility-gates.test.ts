import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Documented public visibility gates mirroring RLS policies (A5/A6).
 * These constants are documentation tests — keep in sync with migrations under
 * supabase/migrations/*_create_access_*_rls.sql.
 */
export const PUBLIC_VISIBILITY_GATES = {
  businesses: {
    publication_status: "public",
    deleted_at: null,
    is_archived: false,
  },
  professionals: {
    publication_status: "published",
    visibility_status: "public",
  },
  opportunities: {
    publication_status: "published",
    visibility_level: "public",
  },
  service_offers: {
    publication_status: "published",
    visibility_status: "public",
  },
  service_requests: {
    publication_status: "published",
    visibility_status: "public",
  },
  events: {
    publication_status: "published",
    visibility_status: "public",
  },
  collaborations: {
    editorial_status: "published",
  },
  markets: {
    editorial_status: "published",
  },
  organizations: {
    publication_status: "published",
    visibility_status: "public",
  },
  indicators: {
    publication_status: "published",
  },
  contents: {
    publication_status: "published",
    visibility_status: "public",
  },
} as const;

describe("public visibility gates (RLS documentation)", () => {
  it("businesses gate matches Imprese public policy", () => {
    assert.equal(PUBLIC_VISIBILITY_GATES.businesses.publication_status, "public");
    assert.equal(PUBLIC_VISIBILITY_GATES.businesses.deleted_at, null);
    assert.equal(PUBLIC_VISIBILITY_GATES.businesses.is_archived, false);
  });

  it("professionals gate matches Professionisti public policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.professionals, {
      publication_status: "published",
      visibility_status: "public",
    });
  });

  it("opportunities gate matches Opportunità public policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.opportunities, {
      publication_status: "published",
      visibility_level: "public",
    });
  });

  it("service offers and requests share Servizi public policy", () => {
    const expected = {
      publication_status: "published",
      visibility_status: "public",
    };
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.service_offers, expected);
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.service_requests, expected);
  });

  it("events gate matches Eventi public policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.events, {
      publication_status: "published",
      visibility_status: "public",
    });
  });

  it("collaborations gate uses editorial_status only", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.collaborations, {
      editorial_status: "published",
    });
  });

  it("markets gate uses editorial_status only", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.markets, {
      editorial_status: "published",
    });
  });

  it("organizations gate matches Organizzazioni public policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.organizations, {
      publication_status: "published",
      visibility_status: "public",
    });
  });

  it("indicators gate matches Osservatorio indicator policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.indicators, {
      publication_status: "published",
    });
  });

  it("contents gate matches Contenuti public policy", () => {
    assert.deepEqual(PUBLIC_VISIBILITY_GATES.contents, {
      publication_status: "published",
      visibility_status: "public",
    });
  });
});
