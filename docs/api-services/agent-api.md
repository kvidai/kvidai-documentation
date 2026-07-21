---
title: Agent API
description: kvidAI Agent API — AI-driven video composition editing via Server-Sent Events. Generate scene plans, run media generation jobs, and resume interrupted long-video renders.
keywords: [agent API, AI video editor, server-sent events, SSE, long video, scene plan, kvidAI agent, composition AI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: agent-api
tags: [API, Agent, AI, SSE, Composition]
sidebar_position: 6
---

# Agent API

> **한국어로 보기**: [에이전트 API](/ko/docs/api-services/agent-api) | **View in English** (current page)

The kvidAI Agent API lets you drive the same AI assistant that powers the editor on [kvid.ai](https://kvid.ai) — from your own code. Send a natural-language instruction, and the agent decides what to do: add/edit items, generate images, generate videos, build a multi-scene long-video plan, or stitch all of the above into a finished composition.

Responses are streamed as **Server-Sent Events (SSE)** so you can show progress to the user while the agent is still working. A short edit takes 1–3 minutes; a long video can run for tens of minutes.

## 🎯 Service Overview

### What the agent can do

- **Short video edits** — add text overlays, swap backgrounds, regenerate a single image or video item ("Replace the white sofa with a black leather one"). Returns a new composition snapshot.
- **Long video planning** — given a topic ("explain the iPhone 17 chip in 8 scenes"), the agent first emits a scene plan and then runs all generation jobs (image/video + TTS narration) in a concurrent media queue. Progress events stream while it works.
- **Resume after failure** — if credits ran out mid-render or the connection dropped, resume with `/agent/resume` and only the unfinished scenes are retried.
- **Per-scene retry** — surgical retry of a single failed scene without re-running the whole plan.

### Concepts

- **`projectId`** — Long-running jobs are tied to a project (see [Project Management API](./project-management.md)). Create one with `POST /video-project/create` first. The agent reads/writes the project's composition.
- **`composition`** — Optionally sent in the request body so the agent can reason over the current state without an extra round trip. Omit it and the agent starts from an empty project default. In practice you almost always pass the result of `GET /video-project/:id` verbatim. The agent returns mutated composition snapshots via `checkpoint` and `done` events. The DB composition is auto-saved just before `done` — you do not need to PATCH it yourself.
- **`presetId`** — Optional preset to apply (voice, tone, color palette, scene defaults). Omit it and the agent falls back to `system_default`, then to locale-aware defaults. Create/manage presets via the [Preset API](./preset-api.md).
- **`locale`** — `en` / `ko` / `es`. Drives the final user-facing message language **and** the default voice for narration when no preset is selected. Unsupported values fall back to `en`.

### Authentication

- `api-key` header — your kvidAI API key (APIM subscription primary key).
- The APIM gateway identifies the calling user for you. **Do not** put `email`, `apiKey`, or `kind` in the request body.

Get an API key at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

> Each agent run reserves credits up front (Claude tokens + downstream media generation). Insufficient balance yields a `402 INSUFFICIENT_CREDIT` response **before** any work starts. Rates: see [Pricing](../pricing.md).

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
Response style: text/event-stream (SSE) on success; application/json on early-reject
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/agent/generate` | Run the agent (short edit or long-video plan) |
| `POST` | `/agent/resume` | Resume a partially completed long-video job |
| `POST` | `/agent/retry-scene` | Retry a single failed scene |

---

### 1. Run the agent

`POST /agent/generate`

**Required body fields**

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| `projectId` | integer | `> 0` | Project to edit. Create with `POST /video-project/create` first. |
| `message` | string | 1–4000 chars | Natural-language instruction (`ko` / `en` / `es`). |

**Optional body fields**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `composition` | object | empty project default (1080×1920 @ 30fps, 1 track) | Current composition snapshot. Almost always the `GET /video-project/:id` result passed verbatim. Shape: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. |
| `locale` | string | `en` | `en` / `ko` / `es` (max 16 chars). Drives the `done` event i18n and fallback voice. Unsupported values fall back to `en`. |
| `presetId` | string | `system_default` | Preset to apply, max 128 chars (see [Preset API](./preset-api.md)). Falls back to locale default voice if unset. |
| `attachedFiles` | array | — | Media/document attachments, max 10. See [attachedFiles entry shape](#attachedfiles-entry-shape). |
| `chatHistory` | array | `[]` | Condensed prior turns, max 50 entries, each `content` ≤ 8000 chars. `[{ role: "user" \| "assistant", content }]`. |
| `compositionDiff` | string | — | Summary of what the client changed since the last response (saves tokens), max 20000 chars. |
| `selectedItemContext` | object | — | If the user selected a single image/video item in their UI, the agent scopes its edit to that item. Shape: `{ itemId, type: "image" \| "video", assetId, remoteUrl?, sourceImageUrl?, from, durationInFrames }`. |
| `selectedImageContext` | object | — | **Legacy.** Pre-`selectedItemContext` form (image only). `selectedItemContext` takes precedence when both are present. Shape: `{ itemId, assetId, remoteUrl?, from, durationInFrames }`. |

> The DB composition is auto-saved just before the `done` event — you do not need to PATCH it yourself.

#### attachedFiles entry shape

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Filename. |
| `type` | string | yes | `image` / `video` / `audio` / `pdf` / `text`. |
| `mimeType` | string | yes | MIME type. |
| `size` | integer | yes | Bytes. 50 MB cap. |
| `base64` | string | one of `base64` / `cdnUrl` | Data URL form (`data:<mime>;base64,...`). PDF / text support **only** this field. |
| `cdnUrl` | string | one of `base64` / `cdnUrl` | https URL. Recommended for image/video/audio (avoids large inline payloads). Obtain from the [Media API](./media-api.md) (`POST /media/presigned-upload-url`). |
| `durationInSeconds` | number | no | Client-measured probe value for video/audio. |
| `width` | integer | no | Client-measured probe value for image/video. |
| `height` | integer | no | Client-measured probe value for image/video. |

> Each entry needs **either** `base64` **or** `cdnUrl`. Missing both yields a `400`.

```jsonc
// Large video attachment — upload via the Media API first, then pass cdnUrl.
{
  "attachedFiles": [
    {
      "name": "logo.png",
      "type": "image",
      "mimeType": "image/png",
      "size": 102400,
      "cdnUrl": "https://...cdn.digitaloceanspaces.com/.../logo.png"
    }
  ]
}

// text / pdf attachment — base64 only (cdnUrl not supported).
{
  "attachedFiles": [
    {
      "name": "memo.txt",
      "type": "text",
      "mimeType": "text/plain",
      "size": 124,
      "base64": "data:text/plain;base64,5pys..."
    }
  ]
}
```

**Server-Sent Events**

Each event is `event: <name>\ndata: <json>\n\n`. The event names you should handle:

| Event | When | Payload |
|-------|------|---------|
| `tool_start` | Before the agent calls a sub-tool | `{ toolUseId, toolName }` |
| `tool_end` | After a sub-tool completes | `{ toolUseId, toolName, success, error? }` |
| `plan_ready` | Long-video scene plan confirmed | `{ jobId, totalScenes, estimatedMinutes }` |
| `scene_start` | A scene starts generating | `{ sceneId, sceneIndex }` |
| `scene_complete` | A scene finished successfully | `{ sceneId, voiceError? }` |
| `scene_failed` | A scene failed | `{ sceneId, error }` |
| `checkpoint` | Periodic composition snapshot during long video | `{ composition }` |
| `insufficient_credit` | Mid-execution credit shortage | `{ completedScenes, totalScenes, remainingCredit, estPerScene }` |
| `template_warning` | Preset config validation found something off | `{ severity, field, message }` |
| `done` | Agent finished | `{ success, data: { message, messageKey?, messageParams?, composition, toolResults[], projectId, tokenUsage, cost, resumeJobId?, remainingScenes?, totalScenes?, composition_saved? } }` |
| `error` | Fatal error | `{ error }` |
| `heartbeat` | Keep-alive ping | — (ignore) |

> `messageKey` / `messageParams` on `done` let you re-translate the human-readable message client-side when the user changes UI locale without re-running the agent. Match keys against your i18n catalog (`Agent.longVideo.done.*`, `Agent.longVideo.resume.done.*`, …).

**`done.data.cost` — total credit spend for the run**

`done.data` carries the **total credits deducted** for this single run (tokens + image/video + voice, summed) so external callers get the real spend straight from the response.

```jsonc
"tokenUsage": { "inputTokens": 3472, "outputTokens": 1039, "creditCost": 5.62 }, // LLM tokens only (unchanged, kept for compat)
"cost": {                                  // whole-run total
  "runId": "6c7a2347-c43f-4d28-b783-cd8f24a88f06",  // = agent task id (X-Agent-Task-Id)
  "total": 10.23,                          // tokens + media + voice
  "breakdown": {
    "chat": 5.62,                          // tokens
    "generate_image_fal_queue": 3.51,      // image
    "generate_voice_tts_queue": 1.1        // voice (generate_video_* = video)
  },
  "rowCount": 3,                           // number of credit-use-log rows summed
  "pendingCount": 0                        // media rows still awaiting async settlement
}
```

- The source of truth is the ledger sum: `SUM(credit-use-log.used) WHERE run_id`. It is safe under partial failure (only successful work is counted).
- If `pendingCount > 0`, some media settlement is still in flight — the server waits up to ~6 s before `done`. Any residual delayed rows can be re-fetched with `GET /credit/run-cost/:runId`.
- Rates: see [Pricing](../pricing.md).

**Early reject (non-SSE)**

If the request is rejected before streaming starts, the response is a normal JSON body. Check `response.headers['content-type']` before reading the body as a stream.

```json
{ "success": false, "error": "<code>", "message": "...", "issues"?: [...], "retryAfter"?: 60 }
```

| Status | error code | Cause |
|--------|-----------|-------|
| 400 | `invalid_input` | Schema violation — details in the `issues` array |
| 400 | `Invalid request body` | JSON parse failure |
| 401 | `unauthenticated` | Missing or invalid `api-key` header |
| 402 | `INSUFFICIENT_CREDIT` | Balance too low — shortfall in `data` |
| 409 | `CONCURRENT_LIMIT` | Another agent run is already in flight for this user |
| 429 | `rate_limited` | Over 10 requests/min per user. `Retry-After` header + `retryAfter` seconds in body |
| 500 | server error | Transient — safe to retry |

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"

body = {
    "projectId": 1234,
    "message": "Make a 30-second explainer about the new iPhone chip in 8 scenes.",
    "locale": "en",
    "presetId": "system_default",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/agent/generate",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json=body,
    timeout=None,
) as resp:
    if "text/event-stream" not in resp.headers.get("content-type", ""):
        print("rejected:", resp.json())
        raise SystemExit(1)

    event_name = None
    for line in resp.iter_lines():
        if not line:
            event_name = None
            continue
        if line.startswith("event: "):
            event_name = line[7:]
        elif line.startswith("data: ") and event_name:
            payload = json.loads(line[6:])
            print(event_name, payload)
            if event_name == "done":
                final_composition = payload["data"]["composition"]
                print("cost:", payload["data"].get("cost"))
            elif event_name == "scene_complete":
                print(f"  ✓ {payload['sceneId']}")
            elif event_name == "scene_failed":
                print(f"  ✗ {payload['sceneId']}: {payload['error']}")
```

**JavaScript (Node, `fetch` + manual SSE parsing)**

```javascript
const res = await fetch("https://api.kvid.ai/agent/generate", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    projectId: 1234,
    message: "Add a centered title 'Summer Sale' for 3 seconds.",
    locale: "en",
  }),
});

if (!res.headers.get("content-type")?.includes("text/event-stream")) {
  console.error("rejected:", await res.json());
  process.exit(1);
}

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  buf += decoder.decode(value, { stream: true });
  const blocks = buf.split("\n\n");
  buf = blocks.pop() ?? "";

  for (const block of blocks) {
    let name = "", data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) name = line.slice(7);
      else if (line.startsWith("data: ")) data = line.slice(6);
    }
    if (!name) continue;
    const payload = JSON.parse(data);

    switch (name) {
      case "tool_start": console.log("→", payload.toolName); break;
      case "tool_end":   console.log("←", payload.toolName, payload.success ? "ok" : payload.error); break;
      case "checkpoint": console.log("checkpoint at", payload.composition.tracks.length, "tracks"); break;
      case "done":       console.log("done:", payload.data.message, "cost:", payload.data.cost); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 2. Resume a partially completed long-video job

`POST /agent/resume`

When a long-video render is interrupted (credits ran out, scene generation failed, the user closed the tab), the scene plan and the composition already produced stay in storage. Resume re-runs **only the failed/missing scenes**.

**Request body**

| Field | Required | Notes |
|-------|----------|-------|
| `jobId` | yes | From the `done` event's `data.resumeJobId`. |
| `locale` | no | Same semantics as `/agent/generate`. |

Returns an SSE stream with the same event shape as `/agent/generate`. The terminal `done` event uses the resume-specific message keys (`Agent.longVideo.resume.done.*`).

```python
with httpx.stream(
    "POST",
    "https://api.kvid.ai/agent/resume",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"jobId": job_id, "locale": "en"},
    timeout=None,
) as resp:
    for line in resp.iter_lines():
        ...
```

---

### 3. Retry a single failed scene

`POST /agent/retry-scene`

Re-runs one scene without touching the rest of the plan. The agent reuses the existing scene's prompt, voice, and narration text — useful for transient image/video provider failures.

**Request body**

| Field | Required | Notes |
|-------|----------|-------|
| `jobId` | yes | The long-video job. |
| `sceneId` | yes | Scene to retry. |
| `locale` | no | Default `en`. |

```javascript
await fetch("https://api.kvid.ai/agent/retry-scene", {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    jobId: "job_abc123",
    sceneId: "scene-4",
  }),
});
```

The response is an SSE stream emitting `scene_start` → `scene_complete` / `scene_failed` for that one scene, then `done`.

---

## Notes

- A Bruno `bru run` cannot wait for the full SSE stream — call from a UI or an external SSE client.
- `chatHistory` can be omitted on the first call; on later calls, pass a condensed version of the previous response as history.
- Credits are reserved just before the run starts — on an `INSUFFICIENT_CREDIT` response no work happens.

## Related

- [Project Management API](./project-management.md) — projects this agent runs against
- [Media API](./media-api.md) — presigned CDN upload for `attachedFiles[].cdnUrl`
- [Preset API](./preset-api.md) — voice/tone/scene presets applied via `presetId`
- [Video Generation API](./video-api.md) — the lower-level synchronous video generator the agent calls under the hood
- [Image Generation API](./image-api.md) — same, for images
- [Pricing](../pricing.md) — per-tool credit rates
