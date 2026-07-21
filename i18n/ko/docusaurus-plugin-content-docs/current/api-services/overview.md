---
title: API 서비스 개요
description: kvidAI의 Video, Image Generation API 기술 개요
sidebar_position: 1
---

# API 서비스 개요

kvidAI의 모든 API는 `https://api.kvid.ai` 에서 제공되며, 하나의 계정으로 발급한 **단일 API 키**와 **단일 크레딧 잔액**을 모든 서비스가 공유합니다.

## 서비스 한눈에 보기

| 서비스 | 설명 | 문서 |
|--------|------|------|
| **Video Generation** | Text-to-Video / Image-to-Video / Reference-to-Video (`wan` / `seedance` / `veo3.1` 모델) | [Video API](./video-api) |
| **Image Generation** | Text-to-Image / Image-to-Image (`nano-banana` / `flux` / `sdxl`) | [Image API](./image-api) |
| **Talk-V2V (립싱크)** | 기존 비디오에 새 오디오를 입혀 립싱크 비디오 생성 | [Talk-V2V API](./talk-v2v) |
| **Voice (TTS)** | ElevenLabs 기반 음성 합성. 자막 싱크용 character 단위 타이밍 제공 | [음성 API](./voice-api) |
| **Speech-to-Text** | ElevenLabs Scribe 전사. 파일 또는 CDN URL 로 단어+타임스탬프 반환 | [음성 전사 API](./speech-to-text) |
| **AI Edit** | 미디어 요약(STT+LLM) 및 무음 컷. SSE 스트리밍 | [AI 편집 API](./ai-edit-api) |
| **Agent (AI 에디터)** | SSE 기반 자연어 composition 편집 + long-video 씬 플래닝 | [Agent API](./agent-api) |
| **Project 관리** | 비디오 프로젝트 REST CRUD + composition 수정 | [Project 관리 API](./project-management) |
| **Preset** | 음성·톤·색상·씬 default 등을 묶은 재사용 가능 프리셋. 새 프로젝트 생성 시 seed | [프리셋 API](./preset-api) |
| **Media** | presigned URL 로 CDN 직접 업로드. 파일을 서버 거치지 않고 `cdnUrl` 만 agent 에 전달 | [미디어 API](./media-api) |

## 시작하기

### 1. 계정 생성 및 크레딧 구매

모든 작업은 kvid.ai 한 곳에서 끝납니다.

1. [kvid.ai](https://kvid.ai) 에서 회원가입 (이메일 인증 필수)
2. [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) 에서 크레딧 구매

### 2. API 키 생성

[kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys) 에서 새 API 구독을 생성합니다. **Primary** 와 **Secondary** 키가 발급되며, 둘 중 어느 것이든 API 호출에 사용할 수 있습니다.

### 3. 첫 API 호출

```bash
curl -X POST "https://api.kvid.ai/ai/generation/text-to-image/generate-async" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "YOUR_PRODUCT_ID",
    "prompt": "K-pop concert stage with colorful lights",
    "model": "nano-banana"
  }'
```

응답으로 `job_id` 가 반환됩니다. `GET /ai/generation/status?jobId={id}` 으로 폴링하여 `status: "completed"` 가 되면 `GET /ai/generation/result?jobId={id}` 으로 결과를 조회합니다. 자세한 흐름은 [Image API 문서](./image-api) 참조.

> **크레딧 풀 식별** — AI 생성 endpoint (이미지 / 비디오 / talk-v2v / 음성) 는 어느 크레딧 잔액에서 차감할지 알기 위해 body 에 `product_id`, `product_code`, `email` **중 하나**가 필요합니다. 플랫폼 endpoint (Preset, Media, Project, Agent, AI Edit) 는 `api-key` 헤더만으로 사용자가 식별되므로 불필요합니다.

## 요금

모든 서비스는 **단일 크레딧 잔액**으로 과금됩니다. 현재 단가는 [요금 안내](/docs/pricing) 페이지를 참고하세요.

## K-pop & K-beauty 특화

- **Video**: 아이돌 안무, 무대 카메라 앵글, 한국 문화 맥락에 최적화된 프롬프트
- **Image**: K-beauty 메이크업·한국 패션 스타일이 반영된 튜닝

## 지원

- Discord: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
- 이메일: support@kvid.ai

---

**Language**: [English](/docs/api-services/overview) | **한국어** (현재 페이지)
