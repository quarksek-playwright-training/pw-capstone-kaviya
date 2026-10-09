import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  async openLogin(): Promise<void> {
    await this.goto('/login');
  }

  async openRegister(): Promise<void> {
    await this.goto('/register');
  }

  async fillLogin(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
  }

  async submitLogin(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLogin();
    await this.fillLogin(email, password);
    await this.submitLogin();
    await this.page.waitForURL((url) => url.pathname === '/');
  }

  async signUp(username: string, email: string, password: string): Promise<void> {
    await this.openRegister();
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Sign up' }).click();
  }

  signInHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Sign in', exact: true });
  }

  signUpHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Sign up', exact: true });
  }

  error(message: string): Locator {
    // The message is the list item's text. These items have no accessible name,
    // so getByRole('listitem', { name }) does not match them.
    return this.page.getByRole('listitem').filter({ hasText: message });
  }
}
