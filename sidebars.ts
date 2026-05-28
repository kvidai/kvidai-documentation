import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Two sidebars — English (tutorialSidebar) and Korean (koSidebar).
 *
 * Docusaurus attaches a sidebar to a doc when that doc id appears in one of
 * the sidebars here. So English docs (in /docs/*.md) get tutorialSidebar and
 * Korean docs (in /docs/ko/*.md) get koSidebar. The Navbar wrapper
 * (src/theme/Navbar/index.tsx) rewrites the "Docs" link href based on current
 * URL so the button always leads to the right locale's intro page.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      link: { type: 'generated-index' },
      items: [
        'getting-started/quick-start',
        'getting-started/account-setup',
        'getting-started/buy-credits',
        'getting-started/api-keys',
      ],
    },
    {
      type: 'category',
      label: 'Web App Features',
      link: { type: 'generated-index' },
      items: [
        'web-app/storyboard',
        'web-app/video-editor',
        'web-app/gallery',
        'web-app/voice-library',
      ],
    },
    {
      type: 'category',
      label: 'API Services',
      link: { type: 'generated-index' },
      items: [
        'api-services/overview',
        'api-services/video-api',
        'api-services/image-api',
        'api-services/talk-v2v',
        'api-services/project-management',
        'api-services/agent-api',
        'api-services/preset-api',
        'api-services/media-api',
      ],
    },
    'pricing',
    'credits-policy',
    'faq',
  ],

};

export default sidebars;
