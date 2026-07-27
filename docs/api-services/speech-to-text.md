---
title: Speech-to-Text API
description: kvidAI Speech-to-Text API — ElevenLabs Scribe STT proxy with per-minute credit billing. Transcribe audio via file upload or a cloud storage URL.
keywords: [speech to text, STT, transcription, scribe, kvidAI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: speech-to-text
tags: [API, STT, Transcription, Scribe]
sidebar_position: 6
---

# Speech-to-Text API

> **한국어로 보기**: [음성 전사 (STT) API](/ko/docs/api-services/speech-to-text) | **View in English** (current page)

Transcribe audio to text using **ElevenLabs Scribe** through a single kvidAI endpoint. Send either an uploaded audio file (`multipart/form-data`) or a public CDN URL of a video/audio file (`application/json`). The response is the raw Scribe JSON — full transcript text plus word-level timestamps and speaker labels.

This is the same backend that powers the local **`transcribe.py`** skill, so it's a drop-in replacement when you want transcription server-side instead of on the client.

## 🎯 Service Overview

### What it does

- Proxies **ElevenLabs Scribe (`scribe_v1`)** transcription behind your kvidAI API key.
- Charges credits based on **audio duration** (per-minute) — see [Pricing](/docs/pricing).
- Returns **word-level timestamps**, **speaker diarization**, and **audio-event tags** in one call.
- Accepts audio directly (file upload) or by reference (a public `cloud_storage_url`, up to 2 GB).

### Billing

- **One credit charge per successful call**, proportional to the audio duration. See [Pricing](/docs/pricing).
- **Re-edits reuse the stored transcript at no cost** — transcribing the same media again does not double-charge; the stored transcript is served back for free.
- Failed calls (`500`) are not charged the full amount.

### Authentication

- `api-key` header — your kvidAI API key. This is the normal path via `https://api.kvid.ai`.
- APIM injects the owner email as `X-Kvidai-User-Email`, so you **don't** need to send an email through the gateway.
- The JSON body's `email` field is **only** needed for **direct / non-gateway calls** (bypassing APIM) where the header isn't injected. Over `api.kvid.ai`, the api-key alone is enough.

## 📡 API Endpoints

```
Base URL:       https://api.kvid.ai/ai/speech-to-text
Authentication: api-key header
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/speech-to-text` | Transcribe audio to text (Scribe v1) |

> **Path note:** `/ai/speech-to-text` is the canonical path, consistent with the other `ai/…` APIs. The legacy `/v1/speech-to-text` still works as a **deprecated alias** — please migrate to `/ai/speech-to-text`.

Two request modes are supported on the same endpoint:

| Mode | Content-Type | Input |
|------|--------------|-------|
| **A. File upload** | `multipart/form-data` | Binary audio file (`file`) |
| **B. Cloud URL** | `application/json` | Public CDN URL (`cloud_storage_url`, ≤ 2 GB) |

---

### Mode A — File upload (`multipart/form-data`)

Upload a binary audio file (WAV, MP3, M4A, etc.) as the `file` field.

**Fields**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `file` | binary | yes | — | Audio file (WAV, MP3, M4A, …). |
| `model_id` | string | no | `scribe_v1` | Scribe model. |
| `diarize` | string | no | `true` | Detect and label speakers. |
| `tag_audio_events` | string | no | `true` | Tag non-speech events (laughter, music, …). |
| `timestamps_granularity` | string | no | `word` | Granularity of returned timestamps. |
| `language_code` | string | no | *(auto-detect)* | BCP-47 code (e.g. `ko`, `en`). Omit to auto-detect. |
| `num_speakers` | string | no | — | Expected number of speakers; improves diarization. |

```bash
curl -X POST "https://api.kvid.ai/ai/speech-to-text" \
  -H "api-key: YOUR_API_KEY" \
  -F "file=@interview.mp3" \
  -F "model_id=scribe_v1" \
  -F "language_code=ko" \
  -F "diarize=true"
```

---

### Mode B — Cloud storage URL (`application/json`)

Point at a public CDN URL of a video or audio file (up to 2 GB). Useful when the media already lives on a CDN — no need to re-upload the bytes.

**Body fields**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `cloud_storage_url` | string | yes | — | Public CDN URL of the video/audio file (≤ 2 GB). |
| `model_id` | string | no | `scribe_v1` | Scribe model. |
| `timestamps_granularity` | string | no | `word` | Granularity of returned timestamps. |
| `language_code` | string | no | *(auto-detect)* | BCP-47 code (e.g. `ko`, `en`). Omit to auto-detect. |
| `email` | string | no* | — | Billing email. *Required only on direct/non-gateway calls; via `api.kvid.ai` it's injected from the api-key as `X-Kvidai-User-Email`. |

```bash
curl -X POST "https://api.kvid.ai/ai/speech-to-text" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_storage_url": "https://cdn.example.com/media/interview.mp4",
    "model_id": "scribe_v1",
    "timestamps_granularity": "word",
    "language_code": "ko"
  }'
```

## Response

`200 OK` returns the raw Scribe JSON — the full transcript plus per-word timestamps and speaker labels.

```json
{
  "language_code": "ko",
  "text": "안녕하세요, 오늘 인터뷰를 시작하겠습니다.",
  "words": [
    { "text": "안녕하세요", "start": 0.12, "end": 0.68, "type": "word", "speaker_id": "speaker_0" },
    { "text": ",", "start": 0.68, "end": 0.70, "type": "spacing", "speaker_id": "speaker_0" }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `language_code` | string | Detected (or supplied) BCP-47 language. |
| `text` | string | Full transcript. |
| `words[]` | array | Ordered tokens. |
| `words[].text` | string | Token text. |
| `words[].start` | number | Start time (seconds). |
| `words[].end` | number | End time (seconds). |
| `words[].type` | string | Token type (`word`, `spacing`, audio-event, …). |
| `words[].speaker_id` | string | Speaker label when `diarize` is enabled. |

## Errors

| Status | Meaning | Cause |
|---|---|---|
| `400` | Bad Request | Missing email (direct calls) or missing/invalid input (`file` / `cloud_storage_url`). |
| `402` | Payment Required | Insufficient credits for the audio duration. |
| `500` | Internal Error | Internal failure or ElevenLabs Scribe API error. Not charged the full amount. |

## Related

- [Pricing](/docs/pricing) — per-minute credit billing details.
- [Media API](./media-api) — get a public `cdnUrl` to pass as `cloud_storage_url`.
- [Video API](./video-api) · [Image API](./image-api) · [Agent API](./agent-api)
