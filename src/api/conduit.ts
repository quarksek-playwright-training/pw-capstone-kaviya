import fs from 'node:fs';
import { APIRequestContext } from '@playwright/test';
import { API_URL } from '../config';
import { Account, accounts } from '../data/accounts';

type StorageState = {
  origins: { localStorage: { name: string; value: string }[] }[];
};

export async function ensureAccount(request: APIRequestContext, account: Account): Promise<void> {
  const created = await request.post(`${API_URL}/users`, {
    data: {
      user: {
        username: account.username,
        email: account.email,
        password: account.password,
      },
    },
  });
  if (created.ok()) {
    return;
  }

  const login = await request.post(`${API_URL}/users/login`, {
    data: {
      user: {
        email: account.email,
        password: account.password,
      },
    },
  });
  if (!login.ok()) {
    throw new Error(
      `Could not ensure ${account.email}: register ${created.status()} ${await created.text()} login ${login.status()} ${await login.text()}`,
    );
  }
}

export function tokenFromStorage(storageStatePath: string): string {
  const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as StorageState;
  for (const origin of state.origins) {
    const token = origin.localStorage.find((item) => item.name === 'jwtToken');
    if (token) {
      return token.value;
    }
  }
  throw new Error(`jwtToken missing from ${storageStatePath}`);
}

export async function deleteTrackedArticles(request: APIRequestContext, slugs: string[]): Promise<void> {
  if (slugs.length === 0) {
    return;
  }
  const token = tokenFromStorage(accounts.primary.storageState);
  for (const slug of slugs) {
    const response = await request.delete(`${API_URL}/articles/${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status() !== 204 && response.status() !== 404) {
      throw new Error(`DELETE /articles/${slug} returned ${response.status()} ${await response.text()}`);
    }
  }
}
