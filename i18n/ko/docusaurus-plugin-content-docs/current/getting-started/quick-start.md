---
title: 빠른 시작
description: 회원가입, 크레딧 구매, 첫 API 호출까지 — kvid.ai 한 계정으로 전부 해결합니다.
sidebar_position: 1
---

# 빠른 시작

> **English**: [Quick Start](/docs/getting-started/quick-start)

kvidAI는 모든 기능이 한 곳에 있습니다: [kvid.ai](https://kvid.ai) 회원가입 → 크레딧 구매 → 웹앱 사용 또는 API 호출.

## 1. 계정 생성

1. [kvid.ai/register](https://kvid.ai/register) 로 이동
2. 사용자명, 이메일, 비밀번호(8자 이상, 대·소·숫자 포함) 입력
3. **이메일 인증 필수** — 받은 메일의 링크를 눌러 인증을 완료하세요.
4. [kvid.ai/login](https://kvid.ai/login) 에서 로그인

자세히: [계정 설정 →](./account-setup)

## 2. 크레딧 구매

1. [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) 접속 (로그인 필요)
2. **Purchase Now** 클릭 → Dodo Payments (국제 카드 결제) 로 이동
3. 결제 완료 시 **3,000 크레딧** 이 잔액에 추가되고 30일간 유효

자세히: [크레딧 구매 →](./buy-credits)

## 3A. 웹앱에서 바로 사용

[kvid.ai](https://kvid.ai) 로 돌아와 아래 기능을 사용해 보세요.

- **Storyboard** — 자연어로 영상 설명 → 자동 컴포지션: [kvid.ai/storyboard](https://kvid.ai/storyboard)
- **이미지 생성** — [kvid.ai/generate/image](https://kvid.ai/generate/image)
- **Text-to-Video** — [kvid.ai/generate/text-to-video](https://kvid.ai/generate/text-to-video)
- **갤러리** — 커뮤니티 공유 컴포지션 둘러보기: [kvid.ai/gallery](https://kvid.ai/gallery)

웹앱 사용엔 별도 API 키가 필요 없습니다.

## 3B. 코드에서 API 호출

1. [kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys) 에서 API 키 생성
2. **Primary 키** 를 복사. `API-KEY` 헤더에 사용
3. 첫 호출:

```bash
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop 무대 조명",
    "image_size": { "width": 1024, "height": 1024 }
  }'
```

자세히: [API 키 발급 →](./api-keys)

## 다음 단계

- [웹앱 기능](../web-app/storyboard) — 기능별 상세 가이드
- [API 서비스](../api-services/overview) — API 명세
- [요금 안내](../pricing) — 현재 크레딧 단가

## 도움이 필요하면

- 이메일: support@kvid.ai
- Discord: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
