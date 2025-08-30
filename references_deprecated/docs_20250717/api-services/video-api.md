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

kvidAI's Video Generation AI API creates high-quality 5-6 second videos from text or images, specializing in K-pop and K-beauty content.

## 🎯 Service Overview

### Supported Features
- **Text-to-Video**: Generate videos from text prompts
- **Image-to-Video**: Create videos based on input images
- **Resolution**: 480p, 720p support (default: 720p)
- **Duration**: 5-6 seconds

### Specialized Capabilities
- Camera angle manipulation prompts (may not be perfect)
- Various generation options and controls
- K-pop dance and K-beauty content optimization

## 📡 API Endpoints

### Basic Information
```
Base URL: https://api.kvid.ai/ai-model/videogen-1/v1
Video Generation: https://api.kvid.ai/ai-model/videogen-1/v1/video_generation
Authentication: API-KEY Bearer Token
Content-Type: application/json
```

### 1. Create Video Generation Task

**Python Example**
```python
import requests
import json

url = "https://api.kvid.ai/ai-model/videogen-1/v1/video_generation"
api_key = "YOUR_API_KEY"

payload = json.dumps({
    "model": "text-to-video",
    "prompt": "[Truck left,Pan right]A woman is drinking coffee.",
})
headers = {
    'API-KEY': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)
```

### 2. Query Generation Status

**Python Example**
```python
import requests

api_key = "YOUR_API_KEY"
task_id = "YOUR_TASK_ID"

url = f"https://api.kvid.ai/ai-model/videogen-1/v1/query/video_generation?task_id={task_id}"

headers = {
  'API-KEY': f'Bearer {api_key}',
  'content-type': 'application/json',
}

response = requests.request("GET", url, headers=headers)
print(response.text)
```

### 3. Get Video File Download URL

**Python Example**
```python
import requests

group_id = "your_group_id"  # optional
api_key = "YOUR_API_KEY"
file_id = "YOUR_FILE_ID"

url = f'https://api.kvid.ai/ai-model/videogen-1/v1/files/retrieve?GroupId={group_id}&file_id={file_id}'
headers = {
    'content-type': 'application/json',
    'API-KEY': f'Bearer {api_key}'
}

response = requests.get(url, headers=headers)
print(response.text)
```

## 📋 Schema

### Input Parameters

**`prompt`** `string` *required*

Text prompt to guide video generation.

**`image_url`** `string`

URL of the input image.

**`seed`** `integer`

Random seed for reproducibility. If None, a random seed will be selected.

**`resolution`** `ResolutionEnum`

Resolution of the generated video (480p or 720p). Default: **`"720p"`**

Possible values: **`480p, 720p`**

**`num_inference_steps`** `integer`

Number of inference steps for sampling. Higher values improve quality but take longer. Default: **`30`**

**`enable_safety_checker`** `boolean`

Enable safety checker when set to true.

**`enable_prompt_expansion`** `boolean`

Whether to enable prompt expansion.

**Request Example**
```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "image_url": "https://hometip.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg",
  "resolution": "720p",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true
}
```

### Output

**`video`** `File` *required*

Generated video file.

**`seed`** `integer` *required*

Seed used for generation.

**Response Example**
```json
{
  "video": {
    "url": "https://hometip.media/files/elephant/Nj4jZupkZvR7g0QkNueJZ_video-1740522225.mp4"
  }
}
```

## 💰 Pricing & Credits

### Credit Consumption

"**Unit Price × Usage**" amount of credits will be deducted from your balance.

| Model | Unit Price | Credits (1,446 KRW rate) |
|-------|------------|---------------------------|
| **Text-to-Video** | $0.86 / 5-6sec video | 124.356 credits |
| **Image-to-Video** | $0.86 / 5-6sec video | 124.356 credits |

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
- **Duration**: Fixed at 5-6 seconds
- **Resolution**: Maximum 720p
- **Camera Angles**: Camera angle manipulation prompts may not always work accurately

### Optimization Tips
- **Specific Prompts**: Provide detailed and clear descriptions
- **Camera Angles**: Use directives like [Low-angle], [Over-the-shoulder shot] when needed
- **Appropriate Resolution**: Choose resolution based on your use case

## 🔗 Related Links

- [API Key Issuance](https://developers.kvid.ai)
- [Console Management](https://console.kvid.ai)
- [Usage Monitoring](https://console.kvid.ai/usage)

## 📞 Support & Contact

For questions or assistance:

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)

---

**Language**: **English** (current page) | [한국어](/docs/ko/api-services/video-api)