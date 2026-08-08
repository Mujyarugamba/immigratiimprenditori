import type { BusinessCapabilities } from "@/types/business";

/**
 * Derive ephemeral CTX/ACT flags from authoritative helper results.
 * Never persist; never use as the only mutation guard.
 */
export function deriveBusinessCapabilities(input: {
  businessId: string;
  hasActiveMembership: boolean;
  canActForBusiness: boolean;
}): BusinessCapabilities {
  return {
    businessId: input.businessId,
    isMember: input.hasActiveMembership,
    // ACT must not be inferred from membership role alone.
    canManage: input.canActForBusiness,
  };
}

/** Pure helpers for tests / UI labels. */
export function labelForCapabilities(caps: BusinessCapabilities): {
  memberLabel: string;
  manageLabel: string;
} {
  return {
    memberLabel: caps.isMember ? "Membro" : "Non membro",
    manageLabel: caps.canManage ? "Gestibile" : "Solo contesto",
  };
}

/**
 * Switcher selection never upgrades ACT.
 * Selecting a CTX-only business keeps canManage false.
 */
export function selectionDoesNotGrantAct(params: {
  selectedBusinessId: string | null;
  capsByBusinessId: Record<string, BusinessCapabilities>;
}): boolean {
  const id = params.selectedBusinessId;
  if (!id) return true;
  const caps = params.capsByBusinessId[id];
  if (!caps) return true;
  return !(caps.canManage && !caps.isMember);
}
