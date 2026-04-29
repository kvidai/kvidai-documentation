---
title: Video 생성 AI API
description: kvidAI Video 생성 API 사용 가이드 및 기술 명세
slug: video-api
tags: [API, Video, AI, 비디오생성]
sidebar_position: 2
---

# Video 생성 AI API

kvidAI의 Video 생성 AI API는 텍스트나 이미지를 입력으로 받아 짧은 길이의 고품질 비디오를 생성하는 서비스입니다.

## 🎯 서비스 개요

### 지원 기능
- **Text-to-Video**: 텍스트 프롬프트로 비디오 생성
- **Image-to-Video**: 이미지를 기반으로 한 비디오 생성
- **해상도**: 480p / 720p / 1080p (모델 별 상이)
- **길이**: 보통 5–10초 (모델 별 상이)

### 특화 기능
- 카메라 앵글 조작 프롬프트 지원 (완벽하지 않을 수 있음)
- 다양한 생성 옵션 및 제어 가능
- K-pop 안무·K-beauty 콘텐츠 최적화

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Video Generation API는 **비동기 방식**입니다. POST로 작업을 제출하면 `job_id` 가 반환되고, status 엔드포인트를 폴링해서 완료된 시점에 result 엔드포인트로 결과를 조회합니다.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/text-to-video/generate-async` | Text-to-Video 작업 제출 |
| `POST` | `/ai/generation/image-to-video/generate-async` | Image-to-Video 작업 제출 |
| `GET`  | `/ai/generation/status?jobId={job_id}` | 작업 상태 조회 |
| `GET`  | `/ai/generation/result?jobId={job_id}` | 완료된 결과 조회 |

> `api-key` 헤더로 사용자와 구독 정보가 식별되므로 request body나 query string에 `email`·`product_code`를 따로 보낼 필요가 없습니다. 백엔드가 API 키로부터 두 값을 모두 해석합니다.

### 1. Text-to-Video 작업 생성

```python
import requests

url = "https://api.kvid.ai/ai/generation/text-to-video/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "prompt": "[Truck left, Pan right] A woman is drinking coffee.",
    "model": "v2",          # v1 / v2 / v3
    "resolution": "720p",   # 480p / 720p / 1080p (모델 별 상이)
}
headers = {
    "api-key": api_key,
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
job_id = result["data"]["job_id"]
print(f"Job ID: {job_id}")
```

응답:

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

### 2. Image-to-Video 작업 생성

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
result = response.json()
job_id = result["data"]["job_id"]
```

### 3. 작업 상태 조회

```python
import requests
import time

api_key = "YOUR_API_KEY"
job_id = "vid_1777360165746_abc123"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}"
headers = {"api-key": api_key}

while True:
    response = requests.get(url, headers=headers)
    result = response.json()

    status = result["data"]["status"]
    print(f"Status: {status}")

    if status == "completed":
        print("비디오 생성 완료!")
        break
    if status == "failed":
        print("비디오 생성 실패")
        break

    time.sleep(5)
```

`status` 값: `queued`, `processing`, `completed`, `failed`.

### 4. 결과 가져오기

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "vid_1777360165746_abc123"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
result = response.json()

if result["success"]:
    data = result["data"]
    print(f"비디오 URL: {data['result_url']}")
    print(f"해상도: {data.get('width')}x{data.get('height')}")
    print(f"사용 크레딧: {data.get('used_credit')}")
else:
    print(f"오류: {result.get('message')}")
```

응답:

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

## 📋 매개변수 상세

### 공통 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `prompt` | string | ✅ | 비디오 생성 프롬프트 |
| `model` | string | – | `v1` / `v2`(기본) / `v3` |
| `resolution` | string | – | `480p` / `720p` / `1080p` (모델 별 상이). 기본 `720p` |
| `seed` | integer | – | 재현성을 위한 시드값 |
| `num_inference_steps` | integer | – | 추론 단계 수 (높을수록 품질↑, 속도↓) |
| `enable_safety_checker` | boolean | – | 안전 필터, 기본 `true` |
| `enable_prompt_expansion` | boolean | – | 프롬프트 자동 확장 |

### Image-to-Video 추가 매개변수

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `image_url` | string | ✅ | 입력 이미지 URL (HTTPS) |
| `aspect_ratio` | string | – | `auto` / `16:9` / `9:16` / `1:1` 등 |

> 모델별로 지원하는 해상도/길이가 달라질 수 있습니다. 현재 지원 조합은 [요금 안내 → 비디오 생성](/docs/ko/pricing#비디오-생성) 참조.

## 🚨 오류 응답

### 기본 형식

```json
{
  "success": false,
  "error": "INSUFFICIENT_CREDITS",
  "message": "크레딧이 부족합니다.",
  "details": {
    "http_status": 402,
    "help_url": "https://docs.kvid.ai/docs/ko/api-services/video-api"
  }
}
```

### 주요 오류 타입

| 오류 타입 | 설명 | HTTP | 해결 방법 |
|-----------|------|------|-----------|
| `INSUFFICIENT_CREDITS` | 크레딧 부족 | 402 | [크레딧 충전](https://kvid.ai/credits/purchase) |
| `PROMPT_VALIDATION_ERROR` | 프롬프트 검증 실패 | 400 | 프롬프트의 허용되지 않는 문자를 제거 |
| `USER_NOT_FOUND` | 사용자 없음 | 404 | 등록된 이메일 확인 |
| `RESULT_FETCH_ERROR` | 결과 조회 실패 | 400 | 작업이 진행 중이거나 실패한 상태일 수 있음. status 먼저 확인 |
| `ValidationError` | 입력값 검증 실패 | 422 | 요청 파라미터 확인 |
| `image_too_small` | 이미지 크기 부족 | 422 | 최소 300×300 이상 이미지 사용 |
| `image_too_large` | 이미지 크기 초과 | 422 | 최대 6000×6000 이하 이미지 사용 |
| `content_policy_violation` | 콘텐츠 정책 위반 | 422 | 안전 정책에 맞춰 프롬프트 수정 |
| `generation_timeout` | 생성 시간 초과 | 504 | 더 단순한 프롬프트, 낮은 해상도로 재시도 |
| `RATE_LIMITED` | 요청 과다 | 429 | 백오프 후 재시도 |
| `internal_server_error` | 내부 서버 오류 | 500 | 잠시 후 재시도 |

## 🎬 사용 예제

### 1. 등산객과 배낭 비디오

![등산객 배낭](/img/video-api/영상제작_배낭.png)

**프롬프트**: A video of a man hiking with a backpack. The bag must be the main subject. Walking slowly

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_배낭.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 2. 청소기 사용 비디오

![진공청소기](/img/video-api/진공청소기.png)

**프롬프트**: Video of cleaning with a vacuum cleaner. slow movement. low angle

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_청소기.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 3. 음식 홍보 비디오

![연어 요리](/img/video-api/영상_리소스_이미지_연어.png)

**프롬프트**: Remove the cooking effect and only add camera movement. highlight the food in Zoom format. promotional video for this food

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_연어회.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 4. 한국 전통 정자 비디오

![전주 공원](/img/video-api/jeonju_park_한국관광공사_169759365517930.jpg)

**프롬프트**: A traditional Korean pavilion by a lotus pond, with two small dogs (a white poodle and a brown shiba inu) joyfully running along the wooden walkway. The pond is filled with green lotus leaves, and the background is full of lush green trees. Bright sunny day, peaceful and vivid atmosphere.

<video width="100%" controls>
  <source src="/img/video-api/videoGenerateResult_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

**Text-to-Video 버전**:
<video width="100%" controls>
  <source src="/img/video-api/videoAIGenerateResult_t2v_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

**추가 프롬프트**: The two small dogs (white poodle and brown shiba inu) approach the pavilion, wagging their tails, playfully interacting. They stop at the end of the deck, looking around curiously. [Over-the-shoulder shot] Captures the view of the park and lotus pond from behind the dogs.

<video width="100%" controls>
  <source src="/img/video-api/The_two_small_dogs_(white_poodle_and_brown_shiba_inu)_approach_the_pavilion_t2v_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 5. 호랑이 이미지-비디오 변환

![호랑이](/img/video-api/호랑이1.jpg)

**프롬프트**: The tiger briefly pulls back its tongue, blinks, and tilts its head slightly. Then immediately sticks out its tongue for a second time, a bit longer than the first, while lowering its head slightly. [Low-angle close-up shot] Capture from below to show both majesty and cuteness.

<video width="100%" controls>
  <source src="/img/video-api/The_tiger_briefly_pulls_back_its_tongue_blinks_and_tilts_its_head_slightly_i2v_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

## ⚠️ 제한사항 및 주의사항

### 기술적 제한
- **길이**: 짧은 클립 (5–10초, 모델별 상이)
- **해상도**: 모델별 지원 범위 다름 (요금 페이지 참고)
- **카메라 앵글**: 카메라 앵글 조작 프롬프트가 항상 정확하게 작동하지 않을 수 있음
- **처리 시간**: 해상도와 길이에 따라 1–5분 소요
- **이미지 입력**: Image-to-Video의 입력 이미지는 300×300 ~ 6000×6000 범위

### 최적화 팁
- **구체적인 프롬프트**: 세부적이고 명확한 설명 제공
- **카메라 앵글**: 필요시 `[Low-angle]`, `[Over-the-shoulder shot]` 등의 지시어 사용
- **적절한 해상도**: 용도에 맞는 해상도 선택

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [요금 안내](/docs/ko/pricing#비디오-생성)

## 💰 요금

크레딧 단가는 모델(v1 / v2 / v3)과 해상도에 따라 다릅니다. 현재 단가는 [요금 안내 → 비디오 생성](/docs/ko/pricing#비디오-생성) 을 참고하세요.

## 📞 지원 및 문의

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
