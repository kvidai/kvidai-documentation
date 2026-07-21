---
title: Image 생성 AI API
description: kvidAI Image 생성 API — 텍스트 기반 이미지 생성 및 이미지 편집. K-pop·K-beauty 튜닝.
slug: image-api
tags: [API, Image, AI, 이미지생성]
sidebar_position: 3
---

# Image 생성 AI API

> **View in English**: [Image Generation AI API](/docs/api-services/image-api) | **한국어로 보기** (현재 페이지)

kvidAI의 Image 생성 API는 텍스트 프롬프트로 고품질 정지 이미지를 생성하고 기존 이미지를 편집합니다. K-pop·K-beauty 프롬프트 최적화가 적용되어 있습니다.

## 🎯 서비스 개요

### 지원 기능
- **Text-to-Image**: 텍스트 프롬프트로 이미지 생성 (`txt2img`)
- **Image-to-Image**: 기존 이미지를 프롬프트로 편집 (`img2img`)
- **K-콘텐츠 튜닝**: K-pop 콘셉트·무대 의상, K-beauty 메이크업/스킨케어, 한국 스트리트웨어

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Image Generation API는 **비동기 방식**입니다. 작업을 제출하고 공용 status 엔드포인트를 폴링한 뒤 result 엔드포인트로 결과를 조회합니다.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/text-to-image/generate-async` | Text-to-Image 작업 제출 |
| `POST` | `/ai/generation/image-to-image/generate-async` | 이미지 편집 / Image-to-Image 작업 제출 |
| `GET`  | `/ai/generation/status?jobId={job_id}` | 작업 상태 조회 (공용 엔드포인트) |
| `GET`  | `/ai/generation/result?jobId={job_id}` | 완료된 결과 조회 (공용 엔드포인트) |

> **인증 및 크레딧 식별.** 모든 요청은 `api-key` 헤더를 보내야 합니다. 추가로 AI 생성 엔드포인트는 차감할 크레딧 풀을 식별하기 위해 **request body에 `product_id` / `product_code` / `email` 중 정확히 하나를 반드시 포함**해야 합니다.
>
> 별도의 개발용 라우팅(`api.hometip.net` + `/ai/generation-clone/...`)이 존재하지만, 이 페이지는 **프로덕션** 경로(`api.kvid.ai`)를 기준으로 설명합니다.

### 1. Text-to-Image 작업 생성

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

**응답**

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

### 2. Image-to-Image (편집) 작업 생성

하나 이상의 원본 이미지를 프롬프트로 편집합니다. nano-banana edit 계열을 사용합니다.

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

**응답**

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

### 3. 작업 상태 조회

```http
GET https://api.kvid.ai/ai/generation/status?jobId=img_1764225237210_1zxvh4sgm
api-key: YOUR_API_KEY
```

**응답**

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

`status` 값: `queued`, `processing`, `completed`, `failed`, `canceled`. 이미지 작업 권장 폴링 간격: **3–5초**.

### 4. 완료된 결과 조회

```http
GET https://api.kvid.ai/ai/generation/result?jobId=img_1764225237210_1zxvh4sgm
api-key: YOUR_API_KEY
```

**응답**

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

## 📋 매개변수 상세

### 공통 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `product_id` / `product_code` / `email` | string | ✅ (셋 중 하나) | 차감할 크레딧 풀 식별 |
| `prompt` | string | ✅ | 긍정 프롬프트 |
| `model` | string | – | 모델 식별자 (`nano-banana`, `flux`, `sdxl` …) |
| `function` | string | – | `txt2img` / `img2img` (엔드포인트에 대응) |
| `negative_prompt` | string | – | 제외할 요소 (`"blurry, low quality"`) |
| `image_size` | string \| object | – | preset 이름 또는 `{ width, height }` object. 기본 `square` |
| `aspect_ratio` | string | – | preset 사용 시 비율 hint (`"4:3"`, `"16:9"`) 또는 편집 출력 비율 |
| `num_inference_steps` | integer | – | 10~50; 높을수록 품질↑, 속도↓. 기본 `25` |
| `guidance_scale` | number | – | 1.0~10.0; 프롬프트 충실도. 기본 `3.0` |
| `num_images` | integer | – | 작업당 생성할 이미지 수 (1~4). 기본 `1` |
| `output_format` | string | – | `png` (기본) / `jpeg` / `webp` |
| `sync_mode` | boolean | – | `true` 면 동기 (작은 작업 한정, 권장 안 함). 기본 `false` |
| `acceleration` | string | – | `regular` / `high` 우선순위 처리 |
| `enable_safety_checker` | boolean | – | NSFW 필터. 기본 `true` (`false` 는 enterprise 만) |
| `seed` | integer | – | 재현성을 위한 시드값 |

### Image-to-Image 추가 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `image_urls` / `image_url` | string[] \| string | ✅ | 편집할 원본 이미지. 배열(`image_urls`) 권장, 단일(`image_url`) 도 허용 |

### `image_size` preset

`square`, `square_hd`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`, 또는 커스텀 `{ "width": <int>, "height": <int> }` object.

> 모델 지원 및 정확한 모델별 매개변수 — [요금 안내](/ko/docs/pricing) 및 모델 문서 참조.

## ⚠️ 오류 응답

| 오류 코드 | HTTP | 설명 |
|-----------|------|------|
| `MISSING_PARAMETERS` / `INVALID_PARAMETERS` | 400 | prompt/image 누락 또는 잘못된 `image_size` |
| `INSUFFICIENT_CREDIT` | 402 | 크레딧 부족 |
| — | 403 | `api-key` invalid |
| `JOB_NOT_FOUND` | 404 | `jobId` 없음 (또는 자기 소유 아님) — result 엔드포인트 |
| `JOB_NOT_COMPLETED` | 400 | status 가 아직 `queued`/`processing` — result 엔드포인트 |
| `JOB_FAILED` | 400 | status 가 `failed`; status 엔드포인트의 `error_message` 참조 |

## 💡 프롬프트 팁

- **스타일 키워드** 활용: `photography`, `digital art`, `cinematic`, `pastel`, `studio lighting`.
- **강한 negative prompt** 로 아티팩트 억제 (`blurry, low quality, extra limbs, distorted hands`).
- K-pop / K-beauty 작업은 콘셉트 어휘에 앵커: `idol stage outfit`, `glass skin makeup`, `streetwear lookbook`.

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [요금 안내](/ko/docs/pricing)
- [Video 생성 AI API](./video-api)

## 📞 지원 및 문의

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)

---

**언어**: [English](/docs/api-services/image-api) | **한국어** (현재 페이지)
