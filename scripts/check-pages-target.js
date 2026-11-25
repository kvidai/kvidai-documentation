// Refuse an implicit cross-repository Pages target; Docusaurus allows one by default.
const {spawnSync} = require('node:child_process');

function parseRemote(value) {
  const scp = value.match(/^(?:[^@/:]+@)?([^/:]+):([^/]+\/[^/]+?)(?:\.git)?\/?$/);
  if (scp) return {host: scp[1].toLowerCase(), port: '', repository: scp[2].replace(/\.git$/, '')};
  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'ssh:'].includes(url.protocol)) return null;
    const parts = url.pathname.replace(/^\/+|\/+$/g, '').replace(/\.git$/, '').split('/');
    if (parts.length !== 2 || parts.some((part) => !part)) return null;
    const port = (url.protocol === 'ssh:' && url.port === '22') ? '' : url.port;
    return {host: url.hostname.toLowerCase(), port, repository: parts.join('/')};
  } catch {
    return null;
  }
}

async function main() {
  const git = process.env.KVIDAI_DOCS_REAL_GIT;
  if (!git || !git.startsWith('/')) throw new Error('Cannot inspect the GitHub Pages target.');
  if (process.env.GIT_PASS) throw new Error('GIT_PASS is not supported; use SSH or a Git credential helper.');
  const {loadContext} = require('@docusaurus/core/lib/server/site');
  const {siteConfig} = await loadContext({siteDir: process.cwd()});
  const organization = process.env.ORGANIZATION_NAME ?? process.env.CIRCLE_PROJECT_USERNAME ?? siteConfig.organizationName;
  const project = process.env.PROJECT_NAME ?? process.env.CIRCLE_PROJECT_REPONAME ?? siteConfig.projectName;
  const branch = process.env.DEPLOYMENT_BRANCH ?? siteConfig.deploymentBranch ?? 'gh-pages';
  const host = process.env.GITHUB_HOST ?? siteConfig.githubHost ?? 'github.com';
  const port = String(process.env.GITHUB_PORT ?? siteConfig.githubPort ?? '');
  if (!/^[A-Za-z0-9._-]+$/.test(organization || '') || !/^[A-Za-z0-9._-]+$/.test(project || '') ||
      !/^[A-Za-z0-9.-]+$/.test(host) || (port && (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)) ||
      (process.env.GIT_USER && !/^[A-Za-z0-9._-]+$/.test(process.env.GIT_USER))) throw new Error('Invalid GitHub Pages target.');
  if (!branch || !/^[A-Za-z0-9._/-]+$/.test(branch) || /^[-+]/.test(branch)) throw new Error('Invalid GitHub Pages branch.');
  if (['main', 'develop', 'refs/heads/main', 'refs/heads/develop'].includes(branch)) throw new Error('Direct push to a shared branch is not allowed.');
  if (project.includes('.github.io') && !process.env.DEPLOYMENT_BRANCH && !siteConfig.deploymentBranch) throw new Error('GitHub Pages branch must be explicit for organization sites.');
  if (spawnSync(git, ['check-ref-format', '--branch', branch], {stdio: 'ignore'}).status !== 0) throw new Error('Invalid GitHub Pages branch.');
  const remote = spawnSync(git, ['remote', 'get-url', 'origin'], {encoding: 'utf8'});
  if (remote.status !== 0) throw new Error('Cannot inspect the source repository.');
  const source = parseRemote(remote.stdout.trim());
  const sameTarget = source && source.host === host.toLowerCase() && source.port === port && source.repository.toLowerCase() === `${organization}/${project}`.toLowerCase();
  const explicitTarget = Boolean((process.env.ORGANIZATION_NAME ?? process.env.CIRCLE_PROJECT_USERNAME) && (process.env.PROJECT_NAME ?? process.env.CIRCLE_PROJECT_REPONAME));
  if (!sameTarget && !explicitTarget) throw new Error('GitHub Pages target differs from origin; explicitly set ORGANIZATION_NAME and PROJECT_NAME.');
  process.stdout.write(`${organization}\n${project}\n${host}\n${port}\n${branch}\n`);
}

const safeMessages = new Set([
  'Cannot inspect the GitHub Pages target.', 'Invalid GitHub Pages target.',
  'Invalid GitHub Pages branch.', 'Cannot inspect the source repository.',
  'Direct push to a shared branch is not allowed.',
  'GIT_PASS is not supported; use SSH or a Git credential helper.',
  'GitHub Pages branch must be explicit for organization sites.',
  'GitHub Pages target differs from origin; explicitly set ORGANIZATION_NAME and PROJECT_NAME.',
]);
main().catch((error) => {
  console.error(error instanceof Error && safeMessages.has(error.message) ? error.message : 'GitHub Pages target check failed.');
  process.exitCode = 1;
});
