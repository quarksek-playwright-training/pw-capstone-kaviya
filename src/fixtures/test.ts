import { test as base, type BrowserContext } from '@playwright/test';
import { accounts } from '../data/accounts';

type AuthenticatedFixtures = {
  authedContext: BrowserContext;
  secondaryContext: BrowserContext;
};

export const test = base.extend<AuthenticatedFixtures>({
  // The built-in context reads this file, so authedContext is already signed in.
  storageState: async ({}, use) => {
    await use(accounts.primary.storageState);
  },
  authedContext: async ({ context }, use) => {
    await use(context);
  },
  // A second context for the other persistent account. newContext does not
  // inherit project options, so the device settings are copied explicitly.
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
