---
title: AI Video Editor
description: kvidAI's browser video editor — timeline, layers, subtitles, audio, and server rendering.
slug: video-editor
sidebar_position: 2
---

# AI Video Editor

> **한국어**: [AI 비디오 에디터](/docs/ko/web-app/video-editor)

The Video Editor is kvidAI's browser-based editor, powered by [Remotion](https://www.remotion.dev/). It's where you land after the Storyboard agent finishes, and where you edit anything imported from the Gallery.

**Location**: `https://kvid.ai/editor/{projectId}`

Open a project by clicking it in [Storyboard](./storyboard), or import one from the [Gallery](./gallery).

## Layout

The editor has three main panels:

| Panel | What it contains |
|-------|------------------|
| **Left — Content / Layers** | Assets (images, videos, audio, fonts), layer list, inspector |
| **Center — Canvas + Timeline** | The Remotion player and a multi-track timeline |
| **Right — AI Chat** | Same agent as Storyboard; ask it to modify the composition |

## Playback controls

- Space — play / pause
- Click the timeline to seek
- Loop toggle and fullscreen on the player

## Timeline & tracks

- Multiple tracks stacked vertically (background, visual, captions, voiceover, music).
- Drag items to reposition; drag edges to trim.
- Snap indicators when aligning edges to the playhead or other items.
- Track mute / hide toggles.

## Item types

The editor understands many item types:

- **Text** — static text layers with font, size, color, stroke, shadow
- **Image** — static image
- **Video** — video clip with optional volume fade / cropping
- **Audio** — background music, voiceover, SFX with volume fade
- **Solid** — solid color or gradient background
- **Captions** — word-level animated captions (TikTok-style)
- **Custom visuals** — charts, star ratings, price compare, section dividers, keyword overlays, timelines, etc.

## Inspector

Select a layer to see its properties on the right: position, dimensions, rotation, opacity, font settings, text content, camera motion (Ken Burns), animation presets, and more. Changes apply live.

## Undo / Redo

- Cmd/Ctrl + Z — undo
- Shift + Cmd/Ctrl + Z — redo
- History is maintained per session.

## Subtitles

Subtitles can be added as plain Text layers or as auto-generated **Captions** with word-level timing.

## Saving

- **Autosave** — your edits are saved to the server after a short debounce (~500 ms of idle).
- You don't have to press Save manually; the status in the top bar tells you when the server has accepted the latest state.

## Rendering

Final video rendering is coming via Remotion Lambda / a dedicated render service. For now the editor stores a complete composition JSON; previewing happens in-browser.

## Sharing

Click **Share to Gallery** in the top bar to publish your composition. A snapshot is saved (composition + a first-frame thumbnail) so others can import it. You remain the sole owner of your original project.

## Keyboard shortcuts (common)

| Action | Shortcut |
|--------|----------|
| Play/Pause | Space |
| Undo | Cmd/Ctrl + Z |
| Redo | Shift + Cmd/Ctrl + Z |
| Delete selected | Backspace / Delete |
| Duplicate | Cmd/Ctrl + D |
| Select all | Cmd/Ctrl + A |

## Pricing

Editing is free — you only pay credits for AI operations (image / video / TTS) triggered from the chat or a Generate panel. See [Pricing](/docs/pricing).
