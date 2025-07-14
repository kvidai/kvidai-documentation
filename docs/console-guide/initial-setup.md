---
title: Console Initial Setup Guide
description: Complete guide for account setup and API key issuance for first-time kvidAI console users
slug: initial-setup
tags: [Console, Setup, API Keys, Initial Setup]
sidebar_position: 1
---

# Console Initial Setup Guide

> **한국어로 보기**: [콘솔 초기 설정 가이드](/docs/ko/console-guide/initial-setup) | **View in English** (current page)

A step-by-step setup guide for first-time kvidAI service users, covering everything from account creation to API key issuance.

## 🚀 Before You Start

### Important Requirements
- **Developer Portal** and **Console Site** must use the **same email address**
- Manual credit and user permission setup required during initial configuration

### Access URLs
- **Developer Portal**: [developers.hometip.net](https://developers.hometip.net/)
- **Console**: [console.hometip.net](https://console.hometip.net)

## 📝 Step 1: Account Creation

### 1.1 Developer Portal Registration

1. Visit [developers.hometip.net](https://developers.hometip.net/)
2. Click **"Sign Up"** button
3. Enter registration information:
   - Email address
   - Password
   - Basic information

### 1.2 Console Site Registration

1. Visit [console.hometip.net](https://console.hometip.net)
2. Click **"Sign Up"** button
3. Register with the **same email address**

:::warning Important
The email addresses used for the Developer Portal and Console Site must be identical. Different emails will prevent API key and account integration.
:::

## 🔑 Step 2: API Key Issuance

### 2.1 Create API Key in Developer Portal

1. Log in to [developers.hometip.net](https://developers.hometip.net/)
2. Select **"API Keys"** or **"Key Management"** menu
3. Click **"Generate New API Key"** button
4. Select desired API services:
   - Video Generation AI API
   - Image Generation AI API  
   - Text Generation LLM AI API
5. Complete API key generation

### 2.2 Save API Key

:::warning Security Notice
API keys are only displayed once during creation. Make sure to store them securely!
:::

1. Copy the generated API key
2. Store in a secure location (password manager recommended)
3. Ensure the key is not exposed

## 💳 Step 3: Console Site Configuration

### 3.1 Credit Setup

Manual credit setup is required as automatic payment system is not yet integrated.

1. Log in to [console.hometip.net](https://console.hometip.net)
2. Request credit top-up from administrator
3. Confirm credit top-up completion

### 3.2 User Permission Setup

User permissions must be set manually.

1. Navigate to account settings in console site
2. Set User Role to **"api-user"**
3. Confirm permission setup completion

:::info Note
Manual credit and user permission setup is required because the system does not go through Cafe24 payment system.
:::

## 🧪 Step 4: API Testing

### 4.1 First API Call Test

Test if setup is complete with a simple API call.

**Text API Test:**
```bash
curl -X POST "https://api.kvid.ai/ai-model/qwen/v1/chat/completions" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**Video API Test:**
```bash
curl -X POST "https://api.kvid.ai/ai-model/videogen-1/v1/video_generation" \
  -H "API-KEY: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-to-video",
    "prompt": "A cat playing in the garden"
  }'
```

## ✅ Setup Completion Checklist

Check if you have completed all the following items:

- [ ] Developer Portal registration (developers.hometip.net)
- [ ] Console Site registration (console.hometip.net)
- [ ] **Same email address** usage confirmed
- [ ] API key issued from Developer Portal
- [ ] API key stored securely
- [ ] Credit setup in Console Site (manual)
- [ ] User permission set to "api-user"
- [ ] API test successful

## 🆘 Troubleshooting

### Common Issues

**Q: API key not working**
- Check if Developer Portal and Console Site email addresses match
- Verify no spaces or special characters when copying API key
- Check credit balance and user permissions

**Q: No credits available**
- Manual setup is currently required
- Contact customer support for credit top-up

**Q: User permission error**
- Check if user role is set to "api-user" in Console Site
- Contact customer support if permission setup is not working

### Customer Support

Contact us anytime during the setup process:

- **Email**: support@kvid.ai
- **Discord**: [kvidAI Community](https://discord.gg/wvsecByF)
- **Contact Form**: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLScp4wRUI-oCmOYOSYQxSbsUX5xouo0PbnspNzktHi068ikvYQ/viewform)

## 🎯 Next Steps

Once setup is complete, refer to these documents:

- [Video API Usage](/docs/api-services/video-api)
- [Image API Usage](/docs/api-services/image-api)
- [Text API Usage](/docs/api-services/text-api)

:::tip Success Tips
Email address unification and manual permission setup are most important during initial setup. Contact customer support if you encounter any issues.
:::

---

**Language**: **English** (current page) | [한국어](/docs/ko/console-guide/initial-setup)