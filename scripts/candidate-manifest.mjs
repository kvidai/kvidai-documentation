import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const manifestPath = process.env.KVIDAI_DOCS_CANDIDATE_MANIFEST;
if (manifestPath) {
  const root = path.resolve(process.env.KVIDAI_DOCS_BUILD_DIR || 'build');
  const manifest = path.resolve(manifestPath);
  if (manifest === root || manifest.startsWith(`${root}${path.sep}`)) throw new Error('Manifest must be outside the build directory');
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()) throw new Error('Invalid build directory');
  const entries = [];
  function visit(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      const relative = prefix ? `${prefix}/${name}` : name;
      const file = path.join(directory, name);
      const stat = lstatSync(file);
      if (stat.isSymbolicLink()) throw new Error(`Build contains a symbolic link: ${relative}`);
      if (stat.isDirectory()) {
        entries.push({ path: relative, type: 'directory' });
        visit(file, relative);
      } else if (stat.isFile()) {
        entries.push({ path: relative, type: 'file', sha256: createHash('sha256').update(readFileSync(file)).digest('hex') });
      } else throw new Error(`Unsupported build entry: ${relative}`);
    }
  }
  visit(root);
  const content = `${JSON.stringify({ root, entries })}\n`;
  if (process.argv[2] === 'create') writeFileSync(manifest, content, { flag: 'wx', mode: 0o600 });
  else if (process.argv[2] === 'verify') {
    if (readFileSync(manifest, 'utf8') !== content) throw new Error('Build candidate changed after HTTP tests');
  } else throw new Error('Expected create or verify');
}
