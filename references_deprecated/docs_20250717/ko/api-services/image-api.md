---
title: Image 생성 AI API
description: kvidAI Image 생성 API 사용 가이드 및 기술 명세
slug: image-api
tags: [API, Image, AI, 이미지생성, FLUX]
---

# Image 생성 AI API

kvidAI의 Image 생성 AI API는 FLUX.1 dev 모델을 기반으로 한 고품질 이미지 생성 서비스입니다. K-pop과 K-뷰티에 특화된 프롬프트 최적화를 제공합니다.

## 🎯 서비스 개요

### 핵심 기능
- **Text-to-Image**: 텍스트 프롬프트로 이미지 생성
- **FLUX.1 dev**: 최신 AI 모델 사용
- **K-컨텐츠 특화**: K-pop, K-뷰티 최적화
- **고해상도**: 최대 1024x1024 지원

### 특화 영역
- **K-pop 스타일**: 아이돌 컨셉, 무대 의상, 앨범 커버
- **K-뷰티**: 메이크업 룩, 스킨케어, 제품 이미지
- **패션**: 한국 트렌드, 스트릿 패션
- **라이프스타일**: 카페, 인테리어, 일상

## 📡 API 엔드포인트

### 기본 정보
```
Base URL: https://api.kvid.ai
Authentication: api-key Header
Content-Type: application/json
```

### 1. 이미지 생성 요청

```http
POST /ai/image/generate
```

**요청 헤더**
```json
{
  "api-key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**요청 본문**
```json
{
  "prompt": "K-pop idol wearing colorful stage outfit, professional photography",
  "negative_prompt": "blurry, low quality, distorted",
  "image_size": {
    "width": 1024,
    "height": 1024
  },
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "enable_safety_checker": true
}
```

**응답**
```json
{
  "task_id": "img_abc123def456",
  "status": "pending",
  "estimated_time": 30,
  "credits_used": 16
}
```

### 2. 작업 상태 확인

```http
GET /ai/image/status/{task_id}
```

**응답**
```json
{
  "task_id": "img_abc123def456",
  "status": "completed",
  "progress": 100,
  "result": {
    "images": [
      {
        "url": "https://cdn.kvid.ai/images/abc123_1.jpg",
        "width": 1024,
        "height": 1024,
        "seed": 12345
      }
    ]
  },
  "credits_used": 16
}
```

### 3. 배치 생성

```http
POST /ai/image/generate
```

**이미지 생성 요청 예시**
```json
{
  "prompt": "Beautiful Korean makeup look, natural lighting",
  "negative_prompt": "blurry, low quality",
  "image_size": {
    "width": 512,
    "height": 512
  },
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "enable_safety_checker": true
}
```

## 📋 매개변수 상세

### 필수 매개변수

| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| `prompt` | string | 이미지 생성 프롬프트 (최대 1000자) | "K-pop idol in colorful stage outfit" |

### 선택 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `negative_prompt` | string | - | 제외할 요소 설명 |
| `image_size` | object | - | 이미지 크기 설정 객체 |
| `image_size.width` | integer | 1024 | 이미지 폭 (512, 768, 1024) |
| `image_size.height` | integer | 1024 | 이미지 높이 (512, 768, 1024) |
| `num_inference_steps` | integer | 50 | 추론 단계 수 (20-100) |
| `guidance_scale` | float | 7.5 | CFG 스케일 (1.0-20.0) |
| `enable_safety_checker` | boolean | true | 안전 필터 활성화 여부 |
| `seed` | integer | random | 재현성을 위한 시드값 |

### 지원 해상도

| 크기 | 비율 | 용도 |
|------|------|------|
| 512×512 | 1:1 | SNS 프로필, 아이콘 |
| 768×768 | 1:1 | 일반 이미지 |
| 1024×1024 | 1:1 | 고품질 이미지 |
| 768×512 | 3:2 | 가로형 이미지 |
| 512×768 | 2:3 | 세로형 이미지 |


## 🎨 스타일 프리셋

### K-pop 스타일
```json
{
  "prompt": "K-pop idol in glittery stage outfit, dynamic pose",
  "negative_prompt": "blurry, low quality, distorted",
  "image_size": {"width": 1024, "height": 1024},
  "guidance_scale": 7.5
}
```
- 화려한 무대 의상
- 다이나믹한 포즈
- 무대 조명 효과
- 현대적이고 트렌디한 스타일

### K-뷰티 스타일
```json
{
  "prompt": "Natural Korean beauty makeup, soft lighting",
  "negative_prompt": "harsh lighting, unnatural colors",
  "image_size": {"width": 768, "height": 768},
  "guidance_scale": 7.5
}
```
- 자연스러운 메이크업
- 부드러운 조명
- 깨끗한 피부 표현
- 미니멀한 배경

### 패션 스타일
```json
{
  "prompt": "Korean street fashion, trendy outfit",
  "negative_prompt": "old-fashioned, outdated style",
  "image_size": {"width": 768, "height": 1024},
  "guidance_scale": 7.5
}
```
- 한국 스트릿 패션
- 트렌디한 스타일링
- 도시적 배경
- 모던한 감성

## 📝 사용 예제

### Python 예제

```python
import requests
import time

# API 설정
API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.kvid.ai"

headers = {
    "api-key": API_KEY,
    "Content-Type": "application/json"
}

# 이미지 생성 요청
payload = {
    "prompt": "Beautiful K-pop idol with colorful hair, professional portrait",
    "negative_prompt": "blurry, low quality, distorted",
    "image_size": {
        "width": 1024,
        "height": 1024
    },
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "enable_safety_checker": True
}

# 생성 요청
response = requests.post(f"{BASE_URL}/ai/image/generate", json=payload, headers=headers)
task_data = response.json()
task_id = task_data["task_id"]

# 완료 대기
while True:
    status_response = requests.get(f"{BASE_URL}/ai/image/status/{task_id}", headers=headers)
    status_data = status_response.json()
    
    if status_data["status"] == "completed":
        images = status_data["result"]["images"]
        for i, img in enumerate(images):
            print(f"이미지 {i+1}: {img['url']}")
        break
    elif status_data["status"] == "failed":
        print("이미지 생성 실패")
        break
    
    time.sleep(5)  # 5초 대기
```

### JavaScript 예제

```javascript
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.kvid.ai';

async function generateImage() {
  // 이미지 생성 요청
  const response = await fetch(`${BASE_URL}/ai/image/generate`, {
    method: 'POST',
    headers: {
      'api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'Korean beauty model with natural makeup, studio lighting',
      negative_prompt: 'blurry, distorted',
      image_size: {
        width: 768,
        height: 768
      },
      num_inference_steps: 50,
      guidance_scale: 7.5,
      enable_safety_checker: true
    })
  });

  const taskData = await response.json();
  const taskId = taskData.task_id;

  // 완료 대기
  while (true) {
    const statusResponse = await fetch(`${BASE_URL}/ai/image/status/${taskId}`, {
      headers: {
        'api-key': API_KEY
      }
    });

    const statusData = await statusResponse.json();

    if (statusData.status === 'completed') {
      console.log('이미지 생성 완료:', statusData.result.images);
      break;
    } else if (statusData.status === 'failed') {
      console.log('이미지 생성 실패');
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
  }
}

generateImage();
```

### cURL 예제

```bash
# 이미지 생성 요청
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop concert stage with colorful lights",
    "negative_prompt": "blurry, low quality",
    "image_size": {
      "width": 1024,
      "height": 768
    },
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "enable_safety_checker": true
  }'

# 상태 확인
curl -X GET "https://api.kvid.ai/ai/image/status/TASK_ID" \
  -H "api-key: YOUR_API_KEY"
```

## 🎯 프롬프트 최적화 가이드

### 효과적인 프롬프트 작성

**좋은 예시:**
```
"K-pop idol with pastel pink hair, wearing holographic stage outfit, dramatic lighting, professional photography, high quality"

**negative_prompt**:
"blurry, low quality, distorted, bad anatomy"
```

**피해야 할 예시:**
```
"pretty girl"
```

### 프롬프트 구성 요소

1. **주제**: 인물, 객체, 장면
2. **스타일**: K-pop, K-뷰티, 패션
3. **디테일**: 색상, 옷, 헤어스타일
4. **분위기**: 조명, 배경, 무드
5. **품질**: "professional", "high quality", "detailed"

### 네거티브 프롬프트 활용

```json
{
  "prompt": "Beautiful Korean model",
  "negative_prompt": "blurry, low quality, distorted, bad anatomy",
  "image_size": {"width": 1024, "height": 1024},
  "guidance_scale": 7.5,
  "enable_safety_checker": true
}
```

## ⚠️ 제한사항 및 주의사항

### 기술적 제한
- **최대 해상도**: 1024×1024
- **배치 크기**: 최대 4개 이미지
- **처리 시간**: 30초-2분
- **파일 형식**: JPEG, PNG

### 콘텐츠 정책
- 성인 콘텐츠 생성 금지
- 실제 인물 얼굴 복제 금지
- 저작권 침해 콘텐츠 금지
- 폭력적이거나 혐오 콘텐츠 금지

### 품질 최적화 팁
- **구체적인 설명**: "아름다운 여성" → "파스텔 핑크 머리의 K-pop 아이돌"
- **조명 명시**: "studio lighting", "soft natural light"
- **품질 키워드**: "professional photography", "high resolution"
- **스타일 일관성**: 관련 키워드들을 함께 사용

## 🔗 관련 링크

- [API 키 발급](https://developers.kvid.ai)
- [콘솔 관리](https://console.kvid.ai)
- [크레딧 구매](https://app.kvid.ai/credits)
- [갤러리 샘플](https://app.kvid.ai/gallery)

## 💰 요금 정보

Image Generation API의 자세한 요금 정보는 [요금제 페이지](/ko/pricing#🎨-image-generation-ai-요금)를 참고해 주세요.

## 📞 지원

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/yzgyCx8Jpt)