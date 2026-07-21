---
title: Voice (TTS) API
description: kvidAI Voice (Text-to-Speech) API — ElevenLabs-based speech synthesis with character-level alignment for subtitle sync.
keywords: [voice API, text to speech, TTS, ElevenLabs, speech synthesis, kvidAI voice API, subtitle alignment]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: voice-api
tags: [API, Voice, TTS, AI]
sidebar_position: 5
---

# Voice (TTS) API

> **한국어로 보기**: [음성 합성 (TTS) API](/ko/docs/api-services/voice-api) | **View in English** (current page)

The Voice API synthesizes speech from text using an ElevenLabs-based backend. The result includes **character-level `alignment`** (per-character start/end times) so you can sync subtitles precisely to the generated audio.

## 🎯 Service Overview

### Supported Features
- **Text-to-Speech**: generate audio from text with a selectable voice and model
- **Multilingual**: `eleven_multilingual_v2` and other models, with an optional `language_code`
- **Subtitle sync**: `alignment` provides character-level timing in the result

> The voice surface uses its **own** status/result endpoints, separate from the shared image/video polling endpoints.

## 📡 API Endpoints

### Basic Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

The Voice API is **asynchronous** — submit a job, poll the **voice-specific** status endpoint, then fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/voice/text-to-speech/generate-async` | Submit a TTS job |
| `GET`  | `/ai/generation/voice/status?jobId={job_id}` | Check TTS job status |
| `GET`  | `/ai/generation/voice/result?jobId={job_id}` | Fetch completed TTS result |
| `GET`  | `/ai/generation/voice/voices` | List available voices |
| `GET`  | `/ai/generation/voice/models` | List available TTS models |

> **Voice uses its own polling paths.** Unlike image/video jobs (which use `/ai/generation/status` and `/ai/generation/result`), voice jobs poll `/ai/generation/voice/status` and `/ai/generation/voice/result`.
>
> **Authentication & credit identification.** Every request must send the `api-key` header. In addition, the request **requires exactly one of `product_id` / `product_code` / `email` in the request body** to identify the credit pool to charge.
>
> A separate dev routing surface exists (`api.hometip.net` + `/ai/generation-clone/...`); this page documents the **production** paths on `api.kvid.ai`.

### 1. Submit a text-to-speech job

```python
import requests

url = "https://api.kvid.ai/ai/generation/voice/text-to-speech/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "product_code": "pdt_XXXXXXXXXXXX",   # or product_id / email — required
    "text": "안녕하세요. 프로덕션 환경에서 TTS API 테스트 중입니다.",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "language_code": "ko",
    "output_format": "mp3_44100_128",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0,
        "speed": 1.0,
        "use_speaker_boost": True
    },
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
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "queued",
    "message": "Voice generation job queued.",
    "estimated_time": "10s-1min",
    "voice_type": "text-to-speech"
  }
}
```

### 2. Check job status

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "voice_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/voice/status?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "processing",
    "voice_type": "text-to-speech",
    "created_at": "2026-06-19T12:34:56.000Z",
    "text": "안녕하세요. 프로덕션 환경에서...",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "progress": 75,
    "result_url": null,
    "duration_seconds": null,
    "error_message": null
  }
}
```

`status` is one of: `pending`, `processing`, `completed`, `failed`.

### 3. Fetch the completed result

The result includes the audio `result_url` plus character-level `alignment` for subtitle sync.

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "voice_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/voice/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/tts/tts.mp3",
    "duration_seconds": 12.5,
    "created_at": "2026-06-19T12:34:56.000Z",
    "text": "안녕하세요...",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "alignment": {
      "characters": ["안", "녕", "하", "세", "요"],
      "start_times": [0.0, 0.12, 0.25, 0.38, 0.5],
      "end_times": [0.12, 0.25, 0.38, 0.5, 0.62]
    }
  }
}
```

### 4. List voices and models

```http
GET https://api.kvid.ai/ai/generation/voice/voices
api-key: YOUR_API_KEY
```

```http
GET https://api.kvid.ai/ai/generation/voice/models
api-key: YOUR_API_KEY
```

Use `/ai/generation/voice/voices` to discover valid `voice_id` values and `/ai/generation/voice/models` to discover valid `model_id` values.

## 📋 Schema

### Request fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `product_code` / `product_id` / `email` | string | ✅ (one of) | – | Identifies the credit pool to charge |
| `text` | string | ✅ | – | Text to synthesize (max 5000 characters) |
| `voice_id` | string | – | `pNInz6obpgDQGcFmaJgB` (Adam) | ElevenLabs voice ID. List: `GET /ai/generation/voice/voices` |
| `model_id` | string | – | `eleven_multilingual_v2` | TTS model (`eleven_multilingual_v2`, `eleven_turbo_v2_5`, …). List: `GET /ai/generation/voice/models` |
| `language_code` | string | – | – | Target language (`ko`, `en`, `es`, …) |
| `output_format` | string | – | `mp3_44100_128` | Audio format |
| `voice_settings` | object | – | – | Voice customization (below) |
| `voice_settings.stability` | number | – | – | Stability (0–1) |
| `voice_settings.similarity_boost` | number | – | – | Similarity (0–1) |
| `voice_settings.style` | number | – | – | Style strength (0–1) |
| `voice_settings.speed` | number | – | – | Speed multiplier |
| `voice_settings.use_speaker_boost` | boolean | – | – | Speaker boost |
| `seed` | integer | – | random | Reproducibility |

### Result fields

| Field | Type | Description |
|-------|------|-------------|
| `result_url` | string | Public CDN URL of the mp3 |
| `duration_seconds` | number | Audio length in seconds |
| `alignment` | object | Per-character `start_times` / `end_times` (seconds), for subtitle sync |

> Model availability and exact per-model params — see [Pricing](/docs/pricing) and model docs.

## ⚠️ Errors

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_PARAMETERS` | 400 | Missing `text` or over 5000 characters |
| `INSUFFICIENT_CREDIT` | 402 | Not enough credits |
| `JOB_NOT_FOUND` | 404 | `jobId` not found — result endpoint |
| `JOB_NOT_COMPLETED` | 400 | Status is still `pending`/`processing` — result endpoint |

## 🔗 Related Links

- [Create an API key](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Pricing](/docs/pricing)
- [Video Generation API](./video-api)
- [Talk-V2V (Lip-Sync) API](./talk-v2v)

## 📞 Support & Contact

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/ko/docs/api-services/voice-api)
