const codes = [
  "SP.POP.TOTL",
  "NY.GDP.MKTP.CD",
  "NY.GDP.MKTP.KD.ZG",
  "NY.GDP.PCAP.CD",
  "NE.TRD.GNFS.ZS",
];
const countries = ["IT", "DE", "FR"];

for (const c of countries) {
  for (const ind of codes) {
    const u = `https://api.worldbank.org/v2/country/${c}/indicator/${ind}?format=json&date=2024:2024`;
    const r = await fetch(u);
    const j = await r.json();
    const row = j[1] && j[1][0];
    console.log(
      JSON.stringify({
        country: c,
        indicator: ind,
        status: r.status,
        date: row?.date ?? null,
        value: row?.value ?? null,
      }),
    );
  }
}
