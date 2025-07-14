---
title: Text 생성 LLM AI API
description: kvidAI Text 생성 API 사용 가이드 및 기술 명세
slug: text-api
tags: [API, LLM, Text, AI, 텍스트생성, Qwen]
sidebar_position: 4
---

# Text 생성 LLM AI API

kvidAI의 Text 생성 LLM AI API는 Qwen 모델을 기반으로 한 대화형 AI 텍스트 생성 서비스입니다. OpenAI SDK와 호환되며, 텍스트와 이미지 입력을 모두 지원합니다.

## 🎯 서비스 개요

### 핵심 기능
- **OpenAI SDK 호환**: OpenAI SDK를 사용하여 API 호출 가능
- **멀티모달 지원**: 텍스트 + 이미지 입력 지원
- **고성능 모델**: Qwen 2.5 시리즈 최신 모델 제공
- **다양한 역할**: system, user, assistant 역할 기반 대화

### 지원 모델
- **qwen2.5-72b-instruct**: 범용 대화 및 텍스트 생성 모델
- **qwen2.5-vl-72b-instruct**: 비전-언어 멀티모달 모델 (이미지 분석 가능)

## 📡 API 엔드포인트

### 기본 정보
```
Base URL: https://api.hometip.net/ai-model/qwen/v1
Chat Completions: https://api.hometip.net/ai-model/qwen/v1/chat/completions
Authentication: API-KEY Bearer Token
Content-Type: application/json
```

### 1. 텍스트 입력 API

**요청 예시**
```bash
curl -X POST https://api.hometip.net/ai-model/qwen/v1/chat/completions \
-H "API-KEY: Bearer $SUBSCRIPTION_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Who are you?"
        }
    ]
}'
```

### 2. 이미지 입력 API

**요청 예시**
```bash
curl -X POST https://api.hometip.net/ai-model/qwen/v1/chat/completions \
-H "API-KEY: Bearer $SUBSCRIPTION_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "model": "qwen2.5-vl-72b-instruct",
  "messages": [{
      "role": "user",
      "content":
      [{"type": "text","text": "What is this"},
       {"type": "image_url","image_url": {"url": "https://lkhtherapymi.com/wp-content/uploads/2016/09/h48-post-1.jpg"}}]
    }]
}'
```

## 📋 메시지 스키마

### Messages 배열
모델에 대한 지시사항을 포함하는 `messages` 배열을 제공하여 프롬프트를 생성합니다. 각 메시지는 모델이 입력을 해석하는 방식에 영향을 주는 서로 다른 `role`을 가질 수 있습니다.

### Role 설명

| Role | 설명 | 사용 예시 |
|------|------|-----------|
| **user** | 모델에서 출력을 요청하는 지시사항. 최종 사용자가 채팅에서 입력하는 메시지와 유사 | 질문, 요청사항 |
| **developer** (system) | 사용자 메시지보다 우선순위가 높은 모델에 대한 지시사항. 이전에는 `system` 프롬프트라고 불림 | 모델 행동 정의, 역할 설정 |
| **assistant** | 모델에 의해 생성된 메시지. 이전 생성 요청에서 나온 응답 | 대화 컨텍스트 유지 |

## 💰 요금 및 크레딧

### 토큰 기반 과금 시스템
"**단가 × 사용량**" 만큼 보유 크레딧이 차감됩니다.

| 구분 | 단가 (1,000토큰 기준) |
|------|---------------------|
| **Input** | $0.0012 |
| **Output** | $0.0036 |

### 가격 예시 (환율 1,446원 기준)
| 구분 | 크레딧 (1,000토큰 기준) |
|------|------------------------|
| **Input** | 17.352 크레딧 |
| **Output** | 52.056 크레딧 |

## 📝 Python SDK 사용 예제

### OpenAI SDK 설치
```bash
pip install openai
```

### 기본 텍스트 생성
```python
from openai import OpenAI

# kvidAI API 클라이언트 설정
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.hometip.net/ai-model/qwen/v1"
)

# 채팅 완성 요청
response = client.chat.completions.create(
    model="qwen2.5-72b-instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "안녕하세요. 자기소개를 해주세요."}
    ]
)

print(response.choices[0].message.content)
```

### 이미지 분석
```python
# 이미지 포함 분석 (VL 모델 사용)
response = client.chat.completions.create(
    model="qwen2.5-vl-72b-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "이 이미지에 무엇이 있는지 설명해주세요."},
                {"type": "image_url", "image_url": {"url": "IMAGE_URL_HERE"}}
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

### 스트리밍 응답
```python
# 스트리밍으로 실시간 응답 받기
stream = client.chat.completions.create(
    model="qwen2.5-72b-instruct",
    messages=[
        {"role": "user", "content": "AI의 미래에 대해 설명해주세요."}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

## 🎯 사용 사례

### 1. 텍스트 생성 및 작성
- 콘텐츠 작성 지원
- 번역 및 언어 변환
- 요약 및 정리
- 창작 지원

### 2. 대화형 AI 서비스
- 챗봇 구현
- 고객 상담 자동화
- 교육용 튜터
- 개인 비서 기능

### 3. 이미지 분석 (VL 모델)
- 이미지 내용 설명
- 시각적 질문 답변
- 이미지 기반 검색
- 멀티모달 콘텐츠 생성

## ⚠️ 제한사항 및 주의사항

### API 사용 제한
- API 키 인증 필수
- 요청 당 토큰 제한 적용
- 적절한 에러 핸들링 구현 권장

### 콘텐츠 정책
- 유해한 콘텐츠 생성 금지
- 개인정보 처리 주의
- 저작권 관련 콘텐츠 주의
- 사실 확인 필요

### 최적화 팁
- **명확한 프롬프트**: 구체적이고 명확한 지시사항 제공
- **적절한 모델 선택**: 용도에 맞는 모델 선택 (텍스트 vs 멀티모달)
- **토큰 효율성**: 불필요한 토큰 사용 최소화
- **에러 처리**: 적절한 에러 핸들링 및 재시도 로직

## 🔗 관련 링크

- [API 키 발급](https://developers.kvid.ai)
- [콘솔 관리](https://console.kvid.ai)
- [사용량 모니터링](https://console.kvid.ai/usage)

## 📞 지원 및 문의

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/wvsecByF)
- **문의 폼**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)