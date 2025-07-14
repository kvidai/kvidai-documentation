---
title: Video 생성 AI API
description: kvidAI Video 생성 API 사용 가이드 및 기술 명세
slug: video-api
tags: [API, Video, AI, 비디오생성]
---

# Video 생성 AI API

kvidAI의 Video 생성 AI API는 텍스트나 이미지를 입력으로 받아 5초 길이의 고품질 비디오를 생성하는 서비스입니다.

## 🎯 서비스 개요

### 지원 기능
- **Text-to-Video**: 텍스트 프롬프트로 비디오 생성
- **Image-to-Video**: 이미지를 기반으로 한 비디오 생성
- **해상도**: 480p, 720p 지원
- **길이**: 5초 고정

### 특화 분야
- **K-pop 스타일**: 아이돌, 퍼포먼스, 뮤직비디오 스타일
- **K-뷰티**: 메이크업, 스킨케어, 뷰티 튜토리얼
- **한국 문화**: 전통 문화, 현대 라이프스타일

## 📡 API 엔드포인트

### 기본 정보
```
Base URL: https://api.kvid.ai/v1
Authentication: Bearer Token (API Key)
Content-Type: application/json
```

### 1. 비디오 생성 요청

```http
POST /video/generate
```

**요청 헤더**
```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**요청 본문**
```json
{
  "type": "text_to_video",
  "prompt": "아이돌이 무대에서 춤추는 모습",
  "resolution": "720p",
  "style": "kpop",
  "seed": 12345,
  "cfg_scale": 7.5
}
```

**응답**
```json
{
  "task_id": "task_abc123def456",
  "status": "pending",
  "estimated_time": 180,
  "credits_used": 10
}
```

### 2. 작업 상태 확인

```http
GET /video/status/{task_id}
```

**응답**
```json
{
  "task_id": "task_abc123def456",
  "status": "completed",
  "progress": 100,
  "result": {
    "video_url": "https://cdn.kvid.ai/videos/abc123.mp4",
    "thumbnail_url": "https://cdn.kvid.ai/thumbnails/abc123.jpg",
    "duration": 5.0,
    "resolution": "720p"
  },
  "credits_used": 10
}
```

### 3. Image-to-Video 생성

```http
POST /video/generate
```

**요청 본문**
```json
{
  "type": "image_to_video",
  "image_url": "https://example.com/image.jpg",
  "prompt": "이 이미지의 인물이 춤추는 모습으로 만들어주세요",
  "resolution": "720p",
  "motion_strength": 0.8
}
```

## 📋 매개변수 상세

### 필수 매개변수

| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| `type` | string | 생성 타입 | `text_to_video`, `image_to_video` |
| `prompt` | string | 텍스트 프롬프트 (최대 500자) | "아이돌이 무대에서 춤추는 모습" |

### 선택 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `resolution` | string | `720p` | 비디오 해상도 (`480p`, `720p`) |
| `style` | string | `auto` | 스타일 프리셋 (`kpop`, `kbeauty`, `auto`) |
| `seed` | integer | `random` | 재현 가능한 결과를 위한 시드값 |
| `cfg_scale` | float | 7.5 | CFG 스케일 (1.0-20.0) |
| `motion_strength` | float | 0.7 | 모션 강도 (0.1-1.0, image_to_video만) |
| `image_url` | string | - | 입력 이미지 URL (image_to_video만) |

## 💰 요금 및 크레딧

### 크레딧 소모량

| 해상도 | 타입 | 크레딧 |
|--------|------|--------|
| **480p** | Text-to-Video | 8 크레딧 |
| **720p** | Text-to-Video | 10 크레딧 |
| **480p** | Image-to-Video | 12 크레딧 |
| **720p** | Image-to-Video | 15 크레딧 |

### 크레딧 구매 가격

| 패키지 | 크레딧 | 가격(원) | 단가 |
|--------|--------|----------|------|
| 스타터 | 100 | 10,000 | 100원/크레딧 |
| 베이직 | 500 | 45,000 | 90원/크레딧 |
| 프로 | 1,000 | 80,000 | 80원/크레딧 |
| 엔터프라이즈 | 5,000 | 350,000 | 70원/크레딧 |

## 📝 사용 예제

### Python 예제

```python
import requests
import time

# API 설정
API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.kvid.ai/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 비디오 생성 요청
payload = {
    "type": "text_to_video",
    "prompt": "K-pop 아이돌이 화려한 무대에서 춤추는 모습",
    "resolution": "720p",
    "style": "kpop"
}

# 생성 요청
response = requests.post(f"{BASE_URL}/video/generate", json=payload, headers=headers)
task_data = response.json()
task_id = task_data["task_id"]

# 완료 대기
while True:
    status_response = requests.get(f"{BASE_URL}/video/status/{task_id}", headers=headers)
    status_data = status_response.json()
    
    if status_data["status"] == "completed":
        video_url = status_data["result"]["video_url"]
        print(f"비디오 생성 완료: {video_url}")
        break
    elif status_data["status"] == "failed":
        print("비디오 생성 실패")
        break
    
    time.sleep(10)  # 10초 대기
```

### JavaScript 예제

```javascript
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.kvid.ai/v1';

async function generateVideo() {
  // 비디오 생성 요청
  const response = await fetch(`${BASE_URL}/video/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'text_to_video',
      prompt: 'K-뷰티 메이크업 튜토리얼 영상',
      resolution: '720p',
      style: 'kbeauty'
    })
  });

  const taskData = await response.json();
  const taskId = taskData.task_id;

  // 완료 대기
  while (true) {
    const statusResponse = await fetch(`${BASE_URL}/video/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const statusData = await statusResponse.json();

    if (statusData.status === 'completed') {
      console.log('비디오 생성 완료:', statusData.result.video_url);
      break;
    } else if (statusData.status === 'failed') {
      console.log('비디오 생성 실패');
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
  }
}

generateVideo();
```

## ⚠️ 제한사항 및 주의사항

### 기술적 제한
- **길이**: 현재 5초 고정 (향후 확장 예정)
- **해상도**: 최대 720p
- **처리 시간**: 평균 2-3분
- **파일 크기**: 최대 50MB

### 콘텐츠 정책
- 성인 콘텐츠 생성 금지
- 저작권 침해 콘텐츠 금지
- 폭력적이거나 혐오 콘텐츠 금지
- 실제 인물 무단 사용 금지

### 품질 최적화 팁
- **구체적인 프롬프트**: "춤추는 모습" → "화려한 무대에서 현대적인 안무로 춤추는 모습"
- **스타일 지정**: K-pop, K-뷰티 관련 콘텐츠는 적절한 스타일 프리셋 사용
- **해상도 선택**: 소셜미디어용은 720p 권장

## 🔗 관련 링크

- [API 키 발급](https://developers.kvid.ai)
- [콘솔 관리](https://console.kvid.ai)
- [크레딧 구매](https://app.kvid.ai/credits)
- [디스코드 커뮤니티](https://discord.gg/wvsecByF)

## 📞 지원

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/wvsecByF)
- **문의 폼**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)