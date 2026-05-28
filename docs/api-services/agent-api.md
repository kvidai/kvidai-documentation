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

The kvidAI Agent API lets you drive the same AI assistant that powers the editor on [kvid.ai](https://kvid.ai) — from your own code. Send a natural-language instruction plus a Remotion composition, and the agent decides what to do: add/edit items, generate images, generate videos, build a multi-scene long-video plan, or stitch all of the above into a finished composition.

Responses are streamed as **Server-Sent Events (SSE)** so you can show progress to the user while the agent is still working.

## 🎯 Service Overview

### What the agent can do

- **Short video edits** — add text overlays, swap backgrounds, regenerate a single image or video item ("Replace the white sofa with a black leather one"). Returns a new composition diff.
- **Long video planning** — given a topic ("explain the iPhone 17 chip in 8 scenes"), the agent first emits a scene plan and then runs all generation jobs (image/video + TTS narration) in a concurrent media queue. Progress events stream while it works.
- **Resume after failure** — if credits ran out mid-render or the connection dropped, you can resume with `/api/agent/resume` and only the unfinished scenes are retried.
- **Per-scene retry** — surgical retry of a single failed scene without re-running the whole plan.

### Concepts

- **`projectId`** — Long-running jobs are tied to a project (see [Project Management API](./project-management.md)). The agent reads/writes the project's composition.
- **`composition`** — Sent in the request body so the agent can reason over the current state without an extra round trip. The agent returns mutated composition snapshots via `checkpoint` and `done` events.
- **`presetId`** — Optional preset to apply (voice, tone, color palette, scene defaults). Omit it and the agent falls back to `system_default` then to locale-aware defaults. Create/manage presets via the [Preset API](./overview#preset-api). Legacy field name `templateId` is still accepted for backward compatibility.
- **`locale`** — `en` / `ko` / `es`. Drives the final user-facing message language **and** the default voice for narration when no template is selected.

### Authentication

Same as the [Project Management API](./project-management.md#authentication):

- `api-key` header — your kvidAI API key
- `email` field in the request body — the user the agent runs as

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
| `POST` | `/api/agent` | Run the agent (short edit or long-video plan) |
| `POST` | `/api/agent/resume` | Resume a partially completed long-video job |
| `POST` | `/api/agent/retry-scene` | Retry a single failed scene |
| `GET`  | `/api/agent/check-resume` | Check if a project has an unfinished job |

---

### 1. Run the agent

`POST /api/agent`

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | string | yes | Natural-language instruction. |
| `composition` | object | yes | Current composition. The agent reasons over this. |
| `projectId` | number | yes | Project to associate the job with. |
| `email` | string | yes | Owner. |
| `apiKey` | string | yes | Per-user kvidAI API key. (This is in the body, not the header — the field is forwarded internally to the AI gateway.) |
| `locale` | string | no | `en` (default) / `ko` / `es`. |
| `presetId` | string | no | Preset to apply (see [Preset API](./overview#preset-api)). Omitting falls back to `system_default`. Legacy alias: `templateId`. |
| `attachedFiles` | array | no | Image / video / audio / PDF / text uploads. Each: `{ name, type, mimeType, size, base64? \| cdnUrl? }`. Pass `cdnUrl` (obtained from the [Media API](./overview#media-api)) for large files; `base64` is the legacy inline path that the web editor uses. PDF / text accept only `base64`. |
| `chatHistory` | array | no | Past messages condensed by your client (saves tokens on long sessions). |
| `selectedItemContext` | object | no | If the user has selected a single image/video in their UI, pass `{ itemId, type, assetId, remoteUrl?, sourceImageUrl?, from, durationInFrames }`. The agent will scope its edit to that item. |
| `autoSave` | boolean | no | Default `true`. Set `false` if you want to PATCH the composition yourself after `done`. |

**Server-Sent Events**

Each event is a line `event: <name>\ndata: <json>\n\n`. The event names you should handle:

| Event | When | Payload |
|-------|------|---------|
| `tool_start` | Before the agent calls a sub-tool | `{ toolUseId, toolName }` |
| `tool_end` | After a sub-tool completes | `{ toolUseId, toolName, success, error? }` |
| `plan_ready` | Long-video planning completed | `{ jobId, totalScenes, estimatedMinutes }` |
| `scene_start` | A scene starts generating | `{ sceneId, sceneIndex }` |
| `scene_complete` | A scene finished successfully | `{ sceneId, voiceError? }` |
| `scene_failed` | A scene failed | `{ sceneId, error }` |
| `checkpoint` | Periodic composition snapshot during long video | `{ composition }` |
| `insufficient_credit` | Mid-execution credit shortage | `{ completedScenes, totalScenes, remainingCredit, estPerScene }` |
| `template_warning` | Template config validation found something off | `{ severity, field, message }` |
| `done` | Agent finished | `{ success, data: { message, messageKey?, messageParams?, composition, toolResults[], projectId, resumeJobId?, remainingScenes?, totalScenes? } }` |
| `error` | Fatal error | `{ error }` |

> `messageKey` / `messageParams` on `done` let you re-translate the human-readable message client-side when the user changes UI locale without re-running the agent. Match keys against your i18n catalog (`Agent.longVideo.done.*`, `Agent.longVideo.resume.done.*`, …).

**Early reject (non-SSE)**

If the request is rejected before streaming starts (auth failure, credit insufficient, concurrent-limit), the response is a normal JSON body with `status` `4xx` and `{ success: false, error: "<CODE>", message: "...", data: { ... } }`. Inspect `response.headers['content-type']` before reading the body as a stream.

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"

body = {
    "message": "Make a 30-second explainer about the new iPhone chip in 8 scenes.",
    "composition": empty_composition,   # see Project Management API
    "projectId": 1234,
    "email": EMAIL,
    "apiKey": API_KEY,
    "locale": "en",
    "presetId": "sod",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/api/agent",
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
            elif event_name == "scene_complete":
                print(f"  ✓ {payload['sceneId']}")
            elif event_name == "scene_failed":
                print(f"  ✗ {payload['sceneId']}: {payload['error']}")
```

**JavaScript (Node, `fetch` + manual SSE parsing)**

```javascript
const res = await fetch("https://api.kvid.ai/api/agent", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Add a centered title 'Summer Sale' for 3 seconds.",
    composition,
    projectId: 1234,
    email: "you@example.com",
    apiKey: process.env.KVIDAI_API_KEY,
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
      case "done":       console.log("done:", payload.data.message); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 2. Resume a partially completed long-video job

`POST /api/agent/resume`

When a long-video render is interrupted (credits ran out, scene generation failed, the user closed the tab), the scene plan and the composition that were already produced stay in storage. Resume re-runs **only the failed/missing scenes**.

**Request body**

| Field | Required | Notes |
|-------|----------|-------|
| `jobId` | yes | From the `done` event's `data.resumeJobId`, or from `check-resume`. |
| `email` | yes | Owner. |
| `apiKey` | yes | Per-user API key. |
| `locale` | no | Same semantics as `/api/agent`. |

Returns an SSE stream with the same event shape as `/api/agent`. The terminal `done` event uses the resume-specific message keys (`Agent.longVideo.resume.done.*`).

```python
with httpx.stream(
    "POST",
    "https://api.kvid.ai/api/agent/resume",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"jobId": job_id, "email": EMAIL, "apiKey": API_KEY, "locale": "en"},
    timeout=None,
) as resp:
    for line in resp.iter_lines():
        ...
```

---

### 3. Retry a single failed scene

`POST /api/agent/retry-scene`

Re-runs one scene without touching the rest of the plan. The agent reuses the existing scene's prompt, voice, and narration text — useful for transient image/video provider failures.

**Request body**

| Field | Required | Notes |
|-------|----------|-------|
| `jobId` | yes | The long-video job. |
| `sceneId` | yes | Scene to retry. |
| `email` | yes | Owner. |
| `apiKey` | yes | Per-user API key. |
| `locale` | no | Default `en`. |

```javascript
await fetch("https://api.kvid.ai/api/agent/retry-scene", {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    jobId: "job_abc123",
    sceneId: "scene-4",
    email: "you@example.com",
    apiKey: API_KEY,
  }),
});
```

The response is an SSE stream emitting `scene_start` → `scene_complete` / `scene_failed` for that one scene, then `done`.

---

### 4. Check for an unfinished job

`GET /api/agent/check-resume?projectId={id}&email={email}`

Lookup whether a given project has a pending long-video job. Returns `{ data: null }` if there's nothing to resume, otherwise:

```json
{
  "success": true,
  "data": {
    "jobId": "job_abc123",
    "remainingScenes": 6,
    "totalScenes": 24
  }
}
```

Use this on page load — for example to show a "▶ Resume 6 scenes" button when the user comes back to a project they walked away from.

```python
resp = requests.get(
    "https://api.kvid.ai/api/agent/check-resume",
    headers={"api-key": API_KEY},
    params={"projectId": 1234, "email": EMAIL},
)
data = resp.json()["data"]
if data and data["remainingScenes"]:
    print(f"resume available: {data['remainingScenes']} of {data['totalScenes']} remaining")
```

---

## End-to-End: long-video pipeline with resume

```python
import httpx
import json
import requests

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"
PROJECT = 1234

def stream_agent(url, body):
    """Yield (event_name, payload) tuples."""
    with httpx.stream(
        "POST", url,
        headers={"api-key": API_KEY, "Content-Type": "application/json"},
        json=body, timeout=None,
    ) as resp:
        if "text/event-stream" not in resp.headers.get("content-type", ""):
            raise RuntimeError(f"rejected: {resp.json()}")
        name = None
        for line in resp.iter_lines():
            if not line:
                name = None
                continue
            if line.startswith("event: "):
                name = line[7:]
            elif line.startswith("data: ") and name:
                yield name, json.loads(line[6:])

# 1. Kick off
job_id = None
for name, payload in stream_agent(
    "https://api.kvid.ai/api/agent",
    {
        "message": "Make a 30s explainer on Korean street food.",
        "composition": empty_composition,
        "projectId": PROJECT,
        "email": EMAIL,
        "apiKey": API_KEY,
        "locale": "en",
    },
):
    if name == "plan_ready":
        job_id = payload["jobId"]
        print(f"plan with {payload['totalScenes']} scenes")
    elif name == "scene_failed":
        print(f"  ✗ {payload['sceneId']}")
    elif name == "done":
        print("done:", payload["data"]["message"])

# 2. If credits ran out mid-flight, the done event will include `resumeJobId`.
#    Either react to that on the spot, or look it up next session:
status = requests.get(
    "https://api.kvid.ai/api/agent/check-resume",
    headers={"api-key": API_KEY},
    params={"projectId": PROJECT, "email": EMAIL},
).json()["data"]

if status and status["remainingScenes"]:
    for name, payload in stream_agent(
        "https://api.kvid.ai/api/agent/resume",
        {"jobId": status["jobId"], "email": EMAIL, "apiKey": API_KEY, "locale": "en"},
    ):
        if name == "done":
            print("resume done:", payload["data"]["message"])
```

---

## Error Responses

Errors before the stream starts are JSON. Errors during the stream are an `error` SSE event.

| Code | Meaning | Typical fix |
|------|---------|-------------|
| `UNAUTHORIZED` | Bad `apiKey` | Re-issue at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys) |
| `CONCURRENT_LIMIT` | The user already has an agent run in flight | Wait for the previous run to finish, or read `check-resume` and resume instead |
| `INSUFFICIENT_CREDIT` | Reserved credit > available balance | Top up at [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) — see [Pricing](../pricing.md) |
| `MISSING_PARAMETERS` | Required field missing | Inspect `message` for details |
| `ZOMBIE_TIMEOUT` | Previous job is stuck and was reaped | Just retry |

---

## Related

- [Project Management API](./project-management.md) — projects this agent runs against
- [Video Generation API](./video-api.md) — the lower-level synchronous video generator the agent calls under the hood
- [Image Generation API](./image-api.md) — same, for images
- [Pricing](../pricing.md) — per-tool credit rates
