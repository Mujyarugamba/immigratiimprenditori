import { SITE_URL } from "@/lib/i18n/seo";

const SCRIPT = String.raw`(() => {
  const API_BASE = "${SITE_URL}/api/v1/indicators";
  const SITE_BASE = "${SITE_URL}";

  const formatValue = (value, unit) => {
    const number = new Intl.NumberFormat(document.documentElement.lang || "it-IT", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
    }).format(value);
    if (unit === "percent") return number + "%";
    if (unit === "eur") return number + " €";
    return number;
  };

  const render = async (root) => {
    const slug = (root.dataset.iiIndicator || "").trim();
    if (!slug) return;

    const params = new URLSearchParams({ indicator: slug });
    for (const [attr, query] of [["iiTerritory", "territory"], ["iiYear", "year"], ["iiSector", "sector"], ["iiCategory", "category"]]) {
      const value = (root.dataset[attr] || "").trim();
      if (value) params.set(query, value);
    }

    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Indicatore Immigrati Imprenditori");
    root.textContent = "Caricamento dato…";

    try {
      const response = await fetch(API_BASE + "?" + params.toString(), { mode: "cors" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      const records = Array.isArray(payload.records) ? payload.records : [];
      root.textContent = "";

      const box = document.createElement("div");
      box.style.cssText = "font-family:Arial,sans-serif;border:1px solid #111;padding:16px;background:#fff;color:#111;max-width:560px;line-height:1.4";

      if (!records.length) {
        const empty = document.createElement("p");
        empty.textContent = "Nessun valore pubblicato corrisponde ai filtri selezionati.";
        empty.style.margin = "0";
        box.appendChild(empty);
        root.appendChild(box);
        return;
      }

      const record = records[0];
      const eyebrow = document.createElement("div");
      eyebrow.textContent = "IMMIGRATI IMPRENDITORI · OSSERVATORIO";
      eyebrow.style.cssText = "font-size:11px;font-weight:700;letter-spacing:.08em;margin-bottom:8px";

      const title = document.createElement("div");
      title.textContent = record.indicator.title;
      title.style.cssText = "font-size:18px;font-weight:700;margin-bottom:12px";

      const value = document.createElement("div");
      value.textContent = formatValue(Number(record.value), record.indicator.unit_code);
      value.style.cssText = "font-size:32px;font-weight:700;margin-bottom:6px";

      const context = document.createElement("div");
      const labels = [record.territory && record.territory.label, record.category && record.category.label, record.period && record.period.start].filter(Boolean);
      context.textContent = labels.join(" · ");
      context.style.cssText = "font-size:13px;color:#555;margin-bottom:10px";

      const note = document.createElement("div");
      note.textContent = records.length > 1 ? records.length + " valori corrispondono ai filtri; è mostrato il primo record restituito." : "Dato pubblicato e qualificato dal Centro Studi.";
      note.style.cssText = "font-size:12px;color:#666;margin-bottom:12px";

      const link = document.createElement("a");
      link.href = SITE_BASE + "/osservatorio/" + encodeURIComponent(record.indicator.slug);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Fonte, definizione e metodologia →";
      link.style.cssText = "font-size:12px;font-weight:700;color:#111;text-decoration:underline";

      box.append(eyebrow, title, value, context, note, link);
      root.appendChild(box);
    } catch {
      root.textContent = "Dato temporaneamente non disponibile.";
    }
  };

  const boot = () => document.querySelectorAll("[data-ii-indicator]").forEach(render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();`;

export async function GET() {
  return new Response(SCRIPT, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
