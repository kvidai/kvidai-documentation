---
id: faq
title: Frequently Asked Questions
sidebar_position: 95
description: Common questions about kvidAI services, billing, API usage, and technical details.
keywords: [kvidAI, FAQ, API, billing, credits, support, K-pop AI, K-beauty AI]
---

# Frequently Asked Questions

## Getting Started

### What is kvidAI?

kvidAI is a K-pop and K-beauty specialized AI platform offering video, image, and text generation APIs and a full-featured web app for composing AI videos.

### How do I sign up?

Create an account at [kvid.ai/register](https://kvid.ai/register) and verify your email. That single account gives you access to the web app, billing, and API keys.

### Do I need technical knowledge?

Not at all. The web app (Storyboard editor, Gallery, Generate pages) is fully GUI-based. API keys and the developer APIs are for automation / integration on top.

## API and Services

### What APIs does kvidAI offer?

- **Video Generation API** (Text-to-Video / Image-to-Video, v1 / v2 / v3)
- **Image Generation API** (Nano Banana)

See the [API Services overview](./api-services/overview) for details.

### What are the rate limits?

Rate limits are set per account and scale with usage tier. Contact support@kvid.ai if you need a higher limit for production.

### What file formats are supported?

- **Video API**: input MP4/AVI/MOV/WebM; output MP4 (H.264).
- **Image API**: input JPEG/PNG/WebP; output JPEG/PNG/WebP.

## Billing and Credits

### How does the credit system work?

All services are billed from a single credit balance. See [Pricing](./pricing) for per-service rates. Credits are deducted when a request succeeds.

### How do I buy credits?

At [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase). Two packages: **Starter** ($10 / 700 credits) and **Monthly Package** ($30 / 3,000 credits) — both valid for 30 days. Monthly Package offers better value per credit.

### What payment methods are accepted?

International card payments via **Dodo Payments**: Visa, Mastercard, American Express.

### How long do credits last?

30 days from purchase for both packages. Enterprise contracts can have custom validity.

### Can I get a refund?

See our [Refund Policy](https://kvid.ai/refund-policy). In short: unused credits can be refunded within the refund window; partially used packages are non-refundable.

## Technical Details

### What is the typical response time?

- **Image Generation**: ~2–5 seconds
- **Video Generation**: ~30–120 seconds depending on length / model
- **Text Generation**: < 1 second (non-streaming); streaming starts under 1 second

### Can I use generated content commercially?

Yes. All content generated through kvidAI APIs can be used commercially — for client work, monetized projects, derivatives.

### What about NSFW content?

kvidAI enforces a safety policy: no adult / explicit content, no violence or harmful content. Repeated violations can result in account suspension.

## Korean / K-culture

### Why is kvidAI specialized for K-pop and K-beauty?

Our models are tuned on K-pop performance, K-beauty product imagery, Korean fashion, and Korean-language content, which gives noticeably better results on this domain.

### Can I use Korean prompts?

Yes — all APIs support Korean and English, and many users get the best results with bilingual prompts.

## Data and Privacy

### How is my data handled?

API keys are stored encrypted, your generated content is private to your account, and we do not use your content for model training without explicit opt-in.

### How long are generated files stored?

Generated files are available for at least 30 days. Download important assets locally. Enterprise plans can extend storage.

### Can I delete my account?

Yes — contact support@kvid.ai from the email on your account. All personal data and generated content will be removed.

## Support and Community

### How do I get help?

- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt) (fastest)
- **Email**: support@kvid.ai
- **Docs**: [docs.kvid.ai](https://docs.kvid.ai)

### Can I request new features?

Yes — post in `#feature-requests` on Discord or email support.

---

Still have questions? Join [Discord](https://discord.gg/yzgyCx8Jpt) or visit [docs.kvid.ai](https://docs.kvid.ai).
