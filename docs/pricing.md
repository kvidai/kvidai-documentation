---
title: Pricing Plans
description: kvidAI API Services Integrated Pricing Guide
slug: pricing
sidebar_position: 2
---

# Pricing Plans

All kvidAI API services use a credit-based pricing system. Here's a detailed breakdown of pricing for each service.

## 💳 Credit Exchange Rates

### Standard Pricing
- **1 USD = 100 credits**
- **1,500 KRW = 100 credits**
- **1 credit = $0.01 USD**

| Currency | Amount | Credits | Price per Credit |
|----------|--------|---------|------------------|
| **USD** | $1 | 100 credits | 1 credit = $0.01 |
| **KRW** | ₩1,500 | 100 credits | 1 credit = ₩15 |

### Volume Discounts
- **0.1M+ credits**: 10% discount
- **0.5M+ credits**: 20% discount  
- **1M+ credits**: Custom enterprise pricing

*Note: Promotional discounts may be available during special events. Check [kvid.ai.kr](https://kvid.ai.kr) for current offers.*

## 📅 Monthly Subscription Plans

| Plan | Monthly Credits | Price (USD) | Price (KRW) | Recommended For |
|------|----------------|-------------|-------------|-----------------|
| **Standard** | 3,000 credits | $30/month | ₩45,000/month | Individuals & Small Teams |
| **Professional** | 6,000 credits | $60/month | ₩90,000/month | SMBs |
| **Enterprise** | Custom | Contact Sales | Contact Sales | Large Organizations |

> 💡 **Tip**: Get 10% bonus credits with monthly subscriptions!

## 🎬 Video Generation API Pricing

### v1 model (기존 최적화)

| Resolution | Duration | Credits | USD Price | KRW Price |
|------------|----------|---------|-----------|-----------|
| **480p** | 5-6s | 60 credits | $0.60 | ₩900 |
| **720p** | 5-6s | 120 credits | $1.20 | ₩1,800 |

### v2 model (신규 추가)

| Resolution | Duration | Credits | USD Price | KRW Price |
|------------|----------|---------|-----------|-----------|
| **480p** | 5s | 39 credits | $0.39 | ₩585 |
| **720p** | 5s | 54 credits | $0.54 | ₩810 |
| **1080p** | 5s | 89 credits | $0.89 | ₩1,335 |

### Mode-based Pricing

| Mode | Additional Cost | Description |
|------|-----------------|-------------|
| **Text-to-Video** | Base price | Generate video from text prompts |
| **Image-to-Video** | Base price | Generate video from images |

## 🎨 Image Generation AI Pricing

### Model (7.5 credits per megapixel)

| Resolution | Megapixels | Credits | USD Price | KRW Price | Use Case |
|------------|------------|---------|-----------|-----------|----------|
| **512×512** | 0.26 mpx | 2 credits | $0.02 | ₩30 | Social profiles, icons |
| **768×512** | 0.39 mpx | 3 credits | $0.03 | ₩45 | Landscape banners |
| **512×768** | 0.39 mpx | 3 credits | $0.03 | ₩45 | Portrait posters |
| **768×768** | 0.59 mpx | 4 credits | $0.04 | ₩60 | Standard images |
| **1024×768** | 0.79 mpx | 6 credits | $0.06 | ₩90 | High-quality landscape |
| **768×1024** | 0.79 mpx | 6 credits | $0.06 | ₩90 | High-quality portrait |
| **1024×1024** | 1.05 mpx | 8 credits | $0.08 | ₩120 | High-quality square |

### Batch Generation Discounts

| Quantity | Discount | Example |
|----------|----------|---------|
| 1-10 | 0% | Base price |
| 11-50 | 5% | 95% of base price |
| 51-100 | 10% | 90% of base price |
| 101+ | Contact us | Custom pricing |

## 📝 Text Generation LLM AI Pricing

### Qwen Model Token Pricing

| Model | Input/Output | Per 1K Tokens (USD) | Per 1K Tokens (Credits) | Per 1K Tokens (KRW) |
|-------|--------------|---------------------|------------------------|---------------------|
| **qwen2.5-72b-instruct** | Input | $0.0012 | 17.352 credits | ₩260 |
| **qwen2.5-72b-instruct** | Output | $0.0036 | 52.056 credits | ₩781 |
| **qwen2.5-vl-72b-instruct** | Input | $0.0012 | 17.352 credits | ₩260 |
| **qwen2.5-vl-72b-instruct** | Output | $0.0036 | 52.056 credits | ₩781 |

> 📌 **Exchange Rate**: 1 USD = 1,446 KRW (2024 reference)

### Average Usage Examples

| Use Case | Avg Input Tokens | Avg Output Tokens | Est. Credits | Est. Cost |
|----------|------------------|-------------------|--------------|-----------|
| **Simple Q&A** | 50 | 100 | 6 credits | ₩90 |
| **Translation (1 page)** | 500 | 500 | 35 credits | ₩525 |
| **Content Writing** | 200 | 1,000 | 56 credits | ₩840 |
| **Code Generation** | 500 | 1,500 | 87 credits | ₩1,305 |
| **Document Summary** | 5,000 | 500 | 113 credits | ₩1,695 |

## 📊 Excel Plugin Pricing

### Function Call-based Pricing

Excel Plugin charges credits per function call.

| Function Name | Feature | Credits per Call | USD Price | KRW Price |
|---------------|---------|------------------|-----------|-----------|
| **RUNGPT_TEXT** | Text generation | 1 credit | $0.01 | ₩15 |
| **RUNGPT_IMAGE_TO_TEXT** | Image analysis | 5 credits | $0.05 | ₩75 |
| **PARSE_JSON** | JSON parsing | 5 credits | $0.05 | ₩75 |
| **Video Generation** | Video creation | 10 credits | $0.10 | ₩150 |
| **RUN_GPT** | GPT execution | 1 credit | $0.01 | ₩15 |

### Composite Function Example

```excel
=RUN_GPT(PARSE_JSON(B1))
```
- RUN_GPT: 1 credit + PARSE_JSON: 5 credits = **Total 6 credits ($0.06)**

### Batch Processing Examples

| Task Type | Rows/Columns | Function | Total Credits | Est. Cost |
|-----------|--------------|----------|---------------|-----------|
| **Product Descriptions** | 1,000 items | RUNGPT_TEXT | 1,000 credits | ₩15,000 |
| **Image Analysis** | 500 items | RUNGPT_IMAGE_TO_TEXT | 2,500 credits | ₩37,500 |
| **Video Production** | 100 items | Video Generation | 1,000 credits | ₩15,000 |

## 🏢 Local RAG Solution Pricing

### License Models

Local RAG provides customized licenses based on enterprise scale and requirements.

| License Type | Description | Price Range |
|--------------|-------------|-------------|
| **Perpetual License** | One-time purchase, unlimited use | $30,000 - $200,000 |
| **Annual Subscription** | Includes updates & support | $10,000 - $100,000/year |
| **User-based** | Based on concurrent users | $100 - $500/user/year |
| **Server-based** | Based on installation servers | $5,000 - $20,000/server/year |

### Enterprise Scale Pricing

| Company Size | Users | Recommended License | Est. Cost |
|--------------|-------|---------------------|-----------|
| **Small** | 10-50 | Annual Subscription | $10,000 - $20,000/year |
| **Medium** | 50-200 | User-based | $30,000 - $50,000/year |
| **Large** | 200-1000 | Perpetual License | $80,000 - $150,000 |
| **Enterprise** | 1000+ | Custom Contract | Contact Sales |

### Industry-Specific Solutions

| Industry | Special Features | Additional Cost |
|----------|------------------|-----------------|
| **Healthcare** | HIPAA compliance, Medical models | +20-30% |
| **Finance** | Regulatory compliance, Audit logs | +25-35% |
| **Education** | Academic discount, Student licenses | -30-50% |
| **Government** | Enhanced security, Localization | +15-25% |

## 💼 Recommended Plans by Usage

### Light Users (Under 1,000 credits/month)

| Service | Expected Usage | Recommendation |
|---------|----------------|----------------|
| Video API | 10 videos/month (720p) | Pay-as-you-go |
| Image API | 100 images/month (768×768) | Pay-as-you-go |
| Text API | 20,000 tokens/month | Pay-as-you-go |

### Regular Users (1,000-5,000 credits/month)

| Service | Expected Usage | Recommendation |
|---------|----------------|----------------|
| Video API | 30 videos/month (mixed res) | Standard Plan |
| Image API | 300 images/month | Standard Plan |
| Text API | 100,000 tokens/month | Standard Plan |

### Heavy Users (Over 5,000 credits/month)

| Service | Expected Usage | Recommendation |
|---------|----------------|----------------|
| Video API | 100+ videos/month | Professional/Enterprise |
| Image API | 1,000+ images/month | Professional/Enterprise |
| Text API | 500,000+ tokens/month | Professional/Enterprise |

## 🎯 Integrated Usage Scenarios

### Scenario 1: Social Media Marketing Package

| Component | Quantity | Credits | Cost |
|-----------|----------|---------|------|
| Videos (720p v2) | 10/month | 810 credits | ₩12,150 |
| Images (1024×1024) | 50/month | 800 credits | ₩12,000 |
| Text (Social copy) | 100/month | 500 credits | ₩7,500 |
| **Total** | - | **2,110 credits** | **₩31,650** |

### Scenario 2: E-commerce Product Listing

| Component | Quantity | Credits | Cost |
|-----------|----------|---------|------|
| Product videos (480p) | 20/month | 1,200 credits | ₩18,000 |
| Product images (768×768) | 100/month | 900 credits | ₩13,500 |
| Product descriptions (AI) | 100/month | 1,000 credits | ₩15,000 |
| **Total** | - | **3,100 credits** | **₩46,500** |

### Scenario 3: Content Creation Agency

| Component | Quantity | Credits | Cost |
|-----------|----------|---------|------|
| Premium videos (1080p) | 15/month | 2,010 credits | ₩30,150 |
| Thumbnail images | 60/month | 540 credits | ₩8,100 |
| Script writing | 15/month | 750 credits | ₩11,250 |
| **Total** | - | **3,300 credits** | **₩49,500** |

## 💡 Cost Optimization Tips

### 1. Resolution Optimization
- Use low resolution for testing
- Generate final versions in high resolution
- Choose appropriate resolution for use case

### 2. Batch Processing
- Take advantage of volume discounts
- Minimize API calls
- Schedule work efficiently

### 3. Credit Management
- Get 10% bonus with monthly subscription
- Monitor usage regularly
- Set budget alerts

## 📊 Legacy Credit Consumption Rates

> ⚠️ **Note**: The following rates are from the legacy pricing model. Please refer to the detailed pricing tables above for current rates.

### Video Generation API (Legacy)
| Feature | Credits per Request |
|---------|-------------------|
| Text-to-Video (5 seconds) | 50,000 credits |
| Text-to-Video (10 seconds) | 100,000 credits |
| Image-to-Video (5 seconds) | 40,000 credits |
| Video Extension (+5 seconds) | 50,000 credits |

### Image Generation API (Legacy)
| Feature | Credits per Request |
|---------|-------------------|
| Standard Image (512x512) | 5,000 credits |
| HD Image (1024x1024) | 10,000 credits |
| 4K Image (2048x2048) | 20,000 credits |
| Style Transfer | 8,000 credits |

### Text Generation API (Legacy)
| Feature | Credits per Request |
|---------|-------------------|
| Standard Generation (up to 1K tokens) | 1,000 credits |
| Extended Generation (up to 4K tokens) | 4,000 credits |
| Korean-optimized Model | 1,500 credits per 1K tokens |

### Failed Generation Policy
- **Successful generation**: Full credits deducted immediately
- **Failed generation**: Credits deducted based on "server instance time × hourly rate"
- Server resources (GPU, CPU) are consumed even for failed attempts
- Deduction will not exceed the standard rate for that feature

## 📞 Contact & Support

### Billing Inquiries
- **Email**: support@kvid.ai
- **Phone**: +82-010-2740-2109 (Weekdays 9AM-6PM KST)

### Enterprise Sales
- **Enterprise**: support@kvid.ai
- **Partnerships**: support@kvid.ai

### Payment Methods
- **Credit Cards**: 20250717 한국 카드결제만 가능
- **Corporate**: Tax invoices available
- **International**: 지원예정 - Visa, MasterCard, AMEX, PayPal, Stripe

---

> 📌 **Important Notes**
> - All prices exclude VAT/taxes
> - Exchange rates subject to change
> - Unused credits do not roll over
> - See [Terms of Service](/terms) for details