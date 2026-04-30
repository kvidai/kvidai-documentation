---
title: Video Generation AI API
description: kvidAI Video Generation API usage guide and technical specifications. Create professional videos from text prompts or images, specialized for K-pop and K-beauty content creation.
keywords: [video generation API, AI video, text to video, image to video, K-pop video AI, K-beauty video AI, kvidAI video API, video synthesis]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: video-api
tags: [API, Video, AI, Generation]
sidebar_position: 2
---

# Video Generation AI API

> **한국어로 보기**: [Video 생성 AI API](/docs/ko/api-services/video-api) | **View in English** (current page)

kvidAI's Video Generation AI API creates high-quality short videos from text or images, specializing in K-pop and K-beauty content.

## 🎯 Service Overview

### Supported Features
- **Text-to-Video**: Generate videos from text prompts
- **Image-to-Video**: Create videos based on input images
- **Resolution**: 480p / 720p / 1080p (model-dependent)
- **Duration**: typically 5–10 seconds (model-dependent)

### Specialized Capabilities
- Camera angle manipulation prompts (may not be perfect)
- Various generation options and controls
- K-pop dance and K-beauty content optimization

## 📡 API Endpoints

### Basic Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

The Video Generation API is **asynchronous** — first POST a generation request to get a `job_id`, then poll the status endpoint until the job completes, and finally fetch the result.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ai/generation/text-to-video/generate-async` | Submit text-to-video job |
| `POST` | `/ai/generation/image-to-video/generate-async` | Submit image-to-video job |
| `GET`  | `/ai/generation/status?jobId={job_id}` | Check job status |
| `GET`  | `/ai/generation/result?jobId={job_id}` | Fetch completed result |

> The `api-key` header identifies the user and their subscription. You don't need to include `email` or `product_code` in the request body or query string — the backend resolves both from the API key.

### 1. Create a text-to-video job

**Python Example**

```python
import requests

url = "https://api.kvid.ai/ai/generation/text-to-video/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "prompt": "[Truck left, Pan right] A woman is drinking coffee.",
    "model": "v2",          # v1 / v2 / v3
    "resolution": "720p",   # 480p / 720p / 1080p (model-dependent)
}
headers = {
    "api-key": api_key,
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

Response:

```json
{
  "success": true,
  "data": {
    "job_id": "vid_1777360165746_abc123",
    "status": "queued",
    "message": "Job submitted",
    "estimated_time": "30s",
    "video_type": "text-to-video"
  }
}
```

### 2. Create an image-to-video job

```python
import requests

url = "https://api.kvid.ai/ai/generation/image-to-video/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "prompt": "The tiger briefly pulls back its tongue, blinks, tilts its head slightly.",
    "image_url": "https://your-host.example/tiger.jpg",
    "model": "v2",
    "resolution": "720p",
}
headers = {
    "api-key": api_key,
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

### 3. Check job status

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "vid_1777360165746_abc123"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

Response (in-progress):

```json
{
  "success": true,
  "data": {
    "job_id": "vid_1777360165746_abc123",
    "status": "processing",
    "video_type": "text-to-video",
    "prompt": "[Truck left, Pan right] A woman is drinking coffee.",
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

`status` is one of: `queued`, `processing`, `completed`, `failed`.

### 4. Fetch the completed result

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "vid_1777360165746_abc123"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

Response:

```json
{
  "success": true,
  "data": {
    "job_id": "vid_1777360165746_abc123",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/videos/vid_1777360165746_abc123.mp4",
    "prompt": "[Truck left, Pan right] A woman is drinking coffee.",
    "width": 1280,
    "height": 720,
    "type": "video/mp4",
    "used_credit": 54,
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

## 📋 Schema

### Common request fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | yes | Text prompt guiding generation |
| `model` | string | no | `v1` / `v2` (default) / `v3` |
| `resolution` | string | no | `480p` / `720p` / `1080p` (model-dependent). Default: `720p` |
| `image_url` | string | image-to-video | URL of the input image (HTTPS) |
| `seed` | integer | no | Random seed for reproducibility |
| `num_inference_steps` | integer | no | Sampling steps; higher = better quality, slower |
| `enable_safety_checker` | boolean | no | Defaults to `true` |
| `enable_prompt_expansion` | boolean | no | Lets the backend expand prompt if `true` |

> Model availability per resolution can change. Refer to [Pricing → Video Generation](/docs/pricing#video-generation) for the currently supported combinations.

## 💰 Pricing

Credit costs vary by model and resolution (v1 / v2 / v3). See [Pricing → Video Generation](/docs/pricing#video-generation) for the current rates.

## 🎬 Usage Examples

### 1. Hiker with Backpack Video

![Hiker Backpack](/img/video-api/영상제작_배낭.png)

**Prompt**: A video of a man hiking with a backpack. The bag must be the main subject. Walking slowly

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_배낭.mp4" type="video/mp4" />
  Unable to display the generated video.
</video>

### 2. Vacuum Cleaner Usage Video

![Vacuum Cleaner](/img/video-api/진공청소기.png)

**Prompt**: Video of cleaning with a vacuum cleaner. slow movement. low angle

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_청소기.mp4" type="video/mp4" />
  Unable to display the generated video.
</video>

### 3. Food Promotional Video

![Salmon Dish](/img/video-api/영상_리소스_이미지_연어.png)

**Prompt**: Remove the cooking effect and only add camera movement. highlight the food in Zoom format. promotional video for this food

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_연어회.mp4" type="video/mp4" />
  Unable to display the generated video.
</video>

### 4. Korean Traditional Pavilion Video

![Jeonju Park](/img/video-api/jeonju_park_한국관광공사_169759365517930.jpg)

**Prompt**: A traditional Korean pavilion by a lotus pond, with two small dogs (a white poodle and a brown shiba inu) joyfully running along the wooden walkway.

<video width="100%" controls>
  <source src="/img/video-api/videoGenerateResult_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4" type="video/mp4" />
  Unable to display the generated video.
</video>

### 5. Tiger Image-to-Video Conversion

![Tiger](/img/video-api/호랑이1.jpg)

**Prompt**: The tiger briefly pulls back its tongue, blinks, and tilts its head slightly. [Low-angle close-up shot]

<video width="100%" controls>
  <source src="/img/video-api/The_tiger_briefly_pulls_back_its_tongue_blinks_and_tilts_its_head_slightly_i2v_20250625.mp4" type="video/mp4" />
  Unable to display the generated video.
</video>

## ⚠️ Limitations & Notes

### Technical Limitations
- **Duration**: short clips (5–10 s typical, model-dependent)
- **Resolution**: depends on selected model (see Pricing)
- **Camera Angles**: camera angle manipulation prompts may not always work accurately

### Optimization Tips
- **Specific Prompts**: provide detailed, clear descriptions
- **Camera Angles**: use directives like `[Low-angle]`, `[Over-the-shoulder shot]` when needed
- **Appropriate Resolution**: match resolution to your delivery channel

## 🔗 Related Links

- [Create an API key](https://kvid.ai/settings/api-keys)
- [Buy credits](https://kvid.ai/credits/purchase)
- [Pricing](/docs/pricing#video-generation)

## 📞 Support & Contact

For questions or assistance:

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/docs/ko/api-services/video-api)
