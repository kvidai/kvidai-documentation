---
title: Gallery
description: Browse, preview, and import community-shared video compositions in the kvidAI Gallery.
slug: gallery
sidebar_position: 3
---

# Gallery

> **한국어**: [갤러리](/docs/ko/web-app/gallery)

The **Gallery** is where users share finished compositions and where you can find templates to import into your own projects.

**Location**: [kvid.ai/gallery](https://kvid.ai/gallery)

## Browsing

- **Grid of cards** — each shows thumbnail, title, author (masked email), import count, and tags.
- **Search** — by composition name (server-side, debounced).
- **Click the card** — opens the detail page.

## Detail page

`/gallery/{id}` shows a single composition:

- **Live preview** — the composition renders in your browser (no separate video file). Click to play / pause.
- **Title, description, author, tag list**
- **Import count** — how many users have used this composition as a starting point
- **"Use this composition" button** — import it into your own projects

Because previews run client-side from the composition JSON, no MP4 storage is needed. External assets (images, videos, audio) are loaded from the original URLs stored in the composition.

## Import

1. Click **Use this composition**.
2. A new project is created in your account with a copy of the composition.
3. You're redirected to the editor to edit, rename, and render as your own project.

Your import does **not** affect the original: it's a snapshot copy.

## Sharing your own

From any of your projects (in Storyboard list or the editor), use **Share to Gallery**:

1. Enter a description and optional tags.
2. Submit — a snapshot of your current composition is published.
3. A thumbnail is auto-extracted from the first image asset of the composition.

You can **un-share** (delete from the gallery) at any time — only you, the owner, can delete your own submissions.

## SEO & public pages

Gallery items have individual public URLs (`kvid.ai/gallery/{id}`) and are included in the sitemap, so search engines can index them. OpenGraph meta tags use the thumbnail for rich previews on social media.

## Tips

- Add descriptive **tags** — they help other users discover your work.
- Keep the composition assets self-contained (use kvidAI CDN URLs rather than private links) so previews continue working after you leave.
- The **first image** in your composition becomes the thumbnail — put a good cover frame early.
