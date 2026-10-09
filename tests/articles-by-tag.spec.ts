import fs from 'node:fs';
import path from 'node:path';
import { deleteTrackedArticles } from '../src/api/conduit';
import { expect, test } from '../src/fixtures/test';
import { EditorPage } from '../src/pages/editor.page';
import { FeedPage } from '../src/pages/feed.page';

type ArticleSeed = {
  title: string;
  description: string;
  body: string;
  tag: string;
};

const slugs: string[] = [];

test.afterEach(async ({ request }) => {
  await deleteTrackedArticles(request, slugs);
  slugs.length = 0;
});

test(
  'articles from one data file each appear under their own tag filter',
  { tag: ['@regression', '@articles'] },
  async ({ authedContext }) => {
    const seeds = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'test-data', 'articles.json'), 'utf8'),
    ) as ArticleSeed[];
    expect(seeds.length).toBeGreaterThanOrEqual(3);

    const page = await authedContext.newPage();
    const editor = new EditorPage(page);
    // The API rejects a title that already exists, so each run gets its own suffix.
    const runId = Date.now().toString(36);
    const published: ArticleSeed[] = [];

    for (const seed of seeds) {
      const title = `${seed.title} ${runId}`;
      const slug = await editor.publish({
        title,
        description: seed.description,
        body: seed.body,
        tags: [seed.tag],
      });
      slugs.push(slug);
      published.push({ ...seed, title });
    }

    const feed = new FeedPage(page);
    await feed.openHome();
    for (const article of published) {
      await feed.filterByTag(article.tag);
      await expect(feed.articleTitle(article.title)).toBeVisible();
      for (const other of published) {
        if (other.tag !== article.tag) {
          await expect(feed.articleTitle(other.title)).toHaveCount(0);
        }
      }
    }
  },
);
