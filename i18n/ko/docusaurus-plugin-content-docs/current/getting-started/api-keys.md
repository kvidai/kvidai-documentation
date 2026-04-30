---
title: API 키 발급
description: kvidAI API 호출용 키를 발급·조회·관리하는 방법.
sidebar_position: 4
---

# API 키 발급

> **English**: [API Keys](/docs/getting-started/api-keys)

API 키는 **코드에서 kvidAI API를 호출할 때** 만 필요합니다. 웹앱(Storyboard, Video Editor, Generate 페이지)은 별도 API 키 없이 바로 사용할 수 있습니다.

## 발급 위치

[kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys)

## 구독 생성 (키 페어)

1. 위 페이지에 접속 (로그인 필요)
2. **Create New Subscription** 클릭
3. (선택) 커스텀 구독 ID 입력 가능 — 영문, 숫자, 하이픈만 허용
4. 각 구독에는 **Primary 키** 와 **Secondary 키** 가 한 쌍으로 발급됩니다. 둘 다 사용 가능.

## 요청에서 키 사용

`API-KEY` 헤더로 전달합니다.

```bash
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_PRIMARY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop 무대 조명",
    "image_size": { "width": 1024, "height": 1024 }
  }'
```

## 왜 키가 두 개인가?

무중단 회전을 위해서입니다.
1. 코드에서 Secondary 키로 전환
2. Primary 키 재발급
3. 회전 기간이 끝나면 새 Primary로 전환하고 Secondary 재발급

## 구독 여러 개

프로젝트나 환경(staging / production) 분리용으로 여러 구독을 둘 수 있습니다. 한 번에 하나가 **active subscription** 이지만 다른 구독도 키는 계속 사용 가능합니다.

## 구독 삭제

- 구독 옆 메뉴 → **Delete**
- 현재 선택된 구독은 삭제할 수 없습니다. 다른 구독으로 전환 후 삭제하세요.

## 크레딧

모든 API 구독은 **계정의 단일 크레딧 잔액** 을 공유합니다. 구독별 한도는 없고 사용량은 계정 단위로 집계됩니다.

## 보안 팁

- API 키를 소스 관리에 커밋하지 마세요.
- 환경변수(`process.env.KVIDAI_API_KEY`) 혹은 시크릿 매니저를 사용하세요.
- Primary/Secondary 패턴으로 정기적으로 키를 교체하세요.
