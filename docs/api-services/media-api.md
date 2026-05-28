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

A 14 MB MP4 test measured ~12s on both flows over the same uplink, but multipart adds an extra server-side write to CDN (so the gap widens with larger files and more remote backends).

### Concepts

- **`uploadUrl`** — Signed `https://...digitaloceanspaces.com/...` PUT URL. Single-use within TTL.
- **`headers`** — Two headers the client must send during PUT: `Content-Type` (matching `mimeType`) and `x-amz-acl: public-read`. Without `x-amz-acl`, the object is stored private and `cdnUrl` returns 403.
- **`cdnUrl`** — Final public URL on the CDN domain (e.g. `ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/...`). Lifetime is unlimited — it's a stable CDN path, not a signed URL.
- **`key`** — Object key inside the bucket. Structured as `{directory}/presigned-uploads/{email-hash}/{uuid}/{sanitized-filename}` for collision-free, owner-correlatable storage.
- **`expiresInSeconds`** — Default 1800 (30 min). Generous so large uploads don't time out mid-transfer.

### Authentication

- `api-key` header on the metadata request — your kvidAI API key
- APIM injects the owner email as `X-Kvidai-User-Email`, used to scope ownership in the object key. No `email` field in the body.

The PUT to DO Spaces uses the signed URL only — no API key passed there.

## 📡 API Endpoints

```
Base URL:       https://api.kvid.ai/media
Authentication: api-key header (for metadata requests; PUT uses the signed URL)
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST`   | `/media/presigned-upload-url`   | Issue a presigned PUT URL |
| `GET`    | `/media/files`                  | List the caller's files (Strapi-managed metadata) |
| `GET`    | `/media/files/{fileId}`         | Get a single file's metadata |
| `PUT`    | `/media/files/{fileId}`         | Update file metadata (name, alt text, caption) |
| `DELETE` | `/media/files/{fileId}`         | Delete a file (caller must be owner) |
| `GET`    | `/media/stats`                  | Storage stats (count, total size, by type) |

> **Heads up** — `GET /media/files` only returns files that have a Strapi DB row. The presigned upload flow stores the binary on DO Spaces but does **not** create a Strapi row, so files uploaded that way don't appear in `/media/files` listings. They're still public on the returned `cdnUrl`. (A future endpoint will let clients register the upload as a Strapi row.)

---

### 1. Get a presigned upload URL

`POST /media/presigned-upload-url`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `filename` | string | yes | Original filename. Sanitized server-side and preserved at the end of the key. |
| `mimeType` | string | yes | Send the **same value** as `Content-Type` during PUT — DO Spaces signs both. |
| `size` | integer | no | Validation. Currently rejects > 200 MB with 413. |

**Response**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://ht-wp-prod1.sfo3.digitaloceanspaces.com/...?X-Amz-Signature=...",
    "headers": { "Content-Type": "image/png", "x-amz-acl": "public-read" },
    "key": "presigned-uploads/{email-hash}/{uuid}/logo.png",
    "cdnUrl": "https://ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/.../logo.png",
    "expiresInSeconds": 1800
  }
}
```

**Errors**

| Status | Code | Cause |
|---|---|---|
| 400 | `FILENAME_REQUIRED` / `MIMETYPE_REQUIRED` | Body missing required field |
| 400 | `EMAIL_REQUIRED` | Header / body had no resolvable owner email |
| 404 | `USER_NOT_FOUND` | Owner email not registered in kvidAI |
| 413 | `FILE_TOO_LARGE` | `size` exceeded the server cap |

---

### 2. Upload the file (PUT to DO Spaces)

This step happens **outside the kvidAI API surface** — directly to the CDN.

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/png" \
  -H "x-amz-acl: public-read" \
  --data-binary @logo.png
```

Both headers are mandatory. The server-returned `headers` object can be spread directly:

```javascript
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: presign.headers,  // { 'Content-Type': '...', 'x-amz-acl': 'public-read' }
  body: fileBuffer,
});
```

After a `200`, the `cdnUrl` is immediately resolvable.

---

### 3. Use the cdnUrl with the Agent API

The Agent API's `attachedFiles[]` accepts either `base64` or `cdnUrl`. For large media, prefer `cdnUrl`:

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
        \"cdnUrl\": \"$CDN_URL\"
      }
    ]
  }"
```

PDF / text attachments **don't** support `cdnUrl` yet — the agent needs the binary inline for text extraction, so use `base64` for those.

---

### 4. List, get, update, delete

Standard CRUD on Strapi-managed file metadata. Each request is scoped to the caller's own files via the email-hash in the file's `caption`. See the Bruno collection (`api-tests/azure-api-management/media/`) for example payloads.

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

// 2. PUT the binary
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: presign.headers,
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

## Notes

- **Key prefix is a hash**, not raw email — clients can't enumerate other users' uploads by guessing keys.
- **Object is `public-read`** by design — the agent and downstream Remotion renderer both need to fetch by URL. Don't upload sensitive material.
- **TTL is for the PUT only**. Once uploaded, the `cdnUrl` is permanent.
- **Why no automatic Strapi row?** Keeping the flow stateless avoids a second round-trip for the common "upload + immediately use with agent" case. If you need browseable files, use the legacy multipart `POST /api/media-management/upload` endpoint or wait for the future `POST /media/complete-upload`.
