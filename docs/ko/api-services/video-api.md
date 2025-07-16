---
title: Video 생성 AI API
description: kvidAI Video 생성 API 사용 가이드 및 기술 명세
slug: video-api
tags: [API, Video, AI, 비디오생성]
sidebar_position: 2
---

# Video 생성 AI API

kvidAI의 Video 생성 AI API는 텍스트나 이미지를 입력으로 받아 5-6초 길이의 고품질 비디오를 생성하는 서비스입니다.

## 🎯 서비스 개요

### 지원 기능
- **Text-to-Video**: 텍스트 프롬프트로 비디오 생성
- **Image-to-Video**: 이미지를 기반으로 한 비디오 생성
- **v1 모델**: 480p, 580p, 720p 지원 (5-6초)
- **v2 모델**: 480p, 720p, 1080p 지원 (5초 또는 10초)

### 특화 기능
- 카메라 앵글 조작 프롬프트 지원 (완벽하지 않을 수 있음)
- 다양한 생성 옵션 및 제어 가능

## 📡 API 엔드포인트

### 기본 정보
```
Base URL: https://api.kvid.ai
api-key: api_key Header
Content-Type: application/json
```

### API 엔드포인트

#### Text-to-Video
- **생성**: `POST https://api.kvid.ai/ai/video/text-to-video/generate`
- **상태 확인**: `GET https://api.kvid.ai/ai/video/text-to-video/status?request_id={request_id}`
- **결과 가져오기**: `GET https://api.kvid.ai/ai/video/text-to-video/result?request_id={request_id}`

#### Image-to-Video
- **생성**: `POST https://api.kvid.ai/ai/video/image-to-video/generate`
- **상태 확인**: `GET https://api.kvid.ai/ai/video/image-to-video/status?request_id={request_id}`
- **결과 가져오기**: `GET https://api.kvid.ai/ai/video/image-to-video/result?request_id={request_id}`

### 1. Text-to-Video 생성

**v1 모델 요청 예제**
```python
import requests
import json

url = "https://api.kvid.ai/ai/video/text-to-video/generate"
api_key = "YOUR_API_KEY"

# v1 모델 (wan-t2v)
payload = json.dumps({
    "prompt": "A waterfall flowing down a mountain, nature documentary style",
    "negative_prompt": "low quality, bad anatomy",
    "num_frames": 81,
    "frames_per_second": 16,
    "seed": None,
    "resolution": "720p",
    "aspect_ratio": "16:9",
    "num_inference_steps": 30,
    "enable_safety_checker": True,
    "enable_prompt_expansion": True
})

headers = {
    'api-key': api_key,
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
result = response.json()
request_id = result['data']['request_id']
print(f"Request ID: {request_id}")
```

**v2 모델 요청 예제**
```python
# v2 모델 (bytedance/seedance)
payload = json.dumps({
    "prompt": "A beautiful sunset over the ocean",
    "aspect_ratio": "16:9",
    "resolution": "1080p",
    "duration": "5",
    "camera_fixed": False,
    "seed": None,
    "model": "bytedance/seedance/v1/lite/text-to-video"
})

response = requests.request("POST", url, headers=headers, data=payload)
```

### 2. Image-to-Video 생성

**v1 모델 요청 예제**
```python
import requests
import json

url = "https://api.kvid.ai/ai/video/image-to-video/generate"
api_key = "YOUR_API_KEY"

# v1 모델 (wan-i2v)
payload = json.dumps({
    "prompt": "Make the subject move naturally",
    "negative_prompt": "low quality, bad anatomy",
    "num_frames": 81,
    "frames_per_second": 16,
    "seed": None,
    "resolution": "720p",
    "aspect_ratio": "auto",
    "num_inference_steps": 30,
    "enable_safety_checker": True,
    "enable_prompt_expansion": True,
    "image_url": "https://your-image-url.jpg"
})

headers = {
    'api-key': api_key,
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
result = response.json()
request_id = result['data']['request_id']
print(f"Request ID: {request_id}")
```

**v2 모델 요청 예제**
```python
# v2 모델 (bytedance/seedance)
payload = json.dumps({
    "prompt": "Camera panning across the scene",
    "resolution": "1080p",
    "duration": "5",
    "camera_fixed": False,
    "seed": None,
    "model": "bytedance/seedance/v1/lite/image-to-video",
    "image_url": "https://your-image-url.jpg"
})

response = requests.request("POST", url, headers=headers, data=payload)
```

### 3. 생성 상태 조회

**상태 확인 예제**
```python
import requests
import time

api_key = "YOUR_API_KEY"
request_id = "req_12345abcdef"  # 생성 요청에서 받은 request_id

# Text-to-Video 상태 확인
url = f"https://api.kvid.ai/ai/video/text-to-video/status?request_id={request_id}"

headers = {
    'api-key': api_key
}

# 상태 폴링
while True:
    response = requests.get(url, headers=headers)
    result = response.json()
    
    status = result['data']['status']
    progress = result['data']['progress']
    
    print(f"Status: {status}, Progress: {progress}%")
    
    if status == 'COMPLETED':
        print("비디오 생성 완료!")
        break
    elif status == 'FAILED':
        print("비디오 생성 실패")
        break
    
    time.sleep(5)  # 5초 대기
```

### 4. 비디오 결과 가져오기

**결과 조회 예제**
```python
import requests

api_key = "YOUR_API_KEY"
request_id = "req_12345abcdef"

# Text-to-Video 결과 조회
url = f"https://api.kvid.ai/ai/video/text-to-video/result?request_id={request_id}"

headers = {
    'api-key': api_key
}

response = requests.get(url, headers=headers)
result = response.json()

if result['success']:
    video_url = result['data']['url']
    video_name = result['data']['name']
    video_size = result['data']['size']
    
    print(f"비디오 URL: {video_url}")
    print(f"파일명: {video_name}")
    print(f"파일 크기: {video_size} KB")
else:
    print(f"오류: {result['message']}")
```

## 📋 매개변수 상세

### Text-to-Video 매개변수

#### v1 모델 (wan-t2v)

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `prompt` | string | *필수* | 비디오 생성을 위한 텍스트 프롬프트 |
| `negative_prompt` | string | "" | 제외할 요소 설명 |
| `num_frames` | integer | 81 | 프레임 수 (81-100) |
| `frames_per_second` | integer | 16 | 초당 프레임 수 (5-24) |
| `seed` | integer/null | null | 재현성을 위한 시드값 |
| `resolution` | string | "720p" | 해상도 ("480p", "580p", "720p") |
| `aspect_ratio` | string | "16:9" | 화면 비율 ("16:9", "9:16") |
| `num_inference_steps` | integer | 30 | 추론 단계 수 |
| `enable_safety_checker` | boolean | true | 안전 필터 활성화 |
| `enable_prompt_expansion` | boolean | true | 프롬프트 확장 활성화 |

#### v2 모델 (bytedance/seedance)

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `prompt` | string | *필수* | 비디오 생성을 위한 텍스트 프롬프트 |
| `aspect_ratio` | string | "16:9" | 화면 비율 ("16:9", "4:3", "1:1", "9:21") |
| `resolution` | string | "720p" | 해상도 ("480p", "720p", "1080p") |
| `duration` | string | "5" | 비디오 길이 ("5", "10") |
| `camera_fixed` | boolean | false | 카메라 고정 여부 |
| `seed` | integer/null | null | 재현성을 위한 시드값 |
| `model` | string | *필수* | "bytedance/seedance/v1/lite/text-to-video" |

### Image-to-Video 매개변수

#### v1 모델 (wan-i2v)

Text-to-Video v1과 동일한 매개변수에 추가로:

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `image_url` | string | *필수* | 입력 이미지 URL |
| `image_file` | string | - | Base64 인코딩된 이미지 데이터 |
| `aspect_ratio` | string | "auto" | 화면 비율 ("auto", "16:9", "9:16", "1:1") |

#### v2 모델 (bytedance/seedance)

Text-to-Video v2와 동일한 매개변수에 추가로:

| 매개변수 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `image_url` | string | *필수* | 입력 이미지 URL |
| `image_file` | string | - | Base64 인코딩된 이미지 데이터 |
| `end_image_url` | string/null | null | 종료 이미지 URL (선택) |

### API 응답 형식

#### Generate 응답
```json
{
  "success": true,
  "data": {
    "request_id": "req_12345abcdef"
  },
  "message": "Video generation request submitted successfully"
}
```

#### Status 응답
```json
{
  "success": true,
  "data": {
    "status": "PROCESSING",
    "progress": 45,
    "logs": [
      "2024-01-15 10:30:00 - Video generation started",
      "2024-01-15 10:30:15 - Processing frame 1-20"
    ]
  },
  "message": "Video generation in progress"
}
```

#### Result 응답
```json
{
  "success": true,
  "data": {
    "url": "https://storage.kvid.ai/videos/req_12345abcdef.mp4",
    "name": "generated_video.mp4",
    "size": 15420
  },
  "message": "Video result retrieved successfully"
}
```

## 💰 요금 및 크레딧

### 크레딧 소모량

비디오 생성은 해상도와 모델 버전에 따라 크레딧이 소모됩니다.

#### Video Generation v1
| 해상도 | 크레딧 |
|--------|--------|
| **480p** | 90 크레딧 |
| **720p** | 160 크레딧 |

#### Video Generation v2 (최신 모델)
| 해상도 | 크레딧 |
|--------|--------|
| **480p** | 60 크레딧 |
| **720p** | 81 크레딧 |
| **1080p** | 134 크레딧 |

### 요금제

- **월 구독**: 4,500 크레딧/월
- 크레딧은 모든 API 서비스에서 공통으로 사용 가능
- v1과 v2 모델은 선택하여 사용 가능

## 🎬 사용 예제

### 1. 등산객과 배낭 비디오

![등산객 배낭](/img/video-api/영상제작_배낭.png)

**프롬프트**: A video of a man hiking with a backpack. The bag must be the main subject. Walking slowly

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_배낭.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 2. 청소기 사용 비디오

![진공청소기](/img/video-api/진공청소기.png)

**프롬프트**: Video of cleaning with a vacuum cleaner. slow movement. low angle

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_청소기.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 3. 음식 홍보 비디오

![연어 요리](/img/video-api/영상_리소스_이미지_연어.png)

**프롬프트**: Remove the cooking effect and only add camera movement. highlight the food in Zoom format. promotional video for this food

<video width="100%" controls>
  <source src="/img/video-api/홍보영상_연어회.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 4. 한국 전통 정자 비디오

![전주 공원](/img/video-api/jeonju_park_한국관광공사_169759365517930.jpg)

**프롬프트**: A traditional Korean pavilion by a lotus pond, with two small dogs (a white poodle and a brown shiba inu) joyfully running along the wooden walkway. The pond is filled with green lotus leaves, and the background is full of lush green trees. Bright sunny day, peaceful and vivid atmosphere.

<video width="100%" controls>
  <source src="/img/video-api/videoGenerateResult_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

**Text-to-Video 버전**:
<video width="100%" controls>
  <source src="/img/video-api/videoAIGenerateResult_t2v_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

**추가 프롬프트**: The two small dogs (white poodle and brown shiba inu) approach the pavilion, wagging their tails, playfully interacting. They stop at the end of the deck, looking around curiously. [Over-the-shoulder shot] Captures the view of the park and lotus pond from behind the dogs.

<video width="100%" controls>
  <source src="/img/video-api/The_two_small_dogs_(white_poodle_and_brown_shiba_inu)_approach_the_pavilion_t2v_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

### 5. 호랑이 이미지-비디오 변환

![호랑이](/img/video-api/호랑이1.jpg)

**프롬프트**: The tiger briefly pulls back its tongue, blinks, and tilts its head slightly. Then immediately sticks out its tongue for a second time, a bit longer than the first, while lowering its head slightly. [Low-angle close-up shot] Capture from below to show both majesty and cuteness.

<video width="100%" controls>
  <source src="/img/video-api/The_tiger_briefly_pulls_back_its_tongue_blinks_and_tilts_its_head_slightly_i2v_20250625.mp4" type="video/mp4" />
  생성된 비디오를 볼 수 없습니다.
</video>

## ⚠️ 제한사항 및 주의사항

### 기술적 제한
- **v1 모델**: 5-6초 고정, 최대 720p
- **v2 모델**: 5초 또는 10초, 최대 1080p
- **카메라 앵글**: 카메라 앵글 조작 프롬프트가 항상 정확하게 작동하지 않을 수 있음
- **처리 시간**: 해상도와 길이에 따라 1-5분 소요

### 최적화 팁
- **구체적인 프롬프트**: 세부적이고 명확한 설명 제공
- **카메라 앵글**: 필요시 [Low-angle], [Over-the-shoulder shot] 등의 지시어 사용
- **적절한 해상도**: 용도에 맞는 해상도 선택

## 🔗 관련 링크

- [API 키 발급](https://developers.kvid.ai)
- [콘솔 관리](https://console.kvid.ai)
- [사용량 모니터링](https://console.kvid.ai/usage)

## 📞 지원 및 문의

문의사항이 있으시면 다음 경로로 연락해 주세요:

- **이메일**: support@kvid.ai
- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/wvsecByF)