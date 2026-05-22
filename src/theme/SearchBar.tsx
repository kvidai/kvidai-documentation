import React, { useEffect, useRef } from 'react';
import docsearch from 'meilisearch-docsearch';
import 'meilisearch-docsearch/css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function SearchBar(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const { meilisearchHost, meilisearchApiKey, meilisearchIndexUid } =
    siteConfig.customFields as {
      meilisearchHost: string;
      meilisearchApiKey: string;
      meilisearchIndexUid: string;
    };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !meilisearchHost || !meilisearchApiKey) return;

    const destroy = docsearch({
      container: containerRef.current,
      host: meilisearchHost,
      apiKey: meilisearchApiKey,
      indexUid: meilisearchIndexUid || 'docs',
    });

    return () => {
      if (typeof destroy === 'function') destroy();
    };
  }, [meilisearchHost, meilisearchApiKey, meilisearchIndexUid]);

  return <div ref={containerRef} />;
}
