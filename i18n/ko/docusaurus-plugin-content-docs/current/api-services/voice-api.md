---
title: 음성 합성 (TTS) API
description: kvidAI Voice (Text-to-Speech) API — ElevenLabs 기반 음성 합성. 자막 싱크용 character-level alignment 제공.
slug: voice-api
tags: [API, Voice, TTS, AI]
sidebar_position: 5
---

# 음성 합성 (TTS) API

> **View in English**: [Voice (TTS) API](/docs/api-services/voice-api) | **한국어로 보기** (현재 페이지)

Voice API 는 ElevenLabs 기반 백엔드로 텍스트를 음성으로 합성합니다. 결과에는 **character-level `alignment`**(문자별 시작/종료 시각)가 포함되어, 생성된 오디오에 자막을 정확히 싱크할 수 있습니다.

## 🎯 서비스 개요

### 지원 기능
- **Text-to-Speech**: 선택한 voice·model 로 텍스트를 오디오로 생성
- **다국어**: `eleven_multilingual_v2` 등 모델, 선택적 `language_code`
- **자막 싱크**: result 의 `alignment` 가 character-level 타이밍 제공

> voice surface 는 이미지/비디오 공용 폴링 엔드포인트와 분리된 **자체** status/result 엔드포인트를 사용합니다.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

Voice API 는 **비동기 방식**입니다. 작업을 제출하고 **voice 전용** status 엔드포인트를 폴링한 뒤 result 엔드포인트로 결과를 조회합니다.

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai/generation/voice/text-to-speech/generate-async` | TTS 작업 제출 |
| `GET`  | `/ai/generation/voice/status?jobId={job_id}` | TTS 작업 상태 조회 |
| `GET`  | `/ai/generation/voice/result?jobId={job_id}` | 완료된 TTS 결과 조회 |
| `GET`  | `/ai/generation/voice/voices` | 사용 가능한 voice 목록 |
| `GET`  | `/ai/generation/voice/models` | 사용 가능한 TTS 모델 목록 |

> **voice 는 자체 폴링 경로를 사용합니다.** 이미지/비디오 작업(`/ai/generation/status`, `/ai/generation/result`)과 달리, voice 작업은 `/ai/generation/voice/status`, `/ai/generation/voice/result` 로 폴링합니다.
>
> **인증 및 크레딧 식별.** 모든 요청은 `api-key` 헤더를 보내야 합니다. 추가로 차감할 크레딧 풀을 식별하기 위해 **request body에 `product_id` / `product_code` / `email` 중 정확히 하나를 반드시 포함**해야 합니다.
>
> 별도의 개발용 라우팅(`api.hometip.net` + `/ai/generation-clone/...`)이 존재하지만, 이 페이지는 **프로덕션** 경로(`api.kvid.ai`)를 기준으로 설명합니다.

### 1. Text-to-Speech 작업 제출

```python
import requests

url = "https://api.kvid.ai/ai/generation/voice/text-to-speech/generate-async"
api_key = "YOUR_API_KEY"

payload = {
    "product_code": "pdt_XXXXXXXXXXXX",   # product_id / email 중 하나 필수
    "text": "안녕하세요. 프로덕션 환경에서 TTS API 테스트 중입니다.",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "language_code": "ko",
    "output_format": "mp3_44100_128",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0,
        "speed": 1.0,
        "use_speaker_boost": True
    },
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
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "queued",
    "message": "음성 생성 작업이 큐에 추가되었습니다.",
    "estimated_time": "10초-1분",
    "voice_type": "text-to-speech"
  }
}
```

### 2. 작업 상태 조회

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "voice_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/voice/status?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "processing",
    "voice_type": "text-to-speech",
    "created_at": "2026-06-19T12:34:56.000Z",
    "text": "안녕하세요. 프로덕션 환경에서...",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "progress": 75,
    "result_url": null,
    "duration_seconds": null,
    "error_message": null
  }
}
```

`status` 값: `pending`, `processing`, `completed`, `failed`.

### 3. 완료된 결과 조회

result 에는 오디오 `result_url` 과 자막 싱크용 character-level `alignment` 이 포함됩니다.

```python
import requests

api_key = "YOUR_API_KEY"
job_id = "voice_1768540311147_4mcdv65c7"

url = f"https://api.kvid.ai/ai/generation/voice/result?jobId={job_id}"
headers = {"api-key": api_key}

response = requests.get(url, headers=headers)
print(response.json())
```

**응답**

```json
{
  "success": true,
  "data": {
    "job_id": "voice_1768540311147_4mcdv65c7",
    "status": "completed",
    "result_url": "https://cdn.kvid.ai/tts/tts.mp3",
    "duration_seconds": 12.5,
    "created_at": "2026-06-19T12:34:56.000Z",
    "text": "안녕하세요...",
    "voice_id": "pNInz6obpgDQGcFmaJgB",
    "model_id": "eleven_multilingual_v2",
    "alignment": {
      "characters": ["안", "녕", "하", "세", "요"],
      "start_times": [0.0, 0.12, 0.25, 0.38, 0.5],
      "end_times": [0.12, 0.25, 0.38, 0.5, 0.62]
    }
  }
}
```

### 4. voice·model 목록 조회

```http
GET https://api.kvid.ai/ai/generation/voice/voices
api-key: YOUR_API_KEY
```

```http
GET https://api.kvid.ai/ai/generation/voice/models
api-key: YOUR_API_KEY
```

`/ai/generation/voice/voices` 로 유효한 `voice_id` 를, `/ai/generation/voice/models` 로 유효한 `model_id` 를 확인하세요.

## 📋 매개변수 상세

### 요청 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `product_code` / `product_id` / `email` | string | ✅ (셋 중 하나) | – | 차감할 크레딧 풀 식별 |
| `text` | string | ✅ | – | 합성할 텍스트 (최대 5000자) |
| `voice_id` | string | – | `pNInz6obpgDQGcFmaJgB` (Adam) | ElevenLabs voice ID. 목록: `GET /ai/generation/voice/voices` |
| `model_id` | string | – | `eleven_multilingual_v2` | TTS 모델 (`eleven_multilingual_v2`, `eleven_turbo_v2_5` …). 목록: `GET /ai/generation/voice/models` |
| `language_code` | string | – | – | 대상 언어 (`ko`, `en`, `es` …) |
| `output_format` | string | – | `mp3_44100_128` | 오디오 포맷 |
| `voice_settings` | object | – | – | 음성 커스터마이즈 (아래) |
| `voice_settings.stability` | number | – | – | 안정성 (0~1) |
| `voice_settings.similarity_boost` | number | – | – | 유사도 (0~1) |
| `voice_settings.style` | number | – | – | 스타일 강도 (0~1) |
| `voice_settings.speed` | number | – | – | 속도 배율 |
| `voice_settings.use_speaker_boost` | boolean | – | – | speaker boost |
| `seed` | integer | – | random | 재현성 |

### 결과 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `result_url` | string | mp3 의 public CDN URL |
| `duration_seconds` | number | 오디오 길이(초) |
| `alignment` | object | character 별 `start_times` / `end_times` (초). 자막 싱크용 |

> 모델 지원 및 정확한 모델별 매개변수 — [요금 안내](/ko/docs/pricing) 및 모델 문서 참조.

## ⚠️ 오류 응답

| 오류 코드 | HTTP | 설명 |
|-----------|------|------|
| `MISSING_PARAMETERS` | 400 | `text` 누락 또는 5000자 초과 |
| `INSUFFICIENT_CREDIT` | 402 | 크레딧 부족 |
| `JOB_NOT_FOUND` | 404 | `jobId` 없음 — result 엔드포인트 |
| `JOB_NOT_COMPLETED` | 400 | status 가 아직 `pending`/`processing` — result 엔드포인트 |

## 🔗 관련 링크

- [API 키 발급](https://kvid.ai/settings/api-keys)
- [크레딧 구매](https://kvid.ai/credits/purchase)
- [요금 안내](/ko/docs/pricing)
- [Video 생성 AI API](./video-api)
- [Talk-V2V (립싱크) API](./talk-v2v)

## 📞 지원 및 문의

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)

---

**언어**: [English](/docs/api-services/voice-api) | **한국어** (현재 페이지)
