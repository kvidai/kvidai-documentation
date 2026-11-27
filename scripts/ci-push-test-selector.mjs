import {spawnSync} from 'node:child_process';

// Only this proven single-file change can use the narrow suite. Fail closed.
const git = (...args) => spawnSync('git', args, {encoding: 'utf8'});
const full = () => { console.log('full'); };
const ref = process.env.GITHUB_REF || '';
const sha = process.env.GITHUB_SHA || '';
if (!ref.startsWith('refs/heads/') || ['refs/heads/main', 'refs/heads/develop'].includes(ref)) {
  full();
} else {
  const head = git('rev-parse', '--verify', 'HEAD^{commit}');
  const target = git('rev-parse', '--verify', `${sha}^{commit}`);
  const fetch = git('fetch', '--no-tags', 'origin', '+refs/heads/develop:refs/remotes/origin/develop');
  if (head.status !== 0 || target.status !== 0 || !sha || head.stdout.trim() !== target.stdout.trim() || fetch.status !== 0) {
    full();
  } else {
    const base = git('merge-base', '--all', 'HEAD', 'refs/remotes/origin/develop');
    const bases = base.stdout.trim().split('\n').filter(Boolean);
    const diff = bases.length === 1 && base.status === 0
      ? git('diff', '--no-renames', '--name-status', '-z', bases[0], 'HEAD', '--')
      : null;
    if (diff?.status === 0 && diff.stdout === 'M\0scripts/copy-screenshots.js\0') console.log('assets');
    else full();
  }
}
