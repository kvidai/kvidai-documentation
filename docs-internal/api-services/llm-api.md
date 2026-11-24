---
title: LLM API (Chat Completions)
description: kvidAI LLM API — an OpenAI-compatible chat completions endpoint billed in credits by the tokens actually used. Call it with your kvidAI API key.
keywords: [LLM API, chat completions, OpenAI compatible, kvidAI, credits]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: llm-api
tags: [API, LLM, Chat]
sidebar_position: 12
---

# LLM API (Chat Completions)

> **DRAFT, not published.** Delete this block when moving the file to `docs/api-services/llm-api.md`. Before publishing: add `'api-services/llm-api'` to `sidebars.ts`, add the Korean link below, confirm the prices in `pricing.md`, and see "Open items" at the end (delete that section too).

> **한국어로 보기**: [LLM API (Chat Completions)](/ko/docs/api-services/llm-api) | **View in English** (current page)

Call a large language model through a single OpenAI-compatible endpoint. Send the usual chat completions request, get the usual response, and pay in credits for the tokens that were actually used.

## Service Overview

- **OpenAI-compatible**: the request and response follow the OpenAI chat completions format, so most OpenAI clients work by changing the base URL and the key.
- **Billed by usage**: credits are charged from the actual token usage of each call. Prices are on the [Pricing](/docs/pricing) page.
- **One credit balance**: the same credits you use for video, image and voice.

### Authentication

Send your kvidAI API key in the `api-key` header. The credits are charged from the account that owns the key. You do not send an email or user id.

## API Endpoint

```
POST https://api.kvid.ai/llm/chat/completions
Headers: api-key: <your kvidAI API key>
         Content-Type: application/json
```

### Request

| Field | Required | Description |
|-------|----------|-------------|
| `model` | yes | A supported model. Currently: `openrouter/openai/gpt-6-luna` |
| `messages` | yes | Array of `{ "role": "system" \| "user" \| "assistant" \| "tool", "content": ... }` |
| `max_tokens` (or `max_completion_tokens`) | no | Output limit. Default 4096, maximum 8192. Credits are reserved for this limit first and the unused part is returned, so set only what you need. Reasoning tokens count as output: a very small limit can end the call without a visible answer (300 or more is a safe start) |
| `tools`, `tool_choice`, `response_format`, `reasoning_effort`, … | no | The other OpenAI fields are passed through |

```bash
curl https://api.kvid.ai/llm/chat/completions \
  -H "api-key: $KVIDAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/openai/gpt-6-luna",
    "max_tokens": 300,
    "messages": [{ "role": "user", "content": "Say hi in 3 words." }]
  }'
```

### Response

The standard chat completions response:

```json
{
  "id": "gen-…",
  "object": "chat.completion",
  "model": "openai/gpt-6-luna",
  "choices": [
    { "index": 0, "finish_reason": "stop",
      "message": { "role": "assistant", "content": "Hi there, friend." } }
  ],
  "usage": {
    "prompt_tokens": 13, "completion_tokens": 33, "total_tokens": 46,
    "prompt_tokens_details": { "cached_tokens": 0 },
    "completion_tokens_details": { "reasoning_tokens": 40 }
  }
}
```

Response headers: `x-llm-platform-charged-micro-credits` (what this call cost; 1 credit = 1,000,000 micro-credits) and `x-request-id`. Send your own `x-request-id` request header to make a call identifiable; reusing the same value is rejected with `409`.

### Errors

| Status | Code | Meaning |
|--------|------|---------|
| 401 | | Missing or invalid `api-key` |
| 400 | `UNKNOWN_MODEL` | The model is not supported |
| 400 | `INVALID_JSON`, `INVALID_INPUT` | The body is not a JSON object, or a field is invalid |
| 402 | `INSUFFICIENT_CREDITS` | Not enough credits for the worst case of this call (`max_tokens`); lower `max_tokens` or buy credits |
| 409 | `REQUEST_ALREADY_SEEN` | This `x-request-id` was already used |
| 413 | `BODY_TOO_LARGE` | The request body is too large |
| 502 | `UPSTREAM_UNREACHABLE` | The model did not answer in time (up to 300 seconds); the reserved credits are released |

### Billing

- Charged by the real token usage after the call: input, output (including reasoning), and cached input at their own rates. See [Pricing](/docs/pricing#llm-api-chat-completions).
- The charge is rounded up to 0.01 credit, so a very small call still costs 0.01 credit.
- Failed calls (non-2xx) are not charged.

## Open items (delete before publishing)

- Streaming (`"stream": true`) is implemented in the backend but has not been verified through `api.kvid.ai`; do not document it until it is.
- Only one model is available. Decide the public model name(s) and whether to expose the `openrouter/` prefix.
- Rate limits for customers are not defined (the internal gateway limits apply only to internal keys).
- Confirm that failed calls are never charged (stated above from the design; verify with a forced failure).
- Prices: see the draft in `pricing.md`.
