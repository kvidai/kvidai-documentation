---
title: Talk-V2V (립싱크) API
description: kvidAI Talk-V2V API — 기존 비디오에 새 오디오를 입혀 발화자의 입과 동작을 오디오에 맞춰 립싱크 비디오를 생성. K-pop·K-beauty 콘텐츠 최적화
slug: talk-v2v
tags: [API, Video, AI, 립싱크, Talk-V2V]
sidebar_position: 4
unlisted: true
---

# Talk-V2V (립싱크) API

> **View in English**: [Talk V2V (Lip-Sync) API](/docs/api-services/talk-v2v) | **한국어로 보기** (현재 페이지)

Talk-V2V API는 기존 **비디오**와 별도의 **오디오 파일**을 입력받아, 비디오 속 발화자의 입과 동작을 오디오에 맞춰 립싱크된 비디오를 생성합니다.

## 🎯 서비스 개요

### 지원 기능
- **Video-to-Video 립싱크**: 입력 비디오를 새 오디오로 구동 (`talk_v2v`)
- **해상도**: 720p (기본)
- **비율 처리**: `keep_proportion` 으로 출력을 목표 프레임에 맞추는 방식 제어

### 대표 활용 사례
- K-pop 아이돌 로컬라이제이션 (기존 퍼포먼스 영상 재더빙)
- 새 나레이션을 입힌 K-beauty 제품 리뷰
- 단일 원본 클립의 다국어 재활용

> Talk-V2V 는 self-hosted GPU 서버에서만 처리됩니다.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Talk-V2V 는 **비동기 방식**입니다. 작업을 제출해 `job_id` 를 받고, 공용 status 엔드포인트를 폴링한 뒤 result 엔드포인트로 결과를 조회합니다.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/talk-v2v/generate-async` | Talk-V2V 작업 제출 |
| `GET`  | `/ai/generation/status?jobId={job_id}` | 작업 상태 조회 (공용 엔드포인트) |
| `GET`  | `/ai/generation/result?jobId={job_id}` | 완료된 결과 조회 (공용 엔드포인트) |

> **인증 및 크레딧 식별.** 모든 요청은 `api-key` 헤더를 보내야 합니다. 추가로 AI 생성 엔드포인트는 차감할 크레딧 풀을 식별하기 위해 **request body에 `product_id` / `product_code` / `email` 중 정확히 하나를 반드시 포함**해야 합니다.
>
> 별도의 개발용 라우팅(`api.hometip.net` + `/ai/generation-clone/...`)이 존재하지만, 이 페이지는 **프로덕션** 경로(`api.kvid.ai`)를 기준으로 설명합니다.

### 1. Talk-V2V 작업 제출

```python
import requests

url = "https://api.kvid.ai/ai/generation/talk-v2v/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "product_id": "pdt_XXXXXXXXXXXX",   # product_code / email 중 하나 필수
    "input_video": "https://your-host.example/source.mp4",
    "audio_file": "https://your-host.example/voice.mp3",
    "prompt": "a woman is singing a lullaby",
    "model": "talk",
    "function": "talk_v2v",
    "resolution": "720p",
    "max_frames": 500,
    "steps": 6,
    "cfg_scale": 1,
    "frame_rate": 25,
    "crf": 19,
    "keep_proportion": "stretch",
    "seed": 5834
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
    "job_id": "job_1768540311147_4mcdv65c7",
    "status": "queued",
    "message": "비디오 생성 작업이 큐에 추가되었습니다.",
    "estimated_time": "2-5분",
    "video_type": "talk-v2v"
  }
}
```

### 2. 작업 상태 조회

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "job_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/status?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

`status` 값: `queued`, `processing`, `completed`, `failed`, `canceled`. Talk-V2V 권장 폴링 간격: **15–30초**.

### 3. 완료된 결과 조회

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "job_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "job_1768540311147_4mcdv65c7",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/videos/job_1768540311147_4mcdv65c7.mp4",
    "created_at": "2026-05-27T09:00:00.000Z",
    "width": 1280,
    "height": 720,
    "size": 5242880,
    "file_size": 5242880,
    "type": "talk-v2v",
    "used_credit": 80
  }
}
```

## 📋 매개변수 상세

### 요청 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `product_id` / `product_code` / `email` | string | ✅ (셋 중 하나) | – | 차감할 크레딧 풀 식별 |
| `input_video` | string (URL) | ✅ | – | 원본 비디오 HTTPS URL |
| `audio_file` | string (URL) | ✅ | – | 립싱크를 구동할 오디오 HTTPS URL |
| `prompt` | string | – | `""` | 스타일 보조 프롬프트 |
| `negative_prompt` | string | – | `""` | 제외할 요소 |
| `model` | string | – | `talk` | 모델 식별자 |
| `function` | string | – | `talk_v2v` | 함수 식별자 |
| `resolution` | string | – | `720p` | 출력 해상도 |
| `image_size` | object | – | – | `{ width, height }` (또는 `width` / `height` 직접) |
| `max_frames` | integer | – | `500` | 최대 프레임 수 |
| `steps` | integer | – | `6` | 추론 step |
| `cfg_scale` | number | – | `1` | guidance scale |
| `frame_rate` | integer | – | `25` | 출력 FPS |
| `crf` | integer | – | `19` | 인코딩 품질 (0~51, 낮을수록 고화질) |
| `keep_proportion` | string | – | `stretch` | 비율 불일치 처리 방식 |
| `audio_duration` | number | – | – | 오디오 길이(초) — credit 계산용 hint |
| `seed` | integer | – | random | 재현성 |

> 모델 지원 및 정확한 모델별 매개변수 — [요금 안내](/ko/docs/pricing) 및 모델 문서 참조.

## ⚠️ 오류 응답

| 오류 코드 | HTTP | 설명 |
|-----------|------|------|
| `MISSING_PARAMETERS` | 400 | `input_video` / `audio_file` 누락 |
| `INSUFFICIENT_CREDIT` | 402 | 크레딧 부족 |
| `CONCURRENT_LIMIT` | 429 | 동시 작업 초과 |
| `JOB_NOT_FOUND` | 404 | `jobId` 없음 (또는 자기 소유 아님) — result 엔드포인트 |
| `JOB_NOT_COMPLETED` | 400 | status 가 아직 `queued`/`processing` — result 엔드포인트 |
| `JOB_FAILED` | 400 | status 가 `failed`; status 엔드포인트의 `error_message` 참조 |

## ⚠️ 제한사항 및 주의사항

- **원본 비디오**: 발화자의 얼굴이 선명하고 대체로 정면일 때 최상의 결과
- **오디오**: 명료한 단일 화자 오디오가 가장 좋음
- **길이**: 긴 출력은 비례해서 크레딧이 더 소모되고 렌더링 시간도 길어짐

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [요금 안내](/ko/docs/pricing)
- [Video 생성 AI API](./video-api) — text-to-video / image-to-video / reference-to-video
- [음성 합성 (TTS) API](./voice-api)

## 📞 지원 및 문의

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)

---

**언어**: [English](/docs/api-services/talk-v2v) | **한국어** (현재 페이지)
