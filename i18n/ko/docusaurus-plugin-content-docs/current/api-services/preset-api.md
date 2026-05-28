---
title: 프리셋 API
description: kvidAI 프리셋 API — 비디오 프로젝트에 voice/tone/color/scene 기본값을 seed 하는 재사용 가능한 JSON config 관리
keywords: [프리셋 API, video preset, kvidAI preset, voice template, tone preset]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: preset-api
tags: [API, Preset, Voice]
sidebar_position: 7
---

# 프리셋 API

> **View in English**: [Preset API](/docs/api-services/preset-api) | **한국어** (현재 페이지)

비디오 프로젝트에 voice / tone / 색상 / 씬 composition default 를 seed 하는 재사용 가능한 JSON config. 각 프리셋은 agent-side 결정들을 묶은 것 — ElevenLabs voice id 와 설정, 나레이션 톤, 색상 팔레트, 화면 구성 룰, optional character 프로필 — 그래서 프로젝트가 generic default 가 아닌 sensible AI behavior 로 시작됩니다.

같은 API 가 [kvid.ai](https://kvid.ai) 의 storyboard "새 프로젝트" Dialog 와 에디터 chat panel 의 프리셋 selector 를 구동합니다. [`POST /video-project/create`](./project-management#post-video-projectcreate) 에 `presetId` 를 넘기면 프로젝트에 attach 되고, agent 가 영상 생성 시 그 config 를 사용합니다.

## 🎯 서비스 개요

### 핵심 개념

- **`presetId`** — human-friendly 식별자 (예: `review-owl`, `system_default`). 별도 numeric `id` (Strapi PK) 도 있지만 외부 API 에서는 `presetId` 사용 권장.
- **`config`** — 실제 JSON config: `{ voice, tone, screenComposition, character, colorPalette, videoModel? }`. 형식은 kvidai monorepo 의 `apps/web-service/src/lib/templates/profiles.json` 미러.
- **`isDefault`** — admin 전용 flag. locale 당 1개만 마크 — `system_default` 가 `presetId: null` 프로젝트의 전역 fallback.
- **`isPublic`** — `true` 면 다른 사용자가 "shared" 카테고리에서 골라 사용 가능.
- **호출자 가시성** — 일반 API 키는 own + `isPublic` + `isDefault` 만 보임. admin 은 전체.

### 인증

- `api-key` 헤더 — kvidAI API 키
- APIM 이 구독자 이메일을 `X-Kvidai-User-Email` 로 자동 주입 — body 에 `email` 안 넣어도 됨. 각 키가 자동으로 본인 scope 으로 격리.

API 키는 [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys) 에서 발급.

## 📡 API 엔드포인트

```
Base URL:       https://api.kvid.ai/preset
Authentication: api-key 헤더
Content-Type:   application/json
```

| Method | Path | 용도 |
|--------|------|-----|
| `GET`    | `/preset`                       | 호출자에게 보이는 프리셋 목록 (own + public + default) |
| `GET`    | `/preset/{id}`                  | numeric id 로 단건 조회 |
| `GET`    | `/preset/by-preset-id/{pid}`    | string presetId 로 조회 (`system_default`, `review-owl` 등) |
| `POST`   | `/preset`                       | 새 프리셋 생성 |
| `PUT`    | `/preset/{id}`                  | name / description / config / isPublic 수정 (owner only) |
| `DELETE` | `/preset/{id}`                  | 프리셋 삭제 (owner only) |
| `POST`   | `/preset/{id}/duplicate`        | 호출자 라이브러리에 복제 |

---

### 1. 목록 조회

`GET /preset`

호출자에게 보이는 프리셋 반환. 일반 사용자: `email = caller` OR `isPublic = true` OR `isDefault = true`. admin: 전체.

```bash
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"
```

**응답**

```json
{
  "success": true,
  "data": [
    { "id": 1, "presetId": "review-owl", "name": "리뷰엉이", "isPublic": true, "isDefault": false, "config": { ... } },
    { "id": 5, "presetId": "system_default", "name": "System Default", "isDefault": true, "config": { ... } }
  ]
}
```

---

### 2. numeric id 로 단건

`GET /preset/{id}`

Strapi row PK. 가시성 게이트 적용 — 보이지 않는 row 는 403.

---

### 3. presetId 로 조회

`GET /preset/by-preset-id/{presetId}`

human-friendly string id 로 lookup. agent 가 영상 생성 시 `fetchTemplateOrDefault(presetId)` 로 사용 — `system_default` 를 넘기면 전역 fallback config.

```bash
curl -H "api-key: YOUR_API_KEY" \
  "https://api.kvid.ai/preset/by-preset-id/system_default"
```

---

### 4. 생성

`POST /preset`

**필수**

| 필드 | 타입 | 비고 |
|-----|------|-----|
| `name` | string | 표시 이름 |
| `config` | object | `{ voice, tone, screenComposition, character?, colorPalette }` |

**선택**

| 필드 | 타입 | 비고 |
|-----|------|-----|
| `presetId` | string | 미지정 시 `{emailPrefix}_{base36ts}` 자동 생성 |
| `description` | string | 프리셋 픽커에 표시되는 자유 형식 설명 |
| `language` | string | `en` / `ko` / `es`. 기본 `ko` |
| `isPublic` | boolean | 기본 `false` |
| `thumbnailUrl` | string | 프리셋 픽커에 표시되는 미리보기 이미지 |
| `tags` | array | 검색/필터링용 자유 형식 라벨 |
| `isDefault` | boolean | **admin 전용**. 일반 사용자가 보내도 무시 |

```bash
curl -X POST "https://api.kvid.ai/preset" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "내 테크 리뷰",
    "description": "차분한 explainer 음성 + 클린 색상 팔레트",
    "language": "ko",
    "config": {
      "voice": {
        "voiceId": "EXAVITQu4vr4xnSDxMaL",
        "modelId": "eleven_multilingual_v2",
        "stability": 0.5,
        "similarityBoost": 0.75,
        "style": 0.4,
        "speed": 1.0
      },
      "tone": { "style": "explainer", "emotionArc": "neutral", "endingPatterns": [], "exampleSentences": [], "forbiddenPatterns": [], "scriptPatterns": {} },
      "screenComposition": { "visualTypeRatio": {}, "sceneMaxDurationSeconds": 15, "subtitle": {} },
      "character": null,
      "colorPalette": {}
    }
  }'
```

---

### 5. 수정

`PUT /preset/{id}`

owner only (regular user). admin 은 owner 체크 skip. 수정 가능 필드: `name`, `description`, `language`, `config`, `isPublic`, `thumbnailUrl`, `tags`. `isDefault` 는 admin 전용 — 일반 사용자가 보내면 silently ignore.

---

### 6. 삭제

`DELETE /preset/{id}`

owner only. admin 은 무제한.

---

### 7. 복제

`POST /preset/{id}/duplicate`

가시 프리셋을 호출자 라이브러리에 복제. 새 row 는 source 와 무관하게 `isDefault: false`, `isPublic: false`. "공개 프리셋을 fork 해서 수정" 워크플로우에 유용.

```bash
curl -X POST "https://api.kvid.ai/preset/1/duplicate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "review-owl 내 복사본" }'
```

## Project Management 와의 조합

```bash
# 1. system + own 프리셋 목록
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"

# 2. review-owl 적용한 프로젝트 생성
curl -X POST "https://api.kvid.ai/video-project/create" \
  -H "api-key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Sample","presetId":"review-owl"}'

# 3. agent 실행 — 프리셋의 config 가 voice / tone / colors 자동 적용
# (Agent API 참조)
```

## 비고

- **명명 이력**: 이 entity 는 Strapi schema 에서 원래 `video-template` 이었음. agent / project-management endpoint 에서 backward-compatible alias 로 `templateId` 도 여전히 받습니다. 새 코드는 `presetId` 사용 권장.
- **`system_default`** 는 kvidai 웹 서비스가 seed 하며 voice fallback layer 를 통해 locale-aware 작동 — 프로젝트 생성 시 `presetId` 를 생략하면 agent 가 `system_default` 를 거쳐 locale-default voice 설정으로 떨어집니다.
