---
title: 시작하기 가이드
description: kvidAI API 첫 사용을 위한 단계별 가이드
sidebar_position: 1
---
# 시작하기 가이드

kvidAI API를 처음 사용하시는 분들을 위한 단계별 설정 가이드입니다.

## 🚀 5분 만에 시작하기

### 1단계: 계정 생성

**중요**: 크레딧 구매시 입력한 이메일과 **동일한 이메일**로 가입해야 합니다!

2. **콘솔 사이트 가입**  

   * [console.kvid.ai](https://console.kvid.ai) 접속
   * **동일한 이메일**로 회원가입

### 2단계: API 키 발급

1. [console.kvid.ai](https://console.kvid.ai)에 로그인
2. "API Keys" 또는 "키 관리" 메뉴 선택
3. "새 API 키 생성" 클릭
4. API 키 복사 후 안전한 곳에 저장

⚠️ **주의**: API 키는 생성 시 한 번만 표시됩니다!

### 3단계: 크레딧 구매

1. [kvid.ai.kr](https://kvid.ai.kr)에 로그인
2. 크래딧 상품 구매

* 이미 구매를 마친 경우 이 단계는 건너 뜁니다.
* console.kvid.ai 이메일 입력 필수

### 4단계: 미디어 생성 해보기

1. [app.kvid.ai](https://app.kvid.ai) 접속
2. 이미지 생성이나 비디오 생성 클릭
3. console.kvid.ai에서 생성한 key 입력 후 미디어 생성

## 🧪 첫 API 호출 테스트

### Text API 테스트

```bash
curl -X POST "https://api.kvid.ai/ai-model/qwen/v1/chat/completions" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
      {"role": "user", "content": "안녕하세요! K-pop 관련 짧은 글을 써주세요."}
    ]
  }'
```

### Video API 테스트

```bash
curl -X POST "https://api.kvid.ai/ai-model/videogen-1/v1/video_generation" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-to-video",
    "prompt": "K-pop 댄서가 춤추는 모습"
  }'
```

### Image API 테스트

```bash
curl -X POST "https://api.kvid.ai/ai-model/flux-1/v1/text-to-image" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-beauty 메이크업을 한 아름다운 여성",
    "width": 1024,
    "height": 1024
  }'
```

## 💰 요금 이해하기

### 크레딧 시스템

* **1 USD = 144.6 크레딧** (환율 1,446원 기준)
* 사용한 만큼 크레딧 차감
* 선불 충전 방식

### 주요 서비스 요금

* **Video 생성**: 124.356 크레딧 (약 $0.86) per 5-6초 비디오
* **Image 생성**: 1-3 크레딧 (해상도별)
* **Text 생성**: 17-52 크레딧 per 1,000 토큰

## ✅ 설정 완료 체크리스트

* 개발자 포털 회원가입 완료
* 콘솔 사이트 회원가입 완료 (동일 이메일)
* API 키 발급 및 저장
* 크레딧 충전 요청
* 사용자 권한 "api-user" 설정 요청
* 첫 API 호출 테스트 성공

## 🔧 자주 발생하는 문제

### Q: API 키가 작동하지 않아요

**A**: 다음 사항을 확인하세요:

* 개발자 포털과 콘솔 사이트 이메일 동일 여부
* API 키 복사 시 공백이나 특수문자 포함 여부
* 크레딧 잔액 및 사용자 권한 확인

### Q: 크레딧이 없어요

**A**: 현재 수동 설정이 필요합니다. 고객 지원팀에 크레딧 충전을 요청하세요.

### Q: 한국어 API 결과가 이상해요

**A**: Qwen 모델은 한국어에 특화되어 있습니다. 프롬프트를 더 구체적으로 작성해보세요.

## 🎯 다음 단계

설정이 완료되었다면:

1. **API 서비스 탐색**: [API 서비스 개요](/ko/docs/api-services)
2. **상세 기술 문서**: [영어 문서](/docs/api-services/overview)에서 전체 API 명세 확인
3. **Excel Plugin**: [Excel에서 AI 사용하기](/docs/api-services/excel-plugin)
4. **콘솔 활용**: [콘솔 가이드](/docs/console-guide/initial-setup)

## 🆘 도움이 필요하시면

* **Discord**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
* **이메일**: support@kvid.ai

## 💡 K-pop & K-beauty 활용 팁

### Video API 활용

```bash
# K-pop 댄스 비디오
"prompt": "[Low-angle shot] K-pop 여성 댄서가 역동적인 안무를 추는 모습"

# K-beauty 제품 홍보
"prompt": "[Close-up] K-beauty 립스틱을 바르는 우아한 모습, 화사한 조명"
```

### Text API 활용

```bash
# K-pop 가사 생성
"content": "사랑을 주제로 한 K-pop 발라드 가사를 한국어로 써주세요"

# K-beauty 제품 설명
"content": "K-beauty 스킨케어 루틴에 대한 블로그 글을 써주세요"
```

- - -

**Language**: [English](/docs/intro) | **한국어** (현재 페이지)
