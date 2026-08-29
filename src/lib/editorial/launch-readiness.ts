export type NumberZeroSnapshot = {
  lombardyDataValues: number;
  italyDataValues: number;
  internationalComparisonTerritories: number;
  selectedReports: number;
  publishedStoriesVoices: number;
  publishedEvents: number;
  interviewCandidatesInResearch: number;
};

export type NumberZeroCriterion = {
  key:
    | "lombardy_data"
    | "italy_data"
    | "international_comparison"
    | "selected_reports"
    | "stories_voices"
    | "events";
  label: string;
  required: string;
  actual: number;
  pass: boolean;
  note: string;
};

export type NumberZeroReadiness = {
  criteria: NumberZeroCriterion[];
  automaticPass: boolean;
  humanQualityReviewRequired: true;
};

const ITALY_TERRITORY_CODES = new Set(["IT", "ITA"]);
const AGGREGATE_TERRITORY_CODES = new Set(["OECD37", "OECD"]);

function isComparableForeignTerritory(code: string | null): code is string {
  if (!code) return false;
  if (ITALY_TERRITORY_CODES.has(code)) return false;
  if (code.startsWith("IT-")) return false;
  if (AGGREGATE_TERRITORY_CODES.has(code)) return false;
  return true;
}

/**
 * Return the foreign territories from the strongest comparison available inside
 * a single published indicator. Italy aliases/subnational codes and aggregate
 * OECD rows do not count as foreign comparison territories.
 */
export function strongestInternationalComparisonTerritories(
  values: Array<{ indicator_id: string; territory_code: string | null }>,
): string[] {
  const territoriesByIndicator = new Map<string, Set<string>>();

  for (const value of values) {
    if (!isComparableForeignTerritory(value.territory_code)) continue;
    const territories = territoriesByIndicator.get(value.indicator_id) ?? new Set<string>();
    territories.add(value.territory_code);
    territoriesByIndicator.set(value.indicator_id, territories);
  }

  let strongest: string[] = [];
  for (const territories of territoriesByIndicator.values()) {
    const sorted = Array.from(territories).sort();
    if (sorted.length > strongest.length) strongest = sorted;
  }
  return strongest;
}

export function isItalyTerritoryCode(code: string | null): boolean {
  return Boolean(code) && ITALY_TERRITORY_CODES.has(code as string);
}

/**
 * Number-zero pre-go-live readiness measures the data, research and event
 * surfaces that can be completed without external outreach.
 *
 * Stories remain a first-class measured criterion, but they do not block the
 * first go-live: the approved operating rule is to put the site online before
 * sending invitations or interview requests. Real stories therefore become the
 * first post-go-live editorial objective and must never be fabricated merely to
 * satisfy an automatic gate.
 */
export function evaluateNumberZeroReadiness(
  snapshot: NumberZeroSnapshot,
): NumberZeroReadiness {
  const criteria: NumberZeroCriterion[] = [
    {
      key: "lombardy_data",
      label: "Nucleo dati Lombardia",
      required: ">= 1 valore pubblico finale",
      actual: snapshot.lombardyDataValues,
      pass: snapshot.lombardyDataValues >= 1,
      note: "Il numero zero deve avere almeno un dato regionale lombardo realmente pubblicato.",
    },
    {
      key: "italy_data",
      label: "Nucleo dati Italia",
      required: ">= 1 valore pubblico finale",
      actual: snapshot.italyDataValues,
      pass: snapshot.italyDataValues >= 1,
      note: "Il numero zero deve avere almeno un dato nazionale italiano realmente pubblicato.",
    },
    {
      key: "international_comparison",
      label: "Confronto internazionale",
      required: ">= 2 territori/Paesi confrontabili",
      actual: snapshot.internationalComparisonTerritories,
      pass: snapshot.internationalComparisonTerritories >= 2,
      note: "Il requisito è soddisfatto solo da dati pubblicati con copertura su più territori/Paesi nello stesso indicatore.",
    },
    {
      key: "selected_reports",
      label: "Rapporti selezionati",
      required: ">= 2 rapporti/ricerche pubblicati",
      actual: snapshot.selectedReports,
      pass: snapshot.selectedReports >= 2,
      note: "La roadmap usa il plurale: il minimo tecnico è due schede di rapporto/ricerca pubblicate.",
    },
    {
      key: "stories_voices",
      label: "Storie e interviste",
      required: "popolamento reale dopo il go-live",
      actual: snapshot.publishedStoriesVoices,
      pass: true,
      note: "Non blocca il primo go-live: inviti e interviste iniziano solo dopo la messa online. La qualità e l'autenticità restano obbligatorie nel ciclo editoriale post-go-live.",
    },
    {
      key: "events",
      label: "Eventi qualificati",
      required: ">= 1 evento pubblico",
      actual: snapshot.publishedEvents,
      pass: snapshot.publishedEvents >= 1,
      note: "Almeno un evento pertinente deve rendere viva l'agenda del numero zero.",
    },
  ];

  return {
    criteria,
    automaticPass: criteria.every((criterion) => criterion.pass),
    humanQualityReviewRequired: true,
  };
}
