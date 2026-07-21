---
title: Image Generation AI API
description: kvidAI Image Generation API — text-to-image and image-to-image generation with K-pop and K-beauty tuning.
keywords: [image generation API, AI image, text to image, image to image, image editing API, nano banana, kvidAI image API]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: image-api
tags: [API, Image, AI, Generation]
sidebar_position: 3
---

# Image Generation AI API

> **한국어로 보기**: [Image 생성 AI API](/ko/docs/api-services/image-api) | **View in English** (current page)

kvidAI's Image Generation API generates high-quality still images from text prompts and edits existing images, with K-pop and K-beauty prompt optimization.

## 🎯 Service Overview

### Supported Features
- **Text-to-Image**: generate images from text prompts (`txt2img`)
- **Image-to-Image**: edit an existing image with a prompt (`img2img`)
- **K-content tuning**: K-pop concept, stage outfits, K-beauty makeup / skincare, Korean streetwear

## 📡 API Endpoints

### Basic Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

The Image Generation API is **asynchronous** — submit a job, poll the shared status endpoint, then fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/text-to-image/generate-async` | Submit a text-to-image job |
| `POST` | `/ai/generation/image-to-image/generate-async` | Submit an image edit / image-to-image job |
| `GET`  | `/ai/generation/status?jobId={job_id}` | Check job status (shared endpoint) |
| `GET`  | `/ai/generation/result?jobId={job_id}` | Fetch completed result (shared endpoint) |

> **Authentication & credit identification.** Every request must send the `api-key` header. In addition, the AI-generation endpoints **require exactly one of `product_id` / `product_code` / `email` in the request body** to identify the credit pool to charge. Include one of them in every generate request.
>
> A separate dev routing surface exists (`api.hometip.net` + `/ai/generation-clone/...`); this page documents the **production** paths on `api.kvid.ai`.

### 1. Create a text-to-image job

```http
POST https://api.kvid.ai/ai/generation/text-to-image/generate-async
api-key: YOUR_API_KEY
Content-Type: application/json

{
  "product_id": "pdt_XXXXXXXXXXXX",
  "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
  "model": "nano-banana",
  "function": "txt2img",
  "image_size": "portrait_4_3",
  "num_inference_steps": 25,
  "guidance_scale": 3.0,
  "num_images": 1,
  "enable_safety_checker": true,
  "seed": 5834
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1764225237210_1zxvh4sgm",
    "status": "queued",
    "message": "Image generation started",
    "estimated_time": "10-20s",
    "image_type": "text-to-image"
  }
}
```

### 2. Create an image-to-image (edit) job

Edit one or more source images with a prompt. Uses the nano-banana edit family.

```http
POST https://api.kvid.ai/ai/generation/image-to-image/generate-async
api-key: YOUR_API_KEY
Content-Type: application/json

{
  "product_id": "pdt_XXXXXXXXXXXX",
  "prompt": "make the sky a dramatic sunset, keep the subject unchanged",
  "model": "nano-banana",
  "function": "img2img",
  "image_urls": ["https://your-host.example/source.png"],
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png",
  "sync_mode": false
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1768540311147_4mcdv65c7",
    "status": "queued",
    "message": "Image generation started",
    "estimated_time": "10-20s",
    "image_type": "image-to-image"
  }
}
```

### 3. Check job status

```http
GET https://api.kvid.ai/ai/generation/status?jobId=img_1764225237210_1zxvh4sgm
api-key: YOUR_API_KEY
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1764225237210_1zxvh4sgm",
    "status": "processing",
    "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
    "result_url": null,
    "error_message": null
  }
}
```

`status` is one of: `queued`, `processing`, `completed`, `failed`, `canceled`. Recommended polling interval for image jobs: **3–5 seconds**.

### 4. Fetch the completed result

```http
GET https://api.kvid.ai/ai/generation/result?jobId=img_1764225237210_1zxvh4sgm
api-key: YOUR_API_KEY
```

**Response**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1764225237210_1zxvh4sgm",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/images/img_1764225237210_1zxvh4sgm.png",
    "created_at": "2026-05-27T09:00:00.000Z",
    "prompt": "K-pop idol wearing a colorful stage outfit, professional photography",
    "width": 768,
    "height": 1024,
    "size": 524288,
    "file_size": 524288,
    "type": "text-to-image",
    "used_credit": 6
  }
}
```

## 📋 Schema

### Common request fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` / `product_code` / `email` | string | ✅ (one of) | Identifies the credit pool to charge |
| `prompt` | string | ✅ | Positive prompt |
| `model` | string | – | Model identifier (`nano-banana`, `flux`, `sdxl`, …) |
| `function` | string | – | `txt2img` / `img2img` (matches the endpoint) |
| `negative_prompt` | string | – | Things to avoid (`"blurry, low quality"`) |
| `image_size` | string \| object | – | Preset name or `{ width, height }` object. Default: `square` |
| `aspect_ratio` | string | – | Ratio hint when using a preset (`"4:3"`, `"16:9"`) or output ratio for edits |
| `num_inference_steps` | integer | – | 10–50; higher = better quality, slower. Default: `25` |
| `guidance_scale` | number | – | 1.0–10.0; prompt adherence strength. Default: `3.0` |
| `num_images` | integer | – | Images to generate per job (1–4). Default: `1` |
| `output_format` | string | – | `png` (default) / `jpeg` / `webp` |
| `sync_mode` | boolean | – | `true` for synchronous (small jobs only; not recommended). Default: `false` |
| `acceleration` | string | – | `regular` / `high` priority processing |
| `enable_safety_checker` | boolean | – | NSFW filter. Default: `true` (`false` is enterprise-only) |
| `seed` | integer | – | Random seed for reproducibility |

### Image-to-Image specific

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_urls` / `image_url` | string[] \| string | ✅ | Source image(s) to edit. Array (`image_urls`) recommended; single (`image_url`) accepted |

### `image_size` presets

`square`, `square_hd`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`, or a custom `{ "width": <int>, "height": <int> }` object.

> Model availability and exact per-model params — see [Pricing](/docs/pricing) and model docs.

## ⚠️ Error handling

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_PARAMETERS` / `INVALID_PARAMETERS` | 400 | Missing prompt/image or invalid `image_size` |
| `INSUFFICIENT_CREDIT` | 402 | Not enough credits |
| — | 403 | `api-key` invalid |
| `JOB_NOT_FOUND` | 404 | `jobId` not found (or not owned by caller) — result endpoint |
| `JOB_NOT_COMPLETED` | 400 | Status is still `queued`/`processing` — result endpoint |
| `JOB_FAILED` | 400 | Status is `failed`; see `error_message` from the status endpoint |

## 💡 Prompting tips

- Use **style keywords**: `photography`, `digital art`, `cinematic`, `pastel`, `studio lighting`.
- Use a **strong negative prompt** to suppress artifacts (`blurry, low quality, extra limbs, distorted hands`).
- For K-pop / K-beauty work, anchor on concept vocabulary: `idol stage outfit`, `glass skin makeup`, `streetwear lookbook`.

## 🔗 Related Links

- [Create an API key](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Pricing](/docs/pricing)
- [Video Generation API](./video-api)

## 📞 Support & Contact

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/ko/docs/api-services/image-api)
