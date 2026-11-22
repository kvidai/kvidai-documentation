# Agent chat QA recordings — 2026-11-02

These record the actual ChatPanel/production CSS and voice button with synthetic auth/editor/network/speech. They are component QA, not a complete authenticated Next page, real AI, billing or physical-phone acceptance.

Final accepted recordings (bundled Playwright Chromium; gray-padding check and full decode passed):

- [Desktop 1280×900, 10.32 seconds](2026-11-02T04-27-36-720Z/agent-chat_desktop-references-command-consent_20261102.webm)
- [Mobile web 390×844, 10.44 seconds](2026-11-02T04-27-36-720Z/agent-chat_mobile-web-references-command-consent_20261102.webm)

Actions: edit draft, open media/saved-file reference chooser, insert notes.md, select a draft-only command, explicitly approve the displayed quote. Assertions: no automatic approval POST, one exact explicit start, no page errors/overflow. Video metadata includes codec/duration/resolution/bytes/SHA. Frames are extracted from the recordings themselves.

The 04-20-00 and 04-25-42 Chrome runs remain **diagnostic**: functional assertions passed but recordings had gray padding/scale defects. Initial external visual review missed this; direct inspection found it. Do not use those clips as the final geometry reference.

Reproduction from monorepo root: `node tests/plan-test/20261102_partial_agent-chat-screen-recording/promotion/record-web-chat.mjs`, while the owned fixture is running via `node tests/agent-chat-interactions/serve-merged-autocut.mjs` from this app. Each run creates a new timestamp directory. Root plan-test contains assertions, stream checks and visual reports. Old screenshots/videos were preserved; no previous-date set was replaced.
