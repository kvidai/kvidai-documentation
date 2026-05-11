import { execSync } from 'child_process';

export default async function globalSetup() {
  const match = (process.env.BASE_URL ?? 'http://localhost:3100').match(/:(\d+)/);
  const port = match ? match[1] : '3100';
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
  } catch {}
  await new Promise((r) => setTimeout(r, 800));
}
