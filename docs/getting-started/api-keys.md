---
title: API Keys
description: Issue, view, and manage API keys for calling kvidAI APIs from code.
slug: api-keys
sidebar_position: 4
---

# API Keys

> **한국어**: [API 키 발급](/ko/docs/getting-started/api-keys)

You only need an API key if you plan to call kvidAI APIs from your own code. The web app (Storyboard, Video Editor, Generate pages) works without creating a key.

## Where

[kvid.ai/settings/api-keys](https://kvid.ai/settings/api-keys)

## Create a subscription (a pair of keys)

1. Open the page above (sign-in required).
2. Click **Create New Subscription**.
3. (Optional) Enter a custom subscription ID (alphanumeric and hyphens only).
4. Each subscription comes with a **primary key** and a **secondary key** — either can be used.

## Using a key in requests

Send the key as the `API-KEY` header:

```bash
curl -X POST "https://api.kvid.ai/ai/image/generate" \
  -H "api-key: YOUR_PRIMARY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "K-pop concert stage with colorful lights",
    "image_size": { "width": 1024, "height": 1024 }
  }'
```

## Why two keys?

Rotate keys without downtime:
1. Start using the secondary key in your code.
2. Regenerate the primary key.
3. After your rotation window, start using the new primary and regenerate the secondary.

## Multiple subscriptions

You can have more than one subscription — useful for separating projects or environments (staging / production). Only one is the **active** subscription at a time; the others remain usable but their keys are separate.

## Deleting a subscription

- Open the menu next to the subscription you want to remove and click **Delete**.
- You cannot delete the currently selected subscription — select a different one first.

## Credits

All API subscriptions share the same account credit balance. There is no per-key limit — usage aggregates to the account.

## Security tips

- Never commit API keys to source control.
- Use environment variables (`process.env.KVIDAI_API_KEY`) or a secret manager.
- Rotate keys periodically using the primary/secondary pattern above.
