import type { Metadata } from "next";
import { EDITORIAL_IMAGE_STOCK } from "@/lib/editorial/image-stock";

export const metadata: Metadata = {
  title: "Stock immagini editoriale",
  robots: { index: false, follow: false },
};

const groups = [
  "Hero e leadership",
  "Impresa e innovazione",
  "Tecnologia e dati",
  "Leadership femminile",
  "Milano",
  "Mobilità globale",
] as const;

export default function EditorialImageStockPage() {
  return (
    <main style={{ background: "#fbfaf4", color: "#15201d", minHeight: "100vh", padding: "48px 24px 96px" }}>
      <div style={{ width: "min(1440px, 100%)", margin: "0 auto" }}>
        <header style={{ borderBottom: "1px solid #15201d", paddingBottom: 24, marginBottom: 36 }}>
          <p style={{ margin: 0, color: "#0b3029", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>
            Fototeca editoriale · Preview interno
          </p>
          <h1 style={{ margin: "12px 0 0", fontFamily: "Georgia, Times New Roman, serif", fontSize: "clamp(42px, 6vw, 82px)", lineHeight: .92, fontWeight: 500 }}>
            Stock immagini · {EDITORIAL_IMAGE_STOCK.length} proposte
          </h1>
          <p style={{ maxWidth: 920, margin: "20px 0 0", color: "#56635d", lineHeight: 1.65 }}>
            Selezione preliminare per Immigrati Imprenditori. Le immagini provengono da Pexels: ogni scheda conserva il link alla pagina originale della fotografia e al relativo stato di utilizzo. La prima scheda H01 è l’immagine business usata nella hero recente.
          </p>
        </header>

        {groups.map((group) => (
          <section key={group} style={{ marginTop: 54 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #15201d", paddingBottom: 12 }}>
              <h2 style={{ margin: 0, fontFamily: "Georgia, Times New Roman, serif", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 500 }}>{group}</h2>
              <span style={{ fontSize: 11, color: "#65716b" }}>{EDITORIAL_IMAGE_STOCK.filter((item) => item.category === group).length} proposte</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginTop: 18 }}>
              {EDITORIAL_IMAGE_STOCK.filter((item) => item.category === group).map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "#fff",
                    border: item.featured ? "3px solid #0b3029" : "1px solid #d9e0dc",
                    minWidth: 0,
                    position: "relative",
                  }}
                >
                  {item.featured ? (
                    <span style={{ position: "absolute", zIndex: 2, top: 10, left: 10, background: "#ddea78", color: "#0b3029", padding: "7px 9px", fontSize: 10, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>
                      Hero attuale
                    </span>
                  ) : null}
                  <div style={{ aspectRatio: "16 / 10", overflow: "hidden", background: "#e9eeeb" }}>
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <strong style={{ color: "#0b3029", fontSize: 13 }}>{item.id}</strong>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#64706a", letterSpacing: ".08em", textTransform: "uppercase" }}>Pexels</span>
                    </div>
                    <h3 style={{ margin: "10px 0 0", fontFamily: "Georgia, Times New Roman, serif", fontSize: 24, lineHeight: 1.05, fontWeight: 500 }}>{item.title}</h3>
                    <p style={{ margin: "12px 0 0", color: "#58645f", fontSize: 13, lineHeight: 1.55 }}>{item.suggestedUse}</p>
                    <p style={{ margin: "12px 0 0", color: "#6f7974", fontSize: 11 }}>Foto: {item.photographer}</p>
                    <a
                      href={item.pexelsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-block", marginTop: 14, color: "#0b3029", fontSize: 11, fontWeight: 800, textDecoration: "none", borderBottom: "1px solid #0b3029", paddingBottom: 2 }}
                    >
                      Apri fonte e licenza →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <aside style={{ marginTop: 64, padding: 24, background: "#0b3029", color: "#f7f1e4" }}>
          <h2 style={{ margin: 0, fontFamily: "Georgia, Times New Roman, serif", fontSize: 28, fontWeight: 500 }}>Come scegliere</h2>
          <p style={{ margin: "12px 0 0", maxWidth: 1000, lineHeight: 1.65, color: "#dce7e1" }}>
            Scrivimi semplicemente i codici: per esempio “tieni H01, H07, W04, M08; scarta B03”. Le immagini stock servono per atmosfera, temi e contesto. Le interviste e i profili reali useranno fotografie autorizzate del soggetto o materiale con documentazione specifica.
          </p>
        </aside>
      </div>
    </main>
  );
}
