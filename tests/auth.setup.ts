import fs from 'node:fs';
import path from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { ensureAccount } from '../src/api/conduit';
import { accounts } from '../src/data/accounts';
import { AuthPage } from '../src/pages/auth.page';

setup('create persistent accounts and save their sessions', async ({ page, request }) => {
  fs.mkdirSync(path.dirname(accounts.primary.storageState), { recursive: true });
  const auth = new AuthPage(page);

  for (const account of [accounts.primary, accounts.secondary]) {
    await ensureAccount(request, account);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await auth.login(account.email, account.password);
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();
    await page.context().storageState({ path: account.storageState });
  }
});
