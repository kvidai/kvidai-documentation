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

같은 API 가 [kvid.ai](https://kvid.ai) 의 storyboard "새 프로젝트" Dialog 와 에디터 chat panel 의 프리셋 selector 를 구동합니다. [`POST /video-project/create`](./project-management#1-프로젝트-생성) 에 `presetId` 를 넘기면 프로젝트에 attach 되고, agent 가 영상 생성 시 그 config 를 사용합니다.

## 🎯 서비스 개요

### 개념

- **`presetId`** — Human-friendly identifier (예: `review-owl`, `system_default`). numeric `id` (Strapi PK) 와 함께 저장. DB-level update 외에는 `presetId` 를 사용하세요.
- **`config`** — 실제 JSON config: `{ voice, tone, screenComposition, character, colorPalette }`. kvidai monorepo 의 `apps/web-service/src/lib/templates/profiles.json` 형식을 따릅니다.
- **`isDefault`** — Admin 전용 플래그. locale 당 정확히 하나의 preset 이 default 여야 합니다 — `system_default` 는 `presetId: null` 프로젝트의 전역 fallback 입니다.
- **`isPublic`** — `true` 면 다른 사용자가 storyboard / 에디터 프리셋 picker 의 "shared" 카테고리에서 이 preset 을 선택할 수 있습니다.
- **Caller visibility** — 일반 API 키는 본인 preset + `isPublic` + `isDefault` 만 봅니다. Admin role 은 전체를 봅니다.

### 인증

- `api-key` 헤더 — kvidAI API 키.
- APIM 게이트웨이가 키를 subscription owner 로 resolve 하므로 **body 나 query 에 `email` 을 넣지 않습니다**. 각 키는 owner 로 자동 scope 됩니다.

API 키는 [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys) 에서 발급받으세요.

> 순수 CRUD 호출은 무료입니다. AI 작업의 요금은 [요금 안내](../pricing.md) 를 참조하세요.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai/preset
Authentication: api-key header
Content-Type:   application/json
```

| Method | Path | 목적 |
|--------|------|------|
| `GET`    | `/preset`                          | 호출자에게 보이는 preset 목록 (own + public + default) |
| `GET`    | `/preset/:id`                      | numeric id 로 단건 조회 |
| `GET`    | `/preset/by-preset-id/:presetId`   | string presetId 로 조회 (예: `system_default`, `review-owl`) |
| `POST`   | `/preset`                          | 신규 preset 생성 |
| `PUT`    | `/preset/:id`                      | preset 수정 (owner-only) |
| `DELETE` | `/preset/:id`                      | preset 삭제 (owner-only) |
| `POST`   | `/preset/:id/duplicate`            | 호출자 라이브러리로 preset 복제 |

---

### 1. preset 목록

`GET /preset`

호출자에게 보이는 preset 을 반환합니다. 일반 사용자: `owner = caller` OR `isPublic = true` OR `isDefault = true`. Admin: 전체 row.

```bash
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"
```

**Response**

```json
{
  "success": true,
  "data": [
    { "id": 1, "presetId": "review-owl", "name": "리뷰엉이", "isPublic": true, "isDefault": false, "config": { "...": "..." } },
    { "id": 5, "presetId": "system_default", "name": "System Default", "isPublic": true, "isDefault": true, "config": { "...": "..." } }
  ]
}
```

---

### 2. numeric id 로 조회

`GET /preset/:id`

Strapi row PK. visibility gate 적용 — 보이지 않는 row 는 `403` 반환.

---

### 3. presetId 로 조회

`GET /preset/by-preset-id/:presetId`

Human-friendly string id 로 lookup. agent 가 내부적으로 `fetchTemplateOrDefault(presetId)` 로 호출하며 fallback 체인은 `1) 명시된 presetId → 2) system_default → 3) locale 기본 voice`. `system_default` 를 넘기면 전역 fallback config 를 얻습니다.

```bash
curl -H "api-key: YOUR_API_KEY" \
  "https://api.kvid.ai/preset/by-preset-id/system_default"
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "presetId": "system_default",
    "name": "System Default",
    "isPublic": true,
    "isDefault": true,
    "config": { "...": "..." }
  }
}
```

---

### 4. 생성

`POST /preset`

**Required**

| Field | Type | 설명 |
|-------|------|------|
| `name` | string | 표시 이름 |
| `config` | object | `{ voice, tone, screenComposition, character?, colorPalette }` |

**Optional**

| Field | Type | Default | 설명 |
|-------|------|---------|------|
| `presetId` | string | auto | 미지정 시 `{emailPrefix}_{base36(Date.now())}` 자동 생성 |
| `description` | string | `""` | picker 에 표시되는 설명 |
| `language` | string | `ko` | i18n 언어 코드 (예: `en` / `ko` / `es`) |
| `thumbnailUrl` | string \| null | `null` | 프리셋 picker 미리보기 이미지 |
| `tags` | string[] | `[]` | 검색 / 필터용 자유 라벨 |
| `isPublic` | boolean | `false` | `true` 면 다른 사용자에게 공개 |
| `isDefault` | boolean | `false` | **Admin 전용.** 일반 user 가 `true` 를 보내도 `false` 로 강제됨 |

```bash
curl -X POST "https://api.kvid.ai/preset" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Preset",
    "description": "Calm explainer voice with a clean color palette",
    "language": "ko",
    "isPublic": false,
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

**Response**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "presetId": "user_kt92h3",
    "name": "My Custom Preset",
    "config": { "...": "..." },
    "isPublic": false,
    "isDefault": false,
    "createdAt": "2026-06-02T...",
    "updatedAt": "2026-06-02T..."
  }
}
```

---

### 5. 수정

`PUT /preset/:id`

일반 사용자는 owner-only, admin 은 owner 체크를 skip 합니다. 보낸 필드만 갱신됩니다: `name`, `description`, `language`, `config` (전체 교체), `isPublic`, `thumbnailUrl`, `tags` (전체 교체). `isDefault` 는 admin 전용이며 일반 user 가 보내면 무시됩니다.

```bash
curl -X PUT "https://api.kvid.ai/preset/42" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated name", "description": "Updated description", "isPublic": true }'
```

---

### 6. 삭제

`DELETE /preset/:id`

Owner-only. Admin 은 제한 없음.

---

### 7. 복제

`POST /preset/:id/duplicate`

호출자에게 보이는 preset 을 호출자 라이브러리로 복제합니다. 새 row 는 원본과 무관하게 **항상** `isDefault: false`, `isPublic: false`. 원본은 호출자에게 visible 해야 합니다 (own ∪ public ∪ default). 복제되는 필드: `description`, `language`, `thumbnailUrl`, `tags`, `config`.

```bash
curl -X POST "https://api.kvid.ai/preset/42/duplicate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My copy of review-owl" }'
```

Optional `name` 은 미지정 시 `"{original.name} (Copy)"` 로 기본 설정됩니다.

## 프로젝트 관리와 조합

```bash
# 1. system + 본인 preset 목록
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"

# 2. review-owl 에 바인딩된 프로젝트 생성 (body 에 email 없음 — api-key 가 신원)
curl -X POST "https://api.kvid.ai/video-project/create" \
  -H "api-key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Sample","presetId":"review-owl"}'

# 3. agent 실행 — preset 의 config 가 voice / tone / colors 를 자동으로 구동
# (Agent API 참조)
```

## 참고

- **필드 네이밍 히스토리**: 이 엔티티는 Strapi 스키마에서 예전에 `video-template` 라 불렸습니다. agent / 프로젝트 관리 엔드포인트에서 `templateId` 가 backward-compatible alias 로 남아 있을 수 있습니다. 새 코드는 `presetId` 를 사용하세요.
- **`system_default`** 는 kvidai web service 가 seed 하며 voice fallback layer 를 통해 locale-aware 합니다 — 프로젝트 생성 시 `presetId` 를 생략하면 agent 는 `system_default` 이후 locale 기본 voice 설정을 사용하게 됩니다.

## 에러

| HTTP | 상황 |
|------|------|
| `400` | `Name is required` / `Config is required` — 필수 body 필드 누락 |
| `403` | Access denied — 일반 user 가 소유하지 않은 preset, 또는 보이지 않는 preset 대상 |
| `404` | `Preset not found` — 알 수 없는 id / presetId |
| `500` | `Failed to create preset` / `Failed to update preset` — 예기치 못한 실패 |
