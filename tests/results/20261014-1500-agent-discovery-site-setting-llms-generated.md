# llms.txt / llms-full.txt generated output — tests/llms-txt.spec.ts

Plan: kvidai monorepo .claude/plans/*agent-discovery-site-setting.md. Run in an isolated copy of this repo with dependencies installed at the versions of the monorepo root pnpm-lock.yaml (importer apps/documentation): `pnpm build`, then `node_modules/.bin/playwright test tests/llms-txt.spec.ts --project=chromium` (HTTP only against `docusaurus serve` on :3100).

## Before (old plugin config, no docs/agents pages; the link-resolution test did not exist yet): 6 failed
```
  ✘  1 [chromium] › tests/llms-txt.spec.ts:21:7 › generated llms.txt › starts with the site title and an accurate summary, not a K-pop-only one (51ms)
  ✘  2 [chromium] › tests/llms-txt.spec.ts:32:7 › generated llms.txt › lists docs only: no blog, tag or demo pages (62ms)
  ✘  3 [chromium] › tests/llms-txt.spec.ts:39:7 › generated llms.txt › uses only absolute https links, so the file works when served from kvid.ai (51ms)
  ✘  4 [chromium] › tests/llms-txt.spec.ts:46:7 › generated llms.txt › links the agent overview and the MCP tool reference first (46ms)
  ✘  5 [chromium] › tests/llms-txt.spec.ts:58:7 › generated llms-full.txt › contains every MCP tool of the generated tool reference page (53ms)
  ✘  6 [chromium] › tests/llms-txt.spec.ts:67:7 › generated llms-full.txt › explains how agents connect and the credit lifecycle (111ms)
  6 failed
```

## After (new config + docs/agents pages): 7 passed
```
  ✓  1 [chromium] › tests/llms-txt.spec.ts:21:7 › generated llms.txt › starts with the site title and an accurate summary, not a K-pop-only one (50ms)
  ✓  2 [chromium] › tests/llms-txt.spec.ts:32:7 › generated llms.txt › lists docs only: no blog, tag or demo pages (19ms)
  ✓  3 [chromium] › tests/llms-txt.spec.ts:39:7 › generated llms.txt › uses only absolute https links, so the file works when served from kvid.ai (43ms)
  ✓  4 [chromium] › tests/llms-txt.spec.ts:46:7 › generated llms.txt › every docs.kvid.ai link resolves in the built site (124ms)
  ✓  5 [chromium] › tests/llms-txt.spec.ts:56:7 › generated llms.txt › links the agent overview and the MCP tool reference first (10ms)
  ✓  6 [chromium] › tests/llms-txt.spec.ts:68:7 › generated llms-full.txt › contains every MCP tool of the generated tool reference page (36ms)
  ✓  7 [chromium] › tests/llms-txt.spec.ts:77:7 › generated llms-full.txt › explains how agents connect and the credit lifecycle (13ms)
  7 passed (3.8s)
```

## Revert check (old plugin config block, new pages kept): 6 failed, 1 passed (the tool-name test guards the page content, not the config)
```
  ✘  1 [chromium] › tests/llms-txt.spec.ts:21:7 › generated llms.txt › starts with the site title and an accurate summary, not a K-pop-only one (55ms)
  ✘  2 [chromium] › tests/llms-txt.spec.ts:32:7 › generated llms.txt › lists docs only: no blog, tag or demo pages (61ms)
  ✘  3 [chromium] › tests/llms-txt.spec.ts:39:7 › generated llms.txt › uses only absolute https links, so the file works when served from kvid.ai (49ms)
  ✘  4 [chromium] › tests/llms-txt.spec.ts:46:7 › generated llms.txt › every docs.kvid.ai link resolves in the built site (47ms)
  ✘  5 [chromium] › tests/llms-txt.spec.ts:56:7 › generated llms.txt › links the agent overview and the MCP tool reference first (50ms)
  ✓  6 [chromium] › tests/llms-txt.spec.ts:68:7 › generated llms-full.txt › contains every MCP tool of the generated tool reference page (117ms)
  ✘  7 [chromium] › tests/llms-txt.spec.ts:77:7 › generated llms-full.txt › explains how agents connect and the credit lifecycle (71ms)
  6 failed
  1 passed (2.4m)
```

## Restored: 7 passed
```
  ✓  1 [chromium] › tests/llms-txt.spec.ts:21:7 › generated llms.txt › starts with the site title and an accurate summary, not a K-pop-only one (55ms)
  ✓  2 [chromium] › tests/llms-txt.spec.ts:32:7 › generated llms.txt › lists docs only: no blog, tag or demo pages (21ms)
  ✓  3 [chromium] › tests/llms-txt.spec.ts:39:7 › generated llms.txt › uses only absolute https links, so the file works when served from kvid.ai (54ms)
  ✓  4 [chromium] › tests/llms-txt.spec.ts:46:7 › generated llms.txt › every docs.kvid.ai link resolves in the built site (149ms)
  ✓  5 [chromium] › tests/llms-txt.spec.ts:56:7 › generated llms.txt › links the agent overview and the MCP tool reference first (14ms)
  ✓  6 [chromium] › tests/llms-txt.spec.ts:68:7 › generated llms-full.txt › contains every MCP tool of the generated tool reference page (32ms)
  ✓  7 [chromium] › tests/llms-txt.spec.ts:77:7 › generated llms-full.txt › explains how agents connect and the credit lifecycle (14ms)
  7 passed (3.6s)
```

Generated sizes after: build/llms.txt 5,762 bytes (was 20,770), build/llms-full.txt 225,487 bytes (was 227,397). The build reported 0 unresolved markdown links.

Final run after regenerating docs/agents/mcp-tools.md (the MCP server added credit wording to 4 tool descriptions in the meantime; the scratch copy was checked identical to this repo with `diff -rq`): build OK, 0 unresolved links, `7 passed`.

**Overall**: PASSED
