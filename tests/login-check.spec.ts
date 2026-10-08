import { expect, test } from '@playwright/test';
import { ensureAccount } from '../src/api/conduit';
import { accounts } from '../src/data/accounts';
import { AuthPage } from '../src/pages/auth.page';

test(
  'persistent account reaches the authenticated area after signing in',
  { tag: ['@smoke', '@auth'] },
  async ({ page, request }) => {
    const account = accounts.primary;
    await ensureAccount(request, account);

    const auth = new AuthPage(page);
    await auth.login(account.email, account.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(auth.newArticleLink()).toBeVisible();
    await expect(auth.usernameLink(account.username)).toBeVisible();
    await expect(auth.signInHeading()).toHaveCount(0);
  },
);
