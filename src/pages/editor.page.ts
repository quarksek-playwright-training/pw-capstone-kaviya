import { BasePage } from './base.page';

export type ArticleDraft = {
  title: string;
  description: string;
  body: string;
  tags: string[];
};

export class EditorPage extends BasePage {
  async publish(draft: ArticleDraft): Promise<string> {
    await this.goto('/editor');
    await this.page.getByRole('textbox', { name: 'Article Title' }).fill(draft.title);
    await this.page.getByRole('textbox', { name: "What's this article about?", exact: true }).fill(draft.description);
    await this.page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill(draft.body);

    const tagInput = this.page.getByRole('textbox', { name: 'Enter tags' });
    for (const tag of draft.tags) {
      await tagInput.fill(tag);
      await tagInput.press('Enter');
      await this.page.getByText(tag, { exact: true }).first().waitFor();
    }

    await this.page.getByRole('button', { name: 'Publish Article' }).click();
    await this.page.waitForURL(/\/article\/.+/);
    return decodeURIComponent(new URL(this.page.url()).pathname.replace(/^\/article\//, ''));
  }
}
