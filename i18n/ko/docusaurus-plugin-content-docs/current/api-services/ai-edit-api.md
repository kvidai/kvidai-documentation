---
title: AI 편집 (요약·무음컷) API
description: kvidAI AI Edit API — Server-Sent Events 기반 미디어 요약(STT + LLM) 및 무음컷. 공개 미디어 URL 을 유지 구간 또는 무음 제거 MP4 로 변환.
keywords: [AI edit API, video summary, silence cut, STT, ElevenLabs Scribe, server-sent events, SSE, FFmpeg, kvidAI]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: ai-edit-api
tags: [API, AI Edit, STT, SSE]
sidebar_position: 7
---

# AI 편집 (요약·무음컷) API

> **View in English**: [AI Edit API](/docs/api-services/ai-edit-api) | **한국어로 보기** (현재 페이지)

AI Edit API 는 공개 미디어 URL (오디오·영상) 을 받아 편집 결정을 **Server-Sent Events (SSE)** 로 반환합니다. 세 개의 엔드포인트:

- **`/ai-edit/summary`** — 미디어를 전사(**STT via ElevenLabs Scribe**)한 뒤 **LLM** 으로 유지할 구간을 골라냅니다. 각 구간에는 importance 점수가 붙습니다. 편집기가 이 구간들을 이어붙여 요약 컷을 만듭니다.
- **`/ai-edit/silence-cut`** — **FFmpeg** 로 무음 구간을 제거한 새 MP4 를 CDN 에 반환합니다. STT/LLM 불필요 — 순수 오디오 무음 분석.
- **`/ai-edit/shorts`** — 전사한 뒤 **LLM** 으로 숏폼 **하이라이트 후보**(각각 시작/끝 + 제목/이유)를 찾습니다. **후보 리스트만 반환** — 컷/선택은 하지 않으며, 호출자가 골라서 자체적으로 자릅니다(summary 와 동일한 '결정 반환' 모델; 실제 MP4 를 반환하는 것은 silence-cut 뿐).

두 엔드포인트 모두 처리 중 진행 상황을 스트리밍합니다 (50분 영상은 1분 이상 걸릴 수 있음). 종료 `done` 이벤트에 결과와 이 실행의 총 credit 사용량(`cost`) 이 담깁니다.

## 🎯 서비스 개요

### 인증

- `api-key` 헤더 — kvidAI API 키 (APIM subscription primary key).
- APIM 게이트웨이가 호출자 식별 정보 (요약의 경우 `kind` 포함) 를 자동 주입합니다. request body 에 `email` 이나 `kind` 를 **넣지 마세요.**

API 키 발급: [kvid.ai/dashboard/api-keys](https://kvid.ai/dashboard/api-keys).

### 개념

- **`mediaUrl`** — 처리할 오디오/영상의 공개 https URL. 외부 호출은 이 값만 주면 됩니다. 한글/공백/특수문자 파일명, NFC/NFD 인코딩 편차에 견고 — 브라우저 주소창/미디어 라이브러리 URL 을 그대로 붙여넣어도 됩니다.
- **`fileKey`** — `mediaUrl` 대안: 업로드 API 가 발급한 media key. 웹 UI 가 브라우저에서 오디오 추출 후 사용하는 값이며, 외부 호출은 보통 `mediaUrl` 을 씁니다. 둘 다 있으면 `mediaUrl` 우선.
- **Segments (요약)** — 자연어 요약문이 아닙니다. 각 항목은 **유지할 시간 구간** + `importance` 점수이며, 편집기가 이를 이어붙입니다.

### 제한 (Limits)

| 항목 | 값 | 비고 |
|------|-----|------|
| 최대 미디어 길이 | **60분** | web 업로드 시 강제; API `mediaUrl` 호출은 권장값. 요약·무음컷·숏츠 동일. |
| 최대 파일 용량 | **5 GB** / 파일 | DO Spaces 단일 PUT 한도. |
| 게이트웨이 처리 타임아웃 | **1200초 (20분)** | APIM forward-request. 매우 긴 원본은 처리 중 초과 가능. |
| 지원 미디어 | 영상(mp4 등) / 오디오 | STT / FFmpeg 가 처리 가능한 포맷. |

> web UI (kvid.ai) 는 60분 / 5GB 를 **업로드 시점에** 강제합니다. `mediaUrl` 을 직접 전달하는 API 호출은 업로드 게이트를 거치지 않으므로 이 값들을 권장값으로 따르되, 처리는 게이트웨이 타임아웃(1200초) 안에 끝나야 합니다.

## 📡 API 엔드포인트

### 기본 정보

```
Base URL:       https://api.kvid.ai/ai-edit
Authentication: api-key header
Content-Type:   application/json
Response style: 성공 시 text/event-stream (SSE); early-reject 시 application/json
```

| Method | Path | 용도 |
|--------|------|------|
| `POST` | `/ai-edit/summary` | 미디어를 유지 구간으로 요약 (STT + LLM) |
| `POST` | `/ai-edit/silence-cut` | 무음 구간 제거, 새 MP4 URL 반환 |
| `POST` | `/ai-edit/shorts` | 숏폼 하이라이트 후보 추출 (STT + LLM) — 컷이 아닌 timestamps 반환 |

---

### 1. 미디어 요약

`POST /ai-edit/summary`

ElevenLabs Scribe 로 전사한 뒤 LLM 이 유지할 구간을 골라냅니다.

**필수 body 필드**

| Field | Type | 제약 | 설명 |
|-------|------|------|------|
| `mediaUrl` | string | 공개 https URL | 요약할 미디어(오디오·영상) CDN URL. **외부 호출은 이 값만 주면 됨.** `mediaUrl` / `fileKey` 중 하나 필수 (둘 다면 `mediaUrl` 우선). |
| `instruction` | string | 1+ chars | 요약 방향 지시. **`overview` 모드(기본)에서는 필수** — 없으면 `400 instruction is required`. `trailer` 모드에서만 생략 가능. |

**선택 body 필드**

| Field | Type | Default | 설명 |
|-------|------|---------|------|
| `mode` | string | `overview` | `overview` (instruction 필수, 균형 요약) / `trailer` (instruction 생략 가능, 짧은 예고편). |
| `fileKey` | string | — | `mediaUrl` 대안 — 업로드 API 가 발급한 media key. 외부 호출은 보통 `mediaUrl` 사용. |
| `projectId` | number | — | 결과를 연결할 프로젝트 id. |

**Server-Sent Events**

각 event 는 `event: <name>\ndata: <json>\n\n`.

| Event | 시점 | Payload |
|-------|------|---------|
| `job_created` | 최초 | `{ jobId }` — 재방문/재연결용 |
| `transcribing` | STT 시작 | `{ jobId }` |
| `analyzing` | LLM 요약 시작 | `{ jobId }` |
| `done` | 완료 | `{ success: true, data: {...} }` (아래) |
| `error` | 실패 | `{ error }` |
| `heartbeat` (`: heartbeat`) | 연결 유지 ping | — (무시) — 긴 영상 STT 중 다수 발생 |

**`done.data` shape**

```jsonc
{
  "kind": "summary",
  "captions": [                              // 전체 전사 (단어 단위, ms)
    { "text": "안녕하세요,", "startMs": 420, "endMs": 740, "timestampMs": 580, "confidence": null }
  ],
  "segments": [                              // 요약이 KEEP 한 구간 + 중요도
    { "startMs": 179, "endMs": 4639, "importance": 9 }
  ],
  "targetSeconds": null,                     // instruction 에 길이 지정("1분" 등) 시 목표 초, 없으면 null
  "mode": "overview",
  "cost": { ... }                            // 아래
}
```

세그먼트는 자연어 요약문이 아니라 **유지할 시간 구간 + importance 점수** 입니다 — 편집기가 이 구간들을 이어붙여 요약 영상을 만듭니다.

**`done.data.cost` — 이 실행 credit 사용량**

```jsonc
"cost": {
  "runId": "c0b5d626-...",                   // = jobId
  "total": 7.65,                             // 이 run 총 차감 credit
  "breakdown": { "text": 7.65 },             // 현재는 LLM 토큰(text)만 집계
  "rowCount": 1,                             // 합산된 credit-use-log 행 수
  "pendingCount": 0
}
```

- 진실원천은 원장 합산: `SUM(credit-use-log.used) WHERE run_id = jobId`.
- ⚠️ 현재 STT(전사) 비용은 `total` 에 **미반영** — `breakdown.text`(LLM) 만 집계됩니다. STT credit 합산은 후속 예정.
- `runId` 로 재조회: `GET /credit/run-cost/:runId`.
- 요율: [Pricing](../pricing.md) 참조.

**Early reject (non-SSE)**

| Status | error | 원인 |
|--------|-------|------|
| 400 | `missing_params` | `email`, `kind`, `mediaUrl` / `fileKey` 중 누락 |
| 400 | `instruction is required` | `overview` 모드인데 `instruction` 없음 (SSE `error` 이벤트) |
| 400 | `invalid_json` | JSON parse 실패 |
| 401 | `forbidden_origin` | origin 게이트 실패 (APIM 미경유 등) |
| 4xx/5xx | `Transcription failed` | STT 실패 (오디오 없음/손상) — SSE `error` 이벤트 |

**Python (httpx + SSE)**

```python
import httpx
import json

API_KEY = "YOUR_API_KEY"

body = {
    "mediaUrl": "https://...cdn.digitaloceanspaces.com/.../talk.mp4",
    "instruction": "Summarize the key points.",
    "mode": "overview",
}

with httpx.stream(
    "POST",
    "https://api.kvid.ai/ai-edit/summary",
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
                data = payload["data"]
                print("segments:", data["segments"])
                print("cost:", data["cost"])
            elif event_name == "error":
                print("error:", payload["error"])
```

---

### 2. 무음 컷

`POST /ai-edit/silence-cut`

FFmpeg (`remove_silence`) 로 무음 구간을 제거한 새 MP4 를 CDN 에 반환합니다. STT/LLM 불필요.

**필수 body 필드**

| Field | Type | 제약 | 설명 |
|-------|------|------|------|
| `mediaUrl` | string | 공개 https URL | 무음컷할 미디어 CDN URL. **외부 호출은 이 값만 주면 됨.** `mediaUrl` / `fileKey` 중 하나 필수 (둘 다면 `mediaUrl` 우선). |

**선택 body 필드**

| Field | Type | Default | 설명 |
|-------|------|---------|------|
| `mode` | string | `all` | 무음 제거 범위: `all`(전체) / `start`(앞) / `end`(뒤). |
| `thresholdDb` | number | `-40` | 무음 판정 임계값(dB). 낮을수록 더 조용해야 무음으로 판정. |
| `minDuration` | number | `0.5` | 제거할 최소 무음 길이(초) — 이보다 짧은 무음은 유지. |
| `keepSilence` | number | `0.1` | 잘린 경계에 남길 무음(초) — 급격한 컷 방지. |
| `fileKey` | string | — | `mediaUrl` 대안 — 업로드 API 가 발급한 media key. 외부 호출은 보통 `mediaUrl` 사용. |
| `projectId` | number | — | 결과를 연결할 프로젝트 id. |

**Server-Sent Events**

| Event | 시점 | Payload |
|-------|------|---------|
| `job_created` | 최초 | `{ jobId }` |
| `processing` | 사이드카 무음컷 시작 | `{ jobId }` |
| `uploading` | 잘린 mp4 CDN 업로드 | `{ jobId }` |
| `done` | 완료 | `{ success: true, data: {...} }` (아래) |
| `error` | 실패 | `{ error }` |
| `heartbeat` (`: heartbeat`) | 연결 유지 ping | — (무시) — 긴 영상 처리 중 다수 발생 |

**`done.data` shape**

```jsonc
{
  "kind": "silence_cut",
  "outputUrl": "https://...cdn.../silence-cut-<uuid>.mp4",  // 잘린 mp4 (바로 사용 가능)
  "outputKey": "<uuid>",                                     // fileKey 로도 재조회 가능
  "meta": {
    "original_duration": 627.4,    // 입력 길이(초) — 과금 기준
    "new_duration": 512.1,         // 출력 길이(초)
    "removed_duration": 115.3,     // 제거된 무음(초)
    "reduction_percent": 18.4,
    "segment_count": 42            // 제거된 무음 구간 수
  },
  "cost": { ... }                  // 아래
}
```

**`done.data.cost` — 이 실행 credit 사용량**

```jsonc
"cost": {
  "runId": "<jobId>",
  "total": 0,                      // 입력 영상 초 × pricing_table 단가 (초기 단가 0 → 0)
  "breakdown": { },
  "rowCount": 1,                   // 무료(0)여도 credit-use-log 1행 기록(추적)
  "pendingCount": 0
}
```

- **처리량 과금**: `credit = original_duration(초) × pricing_table 단가`. 단가는 DB row 값 — 바꾸면 즉시 반영.
- **초기 단가 0** → 무료. 0 이어도 credit-use-log(used=0)로 기록되어 사용량 추적 가능.
- `runId` 로 재조회: `GET /credit/run-cost/:runId`.
- 요율: [Pricing](../pricing.md) 참조.

**Early reject (non-SSE)**

| Status | error | 원인 |
|--------|-------|------|
| 400 | `missing_params` | `email`, `mediaUrl` / `fileKey` 중 누락 |
| 400 | `invalid_mode` | `mode` 가 `all` / `start` / `end` 아님 |
| 400 | `invalid_json` | JSON parse 실패 |
| 401 | `forbidden_origin` | origin 게이트 실패 (APIM 미경유 등) |
| 4xx/5xx | `silence-cut failed` | 사이드카 처리 실패 (다운로드 / FFmpeg) — SSE `error` 이벤트 |

**JavaScript (Node, `fetch` + manual SSE parsing)**

```javascript
const res = await fetch("https://api.kvid.ai/ai-edit/silence-cut", {
  method: "POST",
  headers: {
    "api-key": process.env.KVIDAI_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mediaUrl: "https://...cdn.digitaloceanspaces.com/.../talk.mp4",
    mode: "all",
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
      case "processing": console.log("processing…"); break;
      case "uploading":  console.log("uploading…"); break;
      case "done":       console.log("output:", payload.data.outputUrl, "cost:", payload.data.cost); break;
      case "error":      console.error("error:", payload.error); break;
    }
  }
}
```

---

### 3. 숏츠 (Shorts)

`POST /ai-edit/shorts`

전사(**STT**) 후 **LLM** 으로 독립적인 **숏폼 하이라이트 후보**(Shorts/Reels 용)를 찾습니다. **후보 리스트만 반환** — 컷/선택은 하지 않습니다. summary 와 동일한 '결정 반환' 모델로, 후보별 timestamp + 제목/이유를 받아 원하는 클립을 호출자가 자릅니다. (silence-cut 만 실제 MP4 를 반환 — 무음 제거는 사람 결정이 불필요하기 때문.)

#### Request Body

| Field | Type | 제약 | 설명 |
|-------|------|------|------|
| `mediaUrl` | string | 공개 https URL | 미디어(오디오/영상) CDN URL. **외부 호출은 이 값만 주면 됨.** `fileKey` 와 둘 중 하나 필수(둘 다면 `mediaUrl` 우선). |
| `instruction` | string | 선택 | 후보 선정 방향 지시. 없으면 임팩트 기준 자동 선정. |
| `maxClips` | number | 선택, 기본 `6` | 최대 후보 수. **1~12 로 클램프.** |
| `fileKey` | string | 선택 | (대안) 업로드 API 가 발급한 media key. 외부 호출은 보통 `mediaUrl` 사용. |
| `projectId` | number | 선택 | 결과를 연결할 프로젝트 id. |

#### SSE Events

| Event | 시점 | Payload |
|-------|------|---------|
| `job_created` | 최초 | `{ jobId }` |
| `transcribing` | STT 시작 | `{ jobId }` |
| `analyzing` | LLM 하이라이트 선정 시작 | `{ jobId }` |
| `done` | 완료 | `{ success: true, data: { kind, captions, clips, cost } }` |
| `error` | 실패 | `{ error }` |

#### done.data

```jsonc
{
  "kind": "shorts",
  "captions": [ /* 전체 단어 단위 전사(ms) */ ],
  "clips": [                                   // 하이라이트 후보 (best first, 서로 겹치지 않음)
    {
      "startMs": 12000,                        // 후보 시작(ms)
      "endMs": 38000,                          // 후보 끝(ms)
      "title": "가격이 뒤집힌 순간",             // 짧고 후킹되는 제목(전사 언어)
      "reason": "반전 + 수치 임팩트"             // 왜 숏폼으로 좋은지 한 줄
    }
  ],
  "cost": { /* summary 와 동일 — 원장 합산 run credit */ }
}
```

`clips` 는 **자를 준비가 된 MP4 가 아니라 후보 구간** — `startMs`/`endMs` 로 호출자가 자릅니다. `clips: []` 는 조건 충족 구간 없음.

#### Errors

| Status | error | 원인 |
|--------|-------|------|
| 400 | `missing_params` | `email`, `kind`, `mediaUrl` / `fileKey` 중 누락 |
| 401 | `forbidden_origin` | origin 게이트 실패(APIM 미경유 등) |
| 4xx/5xx | `Transcription failed` | STT 실패(오디오 없음/손상) — SSE `error` 이벤트 |

---

## 주의

- Bruno `bru run` 은 SSE 끝까지 못 기다립니다 — UI 또는 외부 SSE client 로 호출하세요.
- 요약 `overview` 모드는 `instruction` 필수. 지시 없이 자동 요약을 원하면 `mode: "trailer"`.
- 숏츠는 **후보만 반환**(timestamps + 제목/이유) — 클립은 호출자가 직접 자릅니다. 영상은 반환하지 않음(silence-cut 만 MP4 반환).
- 무음이 없는 영상은 `removed_duration = 0` (출력 = 입력) — 정상 동작.

## 관련 문서

- [Media API](./media-api.md) — 공개 `mediaUrl` 을 얻는 presigned CDN 업로드
- [Agent API](./agent-api.md) — SSE 기반 AI composition 편집
- [Pricing](../pricing.md) — tool 별 크레딧 요율
