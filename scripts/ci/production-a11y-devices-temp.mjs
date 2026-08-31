import { chromium } from '@playwright/test';
import path from 'node:path';

const origin = 'https://www.immigratiimprenditori.it';
const routes = ['/', '/esplora', '/cultura', '/ricerca', '/osservatorio', '/storie', '/contribuisci', '/accedi'];
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
  { name: 'reflow-320', viewport: { width: 320, height: 568 } },
];
const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const failures = [];
const findings = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  for (const device of devices) {
    const context = await browser.newContext({ viewport: device.viewport });
    const page = await context.newPage();

    for (const route of routes) {
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      const status = response?.status() ?? 0;
      if (status < 200 || status >= 400) failures.push(`${device.name} ${route}: HTTP ${status}`);

      await page.waitForTimeout(250);
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1Count: document.querySelectorAll('h1').length,
        title: document.title,
      }));

      if (layout.scrollWidth > layout.clientWidth + 1) failures.push(`${device.name} ${route}: horizontal overflow ${layout.scrollWidth} > ${layout.clientWidth}`);
      if (layout.h1Count !== 1) failures.push(`${device.name} ${route}: expected exactly 1 h1, got ${layout.h1Count}`);
      if (!layout.title.trim()) failures.push(`${device.name} ${route}: empty document title`);

      if (device.name !== 'reflow-320') {
        await page.addScriptTag({ path: axePath });
        const results = await page.evaluate(async () => await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        }));
        for (const violation of results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')) {
          failures.push(`${device.name} ${route}: axe ${violation.impact} ${violation.id} (${violation.nodes.length} node/i)`);
        }
        for (const violation of results.violations.filter((v) => v.impact === 'moderate')) {
          findings.push(`${device.name} ${route}: axe moderate ${violation.id} (${violation.nodes.length} node/i)`);
        }
      }

      console.log(`PASS surface ${device.name} ${route} HTTP ${status} reflow=${layout.scrollWidth <= layout.clientWidth + 1}`);
    }
    await context.close();
  }

  const keyboardChecks = [
    { route: '/cerca', targets: ['#site-search', '#search-kind', '#search-year', 'form[method="get"] button[type="submit"]'] },
    { route: '/accedi', targets: ['#email', '#password', '#login-form button[type="submit"]'] },
    { route: '/contribuisci', targets: ['[name="submission_kind"]', '[name="contribution_text"]', '[name="submitter_name"]', '[name="submitter_email"]', '[name="consent_contact"]', '[name="consent_publication"]', '#modulo-partecipazione button[type="submit"]'] },
  ];

  for (const check of keyboardChecks) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const response = await page.goto(`${origin}${check.route}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    if (!response?.ok()) failures.push(`keyboard ${check.route}: HTTP ${response?.status() ?? 0}`);

    for (const selector of check.targets) {
      const target = page.locator(selector);
      if (await target.count() !== 1) {
        failures.push(`keyboard ${check.route}: target ${selector} count != 1`);
        continue;
      }
      let reached = false;
      for (let i = 0; i < 45; i += 1) {
        await page.keyboard.press('Tab');
        reached = await target.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) failures.push(`keyboard ${check.route}: focus never reached ${selector}`);
      else {
        const inViewport = await target.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight;
        });
        if (!inViewport) failures.push(`keyboard ${check.route}: focused ${selector} outside viewport`);
      }
    }
    console.log(`PASS keyboard ${check.route}`);
    await context.close();
  }

  const rtlContext = await browser.newContext({ viewport: { width: 320, height: 844 } });
  const rtlPage = await rtlContext.newPage();
  for (const route of ['/ar', '/ar/osservatorio', '/ar/contribuisci']) {
    const response = await rtlPage.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const info = await rtlPage.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (!response?.ok()) failures.push(`RTL ${route}: HTTP ${response?.status() ?? 0}`);
    if (info.lang !== 'ar') failures.push(`RTL ${route}: lang=${info.lang}`);
    if (info.dir !== 'rtl') failures.push(`RTL ${route}: dir=${info.dir}`);
    if (info.scrollWidth > info.clientWidth + 1) failures.push(`RTL ${route}: horizontal overflow`);
    console.log(`PASS RTL ${route} lang=${info.lang} dir=${info.dir}`);
  }
  await rtlContext.close();

  if (findings.length) {
    console.log('\nMODERATE AXE FINDINGS (non-blocking):');
    for (const item of [...new Set(findings)]) console.log(`- ${item}`);
  }

  if (failures.length) {
    console.error('\nQA FAILURES:');
    for (const item of [...new Set(failures)]) console.error(`- ${item}`);
    process.exitCode = 1;
  } else {
    console.log('\nPRODUCTION_ACCESSIBILITY_DEVICES_QA = PASS');
  }
} finally {
  await browser.close();
}
