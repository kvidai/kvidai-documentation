import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script = fileURLToPath(new URL('../candidate-manifest.mjs', import.meta.url));
for (const mutation of ['unchanged', 'change', 'add', 'delete', 'symlink']) {
  test(`candidate manifest checks ${mutation}`, () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'docs-manifest-'));
    try {
      const build = path.join(dir, 'build');
      mkdirSync(build);
      writeFileSync(path.join(build, 'index.html'), 'initial');
      const env = {...process.env, KVIDAI_DOCS_BUILD_DIR: build, KVIDAI_DOCS_CANDIDATE_MANIFEST: path.join(dir, 'manifest.json')};
      const run = action => spawnSync(process.execPath, [script, action], {env, encoding: 'utf8'});
      assert.equal(run('create').status, 0);
      if (mutation === 'change') writeFileSync(path.join(build, 'index.html'), 'changed');
      if (mutation === 'add') writeFileSync(path.join(build, 'new.html'), 'added');
      if (mutation === 'delete') rmSync(path.join(build, 'index.html'));
      if (mutation === 'symlink') symlinkSync('index.html', path.join(build, 'link'));
      const result = run('verify');
      assert.equal(result.status, mutation === 'unchanged' ? 0 : 1, result.stderr);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });
}
