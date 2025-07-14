# Image 생성 AI API

You can call the Image Generation API **| flux.1 dev, etc image models**

# — pricing

“**unit price * 사용량**” 만큼 보유 credit이 차감 됩니다 

- FLUX.1 [dev] unit price(per image): $0.05 per image

**— pricing example**

- 환율 1,446원 기준
- FLUX.1 [dev] unit price(per image): 7.23 credit

# **— API reference**

base_url for SDK: `https://api.kvid.ai/ai-model/{model_id="flux"}/v1` 

{MODEL_ID}: [`"flux"`]

**— base_url example**

- `https://api.kvid.ai/ai-model/flux/v1/flux-dev`

**Available models: [ flux-dev ]**

— **Generate an image with FLUX.1 [dev]**

```bash
curl https://api.kvid.ai/ai-model/flux/v1/flux-dev \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "prompt": "ein fantastisches bild",
  "image_prompt": "",
  "width": 1024,
  "height": 768,
  "steps": 28,
  "prompt_upsampling": false,
  "seed": 42,
  "guidance": 3,
  "safety_tolerance": 2,
  "output_format": "jpeg",
  "webhook_url": "",
  "webhook_secret": ""
}'
```

## — Schema

**`promptType`** `string`* required

Text prompt for image generation.

**`image_promptType`** `string` | nullable

Optional base64 encoded image to use as a prompt for generation.

**`widthType`** `integer`  min: `256` max: `1440` default `1024`

Width of the generated image in pixels. Must be a multiple of 32.

**`heightType`** `integer` min: `256` max: `1440` default: `768`

Height of the generated image in pixels. Must be a multiple of 32.

**`stepsType`** `integer` | nullable  min: `1` max: `50` default: `28`

Number of steps for the image generation process.

**`prompt_upsamplingType`** `boolean` default: `false`

Whether to perform upsampling on the prompt. If active, automatically modifies the prompt for more creative generation.

**`seedType`** `integer` | nullable

Optional seed for reproducibility.

**`guidanceType`** `number` | nullable min: `1.5` max: `5` default: `3`

Guidance scale for image generation. High guidance scales improve prompt adherence at the cost of reduced realism.

**`safety_toleranceType`** `integer` min: `0` max: `6` default: `2`

Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.

**`output_formatType`** `string` | nullable `enum` `jpeg`

Output format for the generated image. Can be 'jpeg' or 'png'.

**`webhook_urlType`** `string` | nullable min: `1` max: `2083` Format: `uri`

URL to receive webhook notifications

**`webhook_secretType`** `string` | nullable

Optional secret for webhook signature verification

**— Get Result**

```bash
curl 'https://api.kvid.ai/ai-model/flux/v1/get_result?id='
```

```json
{
  "id": "…",
  "status": "Task not found",
  "result": null,
  "progress": 1,
  "details": {}
}
```

## — Schema

**`idType`** `string` *required

Task id for retrieving result

**`statusType`** `string` *required enum

- Task not found
- Pending
- Request Moderated
- Content Moderated
- Ready
- Error

**`result`** | nullable

**`progressType`** `number` | nullable

**`detailsType`** `object` | nullable