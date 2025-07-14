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
- **개발자 포털**과 **콘솔 사이트**의 이메일 주소가 반드시 동일해야 합니다
- 초기 설정 시 수동으로 크레딧 및 사용자 권한을 설정해야 합니다

### 접속 URL
- **개발자 포털**: [developers.hometip.net](https://developers.hometip.net/)
- **콘솔**: [console.hometip.net](https://console.hometip.net)

## 📝 1단계: 계정 생성

### 1.1 개발자 포털 회원가입

1. [developers.hometip.net](https://developers.hometip.net/)에 접속
2. **"회원가입"** 버튼 클릭
3. 가입 정보 입력:
   - 이메일 주소
   - 비밀번호
   - 기본 정보

### 1.2 콘솔 사이트 회원가입

1. [console.hometip.net](https://console.hometip.net)에 접속
2. **"회원가입"** 버튼 클릭
3. **동일한 이메일 주소**로 가입

:::warning 중요
개발자 포털과 콘솔 사이트에서 사용하는 이메일 주소는 반드시 동일해야 합니다. 이메일이 다르면 API 키와 계정 연동이 되지 않습니다.
:::

## 🔑 2단계: API 키 발급

### 2.1 개발자 포털에서 API 키 생성

1. [developers.hometip.net](https://developers.hometip.net/)에 로그인
2. **"API Keys"** 또는 **"키 관리"** 메뉴 선택
3. **"새 API 키 생성"** 버튼 클릭
4. 원하는 API 서비스 선택:
   - Video 생성 AI API
   - Image 생성 AI API  
   - Text 생성 LLM AI API
5. API 키 생성 완료

### 2.2 API 키 저장

:::warning 보안 주의
API 키는 생성 시 한 번만 표시됩니다. 반드시 안전한 곳에 저장하세요!
:::

1. 생성된 API 키 복사
2. 안전한 곳에 저장 (비밀번호 관리자 권장)
3. 키가 노출되지 않도록 주의

## 💳 3단계: 콘솔 사이트 설정

### 3.1 크레딧 설정

현재 자동 결제 시스템이 연동되지 않아 수동으로 크레딧을 설정해야 합니다.

1. [console.hometip.net](https://console.hometip.net)에 로그인
2. 관리자에게 크레딧 충전 요청
3. 크레딧 충전 완료 확인

### 3.2 사용자 권한 설정

사용자 권한을 수동으로 설정해야 합니다.

1. 콘솔 사이트에서 계정 설정 메뉴 이동
2. 사용자 역할(User Role)을 **"api-user"**로 설정
3. 권한 설정 완료 확인

:::info 참고
Cafe24 결제 시스템을 거치지 않기 때문에 크레딧과 사용자 권한을 수동으로 설정해야 합니다.
:::

## 🧪 4단계: API 테스트

### 4.1 첫 번째 API 호출 테스트

설정이 완료되었는지 간단한 API 호출로 테스트해보세요.

**Text API 테스트:**
```bash
curl -X POST "https://api.hometip.net/ai-model/qwen/v1/chat/completions" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
      {"role": "user", "content": "안녕하세요"}
    ]
  }'
```

**Video API 테스트:**
```bash
curl -X POST "https://api.hometip.net/ai-model/videogen-1/v1/video_generation" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-to-video",
    "prompt": "A cat playing in the garden"
  }'
```

## ✅ 설정 완료 체크리스트

다음 항목들을 모두 완료했는지 확인하세요:

- [ ] 개발자 포털 회원가입 (developers.hometip.net)
- [ ] 콘솔 사이트 회원가입 (console.hometip.net)
- [ ] **동일한 이메일 주소** 사용 확인
- [ ] 개발자 포털에서 API 키 발급
- [ ] API 키 안전한 곳에 저장
- [ ] 콘솔 사이트에서 크레딧 설정 (수동)
- [ ] 사용자 권한을 "api-user"로 설정
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

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/wvsecByF)
- **문의 폼**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)

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