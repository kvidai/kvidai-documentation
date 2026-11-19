# Attachment warnings

2026-10-28: isolated web-component fixture (mocked attachment states; actual component, translations, application CSS). No native, backend, upload or codec certification. App-only captures intentionally stay in this app.

| File                                           | View                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| attachment-upload_desktop-warning_20261028.png | Desktop1920x1080, reasons/limits/expanded guidance          |
| attachment-upload_mobile-warning_20261028.png  | Mobile-web390x844, readable warnings/no horizontal overflow |

Reproduce using `tests/attachment-upload-ui/README.md`.

General-agent fixture (real assistant-ui runtime/adapter/policy/FileReader, model reply mocked; desktop/mobile Chrome viewports, no physical-device or live backend proof):

- attachment-upload_desktop-superagent-ready_20261028.png
- attachment-upload_mobile-superagent-ready_20261028.png
- attachment-upload_mobile-superagent-limit_20261028.png

Reference form: reference-policy-desktop.png and reference-policy-mobile.png. Actual uploader/hook/shared OFF policy; mock identity, synthetic53MiB input, no live upload/codec. Chrome viewport captures, not physical Android/iOS evidence.

- [attachment-upload_desktop-compression-preference_20261028.png](./attachment-upload_desktop-compression-preference_20261028.png)
- [attachment-upload_mobile-compression-preference_20261028.png](./attachment-upload_mobile-compression-preference_20261028.png)
- [attachment-upload_mobile-chat-compression_20261028.png](./attachment-upload_mobile-chat-compression_20261028.png)
- [attachment-upload_mobile-i2i-prepared_20261028.png](./attachment-upload_mobile-i2i-prepared_20261028.png)
- [attachment-upload_mobile-i2i-transfer-cancel_20261028.png](./attachment-upload_mobile-i2i-transfer-cancel_20261028.png)
- [attachment-upload_mobile-i2v-prepared_20261028.png](./attachment-upload_mobile-i2v-prepared_20261028.png)

## PNG quality refusal — 2026-10-29

`png-quality-refusal_{desktop,mobile}_20261029.png` is the actual isolated design-host flow, with real upload hook/Worker/OxiPNG and mocked account/API/canvas. The refusal sends no metadata/PUT/AI request and preserves the draft. `*-card_20261029.png` uses actual DPR2 browser rendering for readable card-only review; final focused reviews passed2/2. First duplicate technical alerts and1x captures/review verdicts remain in `png-quality-first-review/` and `png-quality-card-first-review/`. Fullpage fixture whitespace is intentional and does not certify full editor rendering. Exact evidence/reproduction: `../../../src/lib/upload/__tests__/results/20261029-client-media-compression-quality-risk-qa.md`.

Capture-history correction: the intermediate post-fix1x fullpage images were overwritten by a DPR2 rerun; their review JSON remains, but exact intermediate fullpage pixels were not preserved. Raw first-review,1x card and accepted DPR2 captures are retained. No missing image was reconstructed or counted as final verification. The PNG UI spec now adds a unique UTC timestamp to each screenshot and result filename and records both image names in its result JSON, preventing future reruns from overwriting them.
