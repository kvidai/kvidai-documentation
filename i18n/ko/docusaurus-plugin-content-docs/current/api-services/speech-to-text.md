---
title: 음성 전사 (STT) API
description: kvidAI 음성 전사 API — ElevenLabs Scribe STT 프록시, 분당 크레딧 과금. 파일 업로드 또는 CDN URL 로 오디오를 텍스트로 전사.
keywords: [speech to text, STT, transcription, scribe, kvidAI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: speech-to-text
tags: [API, STT, Transcription, Scribe]
sidebar_position: 6
---

# 음성 전사 (STT) API

> **View in English**: [Speech-to-Text API](/docs/api-services/speech-to-text) | **한국어** (현재 페이지)

**ElevenLabs Scribe** 를 사용해 오디오를 텍스트로 전사하는 단일 kvidAI 엔드포인트입니다. 오디오 파일을 직접 업로드 (`multipart/form-data`) 하거나, 영상/오디오 파일의 public CDN URL 을 전달 (`application/json`) 할 수 있습니다. 응답은 Scribe 의 raw JSON — 전체 전사 텍스트 + 단어 단위 타임스탬프 + 화자 라벨입니다.

로컬 **`transcribe.py`** 스킬을 구동하는 것과 동일한 백엔드이므로, 클라이언트가 아닌 서버 측에서 전사를 처리하고 싶을 때 그대로 드롭인 교체할 수 있습니다.

## 🎯 서비스 개요

### 무엇을 하나

- **ElevenLabs Scribe (`scribe_v1`)** 전사를 kvidAI API 키 뒤에서 프록시합니다.
- **오디오 길이 기반 (분당)** 으로 크레딧을 과금합니다 — [요금 안내](/docs/pricing) 참조.
- **단어 단위 타임스탬프**, **화자 분리(diarization)**, **오디오 이벤트 태그** 를 한 번의 호출로 반환합니다.
- 오디오를 직접 (파일 업로드) 또는 참조로 (public `cloud_storage_url`, 최대 2 GB) 받습니다.

### 과금

- **성공 호출당 크레딧 1회 과금**, 오디오 길이에 비례합니다. [요금 안내](/docs/pricing) 참조.
- **재편집은 저장된 전사를 무료로 재사용** — 동일 미디어를 다시 전사해도 중복 과금하지 않고, 저장된 전사를 무료로 돌려줍니다.
- 실패 호출 (`500`) 은 전액 과금되지 않습니다.

### 인증

- `api-key` 헤더 — kvidAI API 키. `https://api.kvid.ai` 를 통한 정상 경로입니다.
- APIM 이 owner email 을 `X-Kvidai-User-Email` 로 주입하므로, 게이트웨이를 통하면 email 을 별도로 보낼 **필요 없습니다**.
- JSON body 의 `email` 필드는 헤더가 주입되지 않는 **직접 / 게이트웨이 우회 호출** 에서만 필요합니다. `api.kvid.ai` 를 통하면 api-key 만으로 충분합니다.

## 📡 API 엔드포인트

```
Base URL:       https://api.kvid.ai/ai/speech-to-text
Authentication: api-key 헤더
```

| Method | Path | 용도 |
|--------|------|-----|
| `POST` | `/ai/speech-to-text` | 오디오를 텍스트로 전사 (Scribe v1) |

> **경로 안내:** `/ai/speech-to-text` 가 정식 경로입니다 (다른 `ai/…` API 와 일관). 구 `/v1/speech-to-text` 는 **deprecated alias** 로 계속 동작하지만, `/ai/speech-to-text` 로 이전을 권장합니다.

동일 엔드포인트에서 두 가지 요청 모드를 지원합니다:

| 모드 | Content-Type | 입력 |
|------|--------------|-----|
| **A. 파일 업로드** | `multipart/form-data` | 바이너리 오디오 파일 (`file`) |
| **B. Cloud URL** | `application/json` | public CDN URL (`cloud_storage_url`, ≤ 2 GB) |

---

### 모드 A — 파일 업로드 (`multipart/form-data`)

바이너리 오디오 파일 (WAV, MP3, M4A 등) 을 `file` 필드로 업로드합니다.

**필드**

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `file` | binary | 예 | — | 오디오 파일 (WAV, MP3, M4A, …). |
| `model_id` | string | 아니오 | `scribe_v1` | Scribe 모델. |
| `diarize` | string | 아니오 | `true` | 화자를 감지·라벨링. |
| `tag_audio_events` | string | 아니오 | `true` | 비음성 이벤트(웃음, 음악 등) 태그. |
| `timestamps_granularity` | string | 아니오 | `word` | 반환 타임스탬프 단위. |
| `language_code` | string | 아니오 | *(자동 감지)* | BCP-47 코드 (예: `ko`, `en`). 생략 시 자동 감지. |
| `num_speakers` | string | 아니오 | — | 예상 화자 수; 화자 분리 정확도 향상. |

```bash
curl -X POST "https://api.kvid.ai/ai/speech-to-text" \
  -H "api-key: YOUR_API_KEY" \
  -F "file=@interview.mp3" \
  -F "model_id=scribe_v1" \
  -F "language_code=ko" \
  -F "diarize=true"
```

---

### 모드 B — Cloud storage URL (`application/json`)

영상 또는 오디오 파일의 public CDN URL (최대 2 GB) 을 전달합니다. 미디어가 이미 CDN 에 있는 경우 유용합니다 — 바이트를 재업로드할 필요가 없습니다.

**Body 필드**

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `cloud_storage_url` | string | 예 | — | 영상/오디오 파일의 public CDN URL (≤ 2 GB). |
| `model_id` | string | 아니오 | `scribe_v1` | Scribe 모델. |
| `timestamps_granularity` | string | 아니오 | `word` | 반환 타임스탬프 단위. |
| `language_code` | string | 아니오 | *(자동 감지)* | BCP-47 코드 (예: `ko`, `en`). 생략 시 자동 감지. |
| `email` | string | 아니오* | — | 과금용 email. *직접/게이트웨이 우회 호출에서만 필수; `api.kvid.ai` 를 통하면 api-key 로부터 `X-Kvidai-User-Email` 로 주입됨. |

```bash
curl -X POST "https://api.kvid.ai/ai/speech-to-text" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_storage_url": "https://cdn.example.com/media/interview.mp4",
    "model_id": "scribe_v1",
    "timestamps_granularity": "word",
    "language_code": "ko"
  }'
```

## 응답

`200 OK` 는 Scribe 의 raw JSON — 전체 전사 + 단어 단위 타임스탬프 + 화자 라벨 을 반환합니다.

```json
{
  "language_code": "ko",
  "text": "안녕하세요, 오늘 인터뷰를 시작하겠습니다.",
  "words": [
    { "text": "안녕하세요", "start": 0.12, "end": 0.68, "type": "word", "speaker_id": "speaker_0" },
    { "text": ",", "start": 0.68, "end": 0.70, "type": "spacing", "speaker_id": "speaker_0" }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `language_code` | string | 감지된 (또는 지정된) BCP-47 언어. |
| `text` | string | 전체 전사. |
| `words[]` | array | 순서가 있는 토큰 배열. |
| `words[].text` | string | 토큰 텍스트. |
| `words[].start` | number | 시작 시각 (초). |
| `words[].end` | number | 종료 시각 (초). |
| `words[].type` | string | 토큰 타입 (`word`, `spacing`, 오디오 이벤트 등). |
| `words[].speaker_id` | string | `diarize` 활성 시 화자 라벨. |

## 에러

| 상태 | 의미 | 원인 |
|---|---|---|
| `400` | Bad Request | email 누락 (직접 호출) 또는 입력 누락/오류 (`file` / `cloud_storage_url`). |
| `402` | Payment Required | 오디오 길이에 대한 크레딧 부족. |
| `500` | Internal Error | 내부 오류 또는 ElevenLabs Scribe API 오류. 전액 과금되지 않음. |

## 관련 문서

- [요금 안내](/docs/pricing) — 분당 크레딧 과금 상세.
- [미디어 API](./media-api) — `cloud_storage_url` 로 전달할 public `cdnUrl` 발급.
- [비디오 API](./video-api) · [이미지 API](./image-api) · [Agent API](./agent-api)
