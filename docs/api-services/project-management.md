---
title: Project Management API
description: kvidAI Project Management API — create, list, update, duplicate, and render video projects through a REST interface.
keywords: [project management API, video project API, composition API, kvidAI API, video editor backend, REST API]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: project-management
tags: [API, Project, Composition]
sidebar_position: 5
---

# Project Management API

kvidAI's Project Management API is a REST interface for organizing video editing work into **projects** — long-lived containers that hold a Remotion-style **composition** (tracks, items, assets) plus chat history, rendering status, and per-project metadata.

You use this API when you want to build your own client around the same project model that powers [kvid.ai](https://kvid.ai) — for example a bulk-import script, a Slack bot that triggers renders, or an integration pipeline that hands a composition to the [Agent API](./agent-api.md) for AI editing.

## 🎯 Service Overview

### Concepts

- **Project** — a JSON record per video editor session. Owned by a user (`email`), holds the `composition`, `chat_history`, `status` (`draft` / `rendering` / `completed` / `failed`), an optional `template_id`, and a `thumbnail_url`.
- **Composition** — Remotion-compatible JSON: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. Mutated through `PATCH /composition` so you don't have to re-send the entire record.
- **Template** — a Strapi `video-template` record selected at creation time. Drives the default voice, tone, color palette, and so on. Set with `templateId` in `create`.

### Authentication

Every endpoint identifies the caller by **`email`** (passed in the request body or as a query parameter) plus an **API key** delivered in the `api-key` header. The backend verifies the key resolves to that email — keys cannot read or mutate other users' projects.

Get an API key at [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

> Pricing for AI-driven operations (rendering, generation triggered via the agent) is documented in [Pricing](../pricing.md). Plain CRUD calls on this API are free.

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST`   | `/api/video-project` | Create a new project |
| `GET`    | `/api/video-project` | List projects for a user (paginated) |
| `GET`    | `/api/video-project/:id` | Fetch one project (includes composition) |
| `PUT`    | `/api/video-project/:id` | Update top-level fields (name, status, thumbnail) |
| `PATCH`  | `/api/video-project/:id/composition` | Patch the composition tree |
| `POST`   | `/api/video-project/:id/duplicate` | Clone a project (composition + template) |
| `POST`   | `/api/video-project/:id/render` | Kick off a render job |
| `POST`   | `/api/video-project/:id/chat` | Append a message to the project's chat history |
| `DELETE` | `/api/video-project/:id` | Delete a project |

---

### 1. Create a project

`POST /api/video-project`

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Owner's email (matches API key). |
| `name` | string | no | Defaults to `"Untitled Project"`. |
| `composition` | object | no | Initial composition. Defaults to an empty 1920×1080 composition. |
| `settings` | object | no | Free-form per-project preferences. |
| `templateId` | string | no | Strapi `video-template.templateId`. `null` falls back to `system_default`. |

**Python**

```python
import requests

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"

resp = requests.post(
    "https://api.kvid.ai/api/video-project",
    headers={
        "api-key": API_KEY,
        "Content-Type": "application/json",
    },
    json={
        "email": EMAIL,
        "name": "Sunset Beach Promo",
        "templateId": "review-owl",
    },
)
resp.raise_for_status()
project = resp.json()["data"]
print(project["id"], project["status"])
```

**JavaScript (Node)**

```javascript
const res = await fetch("https://api.kvid.ai/api/video-project", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "you@example.com",
    name: "Sunset Beach Promo",
    templateId: "review-owl",
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
    "name": "Sunset Beach Promo",
    "email": "you@example.com",
    "composition": { "fps": 30, "compositionWidth": 1920, "compositionHeight": 1080, "tracks": [], "items": {}, "assets": {} },
    "status": "draft",
    "thumbnail_url": null,
    "template_id": "review-owl",
    "last_edited_at": "2026-05-26T09:00:00.000Z"
  }
}
```

---

### 2. List a user's projects

`GET /api/video-project?email={email}`

**Query parameters**

| Parameter | Default | Notes |
|-----------|---------|-------|
| `email` | required | Owner |
| `page` | `1` | 1-based |
| `pageSize` | `12` | Max `50` |
| `search` | — | Case-insensitive partial match on `name` |
| `sort` | `latest` | `latest` / `oldest` / `name-asc` / `name-desc` |
| `status` | — | Filter to one of `draft` / `rendering` / `completed` |

```bash
curl -G "https://api.kvid.ai/api/video-project" \
  -H "api-key: $KVIDAI_API_KEY" \
  --data-urlencode "email=you@example.com" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=20" \
  --data-urlencode "sort=latest"
```

```json
{
  "success": true,
  "data": [
    { "id": 1234, "name": "Sunset Beach Promo", "status": "draft", "thumbnail_url": "https://...", "last_edited_at": "..." }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 20, "total": 37, "pageCount": 2 }
  }
}
```

Project summaries omit `composition` and `chat_history` to keep responses small. Use the `GET /:id` endpoint to fetch the full record.

---

### 3. Fetch one project

`GET /api/video-project/:id?email={email}`

Returns the full record including `composition`, `chat_history`, `settings`, and `template_id`.

```python
resp = requests.get(
    f"https://api.kvid.ai/api/video-project/{project_id}",
    headers={"api-key": API_KEY},
    params={"email": EMAIL},
)
project = resp.json()["data"]
print(len(project["composition"]["tracks"]), "tracks")
```

---

### 4. Update top-level fields

`PUT /api/video-project/:id`

Use this for non-composition edits — renaming, marking complete, attaching a thumbnail, swapping settings.

```javascript
await fetch(`https://api.kvid.ai/api/video-project/${id}`, {
  method: "PUT",
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "you@example.com",
    name: "Sunset Beach Promo — final cut",
    status: "completed",
  }),
});
```

To patch the composition, use `PATCH /:id/composition` instead — that endpoint understands `replace` / `merge` operations and only ships the diff.

---

### 5. Patch the composition

`PATCH /api/video-project/:id/composition`

**Request body**

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | Owner. |
| `operation` | `"replace"` \| `"merge"` | `replace` overwrites the entire composition. `merge` shallow-merges top-level keys. |
| `data.composition` | object | The new composition (full or partial depending on `operation`). |

```python
new_composition = {
    "fps": 30,
    "compositionWidth": 1920,
    "compositionHeight": 1080,
    "tracks": [{ "id": "track-1", "trackType": "video", "name": "Main", "items": ["item-1"] }],
    "items": {
        "item-1": { "id": "item-1", "type": "video", "assetId": "asset-1", "from": 0, "durationInFrames": 150 },
    },
    "assets": {
        "asset-1": { "id": "asset-1", "type": "video", "remoteUrl": "https://cdn.kvid.ai/.../clip.mp4", "durationInSeconds": 5 },
    },
}

requests.patch(
    f"https://api.kvid.ai/api/video-project/{project_id}/composition",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"email": EMAIL, "operation": "replace", "data": {"composition": new_composition}},
)
```

The endpoint also recomputes `thumbnail_url` from the first image asset, so you don't need to upload a thumbnail separately.

---

### 6. Duplicate a project

`POST /api/video-project/:id/duplicate`

Clones composition, settings, and `template_id`. Chat history is **not** copied. The new project starts as `draft`.

```javascript
const res = await fetch(`https://api.kvid.ai/api/video-project/${id}/duplicate`, {
  method: "POST",
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "you@example.com",
    name: "Sunset Beach Promo (variant B)",
  }),
});
const { data: clone } = await res.json();
```

---

### 7. Start a render

`POST /api/video-project/:id/render`

Triggers a server-side render. Returns immediately; poll `GET /:id` for `status` transitions (`draft` → `rendering` → `completed` / `failed`) and read `render_url` on success.

```python
requests.post(
    f"https://api.kvid.ai/api/video-project/{project_id}/render",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"email": EMAIL},
)

# Poll until completed
import time
while True:
    project = requests.get(
        f"https://api.kvid.ai/api/video-project/{project_id}",
        headers={"api-key": API_KEY},
        params={"email": EMAIL},
    ).json()["data"]
    if project["status"] in ("completed", "failed"):
        break
    time.sleep(5)

print(project["render_url"])
```

---

### 8. Append a chat message

`POST /api/video-project/:id/chat`

Stores a message in the project's persistent chat history. The [Agent API](./agent-api.md) calls this automatically; explicit use is mainly for surfacing system notes from your own pipeline.

```javascript
await fetch(`https://api.kvid.ai/api/video-project/${id}/chat`, {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "you@example.com",
    message: { role: "system", content: "Imported 12 clips from Dropbox folder /sunset-shoot" },
  }),
});
```

---

### 9. Delete a project

`DELETE /api/video-project/:id?email={email}`

Hard delete — the record is removed and cannot be restored. Render outputs already stored on CDN are not deleted automatically; track them separately if you need to clean up media.

```bash
curl -X DELETE "https://api.kvid.ai/api/video-project/1234?email=you@example.com" \
  -H "api-key: $KVIDAI_API_KEY"
```

---

## End-to-End: Build a project, then let the agent edit it

```python
import requests

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"

# 1. Create a project (pick a template up front so the agent gets sensible defaults)
project = requests.post(
    "https://api.kvid.ai/api/video-project",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"email": EMAIL, "name": "Tech Review", "templateId": "sod"},
).json()["data"]

# 2. Hand the project to the Agent API — see ./agent-api.md for the streaming protocol
#    (the Agent API will mutate the composition through /composition under the hood)
```

See the [Agent API guide](./agent-api.md) for the streaming side of the flow.

---

## Error Responses

| HTTP | Body example | When |
|------|--------------|------|
| `400` | `{ "error": "EMAIL_REQUIRED" }` | Missing required field |
| `401` | `{ "error": "UNAUTHORIZED" }` | Bad or missing API key |
| `403` | `{ "error": "FORBIDDEN" }` | API key does not own the target project |
| `404` | `{ "error": "PROJECT_NOT_FOUND" }` | `id` doesn't exist |
| `409` | `{ "error": "CONCURRENT_LIMIT" }` | Another long-running job (render / agent) is already in flight |
| `500` | `{ "error": "INTERNAL_ERROR" }` | Unexpected failure — inspect `message` |

All error responses share the shape `{ "success": false, "error": "...", "message": "...", "data": { ... } }` so a single client helper can render them.
