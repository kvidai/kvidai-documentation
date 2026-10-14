/**
 * llms.txt / llms-full.txt are generated at build time by @signalwire/docusaurus-plugin-llms-txt (config: docusaurus.config.ts) and are also served
 * as https://kvid.ai/llms.txt and /llms-full.txt (the web app fetches these files), so they must be clean for AI agents:
 * docs only (no blog / tag pages), absolute links that still resolve when the file is served from another host, an accurate site summary,
 * and the agent pages, including the generated MCP tool reference (docs/agents/mcp-tools.md), inside llms-full.txt.
 *
 * Runs against the built site served on :3100 by playwright.config.ts (run `pnpm build` first). HTTP only, no browser page.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100';
const MCP_TOOL_REFERENCE_PATH = resolve(__dirname, '../docs/agents/mcp-tools.md');

function markdownLinkTargets(markdown: string): string[] {
  return [...markdown.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

test.describe('generated llms.txt', () => {
  test('starts with the site title and an accurate summary, not a K-pop-only one', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/llms.txt`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    const lines = body.split('\n');
    expect(lines[0]).toBe('# kvidAI');
    const summary = lines.find((line) => line.startsWith('> ')) ?? '';
    expect(summary).toContain('AI video, image and voice generation platform');
    expect(summary).toContain('MCP');
  });

  test('lists docs only: no blog, tag or demo pages', async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/llms.txt`)).text();
    expect(body).not.toContain('/blog');
    expect(body).not.toContain('/tags/');
    expect(body).not.toContain('markdown-page');
  });

  test('uses only absolute https links, so the file works when served from kvid.ai', async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/llms.txt`)).text();
    const targets = markdownLinkTargets(body);
    expect(targets.length).toBeGreaterThan(10);
    for (const target of targets) expect(target).toMatch(/^https:\/\//);
  });

  test('every docs.kvid.ai link resolves in the built site', async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/llms.txt`)).text();
    const docsTargets = markdownLinkTargets(body).filter((target) => target.startsWith('https://docs.kvid.ai/'));
    expect(docsTargets.length).toBeGreaterThan(10);
    for (const target of docsTargets) {
      const response = await request.get(target.replace('https://docs.kvid.ai', BASE_URL));
      expect(response.status(), target).toBe(200);
    }
  });

  test('links the agent overview and the MCP tool reference first', async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/llms.txt`)).text();
    const overviewIndex = body.indexOf('https://docs.kvid.ai/docs/agents/overview');
    const toolsIndex = body.indexOf('https://docs.kvid.ai/docs/agents/mcp-tools');
    const apiIndex = body.indexOf('https://docs.kvid.ai/docs/api-services/');
    expect(overviewIndex).toBeGreaterThan(-1);
    expect(toolsIndex).toBeGreaterThan(-1);
    expect(overviewIndex).toBeLessThan(apiIndex);
  });
});

test.describe('generated llms-full.txt', () => {
  test('contains every MCP tool of the generated tool reference page', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/llms-full.txt`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    const toolNames = [...readFileSync(MCP_TOOL_REFERENCE_PATH, 'utf8').matchAll(/^### `([a-z0-9_]+)`/gm)].map((m) => m[1]);
    expect(toolNames.length).toBeGreaterThan(20);
    for (const toolName of toolNames) expect(body).toContain(toolName);
  });

  test('explains how agents connect and the credit lifecycle', async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/llms-full.txt`)).text();
    expect(body).toContain('https://mcp.kvid.ai/mcp');
    expect(body).toContain('https://api.kvid.ai/mcp');
    expect(body).toMatch(/reserves/);
    expect(body).toMatch(/released/);
    expect(body).not.toContain('/blog');
  });
});
