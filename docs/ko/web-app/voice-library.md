---
title: Voice Library
description: kvidAI에서 ElevenLabs 음성을 검색·미리듣고 Voice ID를 템플릿에 바로 활용할 수 있습니다.
sidebar_position: 4
---

# Voice Library

> **English**: [Voice Library](/docs/web-app/voice-library)

Voice Library 는 kvidAI가 TTS(Storyboard 나레이션 등)에 사용할 수 있는 ElevenLabs 음성을 탐색하는 곳입니다.

**위치**: [kvid.ai/voice-library](https://kvid.ai/voice-library)

## 할 수 있는 것

- **검색** — 이름, 설명, 라벨 기준
- **필터** — 카테고리 (Premade / Professional / Cloned / Generated) 와 라벨 (성별, 나이, 언어, 용도, 억양)
- **정렬** — 날짜 / 이름 (오름/내림)
- **미리듣기** — 행의 재생 버튼 클릭
- **Voice ID 복사** — Storyboard 템플릿이나 API 호출에 사용
- **Select** (선택 모드로 진입한 경우) — 호출한 곳으로 바로 전달

## 열 구성

| 열 | 설명 |
|----|------|
| Preview | 재생 버튼 |
| Name | 음성 표시 이름 |
| Description | 짧은 설명 (좁은 화면에서는 숨김) |
| Category | Premade / Professional / Cloned / Generated |
| 성별 / 나이 | 메타데이터 라벨 |
| 언어 / 억양 / 용도 | 메타데이터 라벨 |
| Actions | Voice ID 복사 / Select |

좁은 화면에서는 덜 중요한 열부터 순차적으로 숨겨집니다.

## 필터

필터는 **현재 로드된** 음성에만 적용됩니다. 더 넓은 범위를 보려면 **Load More** 로 목록을 확장한 뒤 필터를 적용하세요. 활성 필터 개수는 **Filters** 버튼 옆 배지로 표시됩니다.

## 정렬 방향

정렬 기준(날짜 / 이름)이 활성화되면 옆에 ↑/↓ 토글이 나타나 오름/내림을 바꿀 수 있습니다.

## 음성 사용

### Storyboard 에서

1. 템플릿 에디터 열기 (Storyboard > 채팅 패널 > 템플릿 메뉴 > Edit)
2. **voice** 필드에 Voice ID 붙여넣기
3. 저장하면 이후 나레이션에 해당 음성이 사용됩니다.

### API 에서

voice 파라미터를 받는 엔드포인트에 Voice ID 를 전달합니다.

```json
{
  "voice_id": "pNInz6obpgDQGcFmaJgB",
  "model_id": "eleven_multilingual_v2",
  "text": "kvidAI 안녕!"
}
```

## URL 상태 유지

검색어·카테고리·정렬이 URL 쿼리스트링에 동기화됩니다. 필터링된 화면을 URL만 복사해 공유할 수 있습니다.

## 팁

- 한국어 나레이션은 `language: ko` 필터에서 시작하세요.
- 드라마틱·에너제틱한 낭독은 `use case: characters & animation` 등을 필터링.
- Cloned 음성은 개성이 강하지만 ElevenLabs 이용약관의 제약이 있을 수 있습니다.
