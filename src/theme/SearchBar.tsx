import React, { useEffect, useRef } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

declare global {
  interface Window {
    __docsearch_meilisearch__?: {
      docsearch: (opts: {
        container: HTMLElement;
        host: string;
        apiKey: string;
        indexUid: string;
        searchParams?: Record<string, unknown>;
      }) => (() => void) | void;
    };
  }
}

const CDN_VERSION = '0.8.0';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/meilisearch-docsearch@${CDN_VERSION}/dist`;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function loadCSS(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}

export default function SearchBar(): JSX.Element {
  const { siteConfig, i18n } = useDocusaurusContext();
  const { meilisearchHost, meilisearchApiKey, meilisearchIndexUid } =
    siteConfig.customFields as {
      meilisearchHost: string;
      meilisearchApiKey: string;
      meilisearchIndexUid: string;
    };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !meilisearchHost || !meilisearchApiKey) return;

    loadCSS(`${CDN_BASE}/index.css`);

    let destroy: (() => void) | void;
    loadScript(`${CDN_BASE}/index.global.js`).then(() => {
      if (!containerRef.current || !window.__docsearch_meilisearch__) return;
      destroy = window.__docsearch_meilisearch__.docsearch({
        container: containerRef.current,
        host: meilisearchHost,
        apiKey: meilisearchApiKey,
        indexUid: meilisearchIndexUid || 'docs',
        // English locale: filter to English-only docs (hide /ko/ pages)
        // Korean locale: no filter — shows both, Korean results rank higher for Korean queries
        ...(i18n.currentLocale === 'en' && { searchParams: { filter: 'lang = "en"' } }),
      });
    });

    return () => {
      if (typeof destroy === 'function') destroy();
    };
  }, [meilisearchHost, meilisearchApiKey, meilisearchIndexUid]);

  return <div ref={containerRef} />;
}
