import fs from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

const envFile = path.join(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  loadEnvFile(envFile);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env`);
  }
  return value;
}

export type Account = {
  username: string;
  email: string;
  password: string;
  storageState: string;
};

function account(prefix: 'PRIMARY' | 'SECONDARY', sessionFile: string): Account {
  return {
    username: required(`${prefix}_USERNAME`),
    email: required(`${prefix}_EMAIL`),
    password: required(`${prefix}_PASSWORD`),
    storageState: path.join(process.cwd(), '.auth', sessionFile),
  };
}

// Credentials come from .env. CI sets the same variable names.
export const accounts = {
  primary: account('PRIMARY', 'primary.json'),
  secondary: account('SECONDARY', 'secondary.json'),
};
