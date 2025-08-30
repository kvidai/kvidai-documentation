---
title: API Services Overview
description: Complete overview of kvidAI API services specialized for K-pop and K-beauty content
slug: api-overview
tags: [API, Services, K-pop, K-beauty]
sidebar_position: 1
---

# API Services Overview

> **한국어로 보기**: [API 서비스 개요](/docs/ko/api-services/overview) | **View in English** (current page)

**kvidAI** is an AI generation platform specialized for K-pop and K-beauty content creation, offering comprehensive API services for developers and businesses.

## 🎯 Main API Services

### 1. Video Generation AI API
- **Function**: Convert text or images into 5-6 second videos
- **Specialization**: K-pop dance moves, K-beauty content optimization
- **Pricing**: $0.86 (124.356 credits) per video
- **Resolution**: 480p, 720p support

### 2. Image Generation AI API  
- **Function**: FLUX.1 dev model-based image generation
- **Specialization**: K-pop idol style, K-beauty model aesthetics
- **Pricing**: 1-3 credits (varies by resolution)
- **Max Resolution**: 1024x1024

### 3. Text Generation LLM API
- **Models**: Qwen2.5-72B-Instruct, Qwen2.5-VL-72B-Instruct
- **Specialization**: Korean language and K-culture content generation
- **Pricing**: 
  - Input: $0.0012 (17.352 credits) per 1K tokens
  - Output: $0.0036 (52.056 credits) per 1K tokens

### 4. Excel Plugin with RAG AI
- **Function**: Use AI functions directly in Excel
- **Functions**: RUNGPT_TEXT(), RUNGPT_IMAGE_TO_TEXT(), RUNGPT_ASYNC_RESULT()
- **Pricing**: $0.01-$0.1 per function call

### 5. Local RAG Solution
- **Function**: On-premises AI system deployment
- **Specialization**: Enterprise-grade custom AI solutions
- **Architecture**: LangChain, Streamlit, ChromaDB based

## 🔑 Getting Started with APIs

### Step 1: API Key Issuance
1. Sign up at [Developer Portal](https://developers.kvid.ai)
2. Register at [Console](https://console.kvid.ai) with the same email
3. Generate API keys and set up credits

### Step 2: First API Call
```bash
# Text API Example
curl -X POST "https://api.kvid.ai/ai-model/qwen/v1/chat/completions" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
      {"role": "user", "content": "Write K-pop lyrics about friendship"}
    ]
  }'
```

## 💰 Pricing Structure

### Credit System
- **Exchange Rate**: 1,446 KRW = 1 USD
- **Usage-based**: Pay per usage × unit price
- **Prepaid**: Credit top-up system

### Service Pricing Table
| Service | Unit Price | Credits |
|---------|------------|---------|
| Video Generation | $0.86 | 124.356 credits |
| Image Generation | $0.0007-$0.002 | 1-3 credits |
| Text Generation (Input) | $0.0012/1K | 17.352 credits |
| Text Generation (Output) | $0.0036/1K | 52.056 credits |
| Excel Functions | $0.01-$0.1 | 14-144 credits |

## 🎨 K-pop & K-beauty Specializations

### Video API Features
- K-pop dance move optimization
- Idol-style camera angles
- Korean traditional element integration

### Image API Features  
- K-beauty makeup styles
- Korean fashion trend reflection
- Idol photo style support

### Text API Features
- Korean natural language processing optimization
- K-culture content generation
- Korean expression and cultural context understanding

## 🚀 Next Steps

- [Getting Started Guide](/docs/getting-started) - From account setup to first API call
- [Console Guide](/docs/console-guide/initial-setup) - Account and credit management
- [한국어 문서](/docs/ko/api-services/overview) - Complete documentation in Korean

## 🆘 Support

- **Discord**: [kvidAI Community](https://discord.gg/yzgyCx8Jpt)
- **Email**: support@kvid.ai

---

**Language**: **English** (current page) | [한국어](/docs/ko/api-services/overview)