---
title: LLM API (Chat Completions)
description: kvidAI LLM API — 실제 사용한 토큰만큼 크레딧이 차감되는 OpenAI 호환 chat completions 엔드포인트. kvidAI API 키로 호출합니다.
keywords: [LLM API, chat completions, OpenAI 호환, kvidAI, 크레딧]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: llm-api
tags: [API, LLM, Chat]
sidebar_position: 12
---

# LLM API (Chat Completions)

> **초안, 아직 공개 전.** `i18n/ko/docusaurus-plugin-content-docs/current/api-services/llm-api.md` 로 옮길 때 이 블록을 지우세요. 공개 전에: `sidebars.ts` 에 `'api-services/llm-api'` 추가, 아래 영어 링크 확인, `pricing.md` 가격 확정, 문서 끝 "공개 전 확인할 것"도 삭제.

> **View in English**: [LLM API (Chat Completions)](/docs/api-services/llm-api) | **한국어** (현재 페이지)

하나의 OpenAI 호환 엔드포인트로 대형 언어 모델을 호출합니다. 평소의 chat completions 요청을 보내고 평소의 응답을 받으며, 실제로 사용한 토큰만큼 크레딧이 차감됩니다.

## 서비스 개요

- **OpenAI 호환**: 요청과 응답이 OpenAI chat completions 형식이라, 대부분의 OpenAI 클라이언트에서 base URL 과 키만 바꾸면 동작합니다.
- **사용량 과금**: 호출마다 실제 토큰 사용량으로 크레딧을 차감합니다. 가격은 [요금 안내](/ko/docs/pricing) 페이지에 있습니다.
- **하나의 크레딧 잔액**: 영상, 이미지, 음성과 같은 크레딧을 씁니다.

### 인증

`api-key` 헤더에 kvidAI API 키를 보냅니다. 키를 가진 계정의 크레딧이 차감됩니다. 이메일이나 사용자 id 는 보내지 않습니다.

## API 엔드포인트

```
POST https://api.kvid.ai/llm/chat/completions
Headers: api-key: <kvidAI API 키>
         Content-Type: application/json
```

### 요청

| 필드 | 필수 | 설명 |
|------|------|------|
| `model` | 예 | 지원하는 모델. 현재: `openrouter/openai/gpt-6-luna` |
| `messages` | 예 | `{ "role": "system" \| "user" \| "assistant" \| "tool", "content": ... }` 배열 |
| `max_tokens` (또는 `max_completion_tokens`) | 아니오 | 출력 한도. 기본 4096, 최대 8192. 이 한도만큼 크레딧을 먼저 예약하고 쓰지 않은 만큼 돌려주므로 필요한 만큼만 지정하세요. reasoning 토큰도 출력으로 셉니다: 너무 작으면 보이는 답 없이 끝날 수 있습니다 (300 이상 권장) |
| `tools`, `tool_choice`, `response_format`, `reasoning_effort` 등 | 아니오 | 나머지 OpenAI 필드는 그대로 전달됩니다 |

```bash
curl https://api.kvid.ai/llm/chat/completions \
  -H "api-key: $KVIDAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/openai/gpt-6-luna",
    "max_tokens": 300,
    "messages": [{ "role": "user", "content": "Say hi in 3 words." }]
  }'
```

### 응답

표준 chat completions 응답입니다.

```json
{
  "id": "gen-…",
  "object": "chat.completion",
  "model": "openai/gpt-6-luna",
  "choices": [
    { "index": 0, "finish_reason": "stop",
      "message": { "role": "assistant", "content": "Hi there, friend." } }
  ],
  "usage": {
    "prompt_tokens": 13, "completion_tokens": 33, "total_tokens": 46,
    "prompt_tokens_details": { "cached_tokens": 0 },
    "completion_tokens_details": { "reasoning_tokens": 40 }
  }
}
```

응답 헤더: `x-llm-platform-charged-micro-credits` (이 호출의 차감량, 1 크레딧 = 1,000,000 micro-credits), `x-request-id`. 요청 헤더에 직접 `x-request-id` 를 보내 호출을 구분할 수 있고, 같은 값을 다시 쓰면 `409` 로 거절됩니다.

### 에러

| 상태 | 코드 | 의미 |
|------|------|------|
| 401 | | `api-key` 가 없거나 유효하지 않음 |
| 400 | `UNKNOWN_MODEL` | 지원하지 않는 모델 |
| 400 | `INVALID_JSON`, `INVALID_INPUT` | body 가 JSON 객체가 아니거나 필드 값이 잘못됨 |
| 402 | `INSUFFICIENT_CREDITS` | 이 호출의 최악의 경우(`max_tokens`)를 감당할 크레딧이 부족. `max_tokens` 를 줄이거나 크레딧을 충전하세요 |
| 409 | `REQUEST_ALREADY_SEEN` | 이미 사용한 `x-request-id` |
| 413 | `BODY_TOO_LARGE` | 요청 본문이 너무 큼 |
| 502 | `UPSTREAM_UNREACHABLE` | 모델이 제때(최대 300초) 응답하지 않음. 예약한 크레딧은 풀립니다 |

### 과금

- 호출이 끝난 뒤 실제 토큰 사용량으로 차감합니다: 입력, 출력(reasoning 포함), 캐시된 입력을 각자의 단가로. [요금 안내](/ko/docs/pricing#llm-api-chat-completions) 참고.
- 차감은 0.01 크레딧 단위로 올림하므로 아주 작은 호출도 0.01 크레딧입니다.
- 실패한 호출(2xx 가 아닌 응답)은 차감하지 않습니다.

## 공개 전 확인할 것 (공개 전에 삭제)

- 스트리밍(`"stream": true`)은 백엔드에 구현돼 있지만 `api.kvid.ai` 경유로는 검증하지 않았습니다. 검증 전에는 쓰지 마세요.
- 모델이 하나뿐입니다. 공개 모델 이름과 `openrouter/` 접두어 노출 여부를 정해야 합니다.
- 고객용 호출 한도가 정해지지 않았습니다 (내부 게이트웨이 한도는 내부 키에만 적용).
- 실패한 호출은 절대 차감하지 않는지 확인 (위 문장은 설계 기준: 일부러 실패시켜 검증).
- 가격: `pricing.md` 초안 참고.
