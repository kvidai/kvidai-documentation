import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import tailwindPlugin from "./plugins/tailwind-config.cjs";

const config: Config = {
  title: "kvidAI Documentation",
  // staticDirectories: ["public", "static"],
  tagline: "AI Generation Platform Specialized for K-pop & K-beauty",
  favicon: "img/logo_kvidai_favicon.ico",

  // Set the production url of your site here
  url: "https://docs.kvid.ai",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",


  // SEO head tags
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'canonical',
        href: 'https://docs.kvid.ai',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'kvidAI Documentation',
        'url': 'https://docs.kvid.ai',
        'description': 'AI generation platform specialized for K-pop and K-beauty content creation',
        'publisher': {
          '@type': 'Organization',
          'name': 'kvidAI',
          'logo': 'https://docs.kvid.ai/img/logo_kvidai_android-chrome-512x512.png'
        }
      }),
    },
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "epicmobile-reserve", // Usually your GitHub org/user name.
  projectName: "kvidai-documentation", // Usually your repo name.

  // onBrokenLinks: "throw",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
    localeConfigs: {
      en: { label: "English", direction: "ltr" },
      ko: { label: "한국어", direction: "ltr" },
    },
  },

  plugins: [
    tailwindPlugin,
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'kvidAI Documentation',
        siteDescription: 'AI generation platform specialized for K-pop and K-beauty content creation. Comprehensive API documentation and guides for video, image, and text generation APIs.',
        depth: 3,
        content: {
          includeBlog: true,
          includePages: true,
          enableLlmsFullTxt: true,
        },
      },
    ],
  ],

  // Docusaurus 3.8 Build Performance Optimizations
  future: {
    // v4: {
    //   removeLegacyPostBuildHeadAttribute: true, // required
    // },
    v4: true,
    experimental_faster: true
    // experimental_faster: {
    //   rspackBundler: true,
    //   rspackPersistentCache: true,
    //   ssgWorkerThreads: true
    // }
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/epicmobile-reserve/kvidai-documentation/tree/master/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/epicmobile-reserve/kvidai-documentation/tree/master/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/logo4_kvidai_가로.jpg",
    metadata: [
      {name: 'description', content: 'kvidAI - K-pop & K-beauty specialized AI platform for video, image, and text generation. Professional AI APIs and tools for content creators.'},
      {name: 'keywords', content: 'kvidAI, K-pop AI, K-beauty AI, video generation API, image generation API, AI platform, content creation, Korean AI'},
      {property: 'og:title', content: 'kvidAI Documentation - AI Generation Platform'},
      {property: 'og:description', content: 'K-pop & K-beauty specialized AI platform offering video, image, and text generation APIs. Create professional content with our advanced AI tools.'},
      {property: 'og:image', content: 'https://docs.kvid.ai/img/logo4_kvidai_가로.jpg'},
      {property: 'og:url', content: 'https://docs.kvid.ai'},
      {property: 'og:site_name', content: 'kvidAI Documentation'},
      {property: 'og:type', content: 'website'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'kvidAI - AI Generation Platform for K-pop & K-beauty'},
      {name: 'twitter:description', content: 'Professional AI APIs for video, image, and text generation specialized in Korean content.'},
      {name: 'twitter:image', content: 'https://docs.kvid.ai/img/logo4_kvidai_가로.jpg'},
    ],
    navbar: {
      title: "kvidAI",
      logo: {
        alt: "kvidAI Logo",
        src: "img/logo_kvidai_android-chrome-192x192.png",
      },
      items: [
        // Docs link — href is rewritten per locale by src/theme/Navbar/index.tsx
        { to: "/docs/intro", label: "Docs", position: "left" },
        { to: "/blog", label: "Blog", position: "left" },
        { to: "/pricing", label: "Pricing", position: "left" },
        {
          href: "https://kvid.ai",
          label: "Try App",
          position: "right",
        },
        {
          href: "https://discord.gg/yzgyCx8Jpt",
          label: "Discord",
          position: "right",
        },
        { type: "localeDropdown", position: "right" },
        // {
        //   href: "https://github.com/epicmobile-reserve/kvidai-documentation",
        //   label: "GitHub",
        //   position: "right",
        // },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/docs/intro",
            },
            {
              label: "Pricing",
              to: "/pricing",
            },
          ],
        },
        {
          title: "Services",
          items: [
            {
              label: "kvidAI App",
              href: "https://kvid.ai",
            },
            {
              label: "API Endpoint",
              href: "https://api.kvid.ai",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/yzgyCx8Jpt",
            },
            {
              label: "Blog",
              to: "/blog",
            },
            // {
            //   label: "GitHub",
            //   href: "https://github.com/epicmobile-reserve/kvidai-documentation",
            // },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} kvidAI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
