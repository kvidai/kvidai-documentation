---
title: Preset API
description: kvidAI Preset API — manage reusable JSON configs (voice, tone, color palette, scene defaults) that seed new video projects.
keywords: [preset API, video preset, kvidAI preset, voice template, tone preset, scene defaults]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: preset-api
tags: [API, Preset, Voice, Template]
sidebar_position: 7
---

# Preset API

> **한국어로 보기**: [프리셋 API](/ko/docs/api-services/preset-api) | **View in English** (current page)

Reusable JSON configs that seed new video projects with voice / tone / color / scene composition defaults. Each preset is a bundle of agent-side decisions — voice id and ElevenLabs settings, narration tone, color palette, screen-composition rules, and an optional character profile — so a project starts with sensible AI behavior instead of generic defaults.

The same API powers the **preset selector** in the storyboard "New project" dialog and the editor chat panel selector on [kvid.ai](https://kvid.ai). Pass `presetId` to [`POST /video-project/create`](./project-management#post-video-projectcreate) to attach a preset to a project, and the agent reads it at generation time.

## 🎯 Service Overview

### Concepts

- **`presetId`** — Human-friendly identifier (e.g. `review-owl`, `system_default`). Stored alongside a numeric `id` (Strapi PK). Use `presetId` everywhere except DB-level updates.
- **`config`** — The actual JSON config: `{ voice, tone, screenComposition, character, colorPalette, videoModel? }`. Format mirrors `apps/web-service/src/lib/templates/profiles.json` in the kvidai monorepo.
- **`isDefault`** — Admin-only flag. Exactly one preset per locale should be marked default — `system_default` is the global fallback for `presetId: null` projects.
- **`isPublic`** — When `true`, other users can pick this preset from the "shared" category in the storyboard / editor preset picker.
- **Caller visibility** — Regular API keys see only their own presets plus `isPublic` + `isDefault`. Admin role sees everything.

### Authentication

- `api-key` header — your kvidAI API key
- APIM injects the subscription owner's email as `X-Kvidai-User-Email`, so you don't pass `email` in the body. Each key is auto-scoped to its owner.

Get an API key at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai/preset
Authentication: api-key header
Content-Type:   application/json
```

| Method | Path | Purpose |
|--------|------|---------|
| `GET`    | `/preset`                       | List presets visible to the caller (own + public + default) |
| `GET`    | `/preset/{id}`                  | Get a single preset by numeric id |
| `GET`    | `/preset/by-preset-id/{pid}`    | Get by string presetId (e.g. `system_default`, `review-owl`) |
| `POST`   | `/preset`                       | Create a new preset |
| `PUT`    | `/preset/{id}`                  | Update name / description / config / isPublic (owner-only) |
| `DELETE` | `/preset/{id}`                  | Delete a preset (owner-only) |
| `POST`   | `/preset/{id}/duplicate`        | Duplicate a preset into the caller's library |

---

### 1. List presets

`GET /preset`

Returns presets visible to the caller. Regular users: `email = caller` OR `isPublic = true` OR `isDefault = true`. Admins: all rows.

```bash
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"
```

**Response**

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

### 2. Get by numeric id

`GET /preset/{id}`

Strapi row PK. Visibility gate applies — non-visible rows return 403.

---

### 3. Get by presetId

`GET /preset/by-preset-id/{presetId}`

Look up by human-friendly string id. The agent uses this internally as `fetchTemplateOrDefault(presetId)` — pass `system_default` to get the global fallback config.

```bash
curl -H "api-key: YOUR_API_KEY" \
  "https://api.kvid.ai/preset/by-preset-id/system_default"
```

---

### 4. Create

`POST /preset`

**Required**

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `config` | object | `{ voice, tone, screenComposition, character?, colorPalette }` |

**Optional**

| Field | Type | Notes |
|-------|------|-------|
| `presetId` | string | Auto-generated as `{emailPrefix}_{base36ts}` if omitted |
| `description` | string | Free-form description shown in the picker |
| `language` | string | `en` / `ko` / `es`. Default `ko` |
| `isPublic` | boolean | Default `false` |
| `thumbnailUrl` | string | Preview image shown in the preset picker |
| `tags` | array | Free-form labels for search/filtering |
| `isDefault` | boolean | **Admin-only**. Regular users sending this are silently ignored |

```bash
curl -X POST "https://api.kvid.ai/preset" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Tech Review",
    "description": "Calm explainer voice with a clean color palette",
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

### 5. Update

`PUT /preset/{id}`

Owner-only (regular users). Admins skip the owner check. Updatable fields: `name`, `description`, `language`, `config`, `isPublic`, `thumbnailUrl`, `tags`. `isDefault` is admin-only and silently ignored from regular users.

---

### 6. Delete

`DELETE /preset/{id}`

Owner-only. Admins unrestricted.

---

### 7. Duplicate

`POST /preset/{id}/duplicate`

Clones a visible preset into the caller's library. The new row always has `isDefault: false`, `isPublic: false`, regardless of the source. Useful for "fork this public preset and tweak it" workflows.

```bash
curl -X POST "https://api.kvid.ai/preset/1/duplicate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My copy of review-owl" }'
```

## Compose with Project Management

```bash
# 1. List system + own presets
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/preset"

# 2. Create a project bound to review-owl
curl -X POST "https://api.kvid.ai/video-project/create" \
  -H "api-key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Sample","presetId":"review-owl"}'

# 3. Run the agent — the preset's config drives voice / tone / colors automatically
# (see Agent API)
```

## Notes

- **Field naming history**: this entity used to be called `video-template` in the Strapi schema; you may still see `templateId` used as a backward-compatible alias on agent / project-management endpoints. New code should use `presetId`.
- **`system_default`** is seeded by the kvidai web service and is locale-aware via the voice fallback layer — if you omit `presetId` when creating a project, the agent ends up using `system_default` then locale-default voice settings.
