---
title: Project Management API
description: kvidAI Project Management API — create, list, fetch, update, and patch the composition of video projects through a REST interface.
keywords: [project management API, video project API, composition API, kvidAI API, video editor backend, REST API]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: project-management
tags: [API, Project, Composition]
sidebar_position: 5
---

# Project Management API

> **한국어로 보기**: [프로젝트 관리 API](/ko/docs/api-services/project-management) | **View in English** (current page)

kvidAI's Project Management API is a REST interface for organizing video editing work into **projects** — long-lived containers that hold a Remotion-style **composition** (tracks, items, assets) plus chat history, rendering status, and per-project metadata.

You use this API when you want to build your own client around the same project model that powers [kvid.ai](https://kvid.ai) — for example a bulk-import script, an integration pipeline, or a workflow that hands a composition to the [Agent API](./agent-api.md) for AI editing.

## 🎯 Service Overview

### Concepts

- **Project** — a JSON record per video editor session. Owned by the caller, holds the `composition`, `chat_history`, `status` (`draft` / `rendering` / `completed`), an optional `preset_id`, and a `thumbnail_url`.
- **Composition** — Remotion-compatible JSON: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. Mutated through `PATCH /:id/composition` so you don't have to re-send the entire record every time.
- **Preset** — a reusable JSON config (voice / tone / color palette / scene defaults) selected at creation time via `presetId`. Managed via the [Preset API](./preset-api.md). Legacy field name `templateId` is still accepted.

### Authentication

Every endpoint is authenticated with a single **`api-key`** header. The APIM gateway resolves that key to the owning user and injects the identity for you — **you never pass `email` in the body or query**. Keys cannot read or mutate other users' projects.

Get an API key at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

> Plain CRUD calls on this API are free. Pricing for AI-driven operations (generation triggered via the agent) is documented in [Pricing](../pricing.md).

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST`   | `/video-project/create`             | Create a new project |
| `GET`    | `/video-project`                    | List the caller's projects (paginated) |
| `GET`    | `/video-project/:id`                | Fetch one project (includes composition) |
| `PUT`    | `/video-project/:id`                | Update top-level fields / whole composition |
| `PATCH`  | `/video-project/:id/composition`    | Patch the composition tree (fine-grained ops) |

---

### 1. Create a project

`POST /video-project/create`

Creates a new project. The caller becomes the owner.

**Optional body**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `name` | string | `"Untitled Project"` | Display name. |
| `composition` | object | 1080×1920 @ 30fps, empty tracks | Initial composition: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. Any item's `durationInFrames < 1` is clamped to `1`. |
| `settings` | object | `{}` | Free-form per-project preferences (editor state, etc.). |
| `presetId` / `preset_id` | string | `null` | Preset to attach (voice / tone / color seed). When omitted, the agent falls back to `system_default`. |
| `templateId` / `template_id` | string | `null` | Legacy alias for `presetId` — send either one. |

**Auto-set fields**: `status = "draft"`, `chat_history = []`, `last_edited_at = now()`, and `thumbnail_url` is auto-extracted from the first image asset in the composition (else `null`).

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

- `data.id` — the `projectId` used by every subsequent call.
- `data.status ∈ { draft, rendering, completed }` — new projects are always `draft`.

---

### 2. List the caller's projects

`GET /video-project`

Returns the caller's projects. The `composition` payload is omitted from the list (payload optimization) — use `GET /video-project/:id` for the full record.

**Optional query parameters**

| Parameter | Type | Default | Constraint | Notes |
|-----------|------|---------|------------|-------|
| `page` | number | `1` | ≥ 1 | Page number. |
| `pageSize` | number | `12` | ≤ 50 | Items per page. |
| `search` | string | — | — | Case-insensitive substring match on `name`. |
| `sort` | string | `latest` | `latest` \| `oldest` \| `name-asc` \| `name-desc` | Sort order. |
| `status` | string | — | `draft` \| `rendering` \| `completed` | Status filter. |

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

### 3. Fetch one project

`GET /video-project/:id`

Returns the full record — `composition` (tracks / items / assets), `chat_history`, `settings`, `preset_id`, `thumbnail_url`, `status`, and timestamps.

**Path parameter**: `id` — projectId (integer), the `data.id` from `POST /video-project/create`.

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

### 4. Update a project

`PUT /video-project/:id`

Updates only the fields you send. The composition can be replaced here too — but for fine-grained edits prefer [`PATCH /video-project/:id/composition`](#5-patch-the-composition).

**Path parameter**: `id` — projectId (integer).

**Optional body — only the fields you send are updated**

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name. |
| `composition` | object | Full replacement (sanitized; `durationInFrames < 1` → `1`). |
| `status` | string | `draft` \| `rendering` \| `completed`. |
| `settings` | object | Free-form per-project preferences. |
| `thumbnail_url` | string | Used as-is if sent. If omitted while the composition changes, it is auto-extracted from the first image asset. |

`last_edited_at` is always set to `now()`.

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

### 5. Patch the composition

`PATCH /video-project/:id/composition`

Applies a single fine-grained change to the composition. The controller supports **exactly six** operations: `add_item`, `update_item`, `delete_item`, `add_track`, `add_asset`, and `replace`. After every operation the composition is re-sanitized, `last_edited_at` is refreshed, and `thumbnail_url` is re-extracted from the first image asset.

**Required body**

| Field | Where | Notes |
|-------|-------|-------|
| `id` | path | projectId (integer). |
| `operation` | body | One of the six operations below. |
| `data` | body | Payload specific to the operation. |

> There is **no `remove_item`, `remove_asset`, or `patch_item` operation.** Delete an item with `delete_item`; to remove an asset, use `replace` with the full composition (or the `deletedAssets` array, which `replace` processes automatically).

#### `operation: "replace"` — replace the whole composition

The most common flow: after the agent's SSE `done`, save the mutated composition wholesale.

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

| Field (`data.composition.*`) | Type | Description |
|---|---|---|
| `fps` | integer | Frame rate (usually 30). |
| `compositionWidth` | integer | Resolution width. |
| `compositionHeight` | integer | Resolution height. |
| `tracks` | array | Array of `{ id, items[], hidden, muted }`. |
| `items` | object | `itemId → item` map. Each item's `durationInFrames < 1` is clamped to `1`. |
| `assets` | object | `assetId → asset` metadata map. |

#### `operation: "add_item"` — add a single item

```jsonc
{
  "operation": "add_item",
  "data": {
    "trackId": "track-1",
    "item": { "id": "item-7", "type": "text", "text": "Hello", "from": 0, "durationInFrames": 90 }
  }
}
```

The item lands in `composition.items[item.id]` and is pushed onto the `items[]` of the track named by `trackId`.

#### `operation: "update_item"` — merge fields into an item

```jsonc
{ "operation": "update_item", "data": { "itemId": "item-3", "updates": { "from": 60, "durationInFrames": 120 } } }
```

Merges `{ ...existing, ...updates }`. Ignored if the item doesn't exist.

#### `operation: "delete_item"` — delete a single item

```jsonc
{ "operation": "delete_item", "data": { "itemId": "item-3" } }
```

Removes `composition.items[itemId]` and drops that id from every track's `items[]`.

#### `operation: "add_track"` — add a track

```jsonc
{ "operation": "add_track", "data": { "track": { "id": "track-2", "items": [], "hidden": false, "muted": false } } }
```

#### `operation: "add_asset"` — add an asset

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

## End-to-End: build a project, then let the agent edit it

```python
import requests

API_KEY = "YOUR_API_KEY"

# 1. Create a project (pick a preset up front so the agent gets sensible defaults)
project = requests.post(
    "https://api.kvid.ai/video-project/create",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"name": "Tech Review", "presetId": "sod"},
).json()["data"]

# 2. Hand the project to the Agent API — see ./agent-api.md for the streaming protocol
#    (the Agent API mutates the composition through /composition under the hood)
```

See the [Agent API guide](./agent-api.md) for the streaming side of the flow.

---

## Error Responses

All errors share the shape `{ "success": false, "error": "...", "message": "...", "data": ... }` so a single client helper can render them.

| HTTP | When |
|------|------|
| `401` | Unauthenticated — `api-key` header missing or invalid. |
| `403` | Access denied — the key does not own the target project. |
| `404` | `PROJECT_NOT_FOUND` — `id` doesn't exist. |
| `400` | `Unknown operation: <name>` — composition `operation` outside the six supported values. |
