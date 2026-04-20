---
title: Voice Library
description: Browse and preview ElevenLabs voices inside kvidAI, and copy Voice IDs into your templates.
slug: voice-library
sidebar_position: 4
---

# Voice Library

> **한국어**: [Voice Library](/docs/ko/web-app/voice-library)

The Voice Library browses ElevenLabs voices that kvidAI can use for text-to-speech in Storyboard narrations and elsewhere.

**Location**: [kvid.ai/voice-library](https://kvid.ai/voice-library)

## What you can do

- **Search** voices by name, description, or labels.
- **Filter** by category (Premade, Professional, Cloned, Generated) and labels (Gender, Age, Language, Use Case, Accent).
- **Sort** by date or name (ascending / descending).
- **Preview** — click the speaker icon on a row to hear a sample.
- **Copy Voice ID** — use it in a Storyboard template or a direct API call.
- **Select** (if triggered from a picker) — plug the voice into the caller.

## Columns

| Column | Description |
|--------|-------------|
| Preview | Audio play button |
| Name | Voice display name |
| Description | Short description (hidden on narrow screens) |
| Category | Premade / Professional / Cloned / Generated |
| Gender / Age | Metadata labels |
| Language / Accent / Use Case | Metadata labels |
| Actions | Copy Voice ID / Select |

Columns hide progressively on smaller screens.

## Filters

Filters apply to the **currently loaded** voices. Load more to widen the pool, then apply filters. Active filter count shows as a badge next to the **Filters** button.

## Sort direction

When a sort field (Date / Name) is active, a small ↑/↓ button toggles ascending or descending.

## Using a voice

### In Storyboard

1. Go to your template editor (Storyboard > chat panel > Template menu > Edit).
2. Paste the Voice ID into the **voice** field.
3. Save. New narrations will use this voice.

### In the API

When calling an endpoint that accepts a voice parameter, pass the Voice ID:

```json
{
  "voice_id": "pNInz6obpgDQGcFmaJgB",
  "model_id": "eleven_multilingual_v2",
  "text": "Hello from kvidAI!"
}
```

## URL state

The page syncs **search**, **category**, and **sort** to the URL query string. You can share a filtered view by copy-pasting the URL.

## Tips

- For Korean narration, start from the `language: ko` filter.
- For a dramatic / energetic read, filter by `use case: characters & animation` or similar.
- Cloned voices often give more personality but may have stricter usage terms — check the ElevenLabs terms you agreed to.
