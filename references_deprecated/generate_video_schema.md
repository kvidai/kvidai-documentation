# Video Generation API Schema

이 문서는 `3_Video_Generator.py`에서 사용되는 동영상 생성 API의 스키마와 예시를 정리한 것입니다.

## 목차
- [공통 설정](#공통-설정)
- [Generate API](#generate-api)
- [Status API](#status-api)
- [Result API](#result-api)

## 공통 설정

### Base URL
```
https://localstrapi.loclx.io
```

### 인증 헤더
```json
{
  "api-key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

---

## Generate API

### 1. Image-to-Video Generate

#### Endpoint
```
POST /ai/video/image-to-video/generate
```

#### Request Schema

##### v1 Model (wan-i2v)
```json
{
  "prompt": "string",
  "negative_prompt": "string",
  "num_frames": 81, // 81-100 range, default: 81
  "frames_per_second": 16, // 5-24 range, default: 16
  "seed": null | number,
  "resolution": "480p" | "720p",
  "aspect_ratio": "auto" | "16:9" | "9:16" | "1:1", //default : auto
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true,  
  "image_url": "string",
  "image_file" : "string" // base64 encoded image data
}
```

##### v2 Model (bytedance/seedance/v1/lite/image-to-video)
```json
{
  "prompt": "string",
  "resolution": "480p" | "720p" | "1080p",
  "duration": "5" | "10",
  "camera_fixed": false,
  "seed": null | number,
  "model": "bytedance/seedance/v1/lite/image-to-video",
  "image_url": "string",
  "image_file" : "string", // base64 encoded image data
  "end_image_url" : null | "string"
}
```

#### Request Example
```json
{
  "prompt": "A waterfall flowing down a mountain, nature documentary style",
  "negative_prompt": "low quality, bad anatomy",
  "num_frames": 81,
  "frames_per_second": 16,
  "seed": null,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true,
  "image_url": "https://example.com/image.jpg"
}
```

#### Response Schema
```json
{
  "success": true,
  "data": {
    "request_id": "string"
  },
  "message": "string"
}
```

#### Response Example
```json
{
  "success": true,
  "data": {
    "request_id": "req_12345abcdef"
  },
  "message": "Video generation request submitted successfully"
}
```

### 2. Text-to-Video Generate

#### Endpoint
```
POST /ai/video/text-to-video/generate
```

#### Request Schema

##### v1 Model (wan-t2v)
```json
{
  "prompt": "string",
  "negative_prompt": "string",
  "num_frames": 81, // 81-100 range, default: 81
  "frames_per_second": 16 // 5-24 range, default: 16,
  "seed": null | number,
  "resolution": "480p" | "580p" | "720p",
  "aspect_ratio": "16:9" | "9:16",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true
}
```

##### v2 Model (bytedance/seedance/v1/lite/text-to-video)
```json
{
  "prompt": "string",
  "aspect_ratio": "16:9" | "4:3" | "1:1" | "9:21",
  "resolution": "480p" | "720p" | "1080p",
  "duration": "5" | "10",
  "camera_fixed": false,
  "seed": null | number,
  "model": "bytedance/seedance/v1/lite/text-to-video"
}
```

#### Request Example
```json
{
  "prompt": "A waterfall flowing down a mountain, nature documentary style",
  "negative_prompt": "",
  "num_frames": 81,
  "frames_per_second": 16,
  "seed": null,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": true
}
```

#### Response Schema
```json
{
  "success": true,
  "data": {
    "request_id": "string"
  },
  "message": "string"
}
```

---

## Status API

### Endpoint
```
GET /ai/video/image-to-video/status
GET /ai/video/text-to-video/status
```

### Request Parameters
```
?request_id=string
```

### Request Example
```
GET /ai/video/text-to-video/status?request_id=req_12345abcdef
```

### Response Schema
```json
{
  "success": true,
  "data": {
    "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    "progress": number,
    "logs": ["string"]
  },
  "message": "string"
}
```

### Response Examples

#### Processing Status
```json
{
  "success": true,
  "data": {
    "status": "PROCESSING",
    "progress": 45,
    "logs": [
      "2024-01-15 10:30:00 - Video generation started",
      "2024-01-15 10:30:15 - Processing frame 1-20",
      "2024-01-15 10:30:30 - Processing frame 21-40",
      "2024-01-15 10:30:45 - Processing frame 41-60"
    ]
  },
  "message": "Video generation in progress"
}
```

#### Completed Status
```json
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "progress": 100,
    "logs": [
      "2024-01-15 10:30:00 - Video generation started",
      "2024-01-15 10:31:20 - Video generation completed successfully"
    ]
  },
  "message": "Video generation completed"
}
```

---

## Result API

### Endpoint
```
GET /ai/video/image-to-video/result
GET /ai/video/text-to-video/result
```

### Request Parameters
```
?request_id=string
```

### Request Example
```
GET /ai/video/text-to-video/result?request_id=req_12345abcdef
```

### Response Schema
```json
{
  "success": true,
  "data": {
    "url": "string",
    "name": "string",
    "size": number
  },
  "message": "string"
}
```

### Response Example
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/videos/req_12345abcdef.mp4",
    "name": "waterfall_video.mp4",
    "size": 15420
  },
  "message": "Video result retrieved successfully"
}
```

---

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

### Error Examples

#### Invalid API Key
```json
{
  "success": false,
  "data": null,
  "message": "Invalid API key provided"
}
```

#### Request Not Found
```json
{
  "success": false,
  "data": null,
  "message": "Request ID not found"
}
```

#### Generation Failed
```json
{
  "success": false,
  "data": null,
  "message": "Video generation failed: insufficient credits"
}
```

---

## 사용 흐름 (Workflow)

1. **Generate**: 비디오 생성 요청을 보내고 `request_id`를 받습니다.
2. **Status**: `request_id`로 주기적으로 상태를 확인합니다.
3. **Result**: 상태가 `COMPLETED`가 되면 결과를 가져옵니다.

### 예시 워크플로우
```javascript
// 1. 비디오 생성 요청
const generateResponse = await fetch('/ai/video/text-to-video/generate', {
  method: 'POST',
  headers: { 'api-key': 'YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: "A beautiful sunset" })
});
const { data: { request_id } } = await generateResponse.json();

// 2. 상태 확인 (폴링)
const checkStatus = async () => {
  const statusResponse = await fetch(`/ai/video/text-to-video/status?request_id=${request_id}`, {
    headers: { 'api-key': 'YOUR_API_KEY' }
  });
  const { data: { status, progress } } = await statusResponse.json();
  
  if (status === 'COMPLETED') {
    // 3. 결과 가져오기
    const resultResponse = await fetch(`/ai/video/text-to-video/result?request_id=${request_id}`, {
      headers: { 'api-key': 'YOUR_API_KEY' }
    });
    const { data: { url } } = await resultResponse.json();
    console.log('Video URL:', url);
  } else {
    setTimeout(checkStatus, 1000); // 1초 후 다시 확인
  }
};

checkStatus();
``` 