---
title: 미디어 API
description: kvidAI 미디어 API — presigned URL 로 CDN 직접 업로드. 대용량 파일을 서버 거치지 않고 agent 에 cdnUrl 만 전달
keywords: [미디어 API, presigned URL, CDN 업로드, 파일 업로드, kvidAI media]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: media-api
tags: [API, Media, Upload, CDN, Presigned URL]
sidebar_position: 8
---

# 미디어 API

> **View in English**: [Media API](/docs/api-services/media-api) | **한국어** (현재 페이지)

미디어 파일 (이미지, 비디오, 오디오, PDF, 텍스트) 을 짧은 수명의 **presigned PUT URL** 을 발급받아 kvidAI CDN 에 직접 업로드합니다. 업로드 후 반환된 `cdnUrl` 을 [Agent API](./agent-api) 의 `attachedFiles[].cdnUrl` 로 넘기면 — agent 가 재업로드 없이 `composition.assets[]` 참조로 사용합니다.

수백 KB 이상의 파일을 다루는 모든 외부 클라이언트 (Skills, CLI, server-to-server) 에 **권장**되는 경로입니다. Agent API 의 legacy `base64` inline 경로는 웹 에디터의 소용량 파일에 여전히 동작하며 변경되지 않았습니다.

## 🎯 서비스 개요

### presigned URL 을 쓰는 이유

| 항목 | Multipart inline (legacy) | Presigned (이 API) |
|---|---|---|
| 네트워크 홉 | client → server → CDN (큰 홉 2개) | client → CDN 직접 (큰 홉 1개) |
| APIM body limit | APIM/proxy body limit 에 종속 | JSON 메타데이터만 APIM 통과 |
| 인증 | 모든 바이트에 api-key | URL 요청에만 api-key; PUT 은 signed URL 사용 |
| 적합한 용도 | 브라우저의 소용량 base64 | 외부 클라이언트, 대용량 파일 |

### 개념

- **`uploadUrl`** — Signed `https://...digitaloceanspaces.com/...` PUT URL. TTL 내 1회용.
- **`cdnUrl`** — CDN 도메인의 최종 public URL (예: `ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/...`). 수명 무제한 — signed URL 이 아니라 안정적인 CDN 경로입니다.
- **`key`** — 버킷 내 오브젝트 key. `presigned-uploads/{email-hash}/{uuid}/{sanitized-filename}` 구조로 충돌 없이 owner 상관 가능하게 저장됩니다.
- **`expiresInSeconds`** — 기본 1800 (30분). 대용량 업로드가 전송 중 timeout 되지 않도록 넉넉하게 설정.

### 인증

- 메타데이터 요청의 `api-key` 헤더 — kvidAI API 키.
- APIM 게이트웨이가 키를 owner 로 resolve 하고 오브젝트 key 에 ownership 을 scope 합니다. **body 에 `email` 을 넣지 않습니다.**

DO Spaces 로의 PUT 은 signed URL 만 사용합니다 — 거기에는 API 키를 넘기지 않습니다.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai/media
Authentication: api-key header (메타데이터 요청용; PUT 은 signed URL 사용)
Content-Type:   application/json
```

| Method | Path | 목적 |
|--------|------|------|
| `POST`   | `/media/presigned-upload-url`   | presigned PUT URL 발급 |
| `GET`    | `/media/files`                  | 호출자의 파일 목록 (Strapi 관리 메타데이터) |
| `GET`    | `/media/files/:id`              | 단건 파일 메타데이터 조회 |
| `PUT`    | `/media/files/:id`              | 파일 메타데이터 수정 |
| `DELETE` | `/media/files/:id`              | 파일 삭제 (호출자가 owner 여야 함) |
| `GET`    | `/media/stats`                  | 저장소 통계 (개수, 총 사이즈, 타입별) |

> **참고** — presigned 업로드만 한 파일은 DO Spaces 에 바이너리는 있지만 Strapi row 를 만들지 않아, `complete-upload` 후속 호출로 등록되기 전까지 `GET /media/files` 목록에 안 보일 수 있습니다. 파일은 반환된 `cdnUrl` 로 여전히 public 입니다.

---

### 1. presigned upload URL 발급

`POST /media/presigned-upload-url`

**Request Body**

| Field | Type | Required | 설명 |
|---|---|---|---|
| `filename` | string | yes | 원본 파일명. server 가 sanitize 해서 key 끝에 보존 |
| `mimeType` | string | yes | 이어지는 PUT 시 `Content-Type` 으로 **같은 값** 을 보내야 함 — DO Spaces 가 둘 다 서명 (예: `image/png`, `video/mp4`) |
| `size` | integer | no | validation 용. **200 MB** 초과 시 `413` |

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

| Status | 원인 |
|---|---|
| `400` | `filename` / `mimeType` 누락 |
| `404` | 등록되지 않은 owner email |
| `413` | `size` 가 200 MB 초과 |

---

### 2. 파일 업로드 (DO Spaces 로 PUT)

이 단계는 **kvidAI API 표면 밖** 에서 — CDN 으로 직접 — 일어납니다. 요청한 `mimeType` 과 일치하는 `Content-Type` 을 보냅니다:

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
  headers: { 'Content-Type': 'image/png' },  // 요청한 mimeType 과 일치
  body: fileBuffer,
});
```

`200` 이후 `cdnUrl` 은 즉시 resolve 됩니다.

---

### 3. cdnUrl 을 Agent API 에서 사용

Agent API 의 `attachedFiles[]` 는 `base64` 또는 `cdnUrl` 을 받습니다. 대용량 미디어는 `cdnUrl` 을 권장합니다 — body 에 `email` 이나 `apiKey` 는 없으며 `api-key` 헤더가 신원입니다:

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

PDF / 텍스트 첨부는 아직 `cdnUrl` 을 지원하지 않습니다 — agent 가 텍스트 추출을 위해 바이너리를 inline 으로 필요로 하므로 그런 파일은 `base64` 를 사용하세요.

---

### 4. 파일 목록

`GET /media/files`

Strapi DB row 가 있는 파일만, 호출자로 scope 해서 반환합니다.

**Optional Query**

| Parameter | Type | Default | 제약 | 설명 |
|---|---|---|---|---|
| `page` | number | `1` | ≥ 1 | 페이지 번호 |
| `pageSize` | number | `20` | ≤ 50 | 페이지당 항목 수 |
| `sort` | string | `createdAt:desc` | Strapi sort syntax | 정렬 |

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

`GET /media/files/:id`, `PUT /media/files/:id`, `DELETE /media/files/:id` 는 같은 Strapi 관리 메타데이터에 대한 표준 CRUD 이며, 각각 호출자 본인의 파일로 scope 됩니다.

---

### 5. 저장소 통계

`GET /media/stats`

호출자의 파일 총 개수 + 총 사이즈 + 타입별 분포.

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

## End-to-end 예시 (Node)

```javascript
import fs from 'node:fs';

const API_KEY = process.env.KVIDAI_API_KEY;
const file = fs.readFileSync('./logo.png');

// 1. presigned URL 요청
const presignRes = await fetch('https://api.kvid.ai/media/presigned-upload-url', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'logo.png', mimeType: 'image/png', size: file.length }),
});
const { data: presign } = await presignRes.json();

// 2. 바이너리 PUT (Content-Type 은 요청한 mimeType 과 일치)
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png' },
  body: file,
});

// 3. cdnUrl 을 agent 에 전달
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

## 참고

- **key prefix 는 hash** 이지 raw email 이 아닙니다 — 클라이언트가 key 를 추측해 다른 사용자의 업로드를 열거할 수 없습니다.
- **오브젝트는 설계상 public** 입니다 — agent 와 downstream Remotion 렌더러가 URL 로 fetch 해야 하기 때문입니다. 민감한 자료를 업로드하지 마세요.
- **TTL 은 PUT 에만 적용됩니다.** 업로드 후 `cdnUrl` 은 영구적입니다.
- **왜 Strapi row 자동 생성이 없나?** flow 를 stateless 로 유지해 "업로드 후 즉시 agent 에 사용" 이라는 흔한 케이스의 두 번째 round-trip 을 피하기 위함입니다. browseable 파일이 필요하면 향후 `complete-upload` 엔드포인트를 기다리세요.
