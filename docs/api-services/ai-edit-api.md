---
title: AI Edit API
description: kvidAI AI Edit API — summarize media (STT + LLM) and silence-cut via Server-Sent Events. Turn a public media URL into keep-segments or a silence-trimmed MP4.
keywords: [AI edit API, video summary, silence cut, STT, ElevenLabs Scribe, server-sent events, SSE, FFmpeg, kvidAI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: ai-edit-api
tags: [API, AI Edit, STT, SSE]
sidebar_position: 7
---

# AI Edit API

> **한국어로 보기**: [AI 편집 (요약·무음컷) API](/ko/docs/api-services/ai-edit-api) | **View in English** (current page)

The AI Edit API takes a public media URL (audio or video) and returns editing decisions as **Server-Sent Events (SSE)**. Three endpoints:

- **`/ai-edit/summary`** — transcribes the media (**STT via ElevenLabs Scribe**) then runs an **LLM** to pick the segments worth keeping, each with an importance score. The editor stitches those segments into a summary cut.
- **`/ai-edit/silence-cut`** — removes silent stretches with **FFmpeg** and returns a new MP4 on the CDN. No STT/LLM — pure audio silence analysis.
- **`/ai-edit/shorts`** — transcribes then runs an **LLM** to find short-form **highlight candidates** (each a start/end + title/reason). Returns the candidate list only — you pick and cut on your side (same "decision-returning" model as summary; only silence-cut returns an actual MP4).

Both stream progress while working (a 50-minute video can take a minute or more). The terminal `done` event carries the result plus the run's total credit spend (`cost`).

## 🎯 Service Overview

### Authentication

- `api-key` header — your kvidAI API key (APIM subscription primary key).
- The APIM gateway injects the caller identity (and, for summary, the `kind`) for you. **Do not** put `email` or `kind` in the request body.

Get an API key at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

### Concepts

- **`mediaUrl`** — A public https URL to the audio/video to process. This is all an external caller needs. It is robust to Korean/space/special-character filenames and NFC/NFD encoding differences — paste a browser address-bar or media-library URL as-is.
- **`fileKey`** — Alternative to `mediaUrl`: a media key issued by the upload API. The web UI uses it after extracting audio in the browser; external callers normally use `mediaUrl`. If both are present, `mediaUrl` wins.
- **Segments (summary)** — Not prose. Each is a **time range to keep** plus an `importance` score; the editor concatenates them.

### Limits

| Item | Value | Notes |
|------|-------|-------|
| Max media length | **60 min** | Enforced at web upload; recommended for API `mediaUrl` calls. Same for summary, silence-cut, and shorts. |
| Max file size | **5 GB** / file | DO Spaces single-PUT limit. |
| Gateway processing timeout | **1200 s (20 min)** | APIM forward-request. Very long originals may exceed this mid-processing. |
| Supported media | video (mp4, etc.) / audio | Any format STT / FFmpeg can handle. |

> The web UI (kvid.ai) enforces 60 min / 5 GB **at upload time**. API calls passing `mediaUrl` directly skip the upload gate, so treat those numbers as recommended values — but processing must still finish inside the gateway timeout (1200 s).

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai/ai-edit
Authentication: api-key header
Content-Type:   application/json
Response style: text/event-stream (SSE) on success; application/json on early-reject
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai-edit/summary` | Summarize media into keep-segments (STT + LLM) |
| `POST` | `/ai-edit/silence-cut` | Remove silent stretches, return a new MP4 URL |
| `POST` | `/ai-edit/shorts` | Find short-form highlight candidates (STT + LLM) — returns timestamps, not a cut |

---

### 1. Summarize media

`POST /ai-edit/summary`

Transcribes with ElevenLabs Scribe, then an LLM picks the segments worth keeping.

**Required body fields**

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| `mediaUrl` | string | public https URL | Media (audio/video) CDN URL to summarize. **External callers only need this.** One of `mediaUrl` / `fileKey` is required (`mediaUrl` wins if both). |
| `instruction` | string | 1+ chars | Summary direction. **Required in `overview` mode (default)** — omitting it yields `400 instruction is required`. Only optional in `trailer` mode. |

**Optional body fields**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `mode` | string | `overview` | `overview` (instruction required, balanced summary) / `trailer` (instruction optional, short trailer). |
| `fileKey` | string | — | Alternative to `mediaUrl` — a media key from the upload API. External callers normally use `mediaUrl`. |
| `projectId` | number | — | Project id to associate the result with. |

**Server-Sent Events**

Each event is `event: <name>\ndata: <json>\n\n`.

| Event | When | Payload |
|-------|------|---------|
| `job_created` | First | `{ jobId }` — for revisit / reconnect |
| `transcribing` | STT starts | `{ jobId }` |
| `analyzing` | LLM summary starts | `{ jobId }` |
| `done` | Finished | `{ success: true, data: {...} }` (below) |
| `error` | Failed | `{ error }` |
| `heartbeat` (`: heartbeat`) | Keep-alive ping | — (ignore) — frequent during long-video STT |

**`done.data` shape**

```jsonc
{
  "kind": "summary",
  "captions": [                              // full transcript (word-level, ms)
    { "text": "Hello,", "startMs": 420, "endMs": 740, "timestampMs": 580, "confidence": null }
  ],
  "segments": [                              // segments the summary KEPT + importance
    { "startMs": 179, "endMs": 4639, "importance": 9 }
  ],
  "targetSeconds": null,                     // target seconds if instruction specifies a length ("1 min"), else null
  "mode": "overview",
  "cost": { ... }                            // below
}
```

Segments are **time ranges to keep plus an importance score**, not a prose summary — the editor concatenates them into a summary video.

**`done.data.cost` — credit spend for this run**

```jsonc
"cost": {
  "runId": "c0b5d626-...",                   // = jobId
  "total": 7.65,                             // total credits deducted for this run
  "breakdown": { "text": 7.65 },             // currently only LLM tokens (text) counted
  "rowCount": 1,                             // number of credit-use-log rows summed
  "pendingCount": 0
}
```

- Source of truth is the ledger sum: `SUM(credit-use-log.used) WHERE run_id = jobId`.
- ⚠️ STT (transcription) cost is **not yet reflected** in `total` — only `breakdown.text` (LLM) is counted for now. STT credit summing is planned.
- Re-fetch by `runId`: `GET /credit/run-cost/:runId`.
- Rates: see [Pricing](../pricing.md).

**Early reject (non-SSE)**

| Status | error | Cause |
|--------|-------|-------|
| 400 | `missing_params` | Missing one of `email`, `kind`, `mediaUrl` / `fileKey` |
| 400 | `instruction is required` | `overview` mode with no `instruction` (emitted as an SSE `error` event) |
| 400 | `invalid_json` | JSON parse failure |
| 401 | `forbidden_origin` | Origin gate failed (e.g. bypassing APIM) |
| 4xx/5xx | `Transcription failed` | STT failure (no/corrupt audio) — emitted as an SSE `error` event |

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"

body = {
    "mediaUrl": "https://...cdn.digitaloceanspaces.com/.../talk.mp4",
    "instruction": "Summarize the key points.",
    "mode": "overview",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/ai-edit/summary",
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
                data = payload["data"]
                print("segments:", data["segments"])
                print("cost:", data["cost"])
            elif event_name == "error":
                print("error:", payload["error"])
```

---

### 2. Silence-cut

`POST /ai-edit/silence-cut`

Removes silent stretches with FFmpeg (`remove_silence`) and returns a new MP4 on the CDN. No STT/LLM.

**Required body fields**

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| `mediaUrl` | string | public https URL | Media CDN URL to silence-cut. **External callers only need this.** One of `mediaUrl` / `fileKey` is required (`mediaUrl` wins if both). |

**Optional body fields**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `mode` | string | `all` | Where to remove silence: `all` (whole clip) / `start` (leading) / `end` (trailing). |
| `thresholdDb` | number | `-40` | Silence threshold (dB). Lower = must be quieter to count as silence. |
| `minDuration` | number | `0.5` | Minimum silence length (s) to remove — shorter gaps are kept. |
| `keepSilence` | number | `0.1` | Silence (s) to leave at each cut boundary — avoids abrupt cuts. |
| `fileKey` | string | — | Alternative to `mediaUrl` — a media key from the upload API. External callers normally use `mediaUrl`. |
| `projectId` | number | — | Project id to associate the result with. |

**Server-Sent Events**

| Event | When | Payload |
|-------|------|---------|
| `job_created` | First | `{ jobId }` |
| `processing` | Sidecar silence-cut starts | `{ jobId }` |
| `uploading` | Uploading trimmed MP4 to CDN | `{ jobId }` |
| `done` | Finished | `{ success: true, data: {...} }` (below) |
| `error` | Failed | `{ error }` |
| `heartbeat` (`: heartbeat`) | Keep-alive ping | — (ignore) — frequent during long-video processing |

**`done.data` shape**

```jsonc
{
  "kind": "silence_cut",
  "outputUrl": "https://...cdn.../silence-cut-<uuid>.mp4",  // trimmed MP4 (ready to use)
  "outputKey": "<uuid>",                                     // re-fetchable as a fileKey
  "meta": {
    "original_duration": 627.4,    // input length (s) — billing basis
    "new_duration": 512.1,         // output length (s)
    "removed_duration": 115.3,     // removed silence (s)
    "reduction_percent": 18.4,
    "segment_count": 42            // number of silence segments removed
  },
  "cost": { ... }                  // below
}
```

**`done.data.cost` — credit spend for this run**

```jsonc
"cost": {
  "runId": "<jobId>",
  "total": 0,                      // input seconds × pricing_table rate (initial rate 0 → 0)
  "breakdown": { },
  "rowCount": 1,                   // logged even when free (0) for tracking
  "pendingCount": 0
}
```

- **Throughput billing**: `credit = original_duration (s) × pricing_table rate`. The rate is a DB row value — changes take effect immediately.
- **Initial rate is 0** → free. Even at 0, a credit-use-log row (`used = 0`) is written for usage tracking.
- Re-fetch by `runId`: `GET /credit/run-cost/:runId`.
- Rates: see [Pricing](../pricing.md).

**Early reject (non-SSE)**

| Status | error | Cause |
|--------|-------|-------|
| 400 | `missing_params` | Missing one of `email`, `mediaUrl` / `fileKey` |
| 400 | `invalid_mode` | `mode` is not `all` / `start` / `end` |
| 400 | `invalid_json` | JSON parse failure |
| 401 | `forbidden_origin` | Origin gate failed (e.g. bypassing APIM) |
| 4xx/5xx | `silence-cut failed` | Sidecar failure (download / FFmpeg) — emitted as an SSE `error` event |

**JavaScript (Node, `fetch` + manual SSE parsing)**

```javascript
const res = await fetch("https://api.kvid.ai/ai-edit/silence-cut", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mediaUrl: "https://...cdn.digitaloceanspaces.com/.../talk.mp4",
    mode: "all",
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
      case "processing": console.log("processing…"); break;
      case "uploading":  console.log("uploading…"); break;
      case "done":       console.log("output:", payload.data.outputUrl, "cost:", payload.data.cost); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 3. Shorts

`POST /ai-edit/shorts`

Transcribes the media (**STT**) then runs an **LLM** to find self-contained **short-form highlight candidates** (think Shorts / Reels). Returns the candidate list — **it does not cut or pick**. Same "decision-returning" model as summary: you receive timestamps + a title/reason per candidate and cut the clips you want on your side. (Only `silence-cut` returns an actual MP4, because removing silence needs no human decision.)

#### Request Body

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `mediaUrl` | string | public https URL | Media (audio/video) CDN URL. **External callers only need this.** One of `mediaUrl` / `fileKey` is required (`mediaUrl` wins if both). |
| `instruction` | string | optional | Steer candidate selection. Omit for automatic impact-based selection. |
| `maxClips` | number | optional, default `6` | Max candidates. Clamped to **1–12**. |
| `fileKey` | string | optional | Alternative to `mediaUrl` — a media key from the upload API. External callers normally use `mediaUrl`. |
| `projectId` | number | optional | Project id to associate the result with. |

#### SSE Events

| Event | When | Payload |
|-------|------|---------|
| `job_created` | first | `{ jobId }` |
| `transcribing` | STT starts | `{ jobId }` |
| `analyzing` | LLM highlight selection starts | `{ jobId }` |
| `done` | complete | `{ success: true, data: { kind, captions, clips, cost } }` |
| `error` | failure | `{ error }` |

#### done.data

```jsonc
{
  "kind": "shorts",
  "captions": [ /* full word-level transcript (ms) */ ],
  "clips": [                                   // highlight candidates, best first, non-overlapping
    {
      "startMs": 12000,                        // candidate start (ms)
      "endMs": 38000,                          // candidate end (ms)
      "title": "The moment the price flipped", // short, catchy clip title (transcript language)
      "reason": "twist + number impact"        // one line on why it works as a short
    }
  ],
  "cost": { /* same shape as summary — ledger-summed run credit */ }
}
```

`clips` are **candidate ranges, not ready-made MP4s** — cut them yourself from `startMs`/`endMs`. Empty `clips: []` means nothing qualified.

#### Errors

| Status | error | Cause |
|--------|-------|-------|
| 400 | `missing_params` | Missing one of `email`, `kind`, `mediaUrl` / `fileKey` |
| 401 | `forbidden_origin` | Origin gate failed (e.g. not via APIM) |
| 4xx/5xx | `Transcription failed` | STT failed (no/broken audio) — emitted as an SSE `error` event |

---

## Notes

- A Bruno `bru run` cannot wait for the full SSE stream — call from a UI or an external SSE client.
- Summary `overview` mode requires `instruction`. For an unguided auto-summary, use `mode: "trailer"`.
- Shorts returns **candidates only** (timestamps + title/reason) — you pick and cut the clips yourself; it never returns a video. Only `silence-cut` returns an MP4.
- A video with no silence returns `removed_duration = 0` (output = input) — this is normal.

## Related

- [Media API](./media-api.md) — presigned CDN upload to obtain a public `mediaUrl`
- [Agent API](./agent-api.md) — AI-driven composition editing over SSE
- [Pricing](../pricing.md) — per-tool credit rates
