import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const selector = fileURLToPath(new URL('../ci-push-test-selector.mjs', import.meta.url));
const git = (cwd, ...args) => execFileSync('git', args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();

function fixture(fn) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-ci-selector-'));
  try {
    const repo = path.join(root, 'repo');
    const remote = path.join(root, 'remote.git');
    git(root, 'init', '--bare', remote);
    git(root, 'init', '-b', 'develop', repo);
    git(repo, 'config', 'user.email', 'test@example.invalid');
    git(repo, 'config', 'user.name', 'Test');
    mkdirSync(path.join(repo, 'scripts'));
    writeFileSync(path.join(repo, 'scripts/copy-screenshots.js'), 'base\n');
    writeFileSync(path.join(repo, 'other.txt'), 'base\n');
    git(repo, 'add', '.'); git(repo, 'commit', '-m', 'base');
    git(repo, 'remote', 'add', 'origin', remote); git(repo, 'push', 'origin', 'develop');
    git(repo, 'switch', '-c', 'feature');
    const commit = (file, content) => {
      if (content === null) rmSync(path.join(repo, file));
      else writeFileSync(path.join(repo, file), content);
      git(repo, 'add', '-A'); git(repo, 'commit', '-m', file);
    };
    const select = (ref = 'refs/heads/feature', sha = git(repo, 'rev-parse', 'HEAD')) => {
      const result = spawnSync(process.execPath, [selector], {cwd: repo, encoding: 'utf8', env: {...process.env, GITHUB_REF: ref, GITHUB_SHA: sha}});
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
    fn({repo, commit, select});
  } finally { rmSync(root, {recursive: true, force: true}); }
}

test('single modified asset script selects the existing asset suite', () => fixture(({commit, select}) => {
  commit('scripts/copy-screenshots.js', 'change\n');
  assert.equal(select(), 'assets');
  assert.equal(select('refs/heads/main'), 'full');
  assert.equal(select('refs/heads/develop'), 'full');
  assert.equal(select('refs/tags/v1'), 'full');
  assert.equal(select('refs/heads/feature', 'bad-sha'), 'full');
}));

test('uses cumulative changes and falls back for mixed changes', () => fixture(({commit, select}) => {
  commit('other.txt', 'change\n');
  commit('scripts/copy-screenshots.js', 'change\n');
  assert.equal(select(), 'full');
}));

test('falls back for an unknown added file', () => fixture(({commit, select}) => {
  commit('new.txt', 'new\n');
  assert.equal(select(), 'full');
}));

test('falls back for additions and deletions', () => fixture(({commit, select}) => {
  commit('scripts/copy-screenshots.js', null);
  assert.equal(select(), 'full');
  commit('new.txt', 'new\n');
  assert.equal(select(), 'full');
}));

test('fetch failure falls back even if the local remote-tracking ref exists', () => fixture(({repo, commit, select}) => {
  commit('scripts/copy-screenshots.js', 'change\n');
  assert.equal(select(), 'assets');
  git(repo, 'remote', 'set-url', 'origin', '/nonexistent/docs-repository');
  assert.equal(select(), 'full');
}));

test('workflow rejects selector errors and invalid output', () => {
  const workflow = fileURLToPath(new URL('../../.github/workflows/ci-push.yml', import.meta.url));
  const text = readFileSync(workflow, 'utf8');
  const match = text.match(/id: select\n        run: \|\n((?:          .*\n)+)/);
  assert.ok(match, 'selector workflow step is missing');
  const script = match[1].replace(/^          /gm, '');
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-ci-workflow-'));
  try {
    const fakeNode = path.join(root, 'node');
    const output = path.join(root, 'output');
    writeFileSync(fakeNode, '#!/bin/sh\nprintf "%s\\n" "$SELECTOR_RESULT"\nexit "$SELECTOR_STATUS"\n', {mode: 0o755});
    for (const [value, status, expected] of [['assets', '0', 0], ['full', '0', 0], ['', '0', 1], ['unexpected', '0', 1], ['', '42', 42]]) {
      writeFileSync(output, '');
      const result = spawnSync('/bin/bash', ['-e', '-c', script], {encoding: 'utf8', env: {...process.env, PATH: `${root}:${process.env.PATH}`, GITHUB_OUTPUT: output, SELECTOR_RESULT: value, SELECTOR_STATUS: status}});
      assert.equal(result.status, expected, result.stderr);
      assert.equal(readFileSync(output, 'utf8'), expected === 0 ? `suite=${value}\n` : '');
    }
  } finally { rmSync(root, {recursive: true, force: true}); }
});
