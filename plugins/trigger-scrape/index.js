// Netlify Build Plugin — triggers GitHub Actions scrape-docs workflow after deploy
// Production → docs index (docs.kvid.ai)
// Preview → docs-staging index (deploy preview URL)
export default {
  onSuccess: async ({ constants }) => {
    const { CONTEXT, DEPLOY_URL, SITE_URL } = constants;
    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
      console.warn('[trigger-scrape] GITHUB_PAT not set — skipping scrape trigger');
      return;
    }

    const isProd = CONTEXT === 'production';
    const startUrl = isProd ? `${SITE_URL}/` : `${DEPLOY_URL}/`;
    const indexUid = isProd ? 'docs' : 'docs-staging';

    console.log(`[trigger-scrape] context=${CONTEXT} → index=${indexUid} url=${startUrl}`);

    const res = await fetch('https://api.github.com/repos/kvidai/kvidai-documentation/dispatches', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'scrape-docs',
        client_payload: { context: CONTEXT, start_url: startUrl, index_uid: indexUid },
      }),
    });

    if (!res.ok) {
      // Don't fail the build — site is already live. Just warn.
      console.error(`[trigger-scrape] GitHub dispatch failed: ${res.status} ${await res.text()}`);
    }
  },
};
