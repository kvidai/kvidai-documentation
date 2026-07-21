---
title: Talk V2V (Lip-Sync) API
description: kvidAI Talk-V2V API — drive an existing video with new audio so the speaker's lips and motion sync to the audio. Optimized for K-pop and K-beauty content.
keywords: [talk v2v, lip sync video, video to video, audio driven video, kvidAI talk api]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: talk-v2v
tags: [API, Video, AI, Generation, Talk-V2V, Lip-Sync]
sidebar_position: 4
---

# Talk-V2V (Lip-Sync) API

> **한국어로 보기**: [Talk-V2V (립싱크) API](/ko/docs/api-services/talk-v2v) | **View in English** (current page)

The Talk-V2V API takes an existing **video** and a separate **audio file**, then drives the speaker's mouth and motion in the video to match the audio — producing a lip-synced video.

## 🎯 Service Overview

### Supported Features
- **Video-to-Video lip sync**: drive an input video with new audio (`talk_v2v`)
- **Resolution**: 720p (default)
- **Aspect handling**: `keep_proportion` controls how the output fits the target frame

### Typical Use Cases
- K-pop idol localization (re-voice an existing performance video)
- K-beauty product reviews with new narration
- Multi-language video reuse from a single source clip

> Talk-V2V is processed on self-hosted GPU servers only.

## 📡 API Endpoints

### Basic Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

Talk-V2V is **asynchronous** — submit a job to receive a `job_id`, poll the shared status endpoint, then fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/talk-v2v/generate-async` | Submit a Talk-V2V job |
| `GET`  | `/ai/generation/status?jobId={job_id}` | Check job status (shared endpoint) |
| `GET`  | `/ai/generation/result?jobId={job_id}` | Fetch completed result (shared endpoint) |

> **Authentication & credit identification.** Every request must send the `api-key` header. In addition, the AI-generation endpoints **require exactly one of `product_id` / `product_code` / `email` in the request body** to identify the credit pool to charge. Include one of them in every generate request.
>
> A separate dev routing surface exists (`api.hometip.net` + `/ai/generation-clone/...`); this page documents the **production** paths on `api.kvid.ai`.

### 1. Submit a Talk-V2V job

```python
import requests

url = "https://api.kvid.ai/ai/generation/talk-v2v/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "product_id": "pdt_XXXXXXXXXXXX",   # or product_code / email — required
    "input_video": "https://your-host.example/source.mp4",
    "audio_file": "https://your-host.example/voice.mp3",
    "prompt": "a woman is singing a lullaby",
    "model": "talk",
    "function": "talk_v2v",
    "resolution": "720p",
    "max_frames": 500,
    "steps": 6,
    "cfg_scale": 1,
    "frame_rate": 25,
    "crf": 19,
    "keep_proportion": "stretch",
    "seed": 5834
}
headers = {
    "api-key": api_key,
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "job_1768540311147_4mcdv65c7",
    "status": "queued",
    "message": "Video generation job queued.",
    "estimated_time": "2-5min",
    "video_type": "talk-v2v"
  }
}
```

### 2. Check job status

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "job_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

`status` is one of: `queued`, `processing`, `completed`, `failed`, `canceled`. Recommended polling interval for Talk-V2V: **15–30 seconds**.

### 3. Fetch the completed result

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "job_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "job_1768540311147_4mcdv65c7",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/videos/job_1768540311147_4mcdv65c7.mp4",
    "created_at": "2026-05-27T09:00:00.000Z",
    "width": 1280,
    "height": 720,
    "size": 5242880,
    "file_size": 5242880,
    "type": "talk-v2v",
    "used_credit": 80
  }
}
```

## 📋 Schema

### Request fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `product_id` / `product_code` / `email` | string | ✅ (one of) | – | Identifies the credit pool to charge |
| `input_video` | string (URL) | ✅ | – | HTTPS URL of the source video |
| `audio_file` | string (URL) | ✅ | – | HTTPS URL of the audio that drives the lip sync |
| `prompt` | string | – | `""` | Optional text prompt to guide style |
| `negative_prompt` | string | – | `""` | Things to avoid |
| `model` | string | – | `talk` | Model identifier |
| `function` | string | – | `talk_v2v` | Function identifier |
| `resolution` | string | – | `720p` | Output resolution |
| `image_size` | object | – | – | `{ width, height }` (or `width` / `height` directly) |
| `max_frames` | integer | – | `500` | Hard cap on output frame count |
| `steps` | integer | – | `6` | Sampling steps |
| `cfg_scale` | number | – | `1` | Classifier-free guidance strength |
| `frame_rate` | integer | – | `25` | Output frames per second |
| `crf` | integer | – | `19` | Encode quality (0–51, lower = higher quality) |
| `keep_proportion` | string | – | `stretch` | How to handle aspect mismatches |
| `audio_duration` | number | – | – | Audio length in seconds — hint for credit calculation |
| `seed` | integer | – | random | Reproducibility |

> Model availability and exact per-model params — see [Pricing](/docs/pricing) and model docs.

## ⚠️ Errors

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_PARAMETERS` | 400 | Missing `input_video` / `audio_file` |
| `INSUFFICIENT_CREDIT` | 402 | Not enough credits |
| `CONCURRENT_LIMIT` | 429 | Too many concurrent jobs |
| `JOB_NOT_FOUND` | 404 | `jobId` not found (or not owned by caller) — result endpoint |
| `JOB_NOT_COMPLETED` | 400 | Status is still `queued`/`processing` — result endpoint |
| `JOB_FAILED` | 400 | Status is `failed`; see `error_message` from the status endpoint |

## ⚠️ Limitations & Notes

- **Source video**: best results when the speaker's face is clearly visible and roughly front-facing
- **Audio**: clear, single-speaker audio works best
- **Duration**: longer outputs cost proportionally more credits and take longer to render

## 🔗 Related Links

- [Create an API key](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Pricing](/docs/pricing)
- [Video Generation API](./video-api) — text-to-video / image-to-video / reference-to-video
- [Voice (TTS) API](./voice-api)

## 📞 Support & Contact

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/ko/docs/api-services/talk-v2v)
