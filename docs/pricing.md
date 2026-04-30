---
sidebar_position: 90
title: Pricing
description: Credit-based pricing for kvidAI Video and Image Generation. Buy credits at kvid.ai — $30 for 3,000 credits.
keywords: [kvidAI pricing, AI credits, video generation cost, image generation cost]
image: https://docs.kvid.ai/img/logo4_kvidai_가로.jpg
slug: pricing
---

# Pricing

> **View in Korean**: [요금 안내](/docs/ko/pricing)

All kvidAI services use a single credit balance. Buy credits at **[kvid.ai/credits/purchase](https://kvid.ai/credits/purchase)** and use them across every API and every feature in the web app.

> Credit rates are reviewed about once a month. This page is the single source of truth — individual service pages link here instead of repeating prices.

---

## Buy Credits

| Package | Credits | Price | Validity |
|---------|---------|-------|----------|
| **Starter** | 3,000 credits | $30 USD | 30 days |

- **Where to buy**: [kvid.ai/credits/purchase](https://kvid.ai/credits/purchase) (sign in required)
- **Payment provider**: Dodo Payments (international)
- **Accepted methods**: Visa, Mastercard, American Express
- **Currency**: USD (your card issuer converts to local currency)

Larger / enterprise packages: contact support@kvid.ai.

> Unused credits expire after the validity period. Usage amounts below are measured per successful request.

---

## Exchange Reference

- **1 credit ≈ $0.01 USD**
- Services that charge a fraction of a credit per unit are rounded up.

---

## Video Generation

Credits per **Text-to-Video** request (base 5-second clip). Image-to-Video uses the same base rate as Text-to-Video.

| Resolution | v1 (Wan) | v2 (SeeDance) | v3 (Veo3) |
|------------|----------|---------------|-----------|
| **480p** | 60 credits | 39 credits | 150 credits |
| **720p** | 120 credits | 54 credits | — |
| **1080p** | — | 89 credits | — |

- v1 only supports 480p / 720p at 5–10 s.
- v2 is the recommended default for most users.
- v3 (Veo3) is the premium quality tier; supports 16:9 / 9:16 only.
- Longer durations (`10s` where supported) scale linearly with duration.

---

## Image Generation

Charged by megapixel at **~7.5 credits per megapixel** (rounded up).

| Resolution | Megapixels | Credits |
|------------|------------|---------|
| 512 × 512 | 0.26 | 2 |
| 768 × 512 / 512 × 768 | 0.39 | 3 |
| 768 × 768 | 0.59 | 4 |
| 1024 × 768 / 768 × 1024 | 0.79 | 6 |
| 1024 × 1024 | 1.05 | 8 |

Bulk generation discount: 51–100 images −10 %, 101 + custom.

---

## Usage Examples

### Social Media Marketing

| Item | Count | Credits |
|------|-------|---------|
| 720p v2 videos | 10 | 540 |
| 1024 × 1024 images | 50 | 400 |
| **Total** | — | **940** |

Easily fits inside one 3,000-credit Starter pack.

### E-commerce Product Listing

| Item | Count | Credits |
|------|-------|---------|
| 480p v2 product videos | 20 | 780 |
| 768 × 768 product images | 100 | 400 |
| **Total** | — | **1,180** |

---

## Failed Generation Policy

- **Successful**: credits deducted per the rates above.
- **Failed (server error)**: no full charge; a small fee proportional to the compute actually used may apply, never exceeding the normal rate for that feature.

---

## Cost Optimization Tips

- Use lower resolution for iteration, final render at higher resolution.
- Choose v2 over v1/v3 unless you need a specific look — it's cheaper and faster.
- Batch image requests to get volume discounts.
- Monitor remaining credits on [kvid.ai/dashboard](https://kvid.ai/dashboard).

---

## Contact & Support

- **Billing / general**: support@kvid.ai
- **Enterprise & partnerships**: support@kvid.ai

> Prices exclude VAT/taxes where applicable. Rates are subject to change; this document is updated when the backend schedule changes.
