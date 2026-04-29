---
title: Talk-V2V (립싱크) API
description: kvidAI Talk-V2V API — 기존 비디오에 새 오디오를 입혀 발화자의 입과 동작을 오디오에 맞춰 립싱크 비디오를 생성. K-pop·K-beauty 콘텐츠 최적화
slug: talk-v2v
tags: [API, Video, AI, 립싱크, Talk-V2V]
sidebar_position: 4
---

# Talk-V2V (립싱크) API

Talk-V2V API는 기존 **비디오**와 별개의 **오디오 파일**을 입력으로 받아, 비디오 속 발화자의 입과 동작을 오디오에 맞게 변형해 **립싱크된 비디오**를 만듭니다.

## 🎯 서비스 개요

### 지원 기능
- **Video-to-Video 립싱크**: 입력 비디오를 새 오디오에 맞춰 변환
- **해상도**: 480p / 720p
- **종횡비 처리**: stretch / crop / pad 로 출력 비율 맞춤

### 주요 활용 사례
- K-pop 아이돌 영상 로컬라이제이션 (다른 언어 더빙)
- K-beauty 제품 리뷰의 새 나레이션 입히기
- 한 소스 클립으로 여러 언어 영상 재활용

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Talk-V2V는 **비동기 방식**입니다. 작업 제출 → `job_id` 수신 → status 폴링 → result 조회.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/talk-v2v/generate-async` | Talk-V2V 작업 제출 |
| `GET`  | `/ai/generation/status?jobId={job_id}&email={email}` | 작업 상태 조회 |
| `GET`  | `/ai/generation/result?jobId={job_id}&email={email}` | 완료된 결과 조회 |

### 1. Talk-V2V 작업 제출

```python
import requests

url = "https://api.kvid.ai/ai/generation/talk-v2v/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "email": "you@example.com",
    "product_code": "YOUR_PRODUCT_CODE",
    "input_video": "https://your-host.example/source.mp4",
    "audio_file": "https://your-host.example/voice.mp3",
    "resolution": "720p",
    "image_size": {"width": 1280, "height": 720},
    "keep_proportion": "crop",
    "frame_rate": 30,
    "audio_duration": 8.5
}
headers = {
    "api-key": api_key,
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "tlk_1777360165746_xyz789",
    "request_id": "req_abc",
    "status": "queued",
    "message": "Job submitted",
    "estimated_time": "60s",
    "credit_cost": 80
  }
}
```

### 2. 작업 상태 조회

```python
import requests
import time

api_key = "YOUR_API_KEY"
job_id = "tlk_1777360165746_xyz789"
email = "you@example.com"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}&email={email}"
headers = {"api-key": api_key}

while True:
    response = requests.get(url, headers=headers)
    result = response.json()
    status = result["data"]["status"]
    print(f"Status: {status}")
    if status == "completed":
        break
    if status == "failed":
        print("립싱크 생성 실패")
        break
    time.sleep(5)
```

`status` 값: `queued`, `processing`, `completed`, `failed`.

### 3. 결과 가져오기

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "tlk_1777360165746_xyz789"
email = "you@example.com"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}&email={email}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "tlk_1777360165746_xyz789",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/videos/tlk_1777360165746_xyz789.mp4",
    "width": 1280,
    "height": 720,
    "type": "video/mp4",
    "used_credit": 80,
    "created_at": "2026-04-21T10:00:00Z"
  }
}
```

## 📋 매개변수 상세

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `email` | string | ✅ | 계정 이메일 — 작업 소유권 및 크레딧 정산용 |
| `product_code` | string | ✅ | API 구독 product code ([API 키 페이지](https://kvid.ai/settings/api-keys)에서 확인) |
| `input_video` | string (URL) | ✅ | 소스 비디오의 HTTPS URL |
| `audio_file` | string (URL) | ✅ | 립싱크 기준이 될 오디오의 HTTPS URL |
| `prompt` | string | – | 스타일 가이드용 선택적 프롬프트 |
| `negative_prompt` | string | – | 배제할 요소 |
| `model` | string | – | 모델 식별자 |
| `function` | string | – | 기능 식별자 |
| `resolution` | string | – | `480p` / `720p` |
| `image_size.width` / `image_size.height` | integer | – | 출력 크기 (resolution 대안) |
| `keep_proportion` | string | – | 비율 처리 방식: `stretch` / `crop` / `pad` |
| `audio_duration` | float | – | 오디오 길이 (초) — 출력 길이 제한 |
| `frame_rate` | integer | – | 출력 FPS |
| `max_frames` | integer | – | 출력 최대 프레임 수 |
| `steps` | integer | – | 샘플링 단계 수 (클수록 품질↑, 속도↓) |
| `cfg_scale` | float | – | CFG 강도 |
| `crf` | integer | – | 출력 비디오 CRF (낮을수록 고품질·큰 파일) |
| `seed` | integer | – | 재현성을 위한 시드값 |

> SDK 사용 시 `width` / `height` shorthand는 자동으로 `image_size: { width, height }` 객체로 변환됩니다. 직접 HTTP 호출 시에는 `image_size` 객체를 그대로 보내세요.

## 💰 요금

Talk-V2V 크레딧 단가는 출력 해상도와 길이에 따라 다릅니다. 현재 단가는 [요금 안내 → 비디오 생성](/docs/ko/pricing#비디오-생성)을 참고하세요.

## ⚠️ 제한사항 및 주의사항

- **소스 비디오**: 발화자 얼굴이 명확하게 보이고 정면에 가까울수록 결과가 좋음
- **오디오**: 단일 화자의 깨끗한 음성에서 가장 잘 작동
- **길이**: 출력이 길수록 크레딧과 처리 시간이 비례 증가
- **종횡비**: 후속 사용처에 맞는 `keep_proportion` 선택 (꽉 채우려면 `crop`, 원본 보존이면 `pad`)

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [요금 안내](/docs/ko/pricing#비디오-생성)
- [Video 생성 API](./video-api) — text-to-video / image-to-video

## 📞 지원 및 문의

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
