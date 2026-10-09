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
  'an article from one account is absent from the other account profile',
  { tag: ['@regression', '@articles'] },
  async ({ authedContext, secondaryContext }) => {
    const authorPage = await authedContext.newPage();
    const title = `Isolation article ${Date.now().toString(36)}`;
    const editor = new EditorPage(authorPage);
    const slug = await editor.publish({
      title,
      description: 'Belongs only to the author',
      body: 'The other persistent account must not list this article.',
      tags: ['Zoom'],
    });
    slugs.push(slug);

    const authorFeed = new FeedPage(authorPage);
    await authorFeed.openProfile(accounts.primary.username);
    await expect(authorFeed.articleTitle(title)).toBeVisible();

    const otherPage = await secondaryContext.newPage();
    const otherFeed = new FeedPage(otherPage);
    await otherFeed.openProfile(accounts.secondary.username);
    await expect(otherFeed.profileHeading(accounts.secondary.username)).toBeVisible();
    await expect(otherFeed.articleTitle(title)).toHaveCount(0);
  },
);
