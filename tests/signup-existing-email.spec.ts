import { expect, test } from '@playwright/test';
import { API_URL } from '../src/config';
import { ensureAccount } from '../src/api/conduit';
import { accounts } from '../src/data/accounts';
import { AuthPage } from '../src/pages/auth.page';

test(
  'signup rejects an email that already belongs to a persistent account',
  { tag: ['@regression', '@auth', '@negative'] },
  async ({ page, request }) => {
    await ensureAccount(request, accounts.primary);
    const username = `no${Date.now().toString(36)}`;

    const auth = new AuthPage(page);
    await auth.signUp(username, accounts.primary.email, accounts.primary.password);

    await expect(auth.error('email has already been taken')).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
    await expect(auth.signUpHeading()).toBeVisible();
    await expect(auth.signInLink()).toBeVisible();
    await expect(auth.usernameLink(username)).toHaveCount(0);

    const profile = await request.get(`${API_URL}/profiles/${username}`);
    expect(profile.status()).toBe(404);
  },
);
