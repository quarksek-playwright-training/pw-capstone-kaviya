import { test as base, type BrowserContext } from '@playwright/test';
import { accounts } from '../data/accounts';

type AuthenticatedFixtures = {
  authedContext: BrowserContext;
  secondaryContext: BrowserContext;
};

export const test = base.extend<AuthenticatedFixtures>({
  storageState: async ({}, use) => {
    await use(accounts.primary.storageState);
  },
  authedContext: async ({ context }, use) => {
    await use(context);
  },
  secondaryContext: async ({ browser }, use, testInfo) => {
    const projectUse = testInfo.project.use;
    const context = await browser.newContext({
      baseURL: projectUse.baseURL,
      viewport: projectUse.viewport,
      userAgent: projectUse.userAgent,
      deviceScaleFactor: projectUse.deviceScaleFactor,
      isMobile: projectUse.isMobile,
      hasTouch: projectUse.hasTouch,
      locale: projectUse.locale,
      timezoneId: projectUse.timezoneId,
      storageState: accounts.secondary.storageState,
    });
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';
