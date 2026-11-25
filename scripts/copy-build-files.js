#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: No files specified to copy');
  console.error('Usage: node copy-build-files.js <file1> [file2] [file3] ...');
  process.exit(1);
}

const buildDir = process.env.KVIDAI_DOCS_BUILD_DIR || path.join(__dirname, '..', 'build');
const staticDir = process.env.KVIDAI_DOCS_STATIC_DIR || path.join(__dirname, '..', 'static');

// Use files from command line arguments
const files = args;

files.forEach(file => {
  const sourcePath = path.join(buildDir, file);
  const destPath = path.join(staticDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${file} to static directory`);
  } else {
    console.log(`✗ ${file} not found in build directory`);
    if (process.env.KVIDAI_DOCS_REQUIRE_BUILD_FILES === 'true') process.exitCode = 1;
  }
});
