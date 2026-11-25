import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const git = '/usr/bin/git';
const guard = resolve('scripts/git-pages-guard.sh');

test('Pages guard pushes only the current commit without force or mirror', () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-pages-git-'));
  const bare = join(root, 'remote.git');
  const work = join(root, 'work');
  const env = {PATH: '/usr/bin:/bin', HOME: root, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0', KVIDAI_DOCS_REAL_GIT: git};
  const run = (command, args, cwd = root) => spawnSync(command, args, {cwd, env, encoding: 'utf8'});
  const ok = (args, cwd = root) => { const result = run(git, args, cwd); assert.equal(result.status, 0, result.stderr); };
  try {
    ok(['init', '--bare', bare]);
    ok(['init', '-b', 'gh-pages', work]);
    ok(['config', 'user.name', 'Test'], work);
    ok(['config', 'user.email', 'test@example.invalid'], work);
    ok(['remote', 'add', 'origin', bare], work);
    writeFileSync(join(work, 'index.html'), 'first');
    ok(['add', 'index.html'], work);
    assert.equal(run(guard, ['commit', '-m', 'first'], work).status, 0);
    ok(['config', 'remote.origin.mirror', 'true'], work);
    ok(['config', 'push.followTags', 'true'], work);
    ok(['tag', 'unrelated'], work);
    assert.equal(run(guard, ['push', '--force', 'origin', 'gh-pages'], work).status, 0);
    assert.equal(run(git, ['--git-dir', bare, 'show-ref', '--tags']).status, 1);
    writeFileSync(join(work, 'index.html'), 'fast-forward');
    ok(['add', 'index.html'], work);
    assert.equal(run(guard, ['commit', '-m', 'push'], work).status, 0);
    assert.equal(run(guard, ['push', '--force', 'origin', 'gh-pages'], work).status, 0);
    const pushed = run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim();
    assert.equal(run(git, ['--git-dir', bare, 'show', 'gh-pages:index.html']).stdout, 'fast-forward');
    ok(['checkout', '--orphan', 'diverged'], work);
    writeFileSync(join(work, 'index.html'), 'diverged');
    ok(['add', 'index.html'], work);
    assert.equal(run(guard, ['commit', '-m', 'diverged'], work).status, 0);
    assert.notEqual(run(guard, ['push', '--force', 'origin', 'gh-pages'], work).status, 0);
    assert.equal(run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim(), pushed);
    for (const args of [['push', '-f', 'origin', 'gh-pages'], ['push', '--force', 'origin', '+gh-pages'], ['push', '--force', 'origin', 'main'], ['push', '--force', 'origin', 'develop'], ['push', '--force', 'origin', 'x;true'], ['-C', work, 'push', '--force', 'origin', 'gh-pages']]) {
      assert.notEqual(run(guard, args, work).status, 0);
    }
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
