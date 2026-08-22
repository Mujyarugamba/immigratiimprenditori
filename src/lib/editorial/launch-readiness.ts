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

/**
 * Roadmap point 20 says the launch must not start with empty pages and requires:
 * Lombardia/Italia data, at least one international comparison, selected reports,
 * events, "alcune storie molto buone", and a living home.
 *
 * The only operational numeric interpretation added here is that the plural
 * "alcune storie" requires at least 2 published story/voice items. This is a
 * technical minimum only: editorial quality remains a human decision.
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
      note: "Il requisito è soddisfatto solo da dati pubblicati con copertura su più territori/Paesi.",
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
      required: ">= 2 storie/interviste/testimonianze pubblicate",
      actual: snapshot.publishedStoriesVoices,
      pass: snapshot.publishedStoriesVoices >= 2,
      note: "Il numero misura solo la presenza. La qualità delle storie deve essere approvata dalla redazione.",
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
