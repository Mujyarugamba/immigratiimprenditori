import { chromium } from '@playwright/test';
import path from 'node:path';

const origin = 'https://www.immigratiimprenditori.it';
const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const failures = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function waitFocusedInViewport(target) {
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline) {
    const visible = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el === document.activeElement && r.bottom > 0 && r.top < window.innerHeight;
    });
    if (visible) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const response = await page.goto(`${origin}/accedi`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    if (!response?.ok()) failures.push(`${viewport.name}: /accedi HTTP ${response?.status() ?? 0}`);
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: 'rule', values: ['color-contrast'] },
      });
      return result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          html: n.html,
          failureSummary: n.failureSummary,
          any: n.any.map((c) => ({ message: c.message, data: c.data })),
        })),
      }));
    });
    console.log(`CONTRAST ${viewport.name} ${JSON.stringify(violations)}`);
    if (violations.length) failures.push(`${viewport.name}: color-contrast violation remains`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto(`${origin}/contribuisci`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const selectors = [
    '[name="submission_kind"]',
    '[name="contribution_text"]',
    '[name="submitter_name"]',
    '[name="submitter_email"]',
    '[name="consent_contact"]',
    '[name="consent_publication"]',
    '#modulo-partecipazione button[type="submit"]',
  ];
  for (const selector of selectors) {
    const target = page.locator(selector);
    let reached = false;
    for (let i = 0; i < 45; i += 1) {
      await page.keyboard.press('Tab');
      reached = await target.evaluate((el) => el === document.activeElement);
      if (reached) break;
    }
    if (!reached) failures.push(`keyboard: focus never reached ${selector}`);
    else if (!(await waitFocusedInViewport(target))) failures.push(`keyboard: focused ${selector} remained outside viewport after 2s`);
    else console.log(`PASS keyboard viewport ${selector}`);
  }
  await context.close();

  if (failures.length) {
    console.error('DIAGNOSTIC FAILURES');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('PRODUCTION_A11Y_DIAGNOSTIC = PASS');
  }
} finally {
  await browser.close();
}
