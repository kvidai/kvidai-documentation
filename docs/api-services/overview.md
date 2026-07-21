---
title: API Services Overview
description: Technical overview of kvidAI API services — Video Generation and Image Generation.
tags: [API, Services, K-pop, K-beauty]
sidebar_position: 1
---

# API Services Overview

> **한국어로 보기**: [API 서비스 개요](/ko/docs/api-services/overview) | **View in English** (current page)

kvidAI exposes a unified HTTPS API at `https://api.kvid.ai`. Every service shares a single credit balance and a single API key issued from the web app.

## Services at a Glance

| Service | Description | Reference |
|---------|-------------|-----------|
| **Video Generation** | Text-to-video, image-to-video, and reference-to-video (`wan` / `seedance` / `veo3.1` models) | [Video API](./video-api) |
| **Image Generation** | Text-to-image and image-to-image (`nano-banana` / `flux` / `sdxl`) | [Image API](./image-api) |
| **Talk-V2V (Lip-Sync)** | Drive an existing video with new audio for localized / re-voiced clips | [Talk-V2V API](./talk-v2v) |
| **Voice (TTS)** | ElevenLabs-based text-to-speech with character-level timing for subtitle sync | [Voice API](./voice-api) |
| **Speech-to-Text** | ElevenLabs Scribe transcription (words + timestamps) from a file or CDN URL | [Speech-to-Text API](./speech-to-text) |
| **AI Edit** | Media summary (STT + LLM) and silence-cut, streamed over SSE | [AI Edit API](./ai-edit-api) |
| **Agent (AI Editor)** | Natural-language composition editing and long-video scene planning via SSE | [Agent API](./agent-api) |
| **Project Management** | REST CRUD for video projects + composition mutations | [Project Management API](./project-management) |
| **Preset** | Reusable presets (voice / tone / color / scene defaults) that seed new projects | [Preset API](./preset-api) |
| **Media** | Direct CDN upload via presigned URL — pass `cdnUrl` to the agent without round-tripping the binary through the server | [Media API](./media-api) |

## Getting Started

### 1. Sign up and buy credits

Everything happens in one place:

1. Create an account at [kvid.ai](https://kvid.ai) (email verification required).
2. Buy credits at [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase).

### 2. Create an API key

Go to [kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys) and create a new API subscription. You will receive a **primary** and **secondary** key; either can be used with the API.

### 3. Make your first call

```bash
curl -X POST "https://api.kvid.ai/ai/generation/text-to-image/generate-async" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "YOUR_PRODUCT_ID",
    "prompt": "K-pop concert stage with colorful lights",
    "model": "nano-banana"
  }'
```

The call returns a `job_id`. Poll `GET /ai/generation/status?jobId={id}` until `status: "completed"`, then fetch the result with `GET /ai/generation/result?jobId={id}`. See the [Image API reference](./image-api) for details.

> **Identifying the credit pool** — the AI generation endpoints (image / video / talk-v2v / voice) require **one of** `product_id`, `product_code`, or `email` in the request body so the platform knows which credit balance to charge. The platform endpoints (Preset, Media, Project, Agent, AI Edit) don't need this — the `api-key` header alone identifies you.

## Pricing

All services are priced on the shared credit balance. See [Pricing](/docs/pricing) for the current rates.

## K-pop & K-beauty Specialization

- **Video**: optimized prompting for idol choreography, stage camera angles, and Korean cultural contexts
- **Image**: K-beauty makeup and Korean fashion styling baked into model tuning

## Support

- Discord: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)
- Email: support@kvid.ai
