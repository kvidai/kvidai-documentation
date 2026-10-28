[2m[WebServer] [22m(node:1894786) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[2m[WebServer] [22m(Use `node --trace-warnings ...` to show where the warning was created)

Running 18 tests using 1 worker

(node:1895073) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:1895073) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 [chromium] › tests/example.spec.ts:3:5 › has title (4.5s)
  ✓   2 [chromium] › tests/example.spec.ts:10:5 › get started link (4.6s)
  ✓   3 [chromium] › tests/llms-txt.spec.ts:21:7 › generated llms.txt › starts with the site title and an accurate summary, not a K-pop-only one (174ms)
  ✓   4 [chromium] › tests/llms-txt.spec.ts:32:7 › generated llms.txt › lists docs only: no blog, tag or demo pages (56ms)
  ✓   5 [chromium] › tests/llms-txt.spec.ts:39:7 › generated llms.txt › uses only absolute https links, so the file works when served from kvid.ai (101ms)
  ✓   6 [chromium] › tests/llms-txt.spec.ts:46:7 › generated llms.txt › every docs.kvid.ai link resolves in the built site (482ms)
  ✓   7 [chromium] › tests/llms-txt.spec.ts:56:7 › generated llms.txt › links the agent overview and the MCP tool reference first (50ms)
  ✓   8 [chromium] › tests/llms-txt.spec.ts:68:7 › generated llms-full.txt › contains every MCP tool of the generated tool reference page (209ms)
  ✓   9 [chromium] › tests/llms-txt.spec.ts:77:7 › generated llms-full.txt › explains how agents connect and the credit lifecycle (59ms)
  ✓  10 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: home (7.6s)
  ✓  11 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-en-intro (3.8s)
  ✓  12 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-en-pricing (4.6s)
  ✓  13 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-en-getting-started (3.9s)
  ✓  14 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-en-api-overview (4.3s)
  ✓  15 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-ko-intro (3.9s)
  ✓  16 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: docs-ko-pricing (4.1s)
  ✓  17 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: blog (3.2s)
  ✓  18 [chromium] › tests/screenshot.spec.ts:38:7 › screenshot: blog-welcome (3.4s)

  18 passed (1.0m)
