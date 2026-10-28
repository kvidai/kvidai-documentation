
 ------------------------------------------------------------------------------                                                                                                         Update available 3.8.1 → 3.10.2                                                                                                                 To upgrade Docusaurus packages with the latest version, run the                                       following command:                                            `npm i @docusaurus/core@latest @docusaurus/faster@latest                @docusaurus/preset-classic@latest @docusaurus/module-type-aliases@latest                 @docusaurus/tsconfig@latest @docusaurus/types@latest`                                                                                               ------------------------------------------------------------------------------ 

[INFO] Website will be built for all these locales: 
- en
- ko
[INFO] [en] Creating an optimized production build...
[WARNING] Some blog authors used in "2025-07-14-first-blog-post.md" are not defined in "authors.yml":
- {"name":"kvidAI Team","title":"kvidAI","url":"https://kvid.ai","image_url":"/img/logo_kvidai_android-chrome-192x192.png","imageURL":"/img/logo_kvidai_android-chrome-192x192.png","socials":{},"key":null,"page":null}

Note that we recommend to declare authors once in a "authors.yml" file and reference them by key in blog posts front matter to avoid author info duplication.
But if you want to allow inline blog authors, you can disable this message by setting onInlineAuthors: 'ignore' in your blog plugin options.
More info at https://docusaurus.io/docs/blog

[WARNING] Docusaurus site warnings:
- Your site is using the SWC js loader. You can safely remove the Babel config file at `babel.config.js`.
Browserslist: browsers data (caniuse-lite) is 6 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme

[ERROR] Error: Unable to build website for locale en.
    at tryToBuildLocale (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:78:15)
    at async /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:34:9
    ... 4 lines matching cause stack trace ...
    at async file:///home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/bin/docusaurus.mjs:44:3 {
  [cause]: Error: Cannot find module 'postcss-import'
  Require stack:
  - /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/apps/documentation/plugins/tailwind-config.cjs
  - /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/apps/documentation/docusaurus.config.ts
      at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
      at defaultResolveImpl (node:internal/modules/cjs/loader:1040:19)
      at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1045:22)
      at Function._load (node:internal/modules/cjs/loader:1216:25)
      at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
      at Module.require (node:internal/modules/cjs/loader:1527:12)
      at require (node:internal/modules/helpers:147:16)
      at Object.configurePostCss (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/apps/documentation/plugins/tailwind-config.cjs:6:9)
      at overridePostCssOptions (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:57:44)
      at /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:69:36
      at Array.forEach (<anonymous>)
      at overridePostCssOptions (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:69:18)
      at /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:72:45
      at Array.forEach (<anonymous>)
      at applyConfigurePostCss (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:72:27)
      at /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:81:28
      at Array.forEach (<anonymous>)
      at executePluginsConfigurePostCss (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:78:13)
      at executePluginsConfigureWebpack (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/webpack/configure.js:108:18)
      at getBuildClientConfig (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/buildLocale.js:135:61)
      at async Promise.all (index 0)
      at async buildLocale (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/buildLocale.js:47:88)
      at async runBuildLocaleTask (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:93:5)
      at async /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:74:13
      at async tryToBuildLocale (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:70:9)
      at async /home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:34:9
      at async mapAsyncSequential (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+utils@3.8.1_@swc+core@1.15.11_@swc+helpers@0.5.18__react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@docusaurus/utils/lib/jsUtils.js:21:24)
      at async Command.build (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/build/build.js:33:5)
      at async Promise.all (index 0)
      at async runCLI (/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/lib/commands/cli.js:56:5)
      at async file:///home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/node_modules/.pnpm/@docusaurus+core@3.8.1_@docusaurus+faster@3.10.1_@docusaurus+types@3.8.1_@swc+core@1.15_a29c271fccacdc505d6fc391b258847f/node_modules/@docusaurus/core/bin/docusaurus.mjs:44:3 {
    code: 'MODULE_NOT_FOUND',
    requireStack: [
      '/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/apps/documentation/plugins/tailwind-config.cjs',
      '/home/ubuntu/code_workspace/kvidai/.claude/worktrees/20261027_design-editor-completion/apps/documentation/docusaurus.config.ts'
    ]
  }
}
[INFO] Docusaurus version: 3.8.1
Node version: v22.23.2
