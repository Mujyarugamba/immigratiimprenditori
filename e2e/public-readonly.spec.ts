import { expect, test } from "@playwright/test";

const corePublicPages = ["/", "/contribuisci", "/sostieni"] as const;
const accessibilityPages = [
  "/",
  "/osservatorio",
  "/atlante",
  "/storie",
  "/eventi",
  "/open-data",
  "/contribuisci",
] as const;
const localizedHomes = [
  ["it", "/", "ltr"],
  ["en", "/en", "ltr"],
  ["fr", "/fr", "ltr"],
  ["es", "/es", "ltr"],
  ["de", "/de", "ltr"],
  ["ar", "/ar", "rtl"],
  ["zh", "/zh", "ltr"],
] as const;
const goLiveLocalizedCorePaths = [
  "/chi-siamo",
  "/esplora",
  "/osservatorio",
  "/dati-e-fonti",
  "/fonti",
  "/glossario",
  "/open-data",
  "/eventi",
  "/storie",
  "/contribuisci",
] as const;

test("homepage renders the institutional editorial surface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Immigrati Imprenditori/i);
  await expect(page.locator("#contenuto")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Vai al contenuto" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#contenuto-principale");

  const hero = page.locator(".home-hero");
  if (await hero.count()) {
    await expect(hero).toBeVisible();
    const backgroundImage = await hero.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(backgroundImage).toBe("none");
  }
});

test("skip link transfers keyboard focus to the main content target", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Vai al contenuto", exact: true });
  await expect(skipLink).toBeFocused();

  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth || "0"),
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
    };
  });
  expect(focusStyle.outlineStyle, "skip link must expose a visible keyboard outline").not.toBe("none");
  expect(focusStyle.outlineWidth, "skip link outline must have non-zero width").toBeGreaterThan(0);
  expect(focusStyle.bottom, "focused skip link must enter the viewport").toBeGreaterThan(0);
  expect(focusStyle.top, "focused skip link must remain inside the viewport").toBeLessThan(
    focusStyle.viewportHeight,
  );

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenuto-principale$/);
  await expect(page.locator("#contenuto-principale")).toBeFocused();
});

test("mobile homepage stays within good LCP and CLS thresholds on local delivery", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    type LayoutShiftEntry = PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    };
    type WebVitalWindow = Window & {
      __goLiveWebVitals?: { cls: number; lcp: number };
    };

    const target = window as WebVitalWindow;
    target.__goLiveWebVitals = { cls: 0, lcp: 0 };

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as LayoutShiftEntry[]) {
          if (!entry.hadRecentInput && target.__goLiveWebVitals) {
            target.__goLiveWebVitals.cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* Chromium in CI supports this; assertions below fail if no metric is observed. */
    }

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last && target.__goLiveWebVitals) {
          target.__goLiveWebVitals.lcp = last.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      /* Chromium in CI supports this; assertions below fail if no metric is observed. */
    }
  });

  const response = await page.goto("/", { waitUntil: "networkidle", timeout: 30_000 });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const target = window as Window & {
      __goLiveWebVitals?: { cls: number; lcp: number };
    };
    return target.__goLiveWebVitals ?? { cls: Number.POSITIVE_INFINITY, lcp: 0 };
  });

  expect(metrics.lcp, "homepage LCP metric was not observed").toBeGreaterThan(0);
  expect(metrics.lcp, `homepage LCP ${metrics.lcp.toFixed(1)}ms exceeded 2.5s good threshold`).toBeLessThanOrEqual(2_500);
  expect(metrics.cls, `homepage CLS ${metrics.cls.toFixed(4)} exceeded 0.10 good threshold`).toBeLessThanOrEqual(0.1);
});

test("core public surfaces pass the automated accessibility structure gate", async ({ page }) => {
  for (const path of accessibilityPages) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${path} did not return 2xx`).toBeTruthy();

    const audit = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll<HTMLElement>("[id]"))
        .map((element) => element.id)
        .filter(Boolean);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const imagesWithoutAlt = document.querySelectorAll("img:not([alt])").length;

      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]), select, textarea',
        ),
      );
      const unlabeledControls = controls.filter((control) => {
        if (control.getAttribute("aria-label")?.trim()) return false;
        if (control.getAttribute("aria-labelledby")?.trim()) return false;
        if (control.getAttribute("title")?.trim()) return false;
        const id = control.id;
        if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return false;
        return !control.closest("label");
      }).length;

      const interactive = Array.from(
        document.querySelectorAll<HTMLElement>('a[href], button, [role="button"]'),
      );
      const unnamedInteractive = interactive.filter((element) => {
        if (element.getAttribute("aria-label")?.trim()) return false;
        if (element.getAttribute("aria-labelledby")?.trim()) return false;
        if (element.getAttribute("title")?.trim()) return false;
        return !(element.textContent ?? "").trim();
      }).length;

      return {
        duplicateIds: new Set(duplicateIds).size,
        imagesWithoutAlt,
        unlabeledControls,
        unnamedInteractive,
        mainCount: document.querySelectorAll("main").length,
        h1Count: document.querySelectorAll("h1").length,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      };
    });

    expect(audit.duplicateIds, `${path} has duplicate IDs`).toBe(0);
    expect(audit.imagesWithoutAlt, `${path} has images without alt`).toBe(0);
    expect(audit.unlabeledControls, `${path} has unlabeled form controls`).toBe(0);
    expect(audit.unnamedInteractive, `${path} has unnamed links/buttons`).toBe(0);
    expect(audit.mainCount, `${path} must expose one main landmark`).toBe(1);
    expect(audit.h1Count, `${path} must expose one H1`).toBe(1);
    expect(audit.lang, `${path} must expose document language`).toBeTruthy();
    expect(["ltr", "rtl"], `${path} must expose writing direction`).toContain(audit.dir);
  }
});

test("contribution page exposes the reviewed intake flow without submitting", async ({ page }) => {
  await page.goto("/contribuisci");

  await expect(page.getByRole("heading", { level: 1, name: "Partecipa al Centro Studi" })).toHaveCount(1);
  await expect(page.getByLabel(/Tipo di proposta/i)).toBeVisible();
  await expect(page.getByLabel(/Nome e cognome/i)).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Invia alla redazione/i })).toBeVisible();
  await expect(page.locator('input[name="website"]')).toBeHidden();
  await expect(page.getByText(/non comporta pubblicazione automatica/i)).toBeVisible();
});

test("support page remains fail-closed while online payments are disabled", async ({ page }) => {
  await page.goto("/sostieni");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/pagamenti online/i)).toBeVisible();
  await expect(page.locator('a[href^="https://"][href*="checkout"]')).toHaveCount(0);
});

test("all seven platform languages expose the correct document direction", async ({ page }) => {
  for (const [locale, path, direction] of localizedHomes) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${locale} home did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    if (locale !== "it") {
      await expect(page.locator(`[data-platform-locale="${locale}"]`)).toHaveAttribute(
        "dir",
        direction,
      );
    }
  }

  await page.goto("/en");
  await expect(page.getByRole("link", { name: "Skip to content", exact: true })).toHaveAttribute(
    "href",
    "#contenuto-principale",
  );

  await page.goto("/ar");
  await expect(page.getByRole("link", { name: "الانتقال إلى المحتوى", exact: true })).toHaveAttribute(
    "href",
    "#contenuto-principale",
  );
});

test("go-live core interface renders across all seven platform languages", async ({
  request,
  page,
}) => {
  for (const [locale, , direction] of localizedHomes) {
    for (const corePath of goLiveLocalizedCorePaths) {
      const path = locale === "it" ? corePath : `/${locale}${corePath}`;
      const response = await request.get(path, { timeout: 30_000 });
      expect(response.ok(), `${path} did not return 2xx`).toBeTruthy();

      const body = await response.text();
      expect(body, `${path} [${locale}] must expose document language`).toMatch(
        new RegExp(`<html[^>]*\\blang=["']${locale}["']`, "i"),
      );
      expect(body, `${path} [${locale}] must expose writing direction`).toMatch(
        new RegExp(`<html[^>]*\\bdir=["']${direction}["']`, "i"),
      );

      const h1Count = body.match(/<h1(?:\s|>)/gi)?.length ?? 0;
      expect(h1Count, `${path} [${locale}] must expose exactly one H1`).toBe(1);
      expect(body, `${path} must not render a load error`).not.toContain("Impossibile caricare");

      if (locale !== "it") {
        expect(body, `${path} must expose localized platform wrapper`).toContain(
          `data-platform-locale="${locale}"`,
        );
        expect(body, `${path} localized wrapper must expose ${direction}`).toContain(
          `dir="${direction}"`,
        );
      }

      if (locale !== "it" && corePath === "/fonti") {
        expect(
          body.includes(`href="/${locale}/dati-e-fonti"`),
          `${path} must expose a localized Fonti → Metodologia link`,
        ).toBeTruthy();
      }
    }
  }

  // React SSR may insert comments between `{label} {arrow}`; assert the
  // accessible name of the in-page CTA, not a contiguous raw-HTML substring.
  await page.goto("/en/chi-siamo", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("link", { name: "Explore →", exact: true }),
    "/en/chi-siamo English CTA must keep a forward arrow",
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore ←", exact: true }),
    "/en/chi-siamo English CTA must not mirror the arrow",
  ).toHaveCount(0);

  await page.goto("/ar/chi-siamo", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("link", { name: "استكشف ←", exact: true }),
    "/ar/chi-siamo Arabic CTA must use an RTL arrow",
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "استكشف →", exact: true }),
    "/ar/chi-siamo Arabic CTA must not keep an LTR arrow",
  ).toHaveCount(0);
});

test("localized homes publish canonical and hreflang metadata", async ({ page }) => {
  for (const [locale, path] of localizedHomes.filter(([locale]) => locale !== "it")) {
    await page.goto(path);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", new RegExp(`/${locale}/?$`));

    const currentAlternate = page.locator(`link[rel="alternate"][hreflang="${locale}"]`);
    const italianAlternate = page.locator('link[rel="alternate"][hreflang="it"]');
    await expect(currentAlternate).toHaveCount(1);
    await expect(italianAlternate).toHaveCount(1);
  }
});

test("Arabic RTL remains usable across core localized pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/ar", "/ar/chi-siamo", "/ar/esplora", "/ar/contenuti", "/ar/storie"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${path} did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator('[data-platform-locale="ar"]')).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const originalNodes = page.locator("[data-original-language]");
    const originalCount = await originalNodes.count();
    for (let index = 0; index < originalCount; index += 1) {
      const node = originalNodes.nth(index);
      const lang = await node.getAttribute("data-original-language");
      const dir = await node.getAttribute("dir");
      if (lang === "ar" || lang === "ur" || lang === "fa") {
        expect(dir, `${path} original ${lang} must remain RTL`).toBe("rtl");
      } else {
        expect(dir, `${path} original ${lang ?? "und"} fallback must isolate as LTR`).toBe("ltr");
      }
    }

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.scrollWidth,
      `${path} overflows horizontally in RTL mobile view`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }

  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  const arabicObservatoryCta = page.getByRole("link", { name: /استكشف المرصد/ });
  await expect(arabicObservatoryCta).toContainText("←");
  await expect(arabicObservatoryCta).not.toContainText("→");
});

test("localized editorial surfaces do not claim AI translation without a cache", async ({ page }) => {
  for (const path of ["/en", "/en/contenuti", "/ar", "/ar/contenuti"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-ai-translation='true']")).toHaveCount(0);
    const body = await page.locator("body").innerText();
    expect(body, `${path} must not describe a reviewed translation`).not.toMatch(
      /traduzione revisionata|reviewed translation|traduction révisée|traducción revisada|geprüfte Übersetzung/i,
    );
  }
});

test("original=1 on a localized content page shows the original and not an AI disclaimer", async ({
  page,
}) => {
  await page.goto("/en/contenuti", { waitUntil: "domcontentloaded" });
  const firstArticleLink = page.locator("article a[href*='/en/contenuti/']").first();
  if ((await firstArticleLink.count()) === 0) {
    test.skip(true, "No public contents available in this environment");
    return;
  }

  const href = await firstArticleLink.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(`${href}?original=1`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-content-version='original']")).toBeVisible();
  await expect(page.locator("[data-ai-translation='true']")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  const headingLang = await page.locator("h1").getAttribute("lang");
  const headingDir = await page.locator("h1").getAttribute("dir");
  if (headingLang === "ar" || headingLang === "ur" || headingLang === "fa") {
    expect(headingDir).toBe("rtl");
  } else {
    expect(headingDir).toBe("ltr");
  }
});

test("LTR localized homes keep page direction and forward CTA arrows", async ({ page }) => {
  for (const [locale, path] of [
    ["en", "/en"],
    ["fr", "/fr"],
    ["zh", "/zh"],
  ] as const) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${path} did not return 2xx`).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator(`[data-platform-locale="${locale}"]`)).toHaveAttribute("dir", "ltr");

    const originalNodes = page.locator("[data-original-language]");
    const originalCount = await originalNodes.count();
    for (let index = 0; index < originalCount; index += 1) {
      const node = originalNodes.nth(index);
      const lang = await node.getAttribute("data-original-language");
      const dir = await node.getAttribute("dir");
      if (lang === "ar" || lang === "ur" || lang === "fa") {
        expect(dir, `${path} original ${lang} must isolate as RTL`).toBe("rtl");
      } else {
        expect(dir, `${path} original ${lang ?? "und"} must isolate as LTR`).toBe("ltr");
      }
    }
  }

  await page.goto("/en", { waitUntil: "domcontentloaded" });
  const englishObservatoryCta = page.getByRole("link", { name: /Explore the Observatory/ });
  await expect(englishObservatoryCta).toContainText("→");
  await expect(englishObservatoryCta).not.toContainText("←");
});

test("core public pages reflow without horizontal overflow", async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of corePublicPages) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id,
              classes: element.className?.toString().slice(0, 120) ?? "",
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              scrollWidth: element.scrollWidth,
              text: (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
            };
          })
          .filter(
            (item) =>
              item.right > viewportWidth + 1 ||
              item.left < -1 ||
              item.scrollWidth > item.width + 1,
          )
          .sort((a, b) => Math.max(b.right - viewportWidth, b.scrollWidth - b.width) - Math.max(a.right - viewportWidth, a.scrollWidth - a.width))
          .slice(0, 12);

        return {
          clientWidth: viewportWidth,
          scrollWidth: document.documentElement.scrollWidth,
          offenders,
        };
      });
      expect(
        dimensions.scrollWidth,
        `${path} overflows horizontally at ${width}px; offenders=${JSON.stringify(dimensions.offenders)}`,
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  }
});

test("institutional and language navigation remains reachable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const institutionalNav = page.getByRole("navigation", { name: "Navigazione istituzionale" });
  await expect(institutionalNav).toBeVisible();
  await expect(institutionalNav.getByRole("link", { name: "Cerca", exact: true })).toBeVisible();
  await expect(institutionalNav.getByRole("link", { name: "Chi siamo", exact: true })).toBeVisible();
  await expect(institutionalNav.getByRole("link", { name: "Accedi", exact: true })).toBeVisible();
  await expect(institutionalNav.getByRole("combobox", { name: "Lingua", exact: true })).toBeVisible();
});
