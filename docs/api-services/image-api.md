---
title: Image Generation AI API
description: kvidAI Image Generation API — Nano Banana based image generation with K-pop and K-beauty tuning.
slug: image-api
tags: [API, Image, AI, Generation, Nano Banana]
sidebar_position: 3
---

# Image Generation AI API

> **한국어**: [Image 생성 AI API](/docs/ko/api-services/image-api)

The Image Generation API generates high-quality still images from text prompts, built on the Nano Banana model with K-pop and K-beauty prompt optimization.

## Overview

- **Text-to-Image** with the Nano Banana model
- **K-content tuning**: K-pop concept, stage outfits, K-beauty makeup / skincare, Korean streetwear
- **Resolution**: up to **1024 × 1024**

## Endpoints

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

The Image Generation API is **asynchronous** — submit a job, poll the unified status endpoint, then fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/text-to-image/generate-async` | Submit a text-to-image job |
| `POST` | `/ai/generation/image-to-image/generate-async` | Submit an image edit / image-to-image job |
| `GET`  | `/ai/generation/status?jobId={job_id}&email={email}` | Check job status |
| `GET`  | `/ai/generation/result?jobId={job_id}&email={email}` | Fetch completed result |

### 1. Create a text-to-image job

```http
POST https://api.kvid.ai/ai/generation/text-to-image/generate-async
api-key: YOUR_API_KEY
Content-Type: application/json

{
  "email": "you@example.com",
  "product_code": "image-text-to-image",
  "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
  "negative_prompt": "blurry, low quality, distorted",
  "image_size": { "width": 1024, "height": 1024 },
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "enable_safety_checker": true
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1777360165746_2f4ye58gq",
    "status": "queued",
    "message": "Job submitted",
    "estimated_time": "10s",
    "image_type": "text-to-image"
  }
}
```

### 2. Check job status

```http
GET https://api.kvid.ai/ai/generation/status?jobId=img_1777360165746_2f4ye58gq&email=you@example.com
api-key: YOUR_API_KEY
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1777360165746_2f4ye58gq",
    "status": "processing",
    "image_type": "text-to-image",
    "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

`status` is one of: `queued`, `processing`, `completed`, `failed`.

### 3. Fetch the completed result

```http
GET https://api.kvid.ai/ai/generation/result?jobId=img_1777360165746_2f4ye58gq&email=you@example.com
api-key: YOUR_API_KEY
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1777360165746_2f4ye58gq",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/images/img_1777360165746_2f4ye58gq.jpg",
    "width": 1024,
    "height": 1024,
    "size": 524288,
    "type": "image/jpeg",
    "used_credit": 8,
    "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | yes | Account email — used for job ownership and credit accounting |
| `product_code` | string | yes | `image-text-to-image` or `image-image-to-image` |
| `prompt` | string | yes | Positive prompt |
| `negative_prompt` | string | no | Things to avoid |
| `image_size.width` / `image_size.height` | integer | no | 256–1024 (multiples of 64 recommended) |
| `aspect_ratio` | string | no | e.g. `1:1`, `16:9`, `9:16` (alternative to `image_size`) |
| `num_inference_steps` | integer | no | 20 / 30 / 40 / 50 — higher = better quality, slower |
| `guidance_scale` | float | no | 3 / 5 / 7.5 / 10 — prompt adherence strength |
| `seed` | integer | no | Reproducibility |
| `num_images` | integer | no | How many images to generate in one job |
| `output_format` | string | no | `jpeg` (default) / `png` |
| `image_url` / `image_urls` | string / string[] | image-to-image | Source image(s) for editing |
| `enable_safety_checker` | boolean | no | Defaults to `true` |

## Error handling

Common errors:

| Code | Meaning | HTTP | Notes |
|------|---------|------|-------|
| `INVALID_PROMPT` | Prompt empty/invalid | 400 | Check prompt |
| `INSUFFICIENT_CREDITS` | Out of credits | 402 | [Top up](https://kvid.ai/credits/purchase) |
| `SAFETY_CHECK_FAILED` | Prompt rejected by safety filter | 422 | Refine prompt |
| `RATE_LIMITED` | Too many requests | 429 | Back off |
| `SERVER_ERROR` | Internal | 500+ | Retry, contact support |

## Prompting tips

- Use **style keywords**: `photography`, `digital art`, `cinematic`, `pastel`, `studio lighting`.
- Use a **strong negative prompt** to suppress artifacts (`blurry, low quality, extra limbs, distorted hands`).
- For K-pop / K-beauty work, anchor on concept vocabulary: `idol stage outfit`, `glass skin makeup`, `streetwear lookbook`.

## Pricing

See [Pricing → Image Generation](/docs/pricing#image-generation) for the current per-megapixel rate and bulk discounts.

## Related

- [API key issuance](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Gallery samples](https://kvid.ai/gallery)

## Support

- Email: support@kvid.ai
- Discord: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)
