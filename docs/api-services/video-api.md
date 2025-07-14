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
- **해상도**: 480p, 720p 지원 (기본값: 720p)
- **길이**: 5-6초

### 특화 기능
- 카메라 앵글 조작 프롬프트 지원 (완벽하지 않을 수 있음)
- 다양한 생성 옵션 및 제어 가능

## 📡 API 엔드포인트

### 기본 정보
```
Base URL: https://api.hometip.net/ai-model/videogen-1/v1
Video Generation: https://api.hometip.net/ai-model/videogen-1/v1/video_generation
Authentication: API-KEY Bearer Token
Content-Type: application/json
```

### 1. 비디오 생성 작업 생성

**Python 예제**
```python
import requests
import json

url = "https://api.hometip.net/ai-model/videogen-1/v1/video_generation"
api_key = "Fill in your api_key"

payload = json.dumps({
    "model": "text-to-video",
    "prompt": "[Truck left,Pan right]A woman is drinking coffee.",
})
headers = {
    'API-KEY': f'Bearer $SUBSCRIPTION_KEY',
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
```

### 2. 생성 상태 조회

**Python 예제**
```python
import requests
import json

api_key = "fill in the api_key"
task_id = "fill in the task_id"

url = f"https://api.hometip.net/ai-model/videogen-1/v1/query/video_generation?task_id={task_id}"

payload = {}
headers = {
  'API-KEY': f'Bearer {$SUBSCRIPTION_KEY}',
  'content-type': 'application/json',
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
```

### 3. 비디오 파일 다운로드 URL 가져오기

**Python 예제**
```python
import requests

group_id = "fill in the groupid - optional"
api_key = "fill in the api key"
file_id = "fill in the file id"

url = f'https://api.hometip.net/ai-model/videogen-1/v1/files/retrieve?GroupId={group_id}&file_id={file_id}'
headers = {
    'content-type': 'application/json',
    'API-KEY': f'Bearer {$SUBSCRIPTION_KEY}'
}

response = requests.get(url, headers=headers)
print(response.text)
```

## 📋 Schema

### Input

**`prompt`** `string` *required*

비디오 생성을 안내하는 텍스트 프롬프트입니다.

**`image_url`** `string`

입력 이미지의 URL입니다.

**`seed`** `integer`

재현성을 위한 랜덤 시드입니다. None인 경우 랜덤 시드가 선택됩니다.

**`resolution`** `ResolutionEnum`

생성된 비디오의 해상도입니다 (480p 또는 720p). 기본값: **`"720p"`**

가능한 값: **`480p, 720p`**

**`num_inference_steps`** `integer`

샘플링을 위한 추론 단계 수입니다. 값이 높을수록 품질이 좋아지지만 시간이 더 걸립니다. 기본값: **`30`**

**`inference_steps`** `integer`

샘플링을 위한 추론 단계 수입니다. 값이 높을수록 품질이 좋아지지만 시간이 더 걸립니다.

**`enable_safety_checker`** `boolean`

true로 설정하면 안전 검사기가 활성화됩니다.

**`enable_prompt_expansion`** `boolean`

프롬프트 확장을 활성화할지 여부입니다.

**요청 예시**
```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "image_url": "https://hometip.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg",
  "resolution": "720p",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true
}
```

### Output

**`video`** `File` *required*

생성된 비디오 파일입니다.

**`seed`** `integer` *required*

생성에 사용된 시드입니다.

**응답 예시**
```json
{
  "video": {
    "url": "https://hometip.media/files/elephant/Nj4jZupkZvR7g0QkNueJZ_video-1740522225.mp4"
  }
}
```

## 💰 요금 및 크레딧

### 크레딧 소모량

"**단가 × 사용량**" 만큼 보유 크레딧이 차감됩니다.

| 모델 | 단가 | 크레딧 (환율 1,446원 기준) |
|------|------|---------------------------|
| **Text-to-Video** | $0.86 / 5-6초 비디오 | 124.356 크레딧 |
| **Image-to-Video** | $0.86 / 5-6초 비디오 | 124.356 크레딧 |

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
- **길이**: 5-6초 고정
- **해상도**: 최대 720p
- **카메라 앵글**: 카메라 앵글 조작 프롬프트가 항상 정확하게 작동하지 않을 수 있음

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
- **문의 폼**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)