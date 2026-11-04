---
title: TypeScript SDK
description: "@kvidai/sdk — official TypeScript SDK for kvidAI. Auth, video/image generation, media upload, preset management. Works in Node.js, browser, React Native, Chrome Extensions and cafe24 apps."
keywords: [kvidai sdk, typescript sdk, javascript sdk, video generation sdk, ai video sdk, kvidai api client]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: sdk
tags: [SDK, TypeScript, JavaScript, Node.js]
sidebar_position: 9
---

# TypeScript SDK (`@kvidai/sdk`)

The official TypeScript client for kvidAI — works in Node.js, browser, React Native, Chrome Extensions and cafe24 apps. Install once and call any kvidAI API without writing `fetch` boilerplate.

## Installation

```bash
# npm
npm install @epicmobile18/kvidai-sdk

# pnpm
pnpm add @epicmobile18/kvidai-sdk

# yarn
yarn add @epicmobile18/kvidai-sdk
```

> The package is published as `@epicmobile18/kvidai-sdk` on GitHub Packages. Import it as `@kvidai/sdk` after adding the alias below.

**package.json alias (optional convenience):**
```json
{
  "dependencies": {
    "@kvidai/sdk": "npm:@epicmobile18/kvidai-sdk@^0.1.0"
  }
}
```

**`.npmrc` (required for GitHub Packages):**
```
@epicmobile18:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## Quick Start

```typescript
import { KvidaiClient } from '@kvidai/sdk';

const client = new KvidaiClient({
  jwt: '<your-strapi-jwt>',
  apiKey: '<your-apim-key>',
  environment: 'prod', // 'prod' | 'staging' | 'dev'
});

// Generate a video and wait for the result
const { requestId, model } = await client.generation.textToVideo({
  model: 'wan',
  prompt: 'A cinematic K-pop idol performance on a neon-lit stage',
});

const result = await client.generation.waitForResult({ requestId, model });
console.log(result.url); // https://cdn.kvid.ai/videos/...
```

---

## Login Flow

If you don't have credentials yet, use `auth.loginAndGetApiKey()` to obtain both in one call:

```typescript
const client = new KvidaiClient({});

const { jwt, apiKey, user } = await client.auth.loginAndGetApiKey(
  'user@example.com',
  'your-password'
);

client.setCredentials({ jwt, apiKey });
// client is now fully authenticated
```

This call:
1. `POST /api/auth/local` → Strapi JWT
2. `GET /api/apim-management/my-keys` → checks for an existing key
3. If found → `GET /api/apim-management/key-detail/:id` for the full key
4. If none → `POST /api/apim-management/generate-key` → new key (**shown once only — store it immediately**)

---

## Auth API

```typescript
// Login
const { jwt, user } = await client.auth.login({ identifier, password });

// Verify token
const me = await client.auth.me();

// Key management
const keys = await client.auth.listKeys();          // masked keys
const detail = await client.auth.keyDetail(subId);  // full key
const products = await client.auth.products();      // available plans

// Issue / rotate / revoke
const { primaryKey } = await client.auth.generateKey({ email, productId });
const { primaryKey } = await client.auth.regenerateKey({ subscriptionId, email });
await client.auth.revokeKey(subscriptionId);

// Credit balance
const { remainingCredits } = await client.auth.creditSummary(email);
```

> **Important**: `generateKey` and `regenerateKey` return the full 32-hex key **only once**. Store it immediately in a secure location (`expo-secure-store`, `chrome.storage.local`, etc.). Regenerating immediately invalidates the old key.

---

## Generation API

### Create jobs

```typescript
// Text → Video
const job = await client.generation.textToVideo({
  model: 'wan',          // 'wan' | 'seedance' | 'veo3.1' | ...
  prompt: 'A sunset over Seoul',
  aspect_ratio: '16:9',
  duration: 5,
});

// Image → Video
const job = await client.generation.imageToVideo({
  model: 'wan',
  image_url: 'https://cdn.kvid.ai/images/my-photo.jpg',
  prompt: 'gentle zoom out',
});

// Reference → Video
const job = await client.generation.referenceToVideo({
  model: 'wan',
  reference_video_url: 'https://cdn.kvid.ai/videos/ref.mp4',
  prompt: 'same scene, golden hour lighting',
});

// Video → Video (style transfer)
const job = await client.generation.videoToVideo({
  model: 'wan',
  input_video_url: 'https://cdn.kvid.ai/videos/input.mp4',
  prompt: 'anime style',
});

// Text → Image
const job = await client.generation.textToImage({
  model: 'nano-banana',
  prompt: 'K-beauty skincare product lifestyle photo',
});

// Image → Image
const job = await client.generation.imageToImage({
  model: 'nano-banana',
  image_url: 'https://cdn.kvid.ai/images/product.jpg',
  prompt: 'professional studio lighting',
});

// Lip-sync (image avatar or video)
const job = await client.generation.talkV2V({
  model: 'fal-ai/sync-lipsync',
  audio_url: 'https://cdn.kvid.ai/audio/voice.mp3',
  input_video: 'https://cdn.kvid.ai/videos/presenter.mp4', // or image_url for avatar mode
});

// Voice (TTS)
const job = await client.generation.voice({
  model: 'elevenlabs',
  text: 'Hello from kvidAI',
  voice_name: 'Rachel',
});
```

Each method returns `{ requestId, model }` — pass these to `waitForResult`.

### Wait for result

```typescript
const result = await client.generation.waitForResult({
  requestId: job.requestId,
  model: job.model,
  // optional:
  pollIntervalMs: 3000,  // default 3s
  maxAttempts: 200,      // default 200 (~10 min)
  signal: abortController.signal,
});

console.log(result.url); // CDN URL of the finished asset
```

`waitForResult` handles the full polling loop internally:
- Polls `GET /ai/generation/status` every 3 seconds
- Tolerates up to 5 consecutive 5xx / network errors before giving up
- Calls `GET /ai/generation/result` with a 90-second timeout for the fal→CDN upload step

### Manual status / result

```typescript
const status = await client.generation.status(requestId, model, email);
// { status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled', progress: 0–100 }

const result = await client.generation.result(requestId, model, email);
// { url, requestId, model }
```

---

## Media API

```typescript
// Full upload convenience method (presign → PUT → complete → cdnUrl)
const cdnUrl = await client.media.upload(file, 'user@example.com');
// Pass cdnUrl to any generation method as image_url / input_video_url / audio_url

// Manual steps
const { uploadUrl, cdnUrl, fileId } = await client.media.presign({
  filename: 'clip.mp4',
  contentType: 'video/mp4',
  size: file.size,
});
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'video/mp4', 'x-amz-acl': 'public-read' },
  body: file,
});
await client.media.completeUpload({ fileId, cdnUrl, filename: 'clip.mp4', contentType: 'video/mp4', size: file.size });

// List / delete
const files = await client.media.list(email);
await client.media.delete(fileId);
```

> **NFC filename normalisation**: `upload()` calls `filename.normalize('NFC')` automatically. macOS generates NFD filenames; S3 stores them as-is, causing 404 on browser fetch. This is handled for you.

> **90 MB limit**: Files ≥ 90 MB throw `KvidaiError('FILE_TOO_LARGE')`. Large files should be PUT directly to the presigned URL.

---

## Preset API

```typescript
const presets = await client.preset.list(email);
const preset = await client.preset.get(id);
const created = await client.preset.create({ name: 'My Preset', settings: { voice: 'Rachel' }, email });
await client.preset.update(id, { name: 'Updated Name' });
await client.preset.delete(id);
const copy = await client.preset.duplicate(id);
```

---

## Error handling

```typescript
import { KvidaiClient, KvidaiError } from '@kvidai/sdk';

try {
  await client.generation.textToVideo({ model: 'wan', prompt: '...' });
} catch (err) {
  if (err instanceof KvidaiError) {
    console.error(err.code, err.status, err.message);
    // err.code: 'INSUFFICIENT_CREDITS' | 'TIMEOUT' | 'GENERATION_FAILED' | 'POLL_ERROR' | ...
    // err.status: HTTP status code (0 for client-side errors)
    // err.details: raw API response body
  }
}
```

Common codes:

| Code | Meaning |
|------|---------|
| `TIMEOUT` | Request timed out (default 30s) |
| `GENERATION_FAILED` | The generation job ended in `failed` state |
| `POLL_ERROR` | 5+ consecutive transient errors while polling |
| `CANCELLED` | `AbortSignal` fired or job cancelled |
| `FILE_TOO_LARGE` | File ≥ 90 MB passed to `media.upload()` |

---

## Configuration

```typescript
const client = new KvidaiClient({
  jwt: string,         // Strapi JWT for auth calls
  apiKey: string,      // APIM 32-hex key for generation/media/preset
  environment: 'prod'  // 'prod' | 'staging' | 'dev'
  timeoutMs: 30000,    // per-request timeout (ms)
});

// Update credentials after login
client.setCredentials({ jwt, apiKey });
```

| Environment | Strapi base | APIM base | Generation path |
|-------------|-------------|-----------|-----------------|
| `prod` | `console.kvid.ai` | `api.kvid.ai` | `/ai/generation` |
| `staging` | Cloud Run staging URL | `api.kvid.ai` | `/ai/generation` |
| `dev` | `localhost:1337` | `api.kvid.ai` | `/ai/generation-clone` |

---

## Platform notes

### React Native / Expo

```typescript
import * as SecureStore from 'expo-secure-store';

const { jwt, apiKey } = await client.auth.loginAndGetApiKey(email, password);
await SecureStore.setItemAsync('kvidai_jwt', jwt);
await SecureStore.setItemAsync('kvidai_api_key', apiKey);
```

### Chrome Extension (MV3)

```typescript
// background service worker
const { jwt, apiKey } = await client.auth.loginAndGetApiKey(email, password);
await chrome.storage.local.set({ kvidai_jwt: jwt, kvidai_api_key: apiKey });
```

Add `https://console.kvid.ai` and `https://api.kvid.ai` to `host_permissions` in `manifest.json`.

> `/api/agent` is not available to external platforms (origin whitelist). Use `client.generation.*` for AI generation from non-whitelisted origins.

---

## Related

- [API Reference](./overview) — full endpoint reference
- [Authentication Guide](../getting-started/authentication) — 2-credential model details
- [Video API](./video-api) — video generation endpoint reference
- [Media API](./media-api) — upload endpoint reference
