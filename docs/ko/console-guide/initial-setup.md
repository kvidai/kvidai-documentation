---
title: 콘솔 초기 설정 가이드
description: kvidAI 콘솔 첫 사용을 위한 계정 설정 및 API 키 발급 안내
slug: initial-setup
tags: [콘솔, 설정, API키, 초기설정]
sidebar_position: 1
---

# 콘솔 초기 설정 가이드

kvidAI 서비스를 처음 이용하시는 분들을 위한 단계별 설정 가이드입니다. 최초 사용 시 필요한 계정 생성부터 API 키 발급까지 전 과정을 안내합니다.

## 🚀 시작하기 전에

### 중요사항
- **구매시 입력한 이메일**과 **콘솔 사이트의 이메일** 주소가 반드시 동일해야 합니다

### 접속 URL
- **구매 사이트**: [kvid.ai.kr](https://developers.kvid.ai/)
- **콘솔 사이트**: [console.kvid.ai](https://console.kvid.ai)

## 📝 1단계: 계정 생성

### 1.1 콘솔 사이트 회원가입

1. [console.kvid.ai](https://console.kvid.ai)에 접속
2. **"회원가입"** 버튼 클릭
3. **동일한 이메일 주소**로 가입

:::warning 중요
크레딧 구매에 입력된 이메일은  콘솔 사이트에서 사용하는 이메일 주소는 반드시 동일해야 합니다. 이메일이 다르면 구매한 크레딧과 계정 연동이 되지 않습니다.
:::


## 💳 2단계: 콘솔 사이트

콘솔사이트에서 사용자의 크레딧 구매 목록, 크레딧 사용 로그 및 사용량 분석, api key 관리 등 전반적인 작업을 수행 할 수 있습니니다.

### 2.1 Content Manager

크레딧 구매목록, 크레딧 사용 히스토리 등을 조회 할 수 있습니다.

1. 구매 목록 - 크레딧을 구매하신 내용을 조회할 수 있습니다. 구매일, 만료일 등을 조회할 수 있습니다.
2. credit 사용 기록 - 크레딧 사용 상세 내역을 조회할 수 있습니다. 사용된 prompt, 결과물 등을 조회 할 수 있습니다.

### 2.2 Media Library

AI를 활용하여 생성된 이미지나 비디오, 비디오 생성을 위해 파일로 업로드 된 이미지 등이 저장되는 라이브러리 입니다.

1. 생성된 이미지, 비디오 등을 조회 할 수 있습니다.
2. 제공되는 url을 통해 원하시는 곳에서 이미지와 동영상을 활용 할 수 있습니다.
3. 이미지 기반 동영상 생성 기능을 사용될 때 파일 형식으로 제공된 이미지는 자동으로 Media Library에 업로드 됩니다.


## 🔑 3단계: API 키 발급

### 3.1 개발자 포털에서 API 키 생성

1. [console.kvid.ai](https://console.kvid.ai/)에 로그인
2. **"API Key Manager"** 또는 **"API 키 관리자"** 메뉴 선택
3. **"API 키 생성"** 버튼 클릭
4. API 키 생성 완료

### 3.2 API 키 확인

:::warning 보안 주의
API 키를 활용하면 크레딧이 소모 됩니다. 반드시 외부에 노출 되지 않게 주의해 주세요!
:::

1. **"API Key Manager"** 또는 **"API 키 관리자"** 메뉴 선택
2. 기존 발급 키 목록 확인
3. 키 보기 클릭
4. 키 전체 확인

:::info Primary Key & Secondary Key
Primary Key를 주로 사용해 주세요. Secondary Key는 비상시나 특수한 경우에 사용되도록 발급하는 보조 키 입니다.
:::


## 🧪 4단계: API 테스트

### 4.1 첫 번째 API 호출 테스트

설정이 완료되었는지 간단한 API 호출로 테스트해보세요.

**Image API 테스트:**
```bash
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop concert stage with colorful lights",
    "negative_prompt": "blurry, low quality",
    "image_size": {
      "width": 512,
      "height": 512
    },
    "num_inference_steps": 50,
    "guidance_scale": 7.5
  }'
```

**Video API 테스트 (Text-to-Video):**
```bash
curl -X POST "https://api.kvid.ai/ai/video/text-to-video/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat playing in the garden",
    "resolution": "480p",
    "aspect_ratio": "16:9",
    "num_frames": 81,
    "frames_per_second": 16,
    "enable_safety_checker": true
  }'
```

## ✅ 설정 완료 체크리스트

다음 항목들을 모두 완료했는지 확인하세요:

- [ ] 콘솔 사이트 회원가입 (console.kvid.ai)
- [ ] 크레딧 상품 구매 (kvid.ai.kr)
- [ ] **동일한 이메일 주소** 사용 확인
- [ ] API 키 발급
- [ ] API 테스트 성공

## 🆘 문제 해결

### 자주 발생하는 문제

**Q: API 키가 작동하지 않아요**
- 개발자 포털과 콘솔 사이트 이메일 주소가 동일한지 확인
- API 키 복사 시 공백이나 특수문자 포함 여부 확인
- 크레딧 잔액 및 사용자 권한 확인

**Q: 크레딧이 없어요**
- 현재 수동 설정이 필요합니다
- 고객 지원팀에 크레딧 충전 요청

**Q: 사용자 권한 오류가 발생해요**
- 콘솔 사이트에서 사용자 역할이 "api-user"로 설정되었는지 확인
- 권한 설정이 안 되어 있다면 고객 지원팀에 문의

### 고객 지원

설정 과정에서 도움이 필요하시면 언제든 연락하세요:

- **이메일**: kvid030@gmail.com
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)

## 🎯 다음 단계

설정이 완료되었다면 이제 다음 문서들을 참고하세요:

- [Video API 사용법](/docs/api-services/video-api)
- [Image API 사용법](/docs/api-services/image-api)
- [Text API 사용법](/docs/api-services/text-api)

:::tip 성공 팁
초기 설정 시 이메일 주소 통일과 수동 권한 설정이 가장 중요합니다. 문제가 발생하면 고객 지원팀에 문의하세요.
:::

---

**마지막 업데이트**: 2025년 7월 14일  
**작성자**: kvidAI 팀