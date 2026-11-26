import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function fixture(mode, cliExit = 0, testExit = 0, mutateCandidate = false) {
  const root = mkdtempSync(join(tmpdir(), 'docs-netlify-preflight-'));
  try {
    const site = join(root, 'site');
    const bin = join(root, 'bin');
    const calls = join(root, 'calls');
    const receipt = join(root, 'receipt');
    mkdirSync(join(site, 'scripts'), { recursive: true });
    mkdirSync(bin);
    for (const file of ['deploy-verified.sh', 'candidate-manifest.mjs']) {
      copyFileSync(resolve('scripts', file), join(site, 'scripts', file));
    }
    mkdirSync(join(site, 'node_modules/@docusaurus/core/bin'), { recursive: true });
    writeFileSync(join(site, 'node_modules/@docusaurus/core/package.json'), '{"version":"3.8.1"}');
    writeFileSync(
      join(site, 'scripts/check-pages-target.js'),
      "console.log('org\\nproject\\nexample.invalid\\n443\\ngh-pages');\n"
    );
    writeFileSync(
      join(site, 'scripts/verify-fake-netlify.mjs'),
      `import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const manifest = JSON.parse(readFileSync(path.join(dir, '..', 'manifest.json'), 'utf8'));
const entry = manifest.entries.find(item => item.path === 'index.html' && item.type === 'file');
assert.equal(dir, manifest.root);
assert.ok(entry);
assert.equal(createHash('sha256').update(readFileSync(path.join(dir, 'index.html'))).digest('hex'), entry.sha256);
writeFileSync(process.env.RECEIPT, entry.sha256);
`
    );
    writeFileSync(
      join(bin, 'pnpm'),
      `#!/bin/sh
printf '%s\\n' "$*" >> "$CALLS"
case "$*" in
  'exec netlify --version') exit "$CLI_EXIT" ;;
  'run test:predeploy')
    [ "$TEST_EXIT" = 0 ] || exit "$TEST_EXIT"
    mkdir -p "$KVIDAI_DOCS_BUILD_DIR"
    printf verified > "$KVIDAI_DOCS_BUILD_DIR/index.html"
    node scripts/candidate-manifest.mjs create ;;
  'exec netlify deploy '*)
    for arg in "$@"; do case "$arg" in --dir=*) candidate=\${arg#--dir=} ;; esac; done
    [ -n "\${candidate:-}" ] || exit 92
    if [ "$MUTATE_CANDIDATE" = 1 ]; then printf changed > "$candidate/index.html"; fi
    node scripts/verify-fake-netlify.mjs "$candidate" ;;
  *) exit 91 ;;
esac
`,
      { mode: 0o755 }
    );
    const env = {
      PATH: `${bin}:${resolve(process.execPath, '..')}:/usr/bin:/bin`,
      HOME: root,
      TMPDIR: root,
      CALLS: calls,
      CLI_EXIT: String(cliExit),
      TEST_EXIT: String(testExit),
      RECEIPT: receipt,
      MUTATE_CANDIDATE: mutateCandidate ? '1' : '0',
    };
    const result = spawnSync('/bin/bash', ['scripts/deploy-verified.sh', mode], {
      cwd: site,
      env,
      encoding: 'utf8',
    });
    return {
      result,
      calls: readFileSync(calls, 'utf8').trim().split('\n'),
      receipt: readFileSyncIfExists(receipt),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function readFileSyncIfExists(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

test('GitHub Pages does not require the Netlify CLI', () => {
  const { result, calls } = fixture('github-pages', 127, 8);
  assert.equal(result.status, 8);
  assert.deepEqual(calls, ['run test:predeploy']);
});

for (const mode of ['preview', 'prod']) {
  test(`${mode} fails before build when Netlify CLI is unavailable`, () => {
    const { result, calls } = fixture(mode, 127);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Netlify CLI.*required/i);
    assert.deepEqual(calls, ['exec netlify --version']);
  });

  test(`${mode} runs the verified build before deployment`, () => {
    const { result, calls, receipt } = fixture(mode);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(calls[0], 'exec netlify --version');
    assert.equal(calls[1], 'run test:predeploy');
    assert.match(calls[2], /^exec netlify deploy --dir=/);
    assert.equal(calls[2].endsWith(' --prod'), mode === 'prod');
    assert.match(receipt, /^[a-f0-9]{64}$/);
  });

  test(`${mode} rejects bytes changed before fake Netlify reads them`, () => {
    const { result, receipt } = fixture(mode, 0, 0, true);
    assert.notEqual(result.status, 0);
    assert.equal(receipt, undefined);
  });

  test(`${mode} does not deploy if the build fails`, () => {
    const { result, calls } = fixture(mode, 0, 8);
    assert.equal(result.status, 8);
    assert.deepEqual(calls, ['exec netlify --version', 'run test:predeploy']);
  });
}
