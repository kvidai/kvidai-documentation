---
title: Media API
description: kvidAI Media API — direct CDN upload via presigned URL. Pass cdnUrl to the agent without round-tripping large files through the server.
keywords: [media API, presigned URL, CDN upload, file upload, kvidAI media, DigitalOcean Spaces, S3 presigned]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: media-api
tags: [API, Media, Upload, CDN, Presigned URL]
sidebar_position: 8
---

# Media API

> **한국어로 보기**: [미디어 API](/ko/docs/api-services/media-api) | **View in English** (current page)

Upload media files (images, video, audio, PDF, text) directly to the kvidAI CDN by requesting a short-lived **presigned PUT URL**. Once uploaded, pass the returned `cdnUrl` to the [Agent API](./agent-api) as `attachedFiles[].cdnUrl` — the agent uses it as a `composition.assets[]` reference without re-uploading.

This is the **recommended** path for any external client (Skills, CLI, server-to-server) handling files larger than a few hundred KB. The legacy `base64` inline path on the Agent API still works for small files from the web editor and is unchanged.

## 🎯 Service Overview

### Why presigned URL

| Aspect | Multipart inline (legacy) | Presigned (this API) |
|---|---|---|
| Network hops | client → server → CDN (two large hops) | client → CDN direct (single large hop) |
| APIM body limit | bound to APIM/proxy body limit | only the JSON metadata traverses APIM |
| Auth | api-key on every byte | api-key on the URL request only; PUT uses the signed URL |
| Best for | small base64 from a browser | external clients, large files |

### Concepts

- **`uploadUrl`** — Signed `https://...digitaloceanspaces.com/...` PUT URL. Single-use within its TTL.
- **`cdnUrl`** — Final public URL on the CDN domain (e.g. `ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/...`). Lifetime is unlimited — it's a stable CDN path, not a signed URL.
- **`key`** — Object key inside the bucket. Structured as `presigned-uploads/{email-hash}/{uuid}/{sanitized-filename}` for collision-free, owner-correlatable storage.
- **`expiresInSeconds`** — Default 1800 (30 min). Generous so large uploads don't time out mid-transfer.

### Authentication

- `api-key` header on the metadata request — your kvidAI API key.
- The APIM gateway resolves the key to the owner and scopes ownership in the object key. You **never pass `email` in the body**.

The PUT to DO Spaces uses the signed URL only — no API key is passed there.

## 📡 API Endpoints

### Base Information

```
Base URL:       https://api.kvid.ai/media
Authentication: api-key header (for metadata requests; PUT uses the signed URL)
Content-Type:   application/json
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST`   | `/media/presigned-upload-url`   | Issue a presigned PUT URL |
| `POST`   | `/media/complete-upload`        | Register a PUT object as an owned Strapi row (→ browseable) |
| `GET`    | `/media/files`                  | List the caller's files — requires `?email=` |
| `GET`    | `/media/files/:id`              | Get a single file's metadata — requires `?email=` |
| `PUT`    | `/media/files/:id`              | Update file metadata |
| `DELETE` | `/media/files/:id`              | Delete a file (caller must be owner) — requires `?email=` |
| `GET`    | `/media/stats`                  | Storage stats (count, total size, by type) — requires `?email=` |

> **Heads up** — a presigned-only upload puts the binary on DO Spaces but doesn't create a Strapi row, so it will **not** appear in `GET /media/files` listings (the object is anonymous). Follow up with `POST /media/complete-upload` to register ownership and make it browseable. The file is public on the returned `cdnUrl` either way.
>
> **Auth asymmetry** — upload routes (`presigned-upload-url`, `complete-upload`) resolve the owner from the api-key (APIM injects the email) and need no `email` in the request. The owner-scoped **read** routes (`files`, `files/:id`, `stats`) do **not** get the injected header and instead require the email as a `?email=` query param (omitting it → `400 EMAIL_REQUIRED`).

---

### 1. Get a presigned upload URL

`POST /media/presigned-upload-url`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `filename` | string | yes | Original filename. Sanitized server-side and preserved at the end of the key. |
| `mimeType` | string | yes | Send the **same value** as `Content-Type` during PUT — DO Spaces signs both (e.g. `image/png`, `video/mp4`). |
| `size` | integer | no | Validation only. Rejects files larger than **200 MB** with `413`. |

```bash
curl -X POST "https://api.kvid.ai/media/presigned-upload-url" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "filename": "logo.png", "mimeType": "image/png", "size": 102400 }'
```

**Response**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://ht-wp-prod1.sfo3.digitaloceanspaces.com/path?X-Amz-Signature=...",
    "key": "presigned-uploads/{email-hash}/{uuid}/logo.png",
    "cdnUrl": "https://ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/.../logo.png",
    "expiresInSeconds": 1800
  }
}
```

**Errors**

| Status | Cause |
|---|---|
| `400` | `filename` / `mimeType` missing. |
| `404` | Owner email not registered in kvidAI. |
| `413` | `size` exceeded 200 MB. |

---

### 2. Upload the file (PUT to DO Spaces)

This step happens **outside the kvidAI API surface** — directly to the CDN. Send `Content-Type` matching the `mimeType` you requested:

```bash
curl -X PUT "$uploadUrl" \
  -H "Content-Type: image/png" \
  --data-binary @logo.png
# → 200
curl -I "$cdnUrl"   # → 200
```

```javascript
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png' },  // matches the requested mimeType
  body: fileBuffer,
});
```

After a `200`, the `cdnUrl` is immediately resolvable.

---

### 3. Use the cdnUrl with the Agent API

The Agent API's `attachedFiles[]` accepts either `base64` or `cdnUrl`. For large media, prefer `cdnUrl` — and note there's no `email` or `apiKey` in the body; the `api-key` header is the identity:

```bash
curl -X POST "https://api.kvid.ai/agent/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": 42,
    \"message\": \"이 로고로 인트로 만들어줘\",
    \"attachedFiles\": [
      {
        \"name\": \"logo.png\",
        \"type\": \"image\",
        \"mimeType\": \"image/png\",
        \"size\": 102400,
        \"cdnUrl\": \"$cdnUrl\"
      }
    ]
  }"
```

PDF / text attachments **don't** support `cdnUrl` yet — the agent needs the binary inline for text extraction, so use `base64` for those.

---

### 4. List files

`GET /media/files`

Returns only files that have a Strapi DB row, scoped to the caller.

**Optional query parameters**

| Parameter | Type | Default | Constraint | Notes |
|---|---|---|---|---|
| `page` | number | `1` | ≥ 1 | Page number. |
| `pageSize` | number | `20` | ≤ 50 | Items per page. |
| `sort` | string | `createdAt:desc` | Strapi sort syntax | Sort order. |

```bash
curl -G "https://api.kvid.ai/media/files" \
  -H "api-key: YOUR_API_KEY" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=20" \
  --data-urlencode "sort=createdAt:desc"
```

```json
{
  "success": true,
  "data": [ { "id": 42, "name": "logo.png", "url": "...", "mime": "image/png", "size": 102.4 } ],
  "meta": { "pagination": { "page": 1, "pageSize": 20, "total": 12, "pageCount": 1 } }
}
```

`GET /media/files/:id`, `PUT /media/files/:id`, and `DELETE /media/files/:id` are standard CRUD on the same Strapi-managed metadata, each scoped to the caller's own files.

---

### 5. Storage stats

`GET /media/stats`

Total file count, total size, and a per-type breakdown for the caller.

```bash
curl -H "api-key: YOUR_API_KEY" "https://api.kvid.ai/media/stats"
```

```json
{
  "success": true,
  "data": {
    "totalFiles": 12,
    "totalSize": 145678901,
    "byType": { "image": 7, "video": 3, "audio": 1, "other": 1 }
  }
}
```

---

## End-to-end example (Node)

```javascript
import fs from 'node:fs';

const API_KEY = process.env.KVIDAI_API_KEY;
const file = fs.readFileSync('./logo.png');

// 1. Request presigned URL
const presignRes = await fetch('https://api.kvid.ai/media/presigned-upload-url', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'logo.png', mimeType: 'image/png', size: file.length }),
});
const { data: presign } = await presignRes.json();

// 2. PUT the binary (Content-Type matches the requested mimeType)
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png' },
  body: file,
});

// 3. Pass cdnUrl to the agent
await fetch('https://api.kvid.ai/agent/generate', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 42,
    message: '이 로고로 인트로 만들어줘',
    attachedFiles: [{
      name: 'logo.png',
      type: 'image',
      mimeType: 'image/png',
      size: file.length,
      cdnUrl: presign.cdnUrl,
    }],
  }),
});
```

## Register ownership (`complete-upload`)

Presigned upload alone is stateless — it avoids a second round-trip for the common "upload + immediately hand to agent" case. When you instead need the file to be **browseable as the user's own content** (e.g. an edited reference image the user should see in their web media library), follow the PUT with `POST /media/complete-upload`.

`POST /media/complete-upload`

| | |
|---|---|
| Headers | `Content-Type: application/json`, `api-key: <KVIDAI_API_KEY>` |
| Body (required) | `key`, `cdnUrl`, `filename`, `mimeType` — all already in hand from the presigned response/input |
| Body (optional) | `size` |
| Owner | resolved by APIM from the api-key (`X-Kvidai-User-Email`) — **no `email` in the body** |
| Response | `{ success: true, data: { id, url, name, mime, size } }` — `data.id` is the `fileId` used by the file routes |

Errors: `400 MISSING_PARAMETERS` (one of the four required fields missing), `400 EMAIL_REQUIRED` (auth couldn't resolve the owner), `500 COMPLETE_UPLOAD_FAILED` (Strapi registration failed).

```javascript
// After step 2 (PUT), register ownership so the file is browseable:
const doneRes = await fetch('https://api.kvid.ai/media/complete-upload', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: presign.key,
    cdnUrl: presign.cdnUrl,
    filename: 'logo.png',
    mimeType: 'image/png',
    size: file.length,
  }),
});
const { data: registered } = await doneRes.json();   // registered.id = fileId
```

## Notes

- **Key prefix is a hash**, not raw email — clients can't enumerate other users' uploads by guessing keys.
- **Object is public** by design — the agent and downstream Remotion renderer both need to fetch by URL. Don't upload sensitive material.
- **TTL is for the PUT only.** Once uploaded, the `cdnUrl` is permanent.
- **Two upload modes.** Presigned-only = fast, anonymous, agent-ready. Presigned + `complete-upload` = owner-registered, browseable in the web media library. Choose per use case.
