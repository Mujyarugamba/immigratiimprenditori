import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CULTURAL_EVENT_TYPE_CODE,
  CULTURE_PROFESSIONAL_CATEGORY_CODE,
  CULTURE_PROFESSIONAL_CATEGORY_CODES,
  CULTURE_PROFESSIONAL_GROUP_CODE,
  dedupeById,
  isCulturalEventType,
  isCultureActivityScope,
  isCultureClassifiedBusiness,
  isCultureClassifiedCollaboration,
  isCultureClassifiedOrganization,
  isCultureClassifiedService,
  isCultureContent,
  isCultureLinkedContent,
  isCultureLinkedMarket,
  isCultureLinkedOpportunity,
  isCultureOpportunity,
  isCultureProfessionalCategory,
  isCultureProfessionalGroup,
} from "@/lib/data/public/culture";
import { moreNav, primaryNav } from "@/data/navigation";
import { ecosystems, transversalLayers } from "@/data/ecosystems";

describe("C4 culture inclusion criteria", () => {
  it("includes events with type_code cultural", () => {
    assert.equal(isCulturalEventType("cultural"), true);
    assert.equal(isCulturalEventType(CULTURAL_EVENT_TYPE_CODE), true);
  });

  it("excludes non-cultural event types", () => {
    assert.equal(isCulturalEventType("networking"), false);
    assert.equal(isCulturalEventType("conference"), false);
    assert.equal(isCulturalEventType(null), false);
  });

  it("includes cultural_creative and cultural_mediation professionals", () => {
    assert.equal(isCultureProfessionalCategory("cultural_mediation"), true);
    assert.equal(
      isCultureProfessionalCategory(CULTURE_PROFESSIONAL_CATEGORY_CODE),
      true,
    );
    assert.equal(isCultureProfessionalCategory("performing_artist"), true);
    assert.equal(isCultureProfessionalCategory("cultural_producer"), true);
    assert.ok(
      CULTURE_PROFESSIONAL_CATEGORY_CODES.includes("musician"),
    );
    assert.equal(isCultureProfessionalGroup("cultural_creative"), true);
    assert.equal(
      isCultureProfessionalGroup(CULTURE_PROFESSIONAL_GROUP_CODE),
      true,
    );
  });

  it("excludes legacy non-cultural professional categories", () => {
    assert.equal(isCultureProfessionalCategory("architecture"), false);
    assert.equal(isCultureProfessionalCategory("communication"), false);
    assert.equal(isCultureProfessionalCategory("legal_area"), false);
    assert.equal(isCultureProfessionalGroup("linguistic_intercultural"), false);
  });

  it("includes organizations with cultural activity scopes", () => {
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "association",
        primaryScopeCode: "culture",
      }),
      true,
    );
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "ngo",
        primaryScopeCode: "heritage",
      }),
      true,
    );
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "foundation",
        primaryScopeCode: "creative_industries",
      }),
      true,
    );
  });

  it("excludes association/foundation/ngo without cultural scope", () => {
    assert.equal(
      isCultureClassifiedOrganization({ typeCode: "association" }),
      false,
    );
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "foundation",
        primaryScopeCode: null,
      }),
      false,
    );
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "ngo",
        primaryScopeCode: "education",
      }),
      false,
    );
  });

  it("includes CCI businesses and excludes non-CCI", () => {
    assert.equal(
      isCultureClassifiedBusiness({
        sectorSlugs: ["construction", "audiovisual"],
      }),
      true,
    );
    assert.equal(
      isCultureClassifiedBusiness({ sectorSlugs: ["publishing"] }),
      true,
    );
    assert.equal(
      isCultureClassifiedBusiness({
        sectorSlugs: ["construction", "logistics"],
      }),
      false,
    );
  });

  it("includes opportunities by scope or cultural event link", () => {
    assert.equal(
      isCultureOpportunity({
        hasCulturalScopeAssignment: true,
        linkedViaCulturalEvent: false,
      }),
      true,
    );
    assert.equal(
      isCultureOpportunity({
        hasCulturalScopeAssignment: false,
        linkedViaCulturalEvent: true,
      }),
      true,
    );
    assert.equal(
      isCultureOpportunity({
        hasCulturalScopeAssignment: false,
        linkedViaCulturalEvent: false,
      }),
      false,
    );
    assert.equal(
      isCultureLinkedOpportunity({
        opportunityId: "opp-1",
        culturalEventContextOpportunityIds: ["opp-1"],
      }),
      true,
    );
  });

  it("dedupes opportunities by id", () => {
    const items = dedupeById([
      { id: "a", title: "one" },
      { id: "b", title: "two" },
      { id: "a", title: "one-again" },
    ]);
    assert.equal(items.length, 2);
    assert.equal(items[0]?.title, "one");
  });

  it("includes collaborations with cultural activity scope", () => {
    assert.equal(
      isCultureClassifiedCollaboration({
        activityScopeCode: "culture",
        formCode: "ricerca",
      }),
      true,
    );
    assert.equal(isCultureActivityScope("creative_industries"), true);
  });

  it("excludes progetto form without cultural scope", () => {
    assert.equal(
      isCultureClassifiedCollaboration({
        activityScopeCode: null,
        formCode: "progetto",
      }),
      false,
    );
    assert.equal(
      isCultureClassifiedCollaboration({
        activityScopeCode: undefined,
        formCode: "progetto",
      }),
      false,
    );
  });

  it("includes cultural_creative services and excludes linguistic", () => {
    assert.equal(
      isCultureClassifiedService({ categoryCode: "cultural_creative" }),
      true,
    );
    assert.equal(
      isCultureClassifiedService({ categoryCode: "linguistic" }),
      false,
    );
    assert.equal(
      isCultureClassifiedService({ categoryCode: "training" }),
      false,
    );
  });

  it("includes content by culture category or cultural event link", () => {
    assert.equal(
      isCultureContent({
        primaryCategoryCode: "culture",
        linkedEventTypeCodes: [],
      }),
      true,
    );
    assert.equal(
      isCultureContent({
        primaryCategoryCode: "entrepreneurship",
        linkedEventTypeCodes: ["cultural"],
      }),
      true,
    );
    assert.equal(
      isCultureLinkedContent({
        linkedEventTypeCodes: ["networking", "cultural"],
        primaryCategoryCode: "entrepreneurship",
      }),
      true,
    );
  });

  it("excludes events_community without cultural event or culture category", () => {
    assert.equal(
      isCultureContent({
        primaryCategoryCode: "events_community",
        linkedEventTypeCodes: [],
      }),
      false,
    );
    assert.equal(
      isCultureContent({
        primaryCategoryCode: "events_community",
        linkedEventTypeCodes: ["conference"],
      }),
      false,
    );
  });

  it("dedupes contents by id", () => {
    const items = dedupeById([
      { id: "c1", slug: "a" },
      { id: "c1", slug: "a" },
      { id: "c2", slug: "b" },
    ]);
    assert.equal(items.length, 2);
  });

  it("includes markets linked to cultural events", () => {
    assert.equal(
      isCultureLinkedMarket({ linkedEventTypeCodes: ["cultural"] }),
      true,
    );
    assert.equal(
      isCultureLinkedMarket({ linkedEventTypeCodes: ["fair"] }),
      false,
    );
  });
});

describe("C4 culture IA", () => {
  it("keeps Cultura transversal, not a sixth ecosystem", () => {
    assert.ok(moreNav.some((n) => n.href === "/cultura"));
    assert.ok(!primaryNav.some((n) => n.href === "/cultura"));
    assert.equal(ecosystems.length, 5);
    assert.ok(!ecosystems.some((e) => (e.id as string) === "culture"));
    assert.ok(transversalLayers.some((l) => l.id === "cultura"));
  });
});
