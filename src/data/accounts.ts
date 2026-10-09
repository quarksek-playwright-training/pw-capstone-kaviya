import path from 'node:path';

const authDir = path.join(process.cwd(), '.auth');

export type Account = {
  username: string;
  email: string;
  password: string;
  storageState: string;
};

export const accounts = {
  primary: {
    username: 'pwfinalprimary01',
    email: 'pwfinal.primary01@example.com',
    password: 'PwTrain!2026a',
    storageState: path.join(authDir, 'primary.json'),
  },
  secondary: {
    username: 'pwfinalsecondary',
    email: 'pwfinal.secondary01@example.com',
    password: 'PwTrain!2026b',
    storageState: path.join(authDir, 'secondary.json'),
  },
} as const satisfies Record<string, Account>;
