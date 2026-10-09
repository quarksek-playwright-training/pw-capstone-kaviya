import { expect, test } from '@playwright/test';
import { ensureAccount } from '../src/api/conduit';
import { accounts } from '../src/data/accounts';
import { AuthPage } from '../src/pages/auth.page';

test(
  'wrong password shows the invalid credentials error and stays on login',
  { tag: ['@regression', '@auth', '@negative'] },
  async ({ page, request }) => {
    const account = accounts.primary;
    await ensureAccount(request, account);

    const auth = new AuthPage(page);
    await auth.openLogin();
    await auth.fillLogin(account.email, 'WrongPassword!1');
    await auth.submitLogin();

    await expect(auth.error('email or password is invalid')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(auth.signInHeading()).toBeVisible();
    await expect(auth.newArticleLink()).toHaveCount(0);
  },
);
