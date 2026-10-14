---
title: MCP tool reference
sidebar_label: MCP tool reference
description: Every tool of the kvidAI remote MCP server with its parameters, generated from the server code.
---

# MCP tool reference

This page is generated from the code of the kvidAI remote MCP server by `scripts/generate-mcp-tool-reference.ts` in the kvidai monorepo; do not edit it by hand. The MCP server itself (`tools/list`) stays the source of truth for the exact input schemas.

Connect first: see [Use kvidAI from your AI agent](./overview.md). Tools marked "Spends credits" reserve credits when they start; see the credit lifecycle on that page.

## Projects

Create, list and load video projects. Composition and managed generation tools work on the project loaded in the session.

### `kvidai_list_projects`

List all your KVIDAI video projects

Parameters: none.

### `kvidai_get_project`

Get details of a specific video project by ID

Parameters:

- `projectId` (number, required): Video project ID

### `kvidai_create_project`

Create a new empty video project and set it as the active project for this session

Parameters:

- `name` (string, optional): Project name (default: "Untitled Project")

### `kvidai_load_project`

Load an existing video project into the current session. Required before using composition or agent tools.

Parameters:

- `projectId` (number, required): Video project ID to load

## Managed generation

Send one high-level request and let kvidAI run the whole video generation. Use the job tools for long videos: some MCP clients stop waiting for a tool result after about 60 seconds.

### `kvidai_send_message`

**Spends credits.**

Managed mode. Send one high-level natural-language request to the KVIDAI video AI agent, which forwards the project to the internal /api/agent orchestration path. Best for short videos (≤20 scenes). Returns the final result when complete. Spends KVIDAI credits from the signed-in user account (the amount depends on how many scenes are generated).

Parameters:

- `message` (string, required): Instruction for the video agent
- `templateId` (string, optional): Optional video template ID to use

### `kvidai_start_generation_job`

**Spends credits.**

Managed mode. Start a long-running video generation job (20+ scenes) through the internal KVIDAI /api/agent orchestration path. Returns a jobId immediately. Use kvidai_get_job_status to poll progress. Spends KVIDAI credits from the signed-in user account (the amount depends on how many scenes are generated).

Parameters:

- `message` (string, required): Instruction for the video agent
- `templateId` (string, optional): Optional video template ID

### `kvidai_get_job_status`

Managed mode. Get the status and progress of a running KVIDAI-agent generation job.

Parameters:

- `jobId` (string, required): Job ID from kvidai_start_generation_job

### `kvidai_resume_job`

**Spends credits.**

Managed mode. Resume a disconnected KVIDAI-agent generation job from its last known event index; the remaining scenes are generated. Spends KVIDAI credits from the signed-in user account (the amount depends on how many scenes are generated).

Parameters:

- `jobId` (string, required): Job ID to resume
- `lastEventIndex` (number, optional): Last received event index (default: 0)

### `kvidai_retry_scene`

**Spends credits.**

Managed mode. Retry a failed scene in a running KVIDAI-agent generation job; the scene is generated again. Spends KVIDAI credits from the signed-in user account (the amount depends on how many scenes are generated).

Parameters:

- `jobId` (string, required): Job ID
- `sceneId` (string, required): Scene ID to retry

## Composition (timeline editing)

Read and change the timeline (tracks and items) of the loaded project yourself.

### `kvidai_get_composition`

BYOL mode. Get the current persisted composition JSON of the active project without invoking the internal KVIDAI agent.

Parameters: none.

### `kvidai_add_track`

BYOL mode. Add a new track to the active project composition and persist it directly without internal KVIDAI-agent orchestration.

Parameters:

- `trackType` (string, required): Type of track to add One of: `background`, `media`, `overlay`, `text`, `audio`.
- `name` (string, optional): Optional track name override

### `kvidai_add_item`

BYOL mode. Add a new item to a specific track in the active project composition and persist it directly. Validate individual item fields with kvidai_validate_composition before calling this.

Parameters:

- `trackId` (string, required): Target track ID
- `item` (object, required): Item object to add. Must include: id, type, from, durationInFrames, top, left, width, height, opacity, isDraggingInTimeline, plus type-specific required fields.

### `kvidai_update_item`

BYOL mode. Update an existing item in the active project composition and persist it directly. Use kvidai_validate_composition on the full composition after updates to verify correctness.

Parameters:

- `itemId` (string, required): Item ID to update
- `updates` (object, required): Partial item fields to update

### `kvidai_remove_item`

BYOL mode. Remove an item from the active project composition and persist the change directly.

Parameters:

- `itemId` (string, required): Item ID to remove

### `kvidai_replace_composition`

BYOL mode. Replace the entire persisted composition of the active project without invoking the internal KVIDAI agent. IMPORTANT: Call kvidai_validate_composition FIRST — this tool returns an error if the composition is invalid. Required structure: \{ fps, compositionWidth, compositionHeight, tracks[], items\{\}, assets\{\}, deletedAssets[] \}.

Parameters:

- `composition` (object, required): Full Composition JSON object. Must pass kvidai_validate_composition before saving.

## Media

Upload source files and list the media of a project.

### `kvidai_prepare_media_upload`

BYOL mode helper. Prepare a video project for media upload. Creates a new project if projectId is not provided. Returns an upload URL the user must visit to upload their files via the browser. IMPORTANT: After calling this tool, always share the uploadUrl and userMessage with the user and wait for them to confirm they have finished uploading before calling kvidai_list_project_media.

Parameters:

- `projectId` (number, optional): Existing project ID to attach media to. If omitted, a new project is created.
- `projectName` (string, optional): Name for the new project (only used when projectId is omitted).

### `kvidai_list_project_media`

BYOL mode helper. List all media files currently attached to a project. Call this after the user confirms they have uploaded files via the editor page. Returns an array of file metadata (id, name, mime, size, url).

Parameters:

- `projectId` (number, optional): Project ID. If omitted, uses the active project for this session.

### `kvidai_generate_composition_from_media`

BYOL mode helper. Automatically build a Remotion composition from the media files attached to a project and save it directly. Each image is placed for 3 s, each video for up to 10 s (sequentially on the timeline). After saving, instruct the user to refresh the editor page to see the result. Call this only after kvidai_list_project_media confirms files are present.

Parameters:

- `projectId` (number, optional): Project ID. If omitted, uses the active project for this session.
- `aspectRatio` (string, optional): Canvas aspect ratio (default: 16:9 → 1920×1080). One of: `16:9`, `9:16`, `1:1`, `4:3`.

## Export

Export the timeline of the loaded project.

### `kvidai_export_timeline`

BYOL mode helper. Export the current persisted KVID video project as an NLE timeline file (FCP7 XML for Premiere Pro/DaVinci Resolve, or FCPXML for Final Cut Pro X). This does not invoke the internal KVIDAI /api/agent orchestration path. KVID-specific items (charts, callouts, countdown timers, etc.) are exported as Gap markers with timecode info like "[KVID: chart 00:15.0~00:22.0s]". Use these timecodes to manually place the rendered MP4 sections in your NLE. Free users: 3 exports/month. Premium users: unlimited.

Parameters:

- `format` (string, required): fcp_xml = FCP7 XML for Premiere Pro & DaVinci Resolve | fcpxml = FCPXML for Final Cut Pro X One of: `fcp_xml`, `fcpxml`.
- `projectId` (number, optional): Project ID to export. Defaults to the active project in the current session.

## Helpers and store integrations

Templates, prompt helpers, validation and WordPress / WooCommerce product import.

### `kvidai_list_wordpress_sites`

List WordPress sites connected to your KVIDAI account. Returns site_id, site_url, site_name, and last_synced_at for each site.

Parameters:

- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.

### `kvidai_get_woocommerce_products`

Get product list from a connected WooCommerce store via KVIDAI. Returns product name, description, images, price, and categories. Use kvidai_list_wordpress_sites first to find the site_id.

Parameters:

- `site_id` (string, required): WordPress site ID from kvidai_list_wordpress_sites
- `limit` (number, optional): Max products to return (1–100, default 50)
- `page` (number, optional): Page number for pagination (default 1)
- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.

### `kvidai_create_project_from_woocommerce_product`

Create a KVIDAI video project pre-filled with WooCommerce product data. The project will contain product title, plain-text description, images, and price. Returns the created project ID which can be opened in the KVIDAI editor.

Parameters:

- `site_id` (string, required): WordPress site ID from kvidai_list_wordpress_sites
- `product_id` (number, required): WooCommerce product ID (numeric, e.g. 42)
- `project_name` (string, optional): Optional custom name for the video project. Defaults to "&lt;product_name&gt; — 홍보영상".
- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.

### `kvidai_list_templates`

List all available KVIDAI video templates

Parameters: none.

### `kvidai_get_template`

Get details of a specific KVIDAI video template

Parameters:

- `templateId` (string, required): Template ID

### `kvidai_generate_system_prompt`

Generate system prompt for KVIDAI video agent

Parameters:

- `compositionInfo` (object, required): CompositionInfo object (fps, compositionWidth, compositionHeight, tracks, items)
- `templateId` (string, optional): Optional template ID

### `kvidai_generate_planning_prompt`

Generate scene planning prompt for KVIDAI video agent

Parameters:

- `compositionInfo` (object, required): CompositionInfo object
- `templateId` (string, optional): Optional template ID

### `kvidai_validate_scene_plan`

Validate a KVIDAI ScenePlan JSON object

Parameters:

- `plan` (object, required): ScenePlan object to validate
- `templateId` (string, optional): Optional template ID for budget validation

### `kvidai_estimate_scene_count`

Estimate number of scenes based on user message

Parameters:

- `message` (string, required)

### `kvidai_split_subtitles`

Split subtitle text into timed segments

Parameters:

- `text` (string, required)
- `totalDurationFrames` (number, required)
- `sceneStartFrame` (number, required)
- `maxCharsPerSegment` (number, optional)

### `kvidai_validate_composition`

Validate a KVIDAI Composition JSON object before saving or rendering. Returns \{ valid, errors[], warnings[] \} with AI-friendly path-prefixed messages (e.g. 'items["id"].assetId: not found'). CALL THIS FIRST when authoring or editing a composition — fix all errors before calling kvidai_replace_composition. Required top-level fields: fps (number, e.g. 30), compositionWidth (int), compositionHeight (int), tracks (array of \{id, items: string[], hidden, muted\}), items (Record&lt;itemId, CompositionItem&gt; — each item needs \{id, type, from, durationInFrames, top, left, width, height, opacity, isDraggingInTimeline\} plus type-specific fields), assets (Record&lt;assetId, CompositionAsset&gt;), deletedAssets (array of \{assetId, remoteFileKey\}). Valid item types: text, image, video, audio, solid, gif, captions, chart, dark-overlay, section-divider, callout, keyword-overlay, star-rating, review-quote, price-compare, discount-badge, stock-badge, sales-counter, progress-bar, timeline, countdown-timer, line, frame, icon, sticker. Asset types: image, video, gif, audio, caption.

Parameters:

- `composition` (object, required): Full Composition JSON object to validate

## Shopify

Listed only when the account has a Shopify integration connected in kvidAI.

### `kvidai_list_shopify_stores`

List Shopify stores connected to your KVIDAI account. Returns shop_domain, shop_name, scope, and last_synced_at for each store.

Parameters:

- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.

### `kvidai_get_shopify_products`

Get product list from a connected Shopify store via KVIDAI. Returns product title, description, images, price, and tags. Use kvidai_list_shopify_stores first to find the shop_domain.

Parameters:

- `shop_domain` (string, required): Shopify store domain (e.g. my-store.myshopify.com)
- `limit` (number, optional): Max products to return (1–250, default 50)
- `page_info` (string, optional): Pagination cursor from previous response for next page
- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.

### `kvidai_create_project_from_shopify_product`

Create a KVIDAI video project pre-filled with Shopify product data. The project will contain product title, plain-text description, images, and price. Returns the created project ID which can be opened in the KVIDAI editor.

Parameters:

- `shop_domain` (string, required): Shopify store domain (e.g. my-store.myshopify.com)
- `product_id` (string, required): Shopify product ID (numeric string, e.g. "987654321")
- `project_name` (string, optional): Optional custom name for the video project. Defaults to "&lt;product_title&gt; — 홍보영상".
- `kvidai_token` (string, optional): KVIDAI JWT token. Optional if KVIDAI_API_TOKEN env var is set.
