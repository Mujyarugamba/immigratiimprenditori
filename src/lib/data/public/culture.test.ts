import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCulturalEventType,
  isCultureClassifiedOrganization,
  isCultureClassifiedService,
  isCultureLinkedContent,
  isCultureLinkedMarket,
  isCultureLinkedOpportunity,
  isCultureProfessionalCategory,
  CULTURAL_EVENT_TYPE_CODE,
  CULTURE_PROFESSIONAL_CATEGORY_CODE,
} from "@/lib/data/public/culture";
import { moreNav, primaryNav } from "@/data/navigation";
import { ecosystems, transversalLayers } from "@/data/ecosystems";

describe("C2 culture inclusion criteria", () => {
  it("includes events with type_code cultural", () => {
    assert.equal(isCulturalEventType("cultural"), true);
    assert.equal(isCulturalEventType(CULTURAL_EVENT_TYPE_CODE), true);
  });

  it("excludes non-cultural event types", () => {
    assert.equal(isCulturalEventType("networking"), false);
    assert.equal(isCulturalEventType("conference"), false);
    assert.equal(isCulturalEventType("other"), false);
    assert.equal(isCulturalEventType(null), false);
  });

  it("includes opportunities linked via cultural event context", () => {
    assert.equal(
      isCultureLinkedOpportunity({
        opportunityId: "opp-1",
        culturalEventContextOpportunityIds: ["opp-1", null, "opp-2"],
      }),
      true,
    );
  });

  it("excludes opportunities not linked to cultural events", () => {
    assert.equal(
      isCultureLinkedOpportunity({
        opportunityId: "opp-x",
        culturalEventContextOpportunityIds: ["opp-1", "opp-2"],
      }),
      false,
    );
  });

  it("includes contents linked to a cultural event", () => {
    assert.equal(
      isCultureLinkedContent({
        linkedEventTypeCodes: ["networking", "cultural"],
        primaryCategoryCode: "entrepreneurship",
      }),
      true,
    );
  });

  it("excludes events_community contents without cultural event link", () => {
    assert.equal(
      isCultureLinkedContent({
        linkedEventTypeCodes: [],
        primaryCategoryCode: "events_community",
      }),
      false,
    );
    assert.equal(
      isCultureLinkedContent({
        linkedEventTypeCodes: ["conference"],
        primaryCategoryCode: "events_community",
      }),
      false,
    );
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

  it("includes only cultural_mediation professionals", () => {
    assert.equal(
      isCultureProfessionalCategory("cultural_mediation"),
      true,
    );
    assert.equal(
      isCultureProfessionalCategory(CULTURE_PROFESSIONAL_CATEGORY_CODE),
      true,
    );
    assert.equal(isCultureProfessionalCategory("architecture"), false);
    assert.equal(isCultureProfessionalCategory("communication"), false);
  });

  it("never classifies organization by association/foundation/ngo alone", () => {
    assert.equal(
      isCultureClassifiedOrganization({ typeCode: "association" }),
      false,
    );
    assert.equal(
      isCultureClassifiedOrganization({ typeCode: "foundation" }),
      false,
    );
    assert.equal(
      isCultureClassifiedOrganization({
        typeCode: "ngo",
        primaryScopeCode: null,
      }),
      false,
    );
  });

  it("never classifies linguistic services as culture", () => {
    assert.equal(
      isCultureClassifiedService({ categoryCode: "linguistic" }),
      false,
    );
    assert.equal(
      isCultureClassifiedService({ categoryCode: "training" }),
      false,
    );
  });
});

describe("C2 culture IA", () => {
  it("puts Cultura in Esplora (moreNav), not primary ecosystems", () => {
    assert.ok(moreNav.some((n) => n.href === "/cultura"));
    assert.ok(!primaryNav.some((n) => n.href === "/cultura"));
    assert.equal(ecosystems.length, 5);
    assert.ok(!ecosystems.some((e) => (e.id as string) === "culture"));
    assert.ok(transversalLayers.some((l) => l.id === "cultura"));
  });
});
