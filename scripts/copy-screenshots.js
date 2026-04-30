// Copies UI screenshots from apps/web-service into static/ui-screenshots/.
// Source is a sibling submodule — only works when run inside the kvidai monorepo.
// On Netlify (standalone repo build) the source won't exist; we skip gracefully
// so that already-committed screenshots stay in place.
//
// NOTE: static/ui-screenshots/ is NOT in .gitignore (unlike affyink's setup)
// because Netlify builds the docs repo standalone without access to web-service.
// Run `pnpm screenshots` locally after web-service screenshots change, then commit.

const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', '..', 'web-service', 'docs', 'ui-screenshots');
const dest = path.resolve(__dirname, '..', 'static', 'ui-screenshots');

if (!fs.existsSync(src)) {
  console.warn(`[copy-screenshots] Source not found: ${src}`);
  console.warn('[copy-screenshots] Skipping — run inside the kvidai monorepo to sync screenshots.');
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

const pngs = fs.readdirSync(dest).filter(f => f.endsWith('.png'));
if (pngs.length === 0) {
  console.error(`[copy-screenshots] No PNGs found in ${dest}`);
  process.exit(1);
}

console.log(`[copy-screenshots] Copied ${pngs.length} screenshots to static/ui-screenshots/`);
