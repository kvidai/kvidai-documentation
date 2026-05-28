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

short-lived **presigned PUT URL** 을 발급받아 미디어 파일 (이미지, 영상, 오디오, PDF, 텍스트) 을 kvidAI CDN 에 직접 업로드. 업로드 후 응답의 `cdnUrl` 을 [Agent API](./agent-api) 의 `attachedFiles[].cdnUrl` 로 전달하면 — agent 가 그걸 `composition.assets[]` 레퍼런스로 사용 (재업로드 없음).

외부 client (Skills, CLI, server-to-server) 가 수백 KB 이상 파일 다룰 때 **권장** 경로. agent endpoint 의 기존 `base64` inline 경로는 웹 에디터의 작은 파일에 그대로 유지되며 변경 없음.

## 🎯 서비스 개요

### 왜 presigned URL?

| 측면 | Multipart inline (legacy) | Presigned (이 API) |
|---|---|---|
| 네트워크 hop | client → server → CDN (큰 hop 두 번) | client → CDN 직접 (큰 hop 한 번) |
| APIM body 제한 | APIM/proxy body 사이즈 제한에 묶임 | metadata JSON 만 APIM 통과 |
| 인증 | 모든 byte 에 api-key | URL 요청 시에만 api-key, PUT 은 signed URL |
| 적합한 경우 | 브라우저의 작은 base64 | 외부 client, 대용량 파일 |

14 MB MP4 실측 — 같은 업링크에서 두 흐름 모두 ~12초. 다만 multipart 는 서버→CDN write 가 추가되어 backend 가 멀어질수록 격차 벌어짐.

### 핵심 개념

- **`uploadUrl`** — Signed `https://...digitaloceanspaces.com/...` PUT URL. TTL 내 single-use.
- **`headers`** — PUT 시 클라이언트가 반드시 보내야 할 두 헤더: `Content-Type` (`mimeType` 일치) + `x-amz-acl: public-read`. `x-amz-acl` 누락 시 객체가 private 으로 저장되어 `cdnUrl` 이 403.
- **`cdnUrl`** — CDN 도메인의 최종 public URL (예: `ht-wp-prod1.sfo3.cdn.digitaloceanspaces.com/...`). signed URL 이 아닌 안정 CDN 경로라 영구.
- **`key`** — 버킷 내 object key. `{directory}/presigned-uploads/{email-hash}/{uuid}/{sanitized-filename}` 구조로 collision-free + owner-correlatable.
- **`expiresInSeconds`** — 기본 1800 (30분). 큰 업로드 중간 timeout 방지.

### 인증

- 메타데이터 요청에 `api-key` 헤더 — kvidAI API 키
- APIM 이 owner email 을 `X-Kvidai-User-Email` 로 주입 → key prefix 의 ownership scope. body 에 `email` 안 보냄.

DO Spaces 로의 PUT 은 signed URL 만 사용 — API 키 불필요.

## 📡 API 엔드포인트

```
Base URL:       https://api.kvid.ai/media
Authentication: api-key 헤더 (메타데이터 요청용; PUT 은 signed URL 사용)
```

| Method | Path | 용도 |
|--------|------|-----|
| `POST`   | `/media/presigned-upload-url`   | presigned PUT URL 발급 |
| `GET`    | `/media/files`                  | 호출자의 파일 목록 (Strapi 가 관리하는 메타데이터) |
| `GET`    | `/media/files/{fileId}`         | 파일 메타데이터 단건 조회 |
| `PUT`    | `/media/files/{fileId}`         | 파일 메타데이터 수정 (name, alt text, caption) |
| `DELETE` | `/media/files/{fileId}`         | 파일 삭제 (owner only) |
| `GET`    | `/media/stats`                  | 보관 통계 (개수, 총 사이즈, 타입별) |

> **주의** — `GET /media/files` 는 Strapi DB row 가 있는 파일만 반환합니다. presigned 업로드 흐름은 DO Spaces 에 바이너리만 저장하고 Strapi row 는 만들지 않으므로 그 파일들은 `/media/files` 리스트에 안 나타납니다. 다만 반환된 `cdnUrl` 로는 public 접근 가능합니다. (향후 클라이언트가 업로드를 Strapi row 로 등록하는 endpoint 추가 예정.)

---

### 1. presigned 업로드 URL 발급

`POST /media/presigned-upload-url`

**Request body**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `filename` | string | 예 | 원본 파일명. 서버에서 sanitize 되고 key 끝에 보존됩니다. |
| `mimeType` | string | 예 | PUT 시 `Content-Type` 헤더로 **같은 값** 보내야 함 — DO Spaces 가 둘 다 sign 검증. |
| `size` | integer | 아니오 | 검증용. 현재 200 MB 초과 시 413. |

**응답**

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

**에러**

| Status | Code | 원인 |
|---|---|---|
| 400 | `FILENAME_REQUIRED` / `MIMETYPE_REQUIRED` | body 의 required field 누락 |
| 400 | `EMAIL_REQUIRED` | 헤더/body 둘 다 owner email 없음 |
| 404 | `USER_NOT_FOUND` | kvidAI 에 등록되지 않은 owner email |
| 413 | `FILE_TOO_LARGE` | `size` 가 서버 cap 초과 |

---

### 2. 파일 업로드 (DO Spaces 로 PUT)

이 단계는 **kvidAI API 영역 바깥** — CDN 으로 직접.

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/png" \
  -H "x-amz-acl: public-read" \
  --data-binary @logo.png
```

두 헤더 모두 필수. 서버가 반환한 `headers` 객체를 그대로 spread 하면 편함:

```javascript
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: presign.headers,  // { 'Content-Type': '...', 'x-amz-acl': 'public-read' }
  body: fileBuffer,
});
```

`200` 받으면 `cdnUrl` 즉시 접근 가능.

---

### 3. Agent API 에 cdnUrl 전달

Agent API 의 `attachedFiles[]` 는 `base64` 또는 `cdnUrl` 둘 다 받음. 대용량 미디어는 `cdnUrl` 권장:

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

PDF / text 첨부는 아직 `cdnUrl` **미지원** — agent 가 텍스트 추출 위해 binary inline 필요. PDF/text 는 `base64` 사용.

---

### 4. List / Get / Update / Delete

Strapi 가 관리하는 파일 메타데이터에 대한 표준 CRUD. 각 요청은 파일의 `caption` 안의 email-hash 로 호출자 자기 파일에만 scope. 예시 payload 는 Bruno collection (`api-tests/azure-api-management/media/`) 참조.

## End-to-end 예시 (Node)

```javascript
import fs from 'node:fs';

const API_KEY = process.env.KVIDAI_API_KEY;
const file = fs.readFileSync('./logo.png');

// 1. presigned URL 발급
const presignRes = await fetch('https://api.kvid.ai/media/presigned-upload-url', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'logo.png', mimeType: 'image/png', size: file.length }),
});
const { data: presign } = await presignRes.json();

// 2. 바이너리 PUT
await fetch(presign.uploadUrl, {
  method: 'PUT',
  headers: presign.headers,
  body: file,
});

// 3. agent 에 cdnUrl 전달
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

## 비고

- **Key prefix 가 해시** — 다른 사용자의 업로드를 key 추측으로 enumerate 할 수 없음.
- **객체는 `public-read`** 가 기본 — agent 와 Remotion 렌더러가 URL fetch 해야 동작. 민감 자료는 업로드하지 마세요.
- **TTL 은 PUT 까지만**. 업로드 후 `cdnUrl` 은 영구.
- **자동 Strapi row 미생성** 이유 — 흔한 "upload + 바로 agent 사용" 경로의 round-trip 1번 절약. 브라우저블한 파일 관리는 기존 multipart `POST /api/media-management/upload` 또는 향후 `POST /media/complete-upload` 사용.
