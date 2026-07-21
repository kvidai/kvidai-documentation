---
title: 에이전트 API
description: kvidAI Agent API — Server-Sent Events 기반 AI 비디오 composition 편집. 씬 플랜 생성, 미디어 생성 작업 실행, 중단된 long-video 렌더 이어가기.
keywords: [agent API, AI video editor, server-sent events, SSE, long video, scene plan, kvidAI agent, composition AI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: agent-api
tags: [API, Agent, AI, SSE, Composition, 에이전트]
sidebar_position: 6
---

# 에이전트 API

> **View in English**: [Agent API](/docs/api-services/agent-api) | **한국어로 보기** (현재 페이지)

kvidAI Agent API 로 [kvid.ai](https://kvid.ai) 에디터를 구동하는 동일한 AI 어시스턴트를 직접 코드에서 사용할 수 있습니다. 자연어 지시문을 보내면 agent 가 알아서 결정합니다 — 아이템 추가/수정, 이미지 생성, 비디오 생성, 멀티-씬 long-video 플랜 작성, 위 모든 것을 묶어 완성된 composition 으로 stitch.

응답은 **Server-Sent Events (SSE)** 로 스트리밍되므로 agent 가 작업 중인 동안에도 진행 상황을 사용자에게 보여줄 수 있습니다. short edit 은 1~3분, long video 는 수십 분까지 걸립니다.

## 🎯 서비스 개요

### Agent 가 할 수 있는 것

- **Short video 편집** — 텍스트 오버레이 추가, 배경 교체, 단일 이미지/비디오 아이템 재생성 ("흰색 쇼파를 가죽 검은색으로 변경"). 새 composition 스냅샷 반환.
- **Long video 플래닝** — 주제만 주면 ("아이폰 17 칩 8씬으로 설명") agent 가 먼저 씬 플랜을 emit 한 다음 모든 생성 작업 (이미지/비디오 + TTS 나레이션) 을 동시 미디어 큐로 실행. 진행 이벤트가 작업 중 스트리밍됨.
- **실패 후 resume** — 렌더 도중 크레딧이 소진되거나 연결이 끊긴 경우 `/agent/resume` 로 이어가면 미완료 씬만 재시도.
- **씬 단위 retry** — 전체 플랜을 다시 돌리지 않고 실패한 단일 씬만 외과적으로 재시도.

### 개념

- **`projectId`** — long-running 작업은 프로젝트에 연결됩니다 ([Project Management API](./project-management.md) 참조). 먼저 `POST /video-project/create` 로 생성하세요. agent 가 프로젝트의 composition 을 읽고 씁니다.
- **`composition`** — 선택적으로 request body 에 담아 보내면 agent 가 추가 왕복 없이 현재 상태를 파악합니다. 생략 시 빈 프로젝트 기본값에서 시작합니다. 실제로는 거의 항상 `GET /video-project/:id` 결과를 그대로 전달합니다. agent 는 `checkpoint` 와 `done` 이벤트로 변경된 composition 스냅샷을 반환합니다. DB composition 은 `done` 직전 자동 저장되므로 별도로 PATCH 할 필요가 없습니다.
- **`presetId`** — 적용할 preset (voice, tone, color palette, 씬 기본값). 생략 시 `system_default` → locale 기본값으로 fallback. preset 관리는 [Preset API](./preset-api.md).
- **`locale`** — `en` / `ko` / `es`. 최종 사용자 메시지 언어 **및** preset 미지정 시 나레이션 기본 voice 를 결정. 미지원 값은 `en` 으로 fallback.

### 인증

- `api-key` 헤더 — kvidAI API 키 (APIM subscription primary key).
- APIM 게이트웨이가 호출 사용자를 식별합니다. request body 에 `email`, `apiKey`, `kind` 를 **넣지 마세요.**

API 키 발급: [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

> 각 agent run 은 크레딧을 시작 전에 reserve 합니다 (Claude 토큰 + 후속 미디어 생성). 잔액 부족 시 **작업이 시작되기 전에** `402 INSUFFICIENT_CREDIT` 를 반환합니다. 요율: [Pricing](../pricing.md) 참조.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key header
Content-Type:   application/json
Response style: 성공 시 text/event-stream (SSE); early-reject 시 application/json
```

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/agent/generate` | agent 실행 (short edit 또는 long-video 플랜) |
| `POST` | `/agent/resume` | 부분 완료된 long-video 작업 이어가기 |
| `POST` | `/agent/retry-scene` | 실패한 단일 씬 재시도 |

---

### 1. Agent 실행

`POST /agent/generate`

**필수 body 필드**

| Field | Type | 제약 | 설명 |
|-------|------|------|------|
| `projectId` | integer | `> 0` | 편집 대상 프로젝트. 먼저 `POST /video-project/create` 로 생성. |
| `message` | string | 1~4000 chars | 자연어 편집 지시 (`ko` / `en` / `es`). |

**선택 body 필드**

| Field | Type | Default | 설명 |
|-------|------|---------|------|
| `composition` | object | 빈 프로젝트 기본값 (1080×1920 @ 30fps, 1 track) | 현재 composition 스냅샷. 거의 항상 `GET /video-project/:id` 결과를 그대로 전달. shape: `{ fps, compositionWidth, compositionHeight, tracks[], items{}, assets{} }`. |
| `locale` | string | `en` | `en` / `ko` / `es` (max 16 chars). `done` 이벤트 i18n 및 fallback voice 결정. 미지원 값은 `en` fallback. |
| `presetId` | string | `system_default` | 적용할 preset, max 128 chars ([Preset API](./preset-api.md) 참조). 미지정 시 locale 기본 voice 로 fallback. |
| `attachedFiles` | array | — | 미디어/문서 첨부, 최대 10개. [attachedFiles entry shape](#attachedfiles-entry-shape) 참조. |
| `chatHistory` | array | `[]` | 이전 대화 압축본, 최대 50개, 각 `content` ≤ 8000 chars. `[{ role: "user" \| "assistant", content }]`. |
| `compositionDiff` | string | — | 직전 응답 이후 client 가 변경한 부분 요약 (토큰 절약), max 20000 chars. |
| `selectedItemContext` | object | — | UI 에서 단일 image/video 아이템을 선택한 경우 agent 가 그 아이템으로 편집을 한정. shape: `{ itemId, type: "image" \| "video", assetId, remoteUrl?, sourceImageUrl?, from, durationInFrames }`. |
| `selectedImageContext` | object | — | **Legacy.** `selectedItemContext` 이전 방식 (image 만). 둘 다 있으면 `selectedItemContext` 우선. shape: `{ itemId, assetId, remoteUrl?, from, durationInFrames }`. |

> DB composition 은 `done` 이벤트 직전 자동 저장됩니다 — 별도로 PATCH 할 필요가 없습니다.

#### attachedFiles entry shape

| Field | Type | Required | 설명 |
|-------|------|----------|------|
| `name` | string | 필수 | 파일명. |
| `type` | string | 필수 | `image` / `video` / `audio` / `pdf` / `text`. |
| `mimeType` | string | 필수 | MIME type. |
| `size` | integer | 필수 | bytes. 50 MB 상한. |
| `base64` | string | `base64` / `cdnUrl` 중 하나 | data URL 형태 (`data:<mime>;base64,...`). PDF / text 는 **이 필드만** 지원. |
| `cdnUrl` | string | `base64` / `cdnUrl` 중 하나 | https URL. image/video/audio 에 권장 (대용량 inline 회피). [Media API](./media-api.md) (`POST /media/presigned-upload-url`) 로 발급. |
| `durationInSeconds` | number | 선택 | video/audio client 측정 probe 값. |
| `width` | integer | 선택 | image/video client 측정 probe 값. |
| `height` | integer | 선택 | image/video client 측정 probe 값. |

> 각 entry 는 `base64` 또는 `cdnUrl` 중 **하나는 필수**. 둘 다 없으면 `400`.

```jsonc
// 대용량 영상 첨부 — Media API 로 먼저 업로드 후 cdnUrl 전달.
{
  "attachedFiles": [
    {
      "name": "logo.png",
      "type": "image",
      "mimeType": "image/png",
      "size": 102400,
      "cdnUrl": "https://...cdn.digitaloceanspaces.com/.../logo.png"
    }
  ]
}

// text / pdf 첨부 — base64 만 지원 (cdnUrl 미지원).
{
  "attachedFiles": [
    {
      "name": "memo.txt",
      "type": "text",
      "mimeType": "text/plain",
      "size": 124,
      "base64": "data:text/plain;base64,5pys..."
    }
  ]
}
```

**Server-Sent Events**

각 event 는 `event: <name>\ndata: <json>\n\n`. 처리해야 할 event:

| Event | 시점 | Payload |
|-------|------|---------|
| `tool_start` | tool 호출 직전 | `{ toolUseId, toolName }` |
| `tool_end` | tool 완료 | `{ toolUseId, toolName, success, error? }` |
| `plan_ready` | long-video 씬 플랜 확정 | `{ jobId, totalScenes, estimatedMinutes }` |
| `scene_start` | 한 씬 생성 시작 | `{ sceneId, sceneIndex }` |
| `scene_complete` | 씬 완료 | `{ sceneId, voiceError? }` |
| `scene_failed` | 씬 실패 | `{ sceneId, error }` |
| `checkpoint` | long video 중간 composition 스냅샷 | `{ composition }` |
| `insufficient_credit` | 실행 중 크레딧 부족 | `{ completedScenes, totalScenes, remainingCredit, estPerScene }` |
| `template_warning` | preset config 검증 경고 | `{ severity, field, message }` |
| `done` | agent 종료 | `{ success, data: { message, messageKey?, messageParams?, composition, toolResults[], projectId, tokenUsage, cost, resumeJobId?, remainingScenes?, totalScenes?, composition_saved? } }` |
| `error` | 치명적 에러 | `{ error }` |
| `heartbeat` | 연결 유지 ping | — (무시) |

> `done` 의 `messageKey` / `messageParams` 는 사용자가 agent 를 다시 돌리지 않고 UI locale 을 바꿔도 client 가 메시지를 다시 번역할 수 있게 해줍니다. i18n catalog 에 키를 매칭하세요 (`Agent.longVideo.done.*`, `Agent.longVideo.resume.done.*`, …).

**`done.data.cost` — run 전체 크레딧 사용량**

`done.data` 에 이 run 1건의 **전체 차감 크레딧** (토큰 + 이미지/비디오 + 음성 합산) 이 실려 외부 호출자가 실제 사용량을 응답에서 바로 받습니다.

```jsonc
"tokenUsage": { "inputTokens": 3472, "outputTokens": 1039, "creditCost": 5.62 }, // LLM 토큰만 (기존, 호환 유지)
"cost": {                                  // 전체 합
  "runId": "6c7a2347-c43f-4d28-b783-cd8f24a88f06",  // = agent task id (X-Agent-Task-Id)
  "total": 10.23,                          // 토큰 + 미디어 + 음성
  "breakdown": {
    "chat": 5.62,                          // 토큰
    "generate_image_fal_queue": 3.51,      // 이미지
    "generate_voice_tts_queue": 1.1        // 음성 (generate_video_* = 비디오)
  },
  "rowCount": 3,                           // 합산된 credit-use-log 행 수
  "pendingCount": 0                        // 비동기 정산 대기 중인 미디어 행 수
}
```

- 진실원천은 원장 합산: `SUM(credit-use-log.used) WHERE run_id`. 부분 실패에도 안전 (성공분만 집계).
- `pendingCount > 0` 이면 일부 미디어 정산이 아직 진행 중 — server 가 `done` 전 최대 ~6s 대기합니다. 남는 지연분은 `GET /credit/run-cost/:runId` 로 재조회.
- 요율: [Pricing](../pricing.md) 참조.

**Early reject (non-SSE)**

stream 시작 전 거부되면 일반 JSON 응답입니다. body 를 stream 으로 읽기 전에 `response.headers['content-type']` 를 확인하세요.

```json
{ "success": false, "error": "<code>", "message": "...", "issues"?: [...], "retryAfter"?: 60 }
```

| Status | error code | 원인 |
|--------|-----------|------|
| 400 | `invalid_input` | 스키마 위반 — `issues` 배열에 상세 |
| 400 | `Invalid request body` | JSON parse 실패 |
| 401 | `unauthenticated` | `api-key` 헤더 없음 또는 유효하지 않음 |
| 402 | `INSUFFICIENT_CREDIT` | 잔액 부족 — `data` 에 부족분 |
| 409 | `CONCURRENT_LIMIT` | 같은 user 의 다른 agent run 진행 중 |
| 429 | `rate_limited` | user 당 분당 10회 초과. `Retry-After` 헤더 + body `retryAfter` 초 |
| 500 | 서버 에러 | 일시적 — 재시도 가능 |

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"

body = {
    "projectId": 1234,
    "message": "Make a 30-second explainer about the new iPhone chip in 8 scenes.",
    "locale": "en",
    "presetId": "system_default",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/agent/generate",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json=body,
    timeout=None,
) as resp:
    if "text/event-stream" not in resp.headers.get("content-type", ""):
        print("rejected:", resp.json())
        raise SystemExit(1)

    event_name = None
    for line in resp.iter_lines():
        if not line:
            event_name = None
            continue
        if line.startswith("event: "):
            event_name = line[7:]
        elif line.startswith("data: ") and event_name:
            payload = json.loads(line[6:])
            print(event_name, payload)
            if event_name == "done":
                final_composition = payload["data"]["composition"]
                print("cost:", payload["data"].get("cost"))
            elif event_name == "scene_complete":
                print(f"  ✓ {payload['sceneId']}")
            elif event_name == "scene_failed":
                print(f"  ✗ {payload['sceneId']}: {payload['error']}")
```

**JavaScript (Node, `fetch` + manual SSE parsing)**

```javascript
const res = await fetch("https://api.kvid.ai/agent/generate", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    projectId: 1234,
    message: "Add a centered title 'Summer Sale' for 3 seconds.",
    locale: "en",
  }),
});

if (!res.headers.get("content-type")?.includes("text/event-stream")) {
  console.error("rejected:", await res.json());
  process.exit(1);
}

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  buf += decoder.decode(value, { stream: true });
  const blocks = buf.split("\n\n");
  buf = blocks.pop() ?? "";

  for (const block of blocks) {
    let name = "", data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) name = line.slice(7);
      else if (line.startsWith("data: ")) data = line.slice(6);
    }
    if (!name) continue;
    const payload = JSON.parse(data);

    switch (name) {
      case "tool_start": console.log("→", payload.toolName); break;
      case "tool_end":   console.log("←", payload.toolName, payload.success ? "ok" : payload.error); break;
      case "checkpoint": console.log("checkpoint at", payload.composition.tracks.length, "tracks"); break;
      case "done":       console.log("done:", payload.data.message, "cost:", payload.data.cost); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 2. 부분 완료된 long-video 작업 이어가기

`POST /agent/resume`

long-video 렌더가 중단되면 (크레딧 소진, 씬 생성 실패, 사용자가 탭 닫음) 이미 만들어진 씬 플랜과 composition 은 저장소에 남습니다. resume 은 **실패/누락 씬만** 재실행합니다.

**Request body**

| Field | Required | 설명 |
|-------|----------|------|
| `jobId` | 필수 | `done` 이벤트의 `data.resumeJobId` 값. |
| `locale` | 선택 | `/agent/generate` 와 동일 의미. |

`/agent/generate` 와 동일한 event shape 의 SSE 스트림을 반환합니다. 종료 `done` 이벤트는 resume 전용 message key (`Agent.longVideo.resume.done.*`) 를 사용합니다.

```python
with httpx.stream(
    "POST",
    "https://api.kvid.ai/agent/resume",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"jobId": job_id, "locale": "en"},
    timeout=None,
) as resp:
    for line in resp.iter_lines():
        ...
```

---

### 3. 실패한 단일 씬 재시도

`POST /agent/retry-scene`

나머지 플랜을 건드리지 않고 한 씬만 재실행합니다. agent 가 기존 씬의 prompt, voice, 나레이션 텍스트를 재사용 — 일시적 이미지/비디오 provider 실패에 유용.

**Request body**

| Field | Required | 설명 |
|-------|----------|------|
| `jobId` | 필수 | long-video 작업. |
| `sceneId` | 필수 | 재시도할 씬. |
| `locale` | 선택 | 기본 `en`. |

```javascript
await fetch("https://api.kvid.ai/agent/retry-scene", {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    jobId: "job_abc123",
    sceneId: "scene-4",
  }),
});
```

응답은 그 한 씬에 대해 `scene_start` → `scene_complete` / `scene_failed` 를 emit 한 뒤 `done` 을 보내는 SSE 스트림입니다.

---

## 주의

- Bruno `bru run` 은 SSE 끝까지 못 기다립니다 — UI 또는 외부 SSE client 로 호출하세요.
- `chatHistory` 는 첫 호출 시 생략 가능; 이후 호출은 직전 응답 압축본을 history 로 전달합니다.
- 크레딧은 run 시작 직전 reserve — `INSUFFICIENT_CREDIT` 응답 시 아무 작업도 일어나지 않습니다.

## 관련 문서

- [Project Management API](./project-management.md) — 이 agent 가 편집하는 프로젝트
- [Media API](./media-api.md) — `attachedFiles[].cdnUrl` 용 presigned CDN 업로드
- [Preset API](./preset-api.md) — `presetId` 로 적용하는 voice/tone/씬 preset
- [Video Generation API](./video-api.md) — agent 가 내부적으로 호출하는 하위 동기 비디오 생성기
- [Image Generation API](./image-api.md) — 동일, 이미지용
- [Pricing](../pricing.md) — tool 별 크레딧 요율
