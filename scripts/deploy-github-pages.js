// Use the verified build and reject Docusaurus's default force push.
const {spawnSync} = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
const targetArgs = args.length === 1 && args[0].startsWith('--target-dir=')
  ? ['--target-dir', args[0].slice('--target-dir='.length)] : args;
if (targetArgs.length !== 0 && !(targetArgs.length === 2 && targetArgs[0] === '--target-dir')) {
  console.error('GitHub Pages deployment accepts only --target-dir.');
  process.exitCode = 2;
} else {
  const result = spawnSync('bash', [path.join(__dirname, 'deploy-verified.sh'), 'github-pages', ...targetArgs], {stdio: 'inherit'});
  if (result.error) throw result.error;
  process.exitCode = result.status === null ? 1 : result.status;
}
