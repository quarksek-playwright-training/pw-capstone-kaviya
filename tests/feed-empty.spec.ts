import { Route } from '@playwright/test';
import { expect, test } from '../src/fixtures/test';
import { FeedPage } from '../src/pages/feed.page';

test(
  'the feed shows an empty state when the article request returns nothing',
  { tag: ['@regression', '@articles', '@negative'] },
  async ({ authedContext }) => {
    const page = await authedContext.newPage();
    const fulfillEmpty = async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ articles: [], articlesCount: 0 }),
      });
    };

    await page.route(/\/api\/articles(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.has('tag') || url.searchParams.has('author') || url.searchParams.has('favorited')) {
        await route.continue();
        return;
      }
      await fulfillEmpty(route);
    });
    await page.route('**/api/articles/feed**', fulfillEmpty);

    const feed = new FeedPage(page);
    await feed.openHome();

    await expect(feed.emptyState()).toBeVisible();
    await expect(feed.loadingState()).toBeHidden();
    await expect(
      page.getByRole('heading', {
        name: 'Discover Bondar Academy: Your Gateway to Efficient Learning',
      }),
    ).toHaveCount(0);
  },
);
