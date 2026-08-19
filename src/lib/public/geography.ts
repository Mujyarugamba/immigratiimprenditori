export function countryDisplayNameIt(code: string | null | undefined) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return code ?? "";
  try {
    return new Intl.DisplayNames(["it"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
