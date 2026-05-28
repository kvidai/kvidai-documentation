---
title: Agent API
description: kvidAI Agent API — Server-Sent Events 기반 AI 비디오 composition 편집. 씬 플랜 생성, 미디어 생성 작업 실행, 중단된 long-video 렌더 이어가기.
slug: agent-api
tags: [API, Agent, AI, SSE, Composition, 에이전트]
sidebar_position: 6
---

# Agent API

kvidAI Agent API 로 [kvid.ai](https://kvid.ai) 에디터를 구동하는 동일한 AI 어시스턴트를 직접 코드에서 사용할 수 있습니다. 자연어 지시문 + Remotion composition 을 보내면 agent 가 알아서 결정합니다 — 아이템 추가/수정, 이미지 생성, 비디오 생성, 멀티-씬 long-video 플랜 작성, 위 모든 것을 묶어 완성된 composition 으로 stitch.

응답은 **Server-Sent Events (SSE)** 로 스트리밍되므로 agent 가 작업 중인 동안에도 진행 상황을 사용자에게 보여줄 수 있습니다.

## 🎯 서비스 개요

### Agent 가 할 수 있는 것

- **Short video 편집** — 텍스트 오버레이 추가, 배경 교체, 단일 이미지/비디오 아이템 재생성 ("흰색 쇼파를 가죽 검은색으로 변경"). 새 composition diff 반환.
- **Long video 플래닝** — 주제만 주면 ("아이폰 17 칩 8씬으로 설명") agent 가 먼저 씬 플랜을 emit 한 다음 모든 생성 작업 (이미지/비디오 + TTS 나레이션) 을 동시 미디어 큐로 실행. 진행 이벤트가 작업 중 스트리밍됨.
- **실패 후 이어가기** — 렌더 중 크레딧 부족, 씬 생성 실패, 사용자 탭 종료 등으로 중단된 경우 `/api/agent/resume` 으로 **미완성 씬만** 재실행.
- **씬별 재시도** — 일시적 이미지/비디오 provider 실패 시 한 씬만 surgical 재시도. 전체 플랜 재실행 X.

### 핵심 개념

- **`projectId`** — 장시간 작업은 프로젝트에 묶입니다 ([Project 관리 API](./project-management.md) 참조). Agent 가 해당 프로젝트의 composition 을 읽고 씁니다.
- **`composition`** — 요청 body 에 포함해서 agent 가 추가 round trip 없이 현재 상태를 추론. Agent 는 변경된 composition snapshot 을 `checkpoint` / `done` 이벤트로 반환.
- **`presetId`** — 선택적 프리셋 ID. 음성, 톤, 색상 팔레트, 씬 default 등 결정. 미지정 시 `system_default` fallback → locale 기반 default. 프리셋 관리는 [Preset API](./overview#preset-api) 참조. 옛 필드명 `templateId` 도 호환 위해 그대로 받음.
- **`locale`** — `en` / `ko` / `es`. 최종 사용자 노출 메시지 언어 결정 **+** template 미선택 시 나레이션 기본 voice 결정.

### 인증

[Project 관리 API](./project-management.md#인증) 와 동일:

- `api-key` 헤더 — kvidAI API 키
- 요청 body 의 `email` 필드 — Agent 가 대신 실행할 사용자

API 키: [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys)

> 매 agent 실행은 크레딧을 미리 예약합니다 (Claude 토큰 + 다운스트림 미디어 생성). 잔액 부족 시 작업이 시작되기 **전에** `402 INSUFFICIENT_CREDIT` 응답. 요율: [Pricing](../pricing.md) 참조.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai
Authentication: api-key 헤더
Content-Type:   application/json
Response style: 성공 시 text/event-stream (SSE), 사전 거절 시 application/json
```

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/api/agent` | Agent 실행 (short edit 또는 long-video 플랜) |
| `POST` | `/api/agent/resume` | 부분 완료된 long-video 작업 이어가기 |
| `POST` | `/api/agent/retry-scene` | 단일 실패 씬 재시도 |
| `GET`  | `/api/agent/check-resume` | 프로젝트에 미완료 작업 있는지 확인 |

---

### 1. Agent 실행

`POST /api/agent`

**Request body**

| 필드 | 타입 | 필수 | 설명 |
|-------|------|----------|-------|
| `message` | string | 예 | 자연어 지시문. |
| `composition` | object | 예 | 현재 composition. Agent 가 이걸 기반으로 추론. |
| `projectId` | number | 예 | 작업이 묶일 프로젝트. |
| `email` | string | 예 | 소유자. |
| `apiKey` | string | 예 | 사용자별 kvidAI API 키. (헤더가 아니라 body 에 — 내부적으로 AI gateway 에 forwarding 되기 때문.) |
| `locale` | string | 아니오 | `en` (default) / `ko` / `es`. |
| `presetId` | string | 아니오 | 적용할 프리셋 ID (자세히는 [Preset API](./overview#preset-api)). 미지정 시 `system_default` fallback. 옛 alias: `templateId`. |
| `attachedFiles` | array | 아니오 | 이미지 / 비디오 / 오디오 / PDF / 텍스트 업로드. 각각: `{ name, type, mimeType, size, base64? \| cdnUrl? }`. 대용량 파일은 `cdnUrl` ([Media API](./overview#media-api) 로 발급), 웹 에디터의 기존 inline 경로는 `base64`. PDF / text 는 `base64` 만 지원. |
| `chatHistory` | array | 아니오 | 클라이언트에서 압축한 이전 메시지 (긴 세션에서 토큰 절약). |
| `selectedItemContext` | object | 아니오 | UI 에서 사용자가 이미지/비디오 1개 선택 중이면 `{ itemId, type, assetId, remoteUrl?, sourceImageUrl?, from, durationInFrames }`. Agent 가 그 아이템 한정으로 편집. |
| `autoSave` | boolean | 아니오 | 기본 `true`. `done` 후 직접 composition 을 PATCH 하고 싶으면 `false`. |

**Server-Sent Events**

각 이벤트는 `event: <이름>\ndata: <json>\n\n` 라인. 처리해야 할 이벤트 이름들:

| 이벤트 | 발생 시점 | Payload |
|-------|------|------|
| `tool_start` | Agent 가 sub-tool 호출 직전 | `{ toolUseId, toolName }` |
| `tool_end` | Sub-tool 완료 후 | `{ toolUseId, toolName, success, error? }` |
| `plan_ready` | Long-video 플래닝 완료 | `{ jobId, totalScenes, estimatedMinutes }` |
| `scene_start` | 씬 생성 시작 | `{ sceneId, sceneIndex }` |
| `scene_complete` | 씬 성공 완료 | `{ sceneId, voiceError? }` |
| `scene_failed` | 씬 실패 | `{ sceneId, error }` |
| `checkpoint` | Long video 중 주기적 composition snapshot | `{ composition }` |
| `insufficient_credit` | 실행 중 크레딧 부족 | `{ completedScenes, totalScenes, remainingCredit, estPerScene }` |
| `template_warning` | 템플릿 config 검증 경고 | `{ severity, field, message }` |
| `done` | Agent 완료 | `{ success, data: { message, messageKey?, messageParams?, composition, toolResults[], projectId, resumeJobId?, remainingScenes?, totalScenes? } }` |
| `error` | 치명적 에러 | `{ error }` |

> `done` 의 `messageKey` / `messageParams` 는 사용자가 UI locale 을 변경했을 때 agent 를 재실행하지 않고 메시지만 클라이언트에서 재번역할 수 있게 해줍니다. i18n 카탈로그의 키 (`Agent.longVideo.done.*`, `Agent.longVideo.resume.done.*` …) 와 매칭.

**사전 거절 (non-SSE)**

스트림 시작 전에 요청이 거절되면 (인증 실패, 크레딧 부족, 동시 실행 한도) 응답이 정상 JSON body 로 `4xx` status + `{ success: false, error: "<CODE>", message: "...", data: { ... } }`. body 를 stream 으로 읽기 전에 `response.headers['content-type']` 검사 필수.

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"

body = {
    "message": "아이폰의 새 칩에 대한 30초 설명 영상을 8씬으로 만들어줘.",
    "composition": empty_composition,   # Project 관리 API 참조
    "projectId": 1234,
    "email": EMAIL,
    "apiKey": API_KEY,
    "locale": "ko",
    "presetId": "sod",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/api/agent",
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
            elif event_name == "scene_complete":
                print(f"  ✓ {payload['sceneId']}")
            elif event_name == "scene_failed":
                print(f"  ✗ {payload['sceneId']}: {payload['error']}")
```

**JavaScript (Node, `fetch` + 수동 SSE 파싱)**

```javascript
const res = await fetch("https://api.kvid.ai/api/agent", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "화면 중앙에 'Summer Sale' 타이틀 3초간 추가해줘.",
    composition,
    projectId: 1234,
    email: "you@example.com",
    apiKey: process.env.KVIDAI_API_KEY,
    locale: "ko",
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
      case "done":       console.log("done:", payload.data.message); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 2. 부분 완료된 long-video 작업 이어가기

`POST /api/agent/resume`

Long-video 렌더가 중단된 경우 (크레딧 부족, 씬 생성 실패, 사용자 탭 종료) 이미 생성된 씬 플랜과 composition 은 저장돼 있습니다. Resume 은 **실패/누락 씬만** 재실행합니다.

**Request body**

| 필드 | 필수 | 설명 |
|-------|----------|-------|
| `jobId` | 예 | `done` 이벤트의 `data.resumeJobId` 또는 `check-resume` 결과. |
| `email` | 예 | 소유자. |
| `apiKey` | 예 | 사용자별 API 키. |
| `locale` | 아니오 | `/api/agent` 와 동일. |

`/api/agent` 와 동일한 이벤트 형식의 SSE 스트림 반환. 마지막 `done` 이벤트는 resume 전용 메시지 키 (`Agent.longVideo.resume.done.*`) 사용.

```python
with httpx.stream(
    "POST",
    "https://api.kvid.ai/api/agent/resume",
    headers={"api-key": API_KEY, "Content-Type": "application/json"},
    json={"jobId": job_id, "email": EMAIL, "apiKey": API_KEY, "locale": "ko"},
    timeout=None,
) as resp:
    for line in resp.iter_lines():
        ...
```

---

### 3. 단일 실패 씬 재시도

`POST /api/agent/retry-scene`

전체 플랜을 건드리지 않고 한 씬만 재실행. Agent 가 기존 씬의 prompt / 음성 / 나레이션 텍스트 재사용 — 일시적 이미지/비디오 provider 실패에 유용.

**Request body**

| 필드 | 필수 | 설명 |
|-------|----------|-------|
| `jobId` | 예 | Long-video 작업. |
| `sceneId` | 예 | 재시도할 씬. |
| `email` | 예 | 소유자. |
| `apiKey` | 예 | 사용자별 API 키. |
| `locale` | 아니오 | 기본 `en`. |

```javascript
await fetch("https://api.kvid.ai/api/agent/retry-scene", {
  method: "POST",
  headers: { "api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    jobId: "job_abc123",
    sceneId: "scene-4",
    email: "you@example.com",
    apiKey: API_KEY,
  }),
});
```

응답은 그 한 씬에 대해 `scene_start` → `scene_complete` / `scene_failed` → `done` 이벤트를 emit 하는 SSE 스트림.

---

### 4. 미완료 작업 확인

`GET /api/agent/check-resume?projectId={id}&email={email}`

특정 프로젝트에 진행 중인 long-video 작업이 있는지 조회. 이어갈 작업 없으면 `{ data: null }`, 있으면:

```json
{
  "success": true,
  "data": {
    "jobId": "job_abc123",
    "remainingScenes": 6,
    "totalScenes": 24
  }
}
```

페이지 로드 시 사용 — 예: 사용자가 떠났던 프로젝트로 돌아왔을 때 "▶ 남은 6씬 이어서 생성" 버튼 표시.

```python
resp = requests.get(
    "https://api.kvid.ai/api/agent/check-resume",
    headers={"api-key": API_KEY},
    params={"projectId": 1234, "email": EMAIL},
)
data = resp.json()["data"]
if data and data["remainingScenes"]:
    print(f"resume 가능: {data['remainingScenes']}/{data['totalScenes']} 남음")
```

---

## End-to-End: Resume 포함 long-video 파이프라인

```python
import httpx
import json
import requests

API_KEY = "YOUR_API_KEY"
EMAIL   = "you@example.com"
PROJECT = 1234

def stream_agent(url, body):
    """(event_name, payload) 튜플 yield."""
    with httpx.stream(
        "POST", url,
        headers={"api-key": API_KEY, "Content-Type": "application/json"},
        json=body, timeout=None,
    ) as resp:
        if "text/event-stream" not in resp.headers.get("content-type", ""):
            raise RuntimeError(f"rejected: {resp.json()}")
        name = None
        for line in resp.iter_lines():
            if not line:
                name = None
                continue
            if line.startswith("event: "):
                name = line[7:]
            elif line.startswith("data: ") and name:
                yield name, json.loads(line[6:])

# 1. 시작
job_id = None
for name, payload in stream_agent(
    "https://api.kvid.ai/api/agent",
    {
        "message": "한국 길거리 음식 30초 설명 영상 만들어줘.",
        "composition": empty_composition,
        "projectId": PROJECT,
        "email": EMAIL,
        "apiKey": API_KEY,
        "locale": "ko",
    },
):
    if name == "plan_ready":
        job_id = payload["jobId"]
        print(f"플랜: {payload['totalScenes']}씬")
    elif name == "scene_failed":
        print(f"  ✗ {payload['sceneId']}")
    elif name == "done":
        print("완료:", payload["data"]["message"])

# 2. 중간에 크레딧 부족이면 done 이벤트 `resumeJobId` 가 포함됨.
#    그 자리에서 처리하거나 다음 세션에서 lookup:
status = requests.get(
    "https://api.kvid.ai/api/agent/check-resume",
    headers={"api-key": API_KEY},
    params={"projectId": PROJECT, "email": EMAIL},
).json()["data"]

if status and status["remainingScenes"]:
    for name, payload in stream_agent(
        "https://api.kvid.ai/api/agent/resume",
        {"jobId": status["jobId"], "email": EMAIL, "apiKey": API_KEY, "locale": "ko"},
    ):
        if name == "done":
            print("resume 완료:", payload["data"]["message"])
```

---

## Error Response

스트림 시작 전 에러는 JSON. 스트림 중 에러는 `error` SSE 이벤트.

| Code | 의미 | 일반적 해결 |
|------|---------|-------------|
| `UNAUTHORIZED` | `apiKey` 잘못됨 | [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys) 에서 재발급 |
| `CONCURRENT_LIMIT` | 이미 agent 실행 진행 중 | 이전 실행 완료 대기 또는 `check-resume` 조회 후 resume |
| `INSUFFICIENT_CREDIT` | 예약 크레딧 > 가용 잔액 | [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) 충전 — [Pricing](../pricing.md) 참조 |
| `MISSING_PARAMETERS` | 필수 필드 누락 | `message` 에서 자세한 내용 확인 |
| `ZOMBIE_TIMEOUT` | 이전 작업이 멈춰있었고 자동 종료됨 | 다시 시도 |

---

## 관련 문서

- [Project 관리 API](./project-management.md) — Agent 가 실행되는 프로젝트
- [Video 생성 API](./video-api.md) — Agent 가 내부적으로 호출하는 동기식 비디오 생성기
- [Image 생성 API](./image-api.md) — 같은 형태로 이미지 생성
- [Pricing](../pricing.md) — 도구별 크레딧 요율
