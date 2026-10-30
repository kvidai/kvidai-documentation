# Documentation startup QA — 2026-10-30

Node22, macOS, pinned Playwright Chromium. Actual local Docusaurus build and HTTP/browser tests; no mocks or deployed-site claim.

- Original absent-build serve-only invocation:404 and30s startup timeout, raw red retained.
- Build then serve: full suite18/18 passed repeatedly; typecheck exit0.
- Cold-start revert: original failure reproduced, exact source restored,7/7 passed.
- Occupied3100 listener: actual test runner refused reuse and preserved owner;1/1 passed.
- Explicit BASE_URL on separately owned3101:7/7 passed; server survived runner, stopped by owner only.
- Missing pinned headless shell initially caused11browser-launch failures; installing exact browser resolved them, no package upgrades.
- All36 whole-site screenshots from the completed runs reviewed:36passed/0failed. Complete captures and metadata live at monorepo docs/ui-screenshots/documentation; first18 and final36vision reports both retained here.
- Parent aggregate is NOT green: sandbox test portability corrected and585passed/20skipped, then independent video-editor build failed because Bun is absent. Its build includes real AWS deployment, which was not executed. Root plan remainswip.

Logs and final status snapshots are paired with tests here. Root orchestration/revert/external-server receipts live under tests/plan-test/*documentation-test-startup/. Static prebuild copy side effects were quarantined only when exact generated copies; unknown/user files preserved. No product page content or production sandbox policy changed.
