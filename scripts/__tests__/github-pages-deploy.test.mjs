import {test} from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const app = resolve('.');
const git = '/usr/bin/git';
test('actual Docusaurus publishes the tested build to a local Git remote', {timeout: 60000}, () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-pages-deploy-'));
  const bare = join(root, 'remote.git');
  const seed = join(root, 'seed');
  const site = join(root, 'site');
  const bin = join(root, 'bin');
  const env = {PATH: `${bin}:${resolve(process.execPath, '..')}:/usr/bin:/bin`, HOME: root,
    TMPDIR: root, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(root, 'gitconfig'),
    GIT_TERMINAL_PROMPT: '0', GIT_ALLOW_PROTOCOL: 'file', USE_SSH: 'true', GITHUB_HOST: 'example.invalid',
    ORGANIZATION_NAME: 'acme', PROJECT_NAME: 'docs', GIT_USER: 'fixture-user', GITHUB_TOKEN: 'synthetic-github-token',
    NETLIFY_AUTH_TOKEN: 'synthetic-netlify-token', SSH_AUTH_SOCK: '/synthetic/socket',
    AWS_SECRET_ACCESS_KEY: 'synthetic-aws-secret',
    GIT_USER_NAME: 'Test', GIT_USER_EMAIL: 'test@example.invalid', CANDIDATE: join(root, 'candidate')};
  const run = (command, args, cwd = root, extra = {}) => spawnSync(command, args, {cwd, env: {...env, ...extra}, encoding: 'utf8', timeout: 55000});
  const ok = (args, cwd = root) => { const result = run(git, args, cwd); assert.equal(result.status, 0, result.stderr); };
  try {
    mkdirSync(bin);
    mkdirSync(site);
    mkdirSync(join(site, 'scripts'));
    for (const file of ['deploy-verified.sh', 'deploy-github-pages.js', 'git-pages-guard.sh', 'check-pages-target.js', 'candidate-manifest.mjs']) copyFileSync(join(app, 'scripts', file), join(site, 'scripts', file));
    symlinkSync(join(app, 'node_modules'), join(site, 'node_modules'), 'dir');
    writeFileSync(join(site, 'package.json'), '{"name":"pages-fixture","version":"1.0.0"}');
    writeFileSync(join(site, 'docusaurus.config.js'), "module.exports={title:'Fixture',url:'https://example.invalid',baseUrl:'/',githubHost:'example.invalid',organizationName:'acme',projectName:'docs',deploymentBranch:'gh-pages'};\n");
    writeFileSync(join(root, 'mutated-config'), "module.exports={title:'Fixture',url:'https://other.invalid',baseUrl:'/',githubHost:'other.invalid',organizationName:'other',projectName:'other',deploymentBranch:'main'};\n");
    writeFileSync(join(bin, 'pnpm'), '#!/bin/sh\n[ "$1" = run ] && [ "$2" = test:predeploy ] || exit 9\n[ -z "${GIT_USER+x}${GIT_PASS+x}${GITHUB_TOKEN+x}${NETLIFY_AUTH_TOKEN+x}${SSH_AUTH_SOCK+x}${AWS_SECRET_ACCESS_KEY+x}${GIT_CONFIG_KEY_0+x}${GIT_CONFIG_VALUE_0+x}" ] || exit 11\n[ "${TEST_FAIL:-0}" = 0 ] || exit 8\nmkdir -p "$KVIDAI_DOCS_BUILD_DIR"\nprintf verified > "$KVIDAI_DOCS_BUILD_DIR/index.html"\nnode scripts/candidate-manifest.mjs create || exit $?\nprintf "%s" "$KVIDAI_DOCS_BUILD_DIR" > "$CANDIDATE"\nif [ "${MUTATE_CONFIG:-0}" = 1 ]; then cp "$MUTATED_CONFIG" docusaurus.config.js; fi\n', {mode: 0o755});
    writeFileSync(env.GIT_CONFIG_GLOBAL, `[url "file://${bare}"]\n\tinsteadOf = git@example.invalid:acme/docs.git\n[user]\n\tname = Test\n\temail = test@example.invalid\n`);
    ok(['init', '--bare', bare]);
    ok(['init', '-b', 'gh-pages', seed]);
    writeFileSync(join(seed, 'old.txt'), 'old');
    mkdirSync(join(seed, 'nested'));
    writeFileSync(join(seed, 'nested', 'old.txt'), 'old');
    ok(['add', 'old.txt', 'nested'], seed);
    ok(['commit', '-m', 'seed'], seed);
    ok(['remote', 'add', 'origin', bare], seed);
    ok(['push', 'origin', 'gh-pages'], seed);
    ok(['init', '-b', 'develop', site]);
    writeFileSync(join(site, 'tracked.txt'), 'source');
    ok(['add', 'tracked.txt'], site);
    ok(['commit', '-m', 'source'], site);
    ok(['remote', 'add', 'origin', 'git@example.invalid:source/site.git'], site);
    const before = run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim();
    const failure = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {TEST_FAIL: '1'});
    assert.notEqual(failure.status, 0);
    assert.equal(run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim(), before);
    assert.equal(existsSync(env.CANDIDATE), false);
    const implicitTarget = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {ORGANIZATION_NAME: undefined, PROJECT_NAME: undefined});
    assert.notEqual(implicitTarget.status, 0);
    assert.match(implicitTarget.stderr, /target differs from origin/);
    ok(['remote', 'set-url', 'origin', 'git@example.invalid:acme/docs.git'], site);
    const matchingTarget = run(process.execPath, ['scripts/check-pages-target.js'], site,
      {ORGANIZATION_NAME: undefined, PROJECT_NAME: undefined, GIT_CONFIG_GLOBAL: '/dev/null', KVIDAI_DOCS_REAL_GIT: git});
    assert.equal(matchingTarget.status, 0, matchingTarget.stderr);
    ok(['remote', 'set-url', 'origin', 'git@example.invalid:source/site.git'], site);
    for (const branch of ['--upload-pack=bad', 'x;true', 'x$(id)']) {
      const badBranch = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {DEPLOYMENT_BRANCH: branch});
      assert.notEqual(badBranch.status, 0);
      assert.match(badBranch.stderr, /Invalid GitHub Pages branch/);
    }
    for (const branch of ['main', 'develop']) {
      const shared = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {DEPLOYMENT_BRANCH: branch});
      assert.notEqual(shared.status, 0);
      assert.match(shared.stderr, /Direct push to a shared branch/);
    }
    const unsafeCredential = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {GIT_PASS: 'sample secret'});
    assert.notEqual(unsafeCredential.status, 0);
    assert.doesNotMatch(unsafeCredential.stdout + unsafeCredential.stderr, /sample secret/);
    assert.match(unsafeCredential.stderr, /use SSH or a Git credential helper/);
    const token = 'synthetic-token-for-test';
    const tokenResult = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {GIT_PASS: token});
    assert.notEqual(tokenResult.status, 0);
    assert.doesNotMatch(tokenResult.stdout + tokenResult.stderr, new RegExp(token));
    assert.equal(existsSync(env.CANDIDATE), false);
    const missingBranch = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site, {DEPLOYMENT_BRANCH: 'new-pages'});
    assert.notEqual(missingBranch.status, 0);
    assert.notEqual(run(git, ['--git-dir', bare, 'show-ref', '--verify', 'refs/heads/new-pages']).status, 0);
    assert.equal(run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim(), before);
    for (const target of ['../outside', '.git/hooks', '/absolute']) {
      const badTarget = run(process.execPath, ['scripts/deploy-github-pages.js', '--target-dir', target], site);
      assert.notEqual(badTarget.status, 0);
    }
    const hooks = join(root, 'hooks');
    mkdirSync(hooks);
    writeFileSync(join(hooks, 'pre-commit'), '#!/bin/sh\nexit 1\n', {mode: 0o755});
    const rejectedCommit = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site,
      {GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.hooksPath', GIT_CONFIG_VALUE_0: hooks});
    assert.notEqual(rejectedCommit.status, 0);
    assert.equal(run(git, ['--git-dir', bare, 'rev-parse', 'refs/heads/gh-pages']).stdout.trim(), before);
    const nested = run(process.execPath, ['scripts/deploy-github-pages.js', '--target-dir=nested'], site);
    assert.equal(nested.status, 0, nested.stderr + nested.stdout);
    assert.equal(run(git, ['--git-dir', bare, 'show', 'gh-pages:nested/index.html']).stdout, 'verified');
    const success = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site);
    assert.equal(success.status, 0, success.stderr + success.stdout);
    assert.equal(run(git, ['--git-dir', bare, 'show', 'gh-pages:index.html']).stdout, 'verified');
    assert.equal(existsSync(readFileSync(env.CANDIDATE, 'utf8')), false);
    ok(['remote', 'set-url', 'origin', 'git@example.invalid:acme/docs.git'], site);
    writeFileSync(env.GIT_CONFIG_GLOBAL, `[url "file://${bare}"]\n\tinsteadOf = https://fixture-user@example.invalid/acme/docs.git\n[user]\n\tname = Test\n\temail = test@example.invalid\n`);
    const configChange = run('bash', ['scripts/deploy-verified.sh', 'github-pages'], site,
      {USE_SSH: 'false', GITHUB_HOST: undefined, ORGANIZATION_NAME: undefined, PROJECT_NAME: undefined,
        MUTATE_CONFIG: '1', MUTATED_CONFIG: join(root, 'mutated-config')});
    assert.equal(configChange.status, 0, configChange.stderr + configChange.stdout);
    assert.equal(run(git, ['--git-dir', bare, 'show', 'gh-pages:index.html']).stdout, 'verified');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
