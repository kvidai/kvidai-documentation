# Documentation standalone push CI

- Base: documentation c8e8ea8, isolated worktree.
- Select existing asset tests only for cumulative `develop` diff consisting solely of a modification to `scripts/copy-screenshots.js`; otherwise run existing headless predeploy.
- Verify selector with synthetic Git histories, workflow syntax, and selected test. No UI, deploy, or paid calls.
- Standalone lockfile is not tracked; full CI installs without frozen lockfile.

## Verification

- Selector and existing asset tests: 9 passed on 2026-11-28.
- Workflow YAML parsed with Ruby Psych; selector passed `node --check`.
- Full predeploy was not run in the isolated worktree: dependencies are not installed. GitHub Actions execution remains unverified.
