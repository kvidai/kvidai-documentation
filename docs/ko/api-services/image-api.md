---
title: Image 생성 AI API
description: kvidAI Image 생성 API 사용 가이드 및 기술 명세
slug: image-api
tags: [API, Image, AI, 이미지생성, Nano Banana]
---

# Image 생성 AI API

kvidAI의 Image 생성 AI API는 Nano Banana 모델을 기반으로 한 고품질 이미지 생성 서비스입니다. K-pop과 K-뷰티에 특화된 프롬프트 최적화를 제공합니다.

## 🎯 서비스 개요

### 핵심 기능
- **Text-to-Image**: 텍스트 프롬프트로 이미지 생성
- **Image-to-Image**: 입력 이미지를 기반으로 한 편집·변형
- **Nano Banana**: 기본 이미지 생성 모델
- **K-컨텐츠 특화**: K-pop, K-뷰티 최적화
- **고해상도**: 최대 1024×1024 지원

### 특화 영역
- **K-pop 스타일**: 아이돌 컨셉, 무대 의상, 앨범 커버
- **K-뷰티**: 메이크업 룩, 스킨케어, 제품 이미지
- **패션**: 한국 트렌드, 스트릿 패션
- **라이프스타일**: 카페, 인테리어, 일상

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Image Generation API는 **비동기 방식**입니다. 작업을 제출 → 통합 status 엔드포인트로 폴링 → result 엔드포인트로 결과 조회.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/text-to-image/generate-async` | Text-to-Image 작업 제출 |
| `POST` | `/ai/generation/image-to-image/generate-async` | Image-to-Image (편집) 작업 제출 |
| `GET`  | `/ai/generation/status?jobId={job_id}` | 작업 상태 조회 |
| `GET`  | `/ai/generation/result?jobId={job_id}` | 완료된 결과 조회 |

> `api-key` 헤더로 사용자와 구독 정보가 식별되므로 request body나 query string에 `email`·`product_code`를 따로 보낼 필요가 없습니다. 백엔드가 API 키로부터 두 값을 모두 해석합니다.

### 1. Text-to-Image 작업 생성

```http
POST https://api.kvid.ai/ai/generation/text-to-image/generate-async
api-key: YOUR_API_KEY
Content-Type: application/json

{
  "prompt": "K-pop idol wearing colorful stage outfit, professional photography",
  "negative_prompt": "blurry, low quality, distorted",
  "image_size": { "width": 1024, "height": 1024 },
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "enable_safety_checker": true
}
```

**응답**

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

### 2. 작업 상태 확인

```http
GET https://api.kvid.ai/ai/generation/status?jobId=img_1777360165746_2f4ye58gq
api-key: YOUR_API_KEY
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "img_1777360165746_2f4ye58gq",
    "status": "processing",
    "image_type": "text-to-image",
    "prompt": "K-pop idol wearing colorful stage outfit, professional photography",
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

`status` 값: `queued`, `processing`, `completed`, `failed`.

### 3. 결과 가져오기

```http
GET https://api.kvid.ai/ai/generation/result?jobId=img_1777360165746_2f4ye58gq
api-key: YOUR_API_KEY
```

**응답**

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
    "prompt": "K-pop idol wearing colorful stage outfit, professional photography",
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

## 📋 매개변수 상세

### 공통 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `prompt` | string | ✅ | 이미지 생성 프롬프트 |
| `negative_prompt` | string | – | 제외할 요소 설명 |
| `image_size` | object | – | `{ width, height }` (256–1024, 64의 배수 권장) |
| `aspect_ratio` | string | – | `1:1` / `16:9` / `9:16` 등 (`image_size` 대안) |
| `num_inference_steps` | integer | – | 20 / 30 / 40 / 50 — 클수록 품질↑, 속도↓ |
| `guidance_scale` | float | – | 3 / 5 / 7.5 / 10 — 프롬프트 반영 강도 |
| `seed` | integer | – | 재현성을 위한 시드값 |
| `num_images` | integer | – | 한 작업에서 생성할 이미지 수 |
| `output_format` | string | – | `jpeg` (기본) / `png` |
| `enable_safety_checker` | boolean | – | 안전 필터, 기본 `true` |

### Image-to-Image 추가 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `image_url` 또는 `image_urls` | string / string[] | ✅ | 입력 이미지 URL(들) (HTTPS) |
| `model` | string | – | 모델 식별자 |
| `function` | string | – | 편집 기능 식별자 |

### 지원 해상도 예

| 크기 | 비율 | 용도 |
|------|------|------|
| 512×512 | 1:1 | SNS 프로필, 아이콘 |
| 768×768 | 1:1 | 일반 이미지 |
| 1024×1024 | 1:1 | 고품질 이미지 |
| 768×512 | 3:2 | 가로형 이미지 |
| 512×768 | 2:3 | 세로형 이미지 |

## 🎨 스타일 프리셋

### K-pop 스타일

```json
{
  "prompt": "K-pop idol in glittery stage outfit, dynamic pose",
  "negative_prompt": "blurry, low quality, distorted",
  "image_size": { "width": 1024, "height": 1024 },
  "guidance_scale": 7.5
}
```
- 화려한 무대 의상
- 다이나믹한 포즈
- 무대 조명 효과
- 현대적이고 트렌디한 스타일

### K-뷰티 스타일

```json
{
  "prompt": "Natural Korean beauty makeup, soft lighting",
  "negative_prompt": "harsh lighting, unnatural colors",
  "image_size": { "width": 768, "height": 768 },
  "guidance_scale": 7.5
}
```
- 자연스러운 메이크업
- 부드러운 조명
- 깨끗한 피부 표현
- 미니멀한 배경

### 패션 스타일

```json
{
  "prompt": "Korean street fashion, trendy outfit",
  "negative_prompt": "old-fashioned, outdated style",
  "image_size": { "width": 768, "height": 1024 },
  "guidance_scale": 7.5
}
```
- 한국 스트릿 패션
- 트렌디한 스타일링
- 도시적 배경
- 모던한 감성

## 📝 사용 예제

### Python 예제

```python
import requests
import time

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.kvid.ai"

headers = {
    "api-key": API_KEY,
    "Content-Type": "application/json",
}

payload = {
    "prompt": "Beautiful K-pop idol with colorful hair, professional portrait",
    "negative_prompt": "blurry, low quality, distorted",
    "image_size": {"width": 1024, "height": 1024},
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "enable_safety_checker": True,
}

# 작업 제출
response = requests.post(
    f"{BASE_URL}/ai/generation/text-to-image/generate-async",
    json=payload,
    headers=headers,
)
job_id = response.json()["data"]["job_id"]
print(f"Job ID: {job_id}")

# 완료 대기
while True:
    s = requests.get(
        f"{BASE_URL}/ai/generation/status?jobId={job_id}",
        headers=headers,
    ).json()
    status = s["data"]["status"]
    print(f"Status: {status}")
    if status == "completed":
        break
    if status == "failed":
        print("이미지 생성 실패")
        break
    time.sleep(3)

# 결과 조회
r = requests.get(
    f"{BASE_URL}/ai/generation/result?jobId={job_id}",
    headers=headers,
).json()
print(f"이미지 URL: {r['data']['result_url']}")
```

### JavaScript 예제

```javascript
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.kvid.ai';

async function generateImage() {
  const headers = {
    'api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  // 작업 제출
  const submit = await fetch(
    `${BASE_URL}/ai/generation/text-to-image/generate-async`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: 'Korean beauty model with natural makeup, studio lighting',
        negative_prompt: 'blurry, distorted',
        image_size: { width: 768, height: 768 },
        num_inference_steps: 50,
        guidance_scale: 7.5,
        enable_safety_checker: true,
      }),
    }
  );
  const { data: { job_id } } = await submit.json();

  // 완료 대기
  while (true) {
    const s = await fetch(
      `${BASE_URL}/ai/generation/status?jobId=${job_id}`,
      { headers }
    ).then(r => r.json());

    if (s.data.status === 'completed') break;
    if (s.data.status === 'failed') {
      console.log('이미지 생성 실패');
      return;
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  // 결과 조회
  const r = await fetch(
    `${BASE_URL}/ai/generation/result?jobId=${job_id}`,
    { headers }
  ).then(r => r.json());
  console.log('이미지 URL:', r.data.result_url);
}

generateImage();
```

### cURL 예제

```bash
# 작업 제출
curl -X POST "https://api.kvid.ai/ai/generation/text-to-image/generate-async" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop concert stage with colorful lights",
    "negative_prompt": "blurry, low quality",
    "image_size": { "width": 1024, "height": 768 },
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "enable_safety_checker": true
  }'

# 상태 확인
curl -X GET "https://api.kvid.ai/ai/generation/status?jobId=JOB_ID" \
  -H "api-key: YOUR_API_KEY"

# 결과 조회
curl -X GET "https://api.kvid.ai/ai/generation/result?jobId=JOB_ID" \
  -H "api-key: YOUR_API_KEY"
```

## 🎯 프롬프트 최적화 가이드

### 효과적인 프롬프트 작성

**좋은 예시:**
```
"K-pop idol with pastel pink hair, wearing holographic stage outfit, dramatic lighting, professional photography, high quality"

negative_prompt:
"blurry, low quality, distorted, bad anatomy"
```

**피해야 할 예시:**
```
"pretty girl"
```

### 프롬프트 구성 요소

1. **주제**: 인물, 객체, 장면
2. **스타일**: K-pop, K-뷰티, 패션
3. **디테일**: 색상, 옷, 헤어스타일
4. **분위기**: 조명, 배경, 무드
5. **품질**: "professional", "high quality", "detailed"

## ⚠️ 제한사항 및 주의사항

### 기술적 제한
- **최대 해상도**: 1024×1024
- **처리 시간**: 30초–2분
- **파일 형식**: 기본 `jpeg` (`output_format`으로 `png` 선택 가능)
- **프롬프트**: 영어와 기본 특수문자 권장

### 콘텐츠 정책
- 성인 콘텐츠 생성 금지
- 실제 인물 얼굴 복제 금지
- 저작권 침해 콘텐츠 금지
- 폭력적이거나 혐오 콘텐츠 금지

## 🚨 오류 응답

### 기본 형식

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "오류 메시지",
  "details": {
    "http_status": 400,
    "help_url": "https://docs.kvid.ai/docs/ko/api-services/image-api"
  }
}
```

### 주요 오류 코드

| 오류 코드 | 설명 | HTTP | 해결 방법 |
|----------|------|------|-----------|
| `INSUFFICIENT_CREDITS` | 크레딧 부족 | 402 | [크레딧 충전](https://kvid.ai/credits/purchase) |
| `PROMPT_VALIDATION_ERROR` | 프롬프트 검증 실패 | 400 | 영어와 기본 특수문자만 사용 |
| `USER_NOT_FOUND` | 사용자 없음 | 404 | 등록된 이메일 확인 |
| `SAFETY_CHECK_FAILED` | 안전 필터에 의해 거부 | 422 | 프롬프트 수정 |
| `RATE_LIMITED` | 요청 과다 | 429 | 백오프 후 재시도 |
| `GENERATION_ERROR` | 이미지 생성 실패 | 500 | 잠시 후 재시도 |
| `CONFIGURATION_ERROR` | 서버 설정 오류 | 500 | 관리자에게 문의 |

### 품질 최적화 팁
- **구체적인 설명**: "아름다운 여성" → "파스텔 핑크 머리의 K-pop 아이돌"
- **조명 명시**: "studio lighting", "soft natural light"
- **품질 키워드**: "professional photography", "high resolution"
- **스타일 일관성**: 관련 키워드들을 함께 사용

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [갤러리 샘플](https://kvid.ai/gallery)

## 💰 요금

Image Generation API의 자세한 요금 정보는 [요금 안내 → 이미지 생성](/docs/ko/pricing#이미지-생성)을 참고해 주세요.

## 📞 지원

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
