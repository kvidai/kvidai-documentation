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

## Endpoint

```
Base URL:       https://api.kvid.ai
Authentication: API-KEY header
Content-Type:   application/json
```

### 1. Create a generation task

```http
POST /ai/image/generate
```

**Request**

```json
{
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
  "task_id": "img_abc123def456",
  "status": "pending",
  "estimated_time": 30
}
```

### 2. Check task status

```http
GET /ai/image/status/{task_id}
```

**Response**

```json
{
  "task_id": "img_abc123def456",
  "status": "completed",
  "progress": 100,
  "result": {
    "images": [
      {
        "url": "https://cdn.kvid.ai/images/abc123_1.jpg",
        "width": 1024,
        "height": 1024,
        "seed": 12345
      }
    ]
  }
}
```

Possible `status` values: `pending`, `running`, `completed`, `failed`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | yes | Positive prompt |
| `negative_prompt` | string | no | Things to avoid |
| `image_size.width` / `image_size.height` | integer | no | 256–1024 (multiples of 64 recommended) |
| `num_inference_steps` | integer | no | 20 / 30 / 40 / 50 — higher = better quality, slower |
| `guidance_scale` | float | no | 3 / 5 / 7.5 / 10 — prompt adherence strength |
| `seed` | integer | no | Reproducibility |
| `enable_safety_checker` | boolean | no | Defaults to true |

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
