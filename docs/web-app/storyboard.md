---
title: Storyboard Editor
description: Use kvidAI's AI Storyboard editor to turn a natural-language brief into a scene-by-scene composition.
slug: storyboard
sidebar_position: 1
---

# Storyboard Editor

> **한국어**: [Storyboard 에디터](/ko/docs/web-app/storyboard)

The **Storyboard editor** is the fastest way to get a complete video out of a short brief. Describe what you want in natural language, and an AI agent builds a scene-by-scene composition: image prompts, narration, subtitles, and motion.

**Location**: [kvid.ai/storyboard](https://kvid.ai/storyboard)

## What it does

Given a prompt like "a 30-second tutorial explaining how sunscreen works, upbeat tone", the agent will:

1. **Plan scenes** — decide how many scenes, each scene's duration and purpose.
2. **Write narration** — generate a script sized to the language (about 4 chars/sec for Korean, 15 chars/sec for English).
3. **Generate assets in parallel** — images, videos, and voice TTS through the kvidAI API.
4. **Compose** — lay everything onto a timeline (background, visual, subtitle, audio tracks).
5. **Hand off to the Video Editor** — you can tweak the result manually before rendering.

## Your project list

`/storyboard` is also the project list for anything you've created with the agent:

- **Search** — by project name.
- **Status filter** — draft / rendering / completed.
- **Sort** — latest, oldest, name A→Z, name Z→A.
- Project thumbnails use the first image in the composition (auto-picked if you haven't set one).

## Create a new project

1. Click **New Project**.
2. Choose an aspect ratio preset (16:9, 9:16, 1:1, 4:3, etc.).
3. Name the project.
4. You land on the editor with an empty composition, ready for the agent or manual editing.

## The agent chat

Inside the editor, the **chat panel** is how you drive the agent.

Common requests:
- "Make a 1 minute intro for a K-beauty skincare brand."
- "Replace scene 3 with something more cinematic."
- "Shorten the whole video to 30 seconds and keep the key messages."
- "Regenerate the narration in a more casual tone."

The agent will stream progress (planning → generating media → composing) and you'll see the canvas update live.

### Templates

Above the chat there's a **template selector**. Templates set the voice, narration tone, and scene style. Currently presets include channels like "review-owl" and "sod"; you can also save your own template for reuse.

## Project actions

From each project card:

- **Open** — enter the editor.
- **Duplicate** — make an independent copy.
- **Share to Gallery** — publish a snapshot to the public gallery so others can import it.
- **Delete** — remove permanently.

## Pricing

Image, video, and voice generation are billed at the usual API rates. See [Pricing](/docs/pricing).

## Related

- [Video Editor](./video-editor) — the editor opens after the agent finishes.
- [Gallery](./gallery) — share or import compositions.
