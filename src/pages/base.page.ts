import { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  newArticleLink(): Locator {
    return this.page.getByRole('link', { name: 'New Article' });
  }

  usernameLink(username: string): Locator {
    return this.page.getByRole('link', { name: username, exact: true });
  }

  signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign in', exact: true });
  }
}
