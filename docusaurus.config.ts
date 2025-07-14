import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import tailwindPlugin from "./plugins/tailwind-config.cjs";

const config: Config = {
  title: "kvidAI Documentation",
  tagline: "AI Generation Platform Specialized for K-pop & K-beauty",
  favicon: "img/logo_kvidai_favicon.ico",

  // Set the production url of your site here
  url: "https://docs.kvid.ai",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

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
  },

  plugins: [tailwindPlugin],

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
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "kvidAI",
      logo: {
        alt: "kvidAI Logo",
        src: "img/logo_kvidai_android-chrome-192x192.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://app.kvid.ai",
          label: "Try App",
          position: "right",
        },
        {
          href: "https://discord.gg/wvsecByF",
          label: "Discord",
          position: "right",
        },
        {
          href: "/docs/ko/intro",
          label: "한국어",
          position: "right",
          className: "navbar-language-switch",
        },
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
              label: "API Services",
              to: "/docs/api-services/overview",
            },
            {
              label: "Console Guide",
              to: "/docs/console-guide/content-scheduling",
            },
          ],
        },
        {
          title: "Services",
          items: [
            {
              label: "Main App",
              href: "https://app.kvid.ai",
            },
            {
              label: "Console",
              href: "https://console.kvid.ai",
            },
            {
              label: "Developer Portal",
              href: "https://developers.kvid.ai",
            },
            {
              label: "API Credit Shop",
              href: "https://kvid.ai.kr",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/wvsecByF",
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
