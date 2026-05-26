---
title: Project 관리 API
description: kvidAI Project 관리 API — REST 인터페이스로 비디오 프로젝트를 생성, 조회, 수정, 복제, 렌더링합니다.
slug: project-management
tags: [API, Project, Composition, 프로젝트관리]
sidebar_position: 5
---

# Project 관리 API

kvidAI의 Project 관리 API는 비디오 편집 작업을 **프로젝트** 단위로 관리하는 REST 인터페이스입니다. 각 프로젝트는 Remotion 호환 **composition** (트랙 / 아이템 / 에셋), 채팅 히스토리, 렌더링 상태, 프로젝트별 메타데이터를 보관합니다.

[kvid.ai](https://kvid.ai) 의 에디터와 동일한 프로젝트 모델 위에서 직접 클라이언트를 만들고 싶을 때 사용합니다 — 예: 대량 임포트 스크립트, 슬랙 봇 트리거 렌더, [Agent API](./agent-api.md) 와 연동된 자동 편집 파이프라인 등.

## 🎯 서비스 개요

### 핵심 개념

- **Project (프로젝트)** — 비디오 에디터 세션 하나당 JSON 레코드. 소유자는 `email`, 보관 항목은 `composition`, `chat_history`, `status` (`draft` / `rendering` / `completed` / `failed`), 선택적 `template_id`, `thumbnail_url`.
- **Composition** — Remotion 호환 JSON: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. 전체 레코드를 다시 보내지 않고 `PATCH /composition` 으로 부분 수정 가능.
- **Template** — 프로젝트 생성 시 선택하는 Strapi `video-template` 레코드. 기본 음성·톤·색상 팔레트 등을 결정. `create` 의 `templateId` 필드로 지정.

### 인증

모든 엔드포인트는 **`email`** (요청 body 또는 query param) + **API 키** (`api-key` 헤더) 로 호출자를 식별합니다. 백엔드는 API 키가 그 이메일의 것인지 검증합니다 — 다른 사용자 프로젝트를 읽거나 수정할 수 없습니다.

API 키 발급: [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys)

> AI 가 수행하는 작업 (렌더링, agent 가 트리거하는 미디어 생성) 의 크레딧 요금은 [Pricing](../pricing.md) 페이지에 정리돼 있습니다. 본 API 의 단순 CRUD 호출은 무료입니다.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
```

| Method | Path | 용도 |
|--------|------|------|
| `POST`   | `/api/video-project` | 새 프로젝트 생성 |
| `GET`    | `/api/video-project` | 사용자별 프로젝트 목록 (페이지네이션) |
| `GET`    | `/api/video-project/:id` | 단일 프로젝트 조회 (composition 포함) |
| `PUT`    | `/api/video-project/:id` | 최상위 필드 수정 (이름, status, thumbnail) |
| `PATCH`  | `/api/video-project/:id/composition` | composition 트리 부분 수정 |
| `POST`   | `/api/video-project/:id/duplicate` | 프로젝트 복제 (composition + template 포함) |
| `POST`   | `/api/video-project/:id/render` | 렌더링 작업 시작 |
| `POST`   | `/api/video-project/:id/chat` | 프로젝트 채팅 히스토리에 메시지 추가 |
| `DELETE` | `/api/video-project/:id` | 프로젝트 삭제 |

---

### 1. 프로젝트 생성

`POST /api/video-project`

**Request body**

| 필드 | 타입 | 필수 | 설명 |
|-------|------|----------|-------|
| `email` | string | 예 | 소유자 이메일 (API 키와 일치). |
| `name` | string | 아니오 | 기본값 `"Untitled Project"`. |
| `composition` | object | 아니오 | 초기 composition. 기본값은 빈 1920×1080. |
| `settings` | object | 아니오 | 프로젝트 별 자유 형식 설정. |
| `templateId` | string | 아니오 | Strapi `video-template.templateId`. `null` 이면 `system_default` fallback. |

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

### 2. 사용자 프로젝트 목록

`GET /api/video-project?email={email}`

**Query parameters**

| 파라미터 | 기본값 | 설명 |
|-----------|---------|-------|
| `email` | 필수 | 소유자 |
| `page` | `1` | 1부터 시작 |
| `pageSize` | `12` | 최대 `50` |
| `search` | — | `name` 부분 일치 (대소문자 무관) |
| `sort` | `latest` | `latest` / `oldest` / `name-asc` / `name-desc` |
| `status` | — | `draft` / `rendering` / `completed` 중 하나로 필터 |

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

목록 응답은 페이로드 크기를 줄이기 위해 `composition` / `chat_history` 는 포함하지 않습니다. 전체 레코드가 필요하면 `GET /:id` 호출.

---

### 3. 단일 프로젝트 조회

`GET /api/video-project/:id?email={email}`

`composition`, `chat_history`, `settings`, `template_id` 포함 전체 레코드를 반환합니다.

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

### 4. 최상위 필드 수정

`PUT /api/video-project/:id`

이름 변경, status 변경 (완료 처리), 썸네일 부착, 설정 변경 등 composition 외 수정에 사용.

```javascript
await fetch(`https://api.kvid.ai/api/video-project/${id}`, {
  method: "PUT",
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "you@example.com",
    name: "Sunset Beach Promo — 최종본",
    status: "completed",
  }),
});
```

composition 수정은 `PATCH /:id/composition` 사용 — `replace` / `merge` 연산 지원이라 변경분만 보내면 됩니다.

---

### 5. Composition 부분 수정

`PATCH /api/video-project/:id/composition`

**Request body**

| 필드 | 타입 | 설명 |
|-------|------|-------|
| `email` | string | 소유자. |
| `operation` | `"replace"` \| `"merge"` | `replace` 는 composition 전체 덮어쓰기. `merge` 는 최상위 키 얕은 병합. |
| `data.composition` | object | 새 composition (operation 에 따라 전체 또는 부분). |

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

이 엔드포인트는 첫 번째 이미지 에셋에서 `thumbnail_url` 도 자동 재계산하므로 썸네일을 별도로 업로드할 필요 없습니다.

---

### 6. 프로젝트 복제

`POST /api/video-project/:id/duplicate`

composition / settings / `template_id` 를 복사합니다. 채팅 히스토리는 **복사되지 않습니다**. 새 프로젝트는 `draft` 상태로 시작.

```javascript
const res = await fetch(`https://api.kvid.ai/api/video-project/${id}/duplicate`, {
  method: "POST",
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "you@example.com",
    name: "Sunset Beach Promo (변형 B)",
  }),
});
const { data: clone } = await res.json();
```

---

### 7. 렌더링 시작

`POST /api/video-project/:id/render`

서버 사이드 렌더링을 트리거합니다. 즉시 반환되니 `GET /:id` 폴링으로 `status` 변화 (`draft` → `rendering` → `completed` / `failed`) 를 확인하고, 성공 시 `render_url` 을 읽습니다.

```python
requests.post(
    f"https://api.kvid.ai/api/video-project/{project_id}/render",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"email": EMAIL},
)

# 완료까지 폴링
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

### 8. 채팅 메시지 추가

`POST /api/video-project/:id/chat`

프로젝트 영구 채팅 히스토리에 메시지 저장. [Agent API](./agent-api.md) 가 자동으로 호출하므로 명시적 사용은 주로 자체 파이프라인에서 시스템 노트를 남길 때 사용.

```javascript
await fetch(`https://api.kvid.ai/api/video-project/${id}/chat`, {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "you@example.com",
    message: { role: "system", content: "Dropbox 폴더 /sunset-shoot 에서 12개 클립 임포트 완료" },
  }),
});
```

---

### 9. 프로젝트 삭제

`DELETE /api/video-project/:id?email={email}`

하드 삭제 — 레코드가 제거되며 복구 불가. CDN 에 이미 저장된 렌더 결과물은 자동 삭제되지 않으므로 별도 정리 필요.

```bash
curl -X DELETE "https://api.kvid.ai/api/video-project/1234?email=you@example.com" \
  -H "api-key: $KVIDAI_API_KEY"
```

---

## End-to-End: 프로젝트 만들고 agent 에게 편집 맡기기

```python
import requests

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"

# 1. 프로젝트 생성 (template 미리 골라두면 agent 가 합리적인 기본값 적용)
project = requests.post(
    "https://api.kvid.ai/api/video-project",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"email": EMAIL, "name": "Tech Review", "templateId": "sod"},
).json()["data"]

# 2. Agent API 로 프로젝트 전달 — 스트리밍 프로토콜은 ./agent-api.md 참조
#    (Agent API 가 내부적으로 /composition 을 PATCH 해서 composition 을 갱신)
```

자세한 SSE 흐름은 [Agent API 가이드](./agent-api.md) 참조.

---

## Error Response

| HTTP | Body 예시 | 발생 시점 |
|------|--------------|------|
| `400` | `{ "error": "EMAIL_REQUIRED" }` | 필수 필드 누락 |
| `401` | `{ "error": "UNAUTHORIZED" }` | API 키 잘못됐거나 누락 |
| `403` | `{ "error": "FORBIDDEN" }` | API 키 소유자가 대상 프로젝트의 소유자가 아님 |
| `404` | `{ "error": "PROJECT_NOT_FOUND" }` | `id` 존재하지 않음 |
| `409` | `{ "error": "CONCURRENT_LIMIT" }` | 다른 장시간 작업 (렌더링 / agent) 이 이미 진행 중 |
| `500` | `{ "error": "INTERNAL_ERROR" }` | 예기치 못한 실패 — `message` 확인 |

모든 에러 응답은 `{ "success": false, "error": "...", "message": "...", "data": { ... } }` 형식을 공유하므로 단일 클라이언트 헬퍼로 처리 가능.
