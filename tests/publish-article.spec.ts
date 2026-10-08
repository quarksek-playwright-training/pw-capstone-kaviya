import { deleteTrackedArticles } from '../src/api/conduit';
import { accounts } from '../src/data/accounts';
import { expect, test } from '../src/fixtures/test';
import { EditorPage } from '../src/pages/editor.page';
import { FeedPage } from '../src/pages/feed.page';

const slugs: string[] = [];

test.afterEach(async ({ request }) => {
  await deleteTrackedArticles(request, slugs);
  slugs.length = 0;
});

test(
  'published article appears on the author profile',
  { tag: ['@smoke', '@articles'] },
  async ({ authedContext }) => {
    const page = await authedContext.newPage();
    const title = `Published profile article ${Date.now().toString(36)}`;
    const editor = new EditorPage(page);
    const slug = await editor.publish({
      title,
      description: 'Visible on the author profile',
      body: 'The author profile lists this article after it is published.',
      tags: ['Coding'],
    });
    slugs.push(slug);

    const feed = new FeedPage(page);
    await feed.openProfile(accounts.primary.username);

    await expect(feed.articleTitle(title)).toBeVisible();
    await expect(feed.authorDate(title)).toHaveText(/\w+ \d{1,2}, \d{4}/);
  },
);
