---
title: API 서비스 개요
description: kvidAI API 서비스 전체 개요 및 가격 정보
sidebar_position: 1
---

# API 서비스 개요

kvidAI는 K-pop과 K-beauty에 특화된 AI 생성 플랫폼으로, 다양한 API 서비스를 제공합니다.

## 🎯 주요 API 서비스

### 1. Video 생성 AI API
- **기능**: 텍스트나 이미지를 5-6초 비디오로 변환
- **특화**: K-pop 댄스, K-beauty 콘텐츠 최적화
- **가격**: 39-89 크레딧
- **해상도**: 480p, 720p, 1080p 지원

### 2. Image 생성 AI API  
- **기능**: FLUX.1 dev 모델 기반 이미지 생성
- **특화**: K-pop 아이돌, K-beauty 모델 스타일
- **가격**: 2-8 크레딧 ( 7.5 per mpx )
- **최대 해상도**: 1024x1024

### 3. Text 생성 LLM API
- **모델**: Qwen2.5-72B-Instruct, Qwen2.5-VL-72B-Instruct
- **특화**: 한국어 및 K-culture 콘텐츠 생성
- **가격**: 
  - Input: $0.0012 (17.352 크레딧) per 1K tokens
  - Output: $0.0036 (52.056 크레딧) per 1K tokens

### 4. Excel Plugin
- **기능**: Excel에서 직접 AI 기능 사용
- **함수**: RUNGPT_TEXT(), RUNGPT_IMAGE_TO_TEXT(), RUNGPT_ASYNC_RESULT()
- **가격**: $0.01-$0.1 per 함수 호출

### 5. Local RAG 솔루션
- **기능**: 온프레미스 AI 시스템 구축
- **특화**: 기업용 맞춤형 AI 솔루션
- **구성**: LangChain, Streamlit, ChromaDB 기반

## 🔑 API 시작하기

### 1단계: API 키 발급
1. [콘솔 사이트](https://console.kvid.ai)에  가입
2. API 키 생성

### 2단계: 첫 API 호출
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

## 💰 요금 체계

### 크레딧 시스템
- **기준 환율**: 1,500원 = 1 USD
- **단가 × 사용량**만큼 크레딧 차감
- **선불 충전** 방식으로 운영

### 서비스별 요금
| 서비스 | 단가 | 크레딧 |
|--------|------|--------|
| Video 생성 | $0.39-$0.89 | 39-89 크레딧 |
| Image 생성 | $0.02-$0.08 | 2-8 크레딧(7.5/mpx) |
| Text 생성 (Input) | $0.0012/1K | 17.352 크레딧 |
| Text 생성 (Output) | $0.0036/1K | 52.056 크레딧 |
| Excel 함수 | $0.01-$0.1 | 14-144 크레딧 |

## 🎨 K-pop & K-beauty 특화 기능

### Video API 특화
- K-pop 댄스 동작 최적화
- 아이돌 스타일 카메라 앵글
- 한국 전통 요소 결합

### Image API 특화  
- K-beauty 메이크업 스타일
- 한국 패션 트렌드 반영
- 아이돌 포토 스타일 지원

### Text API 특화
- 한국어 자연어 처리 최적화
- K-culture 콘텐츠 생성
- 한국식 표현 및 문화 맥락 이해

## 🚀 다음 단계

- [시작하기 가이드](/docs/ko/getting-started) - 계정 설정부터 첫 API 호출까지
- [전체 기술 문서](/docs/api-services/overview) - 상세한 API 명세 (영어)
- [콘솔 가이드](/docs/console-guide/initial-setup) - 계정 및 크레딧 관리

## 🆘 지원

- **Discord**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)
- **이메일**: kvid030@gmail.com

---

**Language**: [English](/docs/api-services/overview) | **한국어** (현재 페이지)