# Video 생성 AI API

You can call the Video Generation API

**text to video, image to video | generate 5s [480p, 720p]** 

# — pricing

“**unit price * 사용량**” 만큼 보유 credit이 차감 됩니다 

- “Text To Video” unit price: $0.86 / 5~6초 video
- “Image To Video” unit price: $0.86 / 5~6초 video

**— pricing example**

- 환율 1,446원 기준
- “Text To Video” unit price: 124.356 credit / 5~6초 video
- Image To Video” unit price: 124.356 credit / 5~6초 video

# **— API reference**

base_url for SDK: `https://api.hometip.net/ai-model/{model_id="videogen-1"}/v1` 

{MODEL_ID}: [`"videogen-1"`]

**— base_url example**

- `https://api.hometip.net/ai-model/videogen-1/v1/video_generation`

**Available models: [ text-to-video, image-to-video ]**

**— Create Video Generation Task**

```python
import requests
import json

url = "https://api.hometip.net/ai-model/videogen-1/v1/video_generation"
api_key = "Fill in your api_key"

payload = json.dumps({
    "model": "**text-to-video**",
    "prompt": "[Truck left,Pan right]A woman is drinking coffee.",
})
headers = {
    'API-KEY': f'Bearer $SUBSCRIPTION_KEY',
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)

```

**— Query of Generation Status**

```python
import requests
import json

api_key="fill in the api_key"
task_id="fill in the task_id"

url = f"https://api.hometip.net/ai-model/videogen-1/v1/query/video_generation?task_id={task_id}"

payload = {}
headers = {
  'API-KEY': f'Bearer {$SUBSCRIPTION_KEY}',
  'content-type': 'application/json',
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
```

— **Retrieve the download URL of the video file**

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

## **— Schema**

### Input

**`prompt`** `string`* required

The text prompt to guide video generation.

**`image_url`** `string`

URL of the input image.

**`seed`** `integer`

Random seed for reproducibility. If None, a random seed is chosen.

**`resolution`** `ResolutionEnum`

Resolution of the generated video (480p or 720p). Default value: **`"720p"`**

Possible enum values: **`480p, 720p`**

**`num_inference_steps`** `integer`

Number of inference steps for sampling. Higher values give better quality but take longer. Default value: **`30`**

**`inference_steps`** `integer`

Number of inference steps for sampling. Higher values give better quality but take longer.

**`enable_safety_checker`** `boolean`

If set to true, the safety checker will be enabled.

**`enable_prompt_expansion`** `boolean`

Whether to enable prompt expansion.

```jsx
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

**`video`** [`File`](https://fal.ai/models/fal-ai/wan-i2v/api#type-File)* required

The generated video file.

**`seed`** `integer`* required

The seed used for generation.

```jsx
{
  "video": {
    "url": "https://hometip.media/files/elephant/Nj4jZupkZvR7g0QkNueJZ_video-1740522225.mp4"
  }
}
```

## Example

** The camera angle manipulation prompt may or may not work.

![영상제작_배낭.png](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A1%E1%86%BC%E1%84%8C%E1%85%A6%E1%84%8C%E1%85%A1%E1%86%A8_%E1%84%87%E1%85%A2%E1%84%82%E1%85%A1%E1%86%BC.png)

A video of a man hiking with a backpack. The bag must be the main subject. Walking slowly

[Click to watch the video](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%92%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A9%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A1%E1%86%BC_%E1%84%87%E1%85%A2%E1%84%82%E1%85%A1%E1%86%BC.mp4)

Click to watch the video

![진공청소기.png](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%8C%E1%85%B5%E1%86%AB%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A9%E1%84%80%E1%85%B5.png)

Video of cleaning with a vacuum cleaner. slow movement. low angle

[Click to watch the video](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%92%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A9%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A1%E1%86%BC_%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A9%E1%84%80%E1%85%B5.mp4)

Click to watch the video

![영상 리소스 이미지_연어.png](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A1%E1%86%BC_%E1%84%85%E1%85%B5%E1%84%89%E1%85%A9%E1%84%89%E1%85%B3_%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5_%E1%84%8B%E1%85%A7%E1%86%AB%E1%84%8B%E1%85%A5.png)

Prompt : Remove the cooking effect and only add camera movement. highlight the food in Zoom format.promotional video for this food

[Click to watch the video](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%E1%84%92%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A9%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A1%E1%86%BC_%E1%84%8B%E1%85%A7%E1%86%AB%E1%84%8B%E1%85%A5%E1%84%92%E1%85%AC.mp4)

Click to watch the video

![jeonju park_한국관광공사_169759365517930.jpg](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/jeonju_park_%ED%95%9C%EA%B5%AD%EA%B4%80%EA%B4%91%EA%B3%B5%EC%82%AC_169759365517930.jpg)

Prompt : A traditional Korean pavilion by a lotus pond, with two small dogs (a white poodle and a brown shiba inu) joyfully running along the wooden walkway. The pond is filled with green lotus leaves, and the background is full of lush green trees. Bright sunny day, peaceful and vivid atmosphere.

[Click to watch the video](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/videoGenerateResult_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4)

Click to watch the video

Prompt : A traditional Korean pavilion by a lotus pond, with two small dogs (a white poodle and a brown shiba inu) joyfully running along the wooden walkway. The pond is filled with green lotus leaves, and the background is full of lush green trees. Bright sunny day, peaceful and vivid atmosphere.

[Click to watch the video](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/videoAIGenerateResult_t2v_A_traditional_Korean_pavilion_by_a_lotus_pond_20250625.mp4)

Click to watch the video

The two small dogs (white poodle and brown shiba inu) approach the pavilion, wagging their tails, playfully interacting. They stop at the end of the deck, looking around curiously. [Over-the-shoulder shot] Captures the view of the park and lotus pond from behind the dogs.

[The two small dogs (white poodle and brown shiba inu) approach the pavilion_t2v_20250625.mp4](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/The_two_small_dogs_%28white_poodle_and_brown_shiba_inu)_approach_the_pavilion_t2v_20250625.mp4)

![호랑이1.jpg](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/%ED%98%B8%EB%9E%91%EC%9D%B41.jpg)

The tiger briefly pulls back its tongue, blinks, and tilts its head slightly. Then immediately sticks out its tongue for a second time, a bit longer than the first, while lowering its head slightly. [Low-angle close-up shot] Capture from below to show both majesty and cuteness.

[The tiger briefly pulls back its tongue, blinks, and tilts its head slightly_i2v_20250625.mp4](Video%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20AI%20API/The_tiger_briefly_pulls_back_its_tongue_blinks_and_tilts_its_head_slightly_i2v_20250625.mp4)