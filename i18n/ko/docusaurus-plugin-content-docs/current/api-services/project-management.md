---
title: 프로젝트 관리 API
description: kvidAI 프로젝트 관리 API — REST 인터페이스로 비디오 프로젝트를 생성, 조회, 수정하고 composition 을 patch 합니다.
keywords: [project management API, video project API, composition API, kvidAI API, video editor backend, REST API]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: project-management
tags: [API, Project, Composition, 프로젝트관리]
sidebar_position: 5
---

# 프로젝트 관리 API

> **View in English**: [Project Management API](/docs/api-services/project-management) | **한국어** (현재 페이지)

kvidAI 의 프로젝트 관리 API 는 비디오 편집 작업을 **프로젝트** 단위로 관리하는 REST 인터페이스입니다. 각 프로젝트는 Remotion 스타일의 **composition** (트랙 / 아이템 / 에셋), 채팅 히스토리, 렌더링 상태, 프로젝트별 메타데이터를 보관하는 장기 컨테이너입니다.

[kvid.ai](https://kvid.ai) 를 구동하는 것과 동일한 프로젝트 모델 위에 직접 클라이언트를 구축할 때 이 API 를 사용합니다 — 예: 대량 임포트 스크립트, 통합 파이프라인, 또는 composition 을 [Agent API](./agent-api.md) 에 넘겨 AI 편집을 시키는 워크플로우.

## 🎯 서비스 개요

### 개념

- **프로젝트(Project)** — 비디오 에디터 세션마다 하나씩인 JSON 레코드. 호출자가 owner 이며 `composition`, `chat_history`, `status` (`draft` / `rendering` / `completed`), optional `preset_id`, `thumbnail_url` 을 보관합니다.
- **컴포지션(Composition)** — Remotion 호환 JSON: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. `PATCH /:id/composition` 으로 부분 수정하므로 매번 전체 레코드를 다시 보낼 필요가 없습니다.
- **프리셋(Preset)** — 생성 시점에 `presetId` 로 선택하는 재사용 가능한 JSON config (voice / tone / color palette / scene default). [Preset API](./preset-api.md) 로 관리됩니다. Legacy 필드명 `templateId` 도 여전히 허용됩니다.

### 인증

모든 엔드포인트는 단일 **`api-key`** 헤더로 인증됩니다. APIM 게이트웨이가 그 키를 owner 사용자로 resolve 해서 신원을 주입해 줍니다 — **body 나 query 에 `email` 을 넣지 않습니다.** 키로는 다른 사용자의 프로젝트를 읽거나 수정할 수 없습니다.

API 키는 [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys) 에서 발급받으세요.

> 순수 CRUD 호출은 무료입니다. agent 를 통해 트리거되는 AI 작업의 요금은 [요금 안내](../pricing.md) 를 참조하세요.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

| Method | Path | 목적 |
|--------|------|------|
| `POST`   | `/video-project/create`             | 새 프로젝트 생성 |
| `GET`    | `/video-project`                    | 호출자의 프로젝트 목록 (페이지네이션) |
| `GET`    | `/video-project/:id`                | 단건 조회 (composition 포함) |
| `PUT`    | `/video-project/:id`                | 최상위 필드 / composition 전체 수정 |
| `PATCH`  | `/video-project/:id/composition`    | composition 트리 부분 업데이트 (세밀한 op) |

---

### 1. 프로젝트 생성

`POST /video-project/create`

새 프로젝트를 생성합니다. 호출자가 owner 가 됩니다.

**Optional Body**

| Field | Type | Default | 설명 |
|-------|------|---------|------|
| `name` | string | `"Untitled Project"` | 표시 이름 |
| `composition` | object | 1080×1920 @ 30fps, 빈 track | 초기 composition: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. item 의 `durationInFrames < 1` 은 `1` 로 clamp |
| `settings` | object | `{}` | 프로젝트별 자유 형식 preferences (editor state 등) |
| `presetId` / `preset_id` | string | `null` | attach 할 preset (voice / tone / color seed). 미지정 시 agent 는 `system_default` 로 fallback |
| `templateId` / `template_id` | string | `null` | `presetId` 의 legacy alias — 둘 중 하나만 보내면 됨 |

**Auto-set 필드**: `status = "draft"`, `chat_history = []`, `last_edited_at = now()`, `thumbnail_url` 은 composition 의 첫 image asset 에서 자동 추출 (없으면 `null`).

**Python**

```python
import requests

API_KEY = "YOUR_API_KEY"

resp = requests.post(
    "https://api.kvid.ai/video-project/create",
    headers={
        "api-key": API_KEY,
        "Content-Type": "application/json",
    },
    json={
        "name": "Sample project",
        "presetId": "review-owl",
        "composition": {
            "fps": 30,
            "compositionWidth": 1080,
            "compositionHeight": 1920,
            "tracks": [],
            "items": {},
            "assets": {},
        },
        "settings": {},
    },
)
resp.raise_for_status()
project = resp.json()["data"]
print(project["id"], project["status"])
```

**JavaScript (Node)**

```javascript
const res = await fetch("https://api.kvid.ai/video-project/create", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Sample project",
    presetId: "review-owl",
  }),
});
const { data: project } = await res.json();
console.log(project.id, project.status);
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1234,
    "name": "Sample project",
    "composition": { "fps": 30, "compositionWidth": 1080, "compositionHeight": 1920, "tracks": [], "items": {}, "assets": {} },
    "status": "draft",
    "thumbnail_url": null,
    "preset_id": "review-owl",
    "chat_history": [],
    "settings": {},
    "last_edited_at": "2026-06-02T10:00:00.000Z",
    "createdAt": "2026-06-02T10:00:00.000Z",
    "updatedAt": "2026-06-02T10:00:00.000Z"
  }
}
```

- `data.id` — 이후 모든 호출에서 사용할 `projectId`.
- `data.status ∈ { draft, rendering, completed }` — 신규는 항상 `draft`.

---

### 2. 호출자의 프로젝트 목록

`GET /video-project`

호출자의 프로젝트 목록을 반환합니다. `composition` 페이로드는 목록에서 제외됩니다 (payload 최적화) — 전체 레코드가 필요하면 `GET /video-project/:id` 를 사용하세요.

**Optional Query**

| Parameter | Type | Default | 제약 | 설명 |
|-----------|------|---------|------|------|
| `page` | number | `1` | ≥ 1 | 페이지 번호 |
| `pageSize` | number | `12` | ≤ 50 | 페이지당 항목 수 |
| `search` | string | — | — | `name` substring (case-insensitive) |
| `sort` | string | `latest` | `latest` \| `oldest` \| `name-asc` \| `name-desc` | 정렬 |
| `status` | string | — | `draft` \| `rendering` \| `completed` | 상태 필터 |

```bash
curl -G "https://api.kvid.ai/video-project" \
  -H "api-key: $KVIDAI_API_KEY" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=12" \
  --data-urlencode "sort=latest"
```

```json
{
  "success": true,
  "data": [
    {
      "id": 253,
      "name": "My project",
      "status": "draft",
      "thumbnail_url": null,
      "preset_id": "review-owl",
      "last_edited_at": "2026-06-02T...",
      "createdAt": "2026-05-27T...",
      "updatedAt": "2026-06-02T..."
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 12, "total": 47, "pageCount": 4 } }
}
```

---

### 3. 프로젝트 단건 조회

`GET /video-project/:id`

전체 레코드를 반환합니다 — `composition` (tracks / items / assets), `chat_history`, `settings`, `preset_id`, `thumbnail_url`, `status`, timestamps.

**Path Parameter**: `id` — projectId (integer), `POST /video-project/create` 응답의 `data.id`.

```python
resp = requests.get(
    f"https://api.kvid.ai/video-project/{project_id}",
    headers={"api-key": API_KEY},
)
project = resp.json()["data"]
print(len(project["composition"]["tracks"]), "tracks")
```

```json
{
  "success": true,
  "data": {
    "id": 253,
    "name": "My project",
    "composition": {
      "fps": 30,
      "compositionWidth": 1080,
      "compositionHeight": 1920,
      "tracks": [{ "id": "track-1", "items": ["item-1"], "hidden": false, "muted": false }],
      "items": {
        "item-1": { "id": "item-1", "type": "text", "text": "Hello", "from": 0, "durationInFrames": 90 }
      },
      "assets": {}
    },
    "status": "draft",
    "thumbnail_url": null,
    "preset_id": "review-owl",
    "chat_history": [{ "role": "user", "content": "..." }],
    "settings": {},
    "last_edited_at": "2026-05-27T10:00:00.000Z",
    "createdAt": "2026-05-27T09:00:00.000Z",
    "updatedAt": "2026-05-27T10:00:00.000Z"
  }
}
```

---

### 4. 프로젝트 수정

`PUT /video-project/:id`

보낸 필드만 갱신합니다. composition 도 여기서 교체할 수 있지만, 세밀한 편집이 필요하면 [`PATCH /video-project/:id/composition`](#5-composition-patch) 을 권장합니다.

**Path Parameter**: `id` — projectId (integer).

**Optional Body — 보낸 필드만 갱신**

| Field | Type | 설명 |
|-------|------|------|
| `name` | string | 표시 이름 |
| `composition` | object | 전체 교체 (sanitize 적용, `durationInFrames < 1` → `1`) |
| `status` | string | `draft` \| `rendering` \| `completed` |
| `settings` | object | 프로젝트별 자유 형식 preferences |
| `thumbnail_url` | string | 보내면 그대로 사용. composition 변경 시 미명시하면 첫 image asset 으로 자동 추출 |

`last_edited_at` 은 항상 `now()` 로 갱신됩니다.

```javascript
await fetch(`https://api.kvid.ai/video-project/${id}`, {
  method: "PUT",
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "renamed via APIM",
    status: "completed",
  }),
});
```

```json
{ "success": true, "data": { "id": 186, "name": "renamed via APIM", "status": "completed" } }
```

---

### 5. composition patch

`PATCH /video-project/:id/composition`

composition 에 세밀한 변경 하나를 적용합니다. controller 가 지원하는 operation 은 **정확히 6개**: `add_item`, `update_item`, `delete_item`, `add_track`, `add_asset`, `replace`. 모든 operation 이후 composition 이 다시 sanitize 되고, `last_edited_at` 이 갱신되며, `thumbnail_url` 이 첫 image asset 으로 재추출됩니다.

**Required Body**

| Field | Where | 설명 |
|-------|-------|------|
| `id` | path | projectId (integer) |
| `operation` | body | 아래 6개 중 하나 |
| `data` | body | operation 별 payload |

> **`remove_item` / `remove_asset` / `patch_item` operation 은 없습니다.** item 삭제는 `delete_item` 으로, asset 삭제는 `replace` 로 composition 전체를 교체하거나 (또는 `replace` 가 자동 처리하는 `deletedAssets` 배열) 처리하세요.

#### `operation: "replace"` — composition 전체 교체

가장 흔한 흐름: agent 의 SSE `done` 이후 변경된 composition 을 통째로 저장.

```jsonc
{
  "operation": "replace",
  "data": {
    "composition": {
      "fps": 30,
      "compositionWidth": 1080,
      "compositionHeight": 1920,
      "tracks": [{ "id": "track-1", "items": [], "hidden": false, "muted": false }],
      "items": {},
      "assets": {},
      "deletedAssets": []
    }
  }
}
```

| Field (`data.composition.*`) | Type | 설명 |
|---|---|---|
| `fps` | integer | 프레임레이트 (보통 30) |
| `compositionWidth` | integer | 해상도 너비 |
| `compositionHeight` | integer | 해상도 높이 |
| `tracks` | array | `{ id, items[], hidden, muted }` 배열 |
| `items` | object | `itemId → item` 맵. 각 item 의 `durationInFrames < 1` 은 `1` 로 clamp |
| `assets` | object | `assetId → asset` 메타데이터 맵 |

#### `operation: "add_item"` — 단일 item 추가

```jsonc
{
  "operation": "add_item",
  "data": {
    "trackId": "track-1",
    "item": { "id": "item-7", "type": "text", "text": "Hello", "from": 0, "durationInFrames": 90 }
  }
}
```

item 은 `composition.items[item.id]` 에 들어가고, `trackId` 에 해당하는 track 의 `items[]` 끝에 push 됩니다.

#### `operation: "update_item"` — item 필드 머지

```jsonc
{ "operation": "update_item", "data": { "itemId": "item-3", "updates": { "from": 60, "durationInFrames": 120 } } }
```

`{ ...기존, ...updates }` 로 머지. item 이 없으면 무시됩니다.

#### `operation: "delete_item"` — 단일 item 삭제

```jsonc
{ "operation": "delete_item", "data": { "itemId": "item-3" } }
```

`composition.items[itemId]` 삭제 + 모든 track 의 `items[]` 에서 해당 id 제거.

#### `operation: "add_track"` — track 추가

```jsonc
{ "operation": "add_track", "data": { "track": { "id": "track-2", "items": [], "hidden": false, "muted": false } } }
```

#### `operation: "add_asset"` — asset 추가

```jsonc
{
  "operation": "add_asset",
  "data": {
    "asset": {
      "id": "asset_1",
      "type": "image",
      "filename": "logo.png",
      "remoteUrl": "https://...cdn.../logo.png",
      "size": 102400,
      "mimeType": "image/png",
      "width": 512, "height": 512
    }
  }
}
```

**Response**

```json
{ "success": true, "data": { "id": 186, "composition": { "..." : "full updated project" } } }
```

---

## End-to-End: 프로젝트 생성 후 agent 로 편집

```python
import requests

API_KEY = "YOUR_API_KEY"

# 1. 프로젝트 생성 (preset 을 미리 지정해 agent 가 sensible default 를 받도록)
project = requests.post(
    "https://api.kvid.ai/video-project/create",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"name": "Tech Review", "presetId": "sod"},
).json()["data"]

# 2. 프로젝트를 Agent API 에 넘김 — 스트리밍 프로토콜은 ./agent-api.md 참조
#    (Agent API 가 내부적으로 /composition 을 통해 composition 을 수정함)
```

스트리밍 흐름은 [Agent API 가이드](./agent-api.md) 를 참조하세요.

---

## 에러 응답

모든 에러는 `{ "success": false, "error": "...", "message": "...", "data": ... }` 형태를 공유하므로 하나의 클라이언트 헬퍼로 렌더링할 수 있습니다.

| HTTP | 상황 |
|------|------|
| `401` | 인증 실패 — `api-key` 헤더 없음 또는 유효하지 않음 |
| `403` | Access denied — 키가 대상 프로젝트의 owner 가 아님 |
| `404` | `PROJECT_NOT_FOUND` — `id` 없음 |
| `400` | `Unknown operation: <name>` — 6개 외의 composition `operation` |
