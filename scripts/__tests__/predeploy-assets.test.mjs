import {test} from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('predeploy refreshes screenshots in its build without changing static', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-assets-'));
  try {
    const docs = path.join(root, 'apps', 'documentation');
    const source = path.join(root, 'apps', 'web-service', 'docs', 'ui-screenshots');
    const staticImages = path.join(docs, 'static', 'ui-screenshots');
    const buildImages = path.join(root, 'candidate', 'build', 'ui-screenshots');
    for (const directory of [path.join(docs, 'scripts'), source, staticImages, buildImages]) mkdirSync(directory, {recursive: true});
    copyFileSync(path.join(scripts, 'copy-screenshots.js'), path.join(docs, 'scripts', 'copy-screenshots.js'));
    writeFileSync(path.join(source, 'page.png'), 'fresh');
    writeFileSync(path.join(staticImages, 'page.png'), 'original');
    writeFileSync(path.join(buildImages, 'page.png'), 'stale');
    const result = spawnSync(process.execPath, [path.join(docs, 'scripts', 'copy-screenshots.js'), '--build'], {
      env: {KVIDAI_DOCS_BUILD_DIR: path.dirname(buildImages)}, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(path.join(buildImages, 'page.png'), 'utf8'), 'fresh');
    assert.equal(readFileSync(path.join(staticImages, 'page.png'), 'utf8'), 'original');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('predeploy fails when a required generated file is missing', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-generated-'));
  try {
    const build = path.join(root, 'build');
    const staticDir = path.join(root, 'static');
    mkdirSync(build);
    mkdirSync(staticDir);
    writeFileSync(path.join(build, 'llms.txt'), 'fixture');
    const result = spawnSync(process.execPath, [path.join(scripts, 'copy-build-files.js'), 'llms.txt', 'sitemap.xml'], {
      env: {KVIDAI_DOCS_BUILD_DIR: build, KVIDAI_DOCS_STATIC_DIR: staticDir, KVIDAI_DOCS_REQUIRE_BUILD_FILES: 'true'},
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.equal(readFileSync(path.join(staticDir, 'llms.txt'), 'utf8'), 'fixture');
    assert.match(result.stdout, /sitemap\.xml not found/);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('standalone build retains committed screenshots when web-service is absent', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-standalone-assets-'));
  try {
    const docs = path.join(root, 'apps', 'documentation');
    const buildImages = path.join(root, 'candidate', 'build', 'ui-screenshots');
    mkdirSync(path.join(docs, 'scripts'), {recursive: true});
    mkdirSync(buildImages, {recursive: true});
    copyFileSync(path.join(scripts, 'copy-screenshots.js'), path.join(docs, 'scripts', 'copy-screenshots.js'));
    writeFileSync(path.join(buildImages, 'page.png'), 'committed');
    const result = spawnSync(process.execPath, [path.join(docs, 'scripts', 'copy-screenshots.js'), '--build'], {
      env: {KVIDAI_DOCS_BUILD_DIR: path.dirname(buildImages)}, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(path.join(buildImages, 'page.png'), 'utf8'), 'committed');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
