import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

function xpathLiteral(value: string): string {
  if (!value.includes("'")) {
    return `'${value}'`;
  }
  if (!value.includes('"')) {
    return `"${value}"`;
  }
  return `concat('${value.split("'").join(`', "'", '`)}')`;
}

export class FeedPage extends BasePage {
  async openHome(): Promise<void> {
    await this.goto('/');
    await this.feedSettled();
  }

  async openProfile(username: string): Promise<void> {
    await this.goto(`/profile/${encodeURIComponent(username)}`);
    await this.profileHeading(username).waitFor();
    await this.feedSettled();
  }

  async filterByTag(tag: string): Promise<void> {
    const filtered = this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname.replace(/\/$/, '').endsWith('/api/articles') && url.searchParams.get('tag') === tag;
    });
    await this.popularTag(tag).click();
    await filtered;
    await this.feedSettled();
  }

  private feedSettled(): Promise<void> {
    return this.emptyState().or(this.page.locator('a.preview-link h1')).first().waitFor();
  }

  articleTitle(title: string): Locator {
    return this.page.getByRole('heading', { level: 1, name: title, exact: true });
  }

  profileHeading(username: string): Locator {
    return this.page.getByRole('heading', { level: 4, name: username, exact: true });
  }

  emptyState(): Locator {
    return this.page.getByText('No articles are here... yet.', { exact: true });
  }

  loadingState(): Locator {
    return this.page.getByText('Loading articles...', { exact: true });
  }

  // The publication date is an unlabelled span, so it has no role and getByRole
  // cannot target it. getByText(the date) matches every article from that day,
  // and no accessible name ties the date to one title. The following-sibling
  // axis is what selects the date next to the author of this preview.
  authorDate(title: string): Locator {
    return this.page.locator(
      `xpath=//h1[normalize-space()=${xpathLiteral(title)}]/ancestor::div[contains(@class,'article-preview')]//a[contains(@class,'author')]/following-sibling::span`,
    );
  }

  // Popular tags are anchors with no href, so they expose no link role and
  // getByRole('link') does not match them. getByText(tag) also matches article
  // tag listitems and the feed tab that repeats the same word. Only the
  // sidebar structure identifies the control that applies the filter.
  popularTag(tag: string): Locator {
    return this.page.locator(
      `xpath=//div[contains(@class,'sidebar')]//a[contains(@class,'tag-pill') and normalize-space()=${xpathLiteral(tag)}]`,
    );
  }
}
