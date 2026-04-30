---
title: Quick Start
description: Sign up, buy credits, and make your first API call — all from a single kvid.ai account.
slug: quick-start
tags: [Getting Started, API, Tutorial]
sidebar_position: 1
---

# Quick Start

> **한국어**: [빠른 시작](/docs/ko/getting-started/quick-start)

Everything you need is in one place: sign up at [kvid.ai](https://kvid.ai), buy credits, and either use the web app or call the API with a key.

## 1. Create an account

1. Go to [kvid.ai/register](https://kvid.ai/register).
2. Enter username, email, and a password (8+ chars with upper/lower/digit).
3. Check your email for the verification link — **you must verify before logging in**.
4. Sign in at [kvid.ai/login](https://kvid.ai/login).

Details: [Account Setup →](./account-setup)

## 2. Buy credits

1. Open [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) (sign-in required).
2. Click **Purchase Now** — you'll be redirected to Dodo Payments (international card checkout).
3. Complete checkout and you'll return with **3,000 credits** added to your balance, valid for 30 days.

Details: [Buy Credits →](./buy-credits)

## 3A. Use the web app immediately

Go back to [kvid.ai](https://kvid.ai) and try any of these:

- **Storyboard** — build a video from a natural-language brief: [kvid.ai/storyboard](https://kvid.ai/storyboard)
- **Image generation** — [kvid.ai/generate/image](https://kvid.ai/generate/image)
- **Text-to-Video** — [kvid.ai/generate/text-to-video](https://kvid.ai/generate/text-to-video)
- **Gallery** — browse community-shared compositions: [kvid.ai/gallery](https://kvid.ai/gallery)

No separate API key needed for the web app.

## 3B. Or call the API from code

1. Create an API key at [kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys).
2. Copy the primary key — you'll need it in the `API-KEY` header.
3. Make your first call:

```bash
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop concert stage with colorful lights",
    "image_size": { "width": 1024, "height": 1024 }
  }'
```

Details: [API Keys →](./api-keys)

## Next steps

- [Web App Features](../web-app/storyboard) — deep-dive guides for each web feature.
- [API Services](../api-services/overview) — full API reference.
- [Pricing](../pricing) — current credit rates.

## Need help?

- Email: support@kvid.ai
- Discord: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)
