---
title: Quick Start Guide
description: Step-by-step guide for first-time kvidAI API users
slug: quick-start
tags: [Getting Started, API, Tutorial]
sidebar_position: 1
---

# Quick Start Guide

> **한국어로 보기**: [시작하기 가이드](/docs/ko/getting-started) | **View in English** (current page)

A step-by-step setup guide for first-time kvidAI API users.

## 🚀 Get Started in 5 Minutes

### Step 1: Account Creation

**Important**: You must use the **same email address** for both sites!

1. **Developer Portal Registration**
   - Visit [developers.kvid.ai](https://developers.kvid.ai)
   - Sign up (enter email and password)

2. **Console Site Registration**  
   - Visit [console.kvid.ai](https://console.kvid.ai)
   - Sign up with the **same email address**

### Step 2: API Key Issuance

1. Log in to [developers.kvid.ai](https://developers.kvid.ai)
2. Select "API Keys" or "Key Management" menu
3. Click "Generate New API Key"
4. Select desired API services:
   - ✅ Video Generation AI API
   - ✅ Image Generation AI API
   - ✅ Text Generation LLM AI API
5. Copy and securely store your API key

⚠️ **Warning**: API keys are only displayed once during creation!

### Step 3: Credits & Permissions Setup

Manual setup is currently required:

1. Log in to [console.kvid.ai](https://console.kvid.ai)
2. Contact customer support for:
   - Credit top-up request
   - Set user role to "api-user"

## 🧪 First API Call Test

### Text API Test
```bash
curl -X POST "https://api.kvid.ai/ai-model/qwen/v1/chat/completions" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
      {"role": "user", "content": "Write a short K-pop related article!"}
    ]
  }'
```

### Video API Test
```bash
curl -X POST "https://api.kvid.ai/ai-model/videogen-1/v1/video_generation" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-to-video",
    "prompt": "K-pop dancer performing choreography"
  }'
```

### Image API Test
```bash
curl -X POST "https://api.kvid.ai/ai-model/flux-1/v1/text-to-image" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Beautiful woman with K-beauty makeup",
    "width": 1024,
    "height": 1024
  }'
```

## 💰 Understanding Pricing

### Credit System
- **1 USD = 144.6 credits** (based on 1,446 KRW exchange rate)
- Usage-based credit deduction
- Prepaid top-up system

### Main Service Pricing
- **Video Generation**: 124.356 credits (≈$0.86) per 5-6 second video
- **Image Generation**: 1-3 credits (varies by resolution)
- **Text Generation**: 17-52 credits per 1,000 tokens

## ✅ Setup Completion Checklist

- [ ] Developer portal registration completed
- [ ] Console site registration completed (same email)
- [ ] API key issued and saved
- [ ] Credit top-up requested
- [ ] User role set to "api-user"
- [ ] First API call test successful

## 🔧 Common Issues

### Q: API key not working
**A**: Check the following:
- Developer portal and console site email addresses match
- No spaces or special characters when copying API key
- Credit balance and user permissions

### Q: No credits available
**A**: Manual setup is currently required. Request credit top-up from customer support.

### Q: Strange Korean API results
**A**: Qwen models are optimized for Korean. Try writing more specific prompts.

## 🎯 Next Steps

Once setup is complete:

1. **Explore API Services**: [API Services Overview](/docs/api-services/overview)
2. **Detailed Documentation**: Check complete API specifications
3. **Excel Plugin**: [Using AI in Excel](/docs/api-services/excel-plugin)
4. **Console Management**: [Console Guide](/docs/console-guide/initial-setup)

## 🆘 Need Help?

- **Discord**: [kvidAI Community](https://discord.gg/wvsecByF)
- **Email**: support@kvid.ai
- **Contact Form**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)

## 💡 K-pop & K-beauty Tips

### Video API Usage
```bash
# K-pop dance video
"prompt": "[Low-angle shot] Female K-pop dancer performing dynamic choreography"

# K-beauty product promotion
"prompt": "[Close-up] Elegant application of K-beauty lipstick with bright lighting"
```

### Text API Usage
```bash
# K-pop lyrics generation
"content": "Write K-pop ballad lyrics about love in Korean"

# K-beauty product description
"content": "Write a blog post about K-beauty skincare routine"
```

---

**Language**: **English** (current page) | [한국어](/docs/ko/getting-started)