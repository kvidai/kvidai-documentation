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

> **한국어로 보기**: [Talk-V2V (립싱크) API](/docs/ko/api-services/talk-v2v) | **View in English** (current page)

The Talk-V2V API takes an existing **video** and a separate **audio file**, then drives the speaker's mouth and motion in the video to match the audio — producing a lip-synced video.

## 🎯 Service Overview

### Supported Features
- **Video-to-Video lip sync**: drive an input video with new audio
- **Resolution**: 480p / 720p
- **Aspect handling**: stretch / crop / pad to fit target aspect ratio

### Typical Use Cases
- K-pop idol localization (re-voice an existing performance video)
- K-beauty product reviews with new narration
- Multi-language video reuse from a single source clip

## 📡 API Endpoints

### Basic Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

Talk-V2V is **asynchronous** — submit a job to receive a `job_id`, poll the unified status endpoint, then fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/talk-v2v/generate-async` | Submit a Talk-V2V job |
| `GET`  | `/ai/generation/status?jobId={job_id}&email={email}` | Check job status |
| `GET`  | `/ai/generation/result?jobId={job_id}&email={email}` | Fetch completed result |

### 1. Submit a Talk-V2V job

```python
import requests

url = "https://api.kvid.ai/ai/generation/talk-v2v/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "email": "you@example.com",
    "product_code": "YOUR_PRODUCT_CODE",
    "input_video": "https://your-host.example/source.mp4",
    "audio_file": "https://your-host.example/voice.mp3",
    "resolution": "720p",
    "image_size": { "width": 1280, "height": 720 },
    "keep_proportion": "crop",
    "frame_rate": 30,
    "audio_duration": 8.5
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
    "job_id": "tlk_1777360165746_xyz789",
    "request_id": "req_abc",
    "status": "queued",
    "message": "Job submitted",
    "estimated_time": "60s",
    "credit_cost": 80
  }
}
```

### 2. Check job status

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "tlk_1777360165746_xyz789"
email = "you@example.com"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}&email={email}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

`status` is one of: `queued`, `processing`, `completed`, `failed`.

### 3. Fetch the completed result

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "tlk_1777360165746_xyz789"
email = "you@example.com"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}&email={email}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "tlk_1777360165746_xyz789",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/videos/tlk_1777360165746_xyz789.mp4",
    "width": 1280,
    "height": 720,
    "type": "video/mp4",
    "used_credit": 80,
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

## 📋 Schema

### Request fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Account email — used for job ownership and credit accounting |
| `product_code` | string | ✅ | Your API subscription product code (from [API keys page](https://kvid.ai/settings/api-keys)) |
| `input_video` | string (URL) | ✅ | HTTPS URL of the source video |
| `audio_file` | string (URL) | ✅ | HTTPS URL of the audio that should drive the lip sync |
| `prompt` | string | – | Optional text prompt to guide style |
| `negative_prompt` | string | – | Things to avoid |
| `model` | string | – | Model identifier |
| `function` | string | – | Function identifier |
| `resolution` | string | – | `480p` / `720p` |
| `image_size.width` / `image_size.height` | integer | – | Output dimensions (alternative to `resolution`) |
| `keep_proportion` | string | – | How to handle aspect mismatches: `stretch` / `crop` / `pad` |
| `audio_duration` | float | – | Audio length in seconds — used to bound the output |
| `frame_rate` | integer | – | Output frames per second |
| `max_frames` | integer | – | Hard cap on output frame count |
| `steps` | integer | – | Sampling steps (higher = better quality, slower) |
| `cfg_scale` | float | – | Classifier-free guidance strength |
| `crf` | integer | – | Output video CRF (lower = higher quality, larger file) |
| `seed` | integer | – | Reproducibility |

> The backend converts `width` / `height` shorthand into the `image_size: { width, height }` object automatically when sent through the SDK; in raw HTTP, send `image_size` directly.

## 💰 Pricing

Talk-V2V cost depends on output resolution and duration. See [Pricing → Video Generation](/docs/pricing#video-generation) for the current rates.

## ⚠️ Limitations & Notes

- **Source video**: best results when the speaker's face is clearly visible and roughly front-facing
- **Audio**: clear, single-speaker audio works best
- **Duration**: longer outputs cost proportionally more credits and take longer to render
- **Aspect**: pick `keep_proportion` that matches your downstream use (`crop` for full-bleed, `pad` to preserve full frame)

## 🔗 Related Links

- [Create an API key](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Pricing](/docs/pricing#video-generation)
- [Video Generation API](./video-api) — text-to-video / image-to-video

## 📞 Support & Contact

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/docs/ko/api-services/talk-v2v)
