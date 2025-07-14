# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docusaurus-based documentation site for kvidAI, a K-pop and K-beauty specialized AI service platform offering video/image generation APIs and AI tools.

**kvidAI Services:**
- Video 생성 AI API
- Image 생성 AI API  
- Text 생성 LLM AI API
- RAG AI 연동 Excel Plugin
- Local RAG 솔루션

**kvidAI Platform URLs:**
- [app.kvid.ai](http://app.kvid.ai) - kvidAI Main app interface
- [console.kvid.ai](https://console.kvid.ai) - User console and API management
- [developers.kvid.ai](http://developers.kvid.ai) - API key issuance, developer portal - Check key api request usage
- [docs.kvid.ai](http://docs.kvid.ai) - Documentation site (this project)
- [kvid.ai.kr](https://kvid.ai.kr/) - buy api credit shopping mall - For Korean credit payments only
- [Discord](https://discord.gg/wvsecByF) - kvidAI discord community

## Development Commands

**Installation:**
```bash
yarn install
```

**Development:**
```bash
yarn start        # Start local development server
yarn build        # Build for production
yarn serve        # Serve production build locally
yarn clear        # Clear Docusaurus cache
yarn typecheck    # Run TypeScript type checking
```

**Deployment:**
```bash
yarn deploy                              # Deploy to GitHub Pages
USE_SSH=true yarn deploy                 # Deploy using SSH
GIT_USER=<username> yarn deploy          # Deploy with specific Git user
netlify deploy --prod                    # Deploy to Netlify (recommended)
vercel --prod                           # Deploy to Vercel
```

## Architecture

**Framework:** Docusaurus 3.8.1 with TypeScript
**Package Manager:** Yarn 4.9.2 (requires Node.js >=22.0)

**Key Technologies:**
- React 18 with TypeScript
- Tailwind CSS (via custom plugin)
- MDX for documentation
- Decap CMS for content management
- **Internationalization (i18n)**: English default, Korean secondary

**Directory Structure:**
- `docs/` - **English documentation** (auto-generated sidebar)
  - `intro.md` - Main introduction page
  - `api-services/` - API documentation (Video, Image, Text, Excel Plugin, Local RAG)
  - `console-guide/` - Console usage guides (Initial setup, Content scheduling)
  - `getting-started/` - Getting started guides
  - `ko/` - **Korean documentation** (AWS-style multilingual approach)
    - `intro.md` - Korean introduction page
    - `api-services/` - Korean API documentation
    - `console-guide/` - Korean console guides
    - `getting-started.md` - Korean getting started guide
- `blog/` - Blog posts (authors.yml maintained)
- `src/` - React components and custom pages
  - `components/HomepageFeatures/` - Custom homepage with video showcases
- `static/` - Static assets and Decap CMS admin
  - `img/` - Images and videos for documentation
  - `admin/` - Decap CMS configuration and custom scripts
- `plugins/` - Custom Docusaurus plugins
- `scripts/` - Utility scripts for content processing
- `references_deprecated/` - Legacy Notion export content for reference

## Content Management

**Decap CMS Integration:**
- Admin interface: `/admin` (requires GitHub OAuth)
- Content stored in `docs/` and `blog/` folders
- Media files in `static/img/`
- Configuration: `static/admin/config.yml`
- **Organized collections**: Separate collections for English/Korean content by folder
- **Custom filename sanitization**: Automatically replaces spaces with hyphens in uploaded images
- **Fixed DOM errors**: Resolved React DOM manipulation issues in CMS interface
- **Stable configuration**: Folder-based collections without nested depth issues

**Document Creation:**
- Automatic filename format: `YYYY-MM-DD-slug.md`
- Auto-generated sidebar from folder structure
- Support for Korean content and filenames
- **File naming**: All filenames automatically cleaned (spaces → hyphens) for CLI compatibility

## Build Configuration

**Docusaurus Config** (`docusaurus.config.ts`):
- **Docusaurus 3.8 Build Optimizations**: v4 future flags enabled, experimental_faster for improved performance
- Tailwind CSS integration via custom plugin
- Customizable navbar and footer (English default, Korean language switcher)
- GitHub edit links configured
- Prism syntax highlighting with GitHub/Dracula themes
- **Internationalization**: English default locale, Korean secondary (AWS-style multilingual support)

**Deployment Targets:**
- Netlify (recommended for Decap CMS)
- GitHub Pages
- Vercel (manual auth required for CMS)

## Scripts and Utilities

**Notion Export Processing** (`scripts/notion_export_hash_removal_scripts/`):
- Remove hash suffixes from exported Notion filenames
- Update internal markdown links
- Handle Korean character filenames
- Processing scripts for bulk content migration

## Content Guidelines

- Primary language: Korean with English support
- Focus on kvidAI product documentation and tutorials
- Maintain consistent branding (kvidAI, not 홈팁스BIZ)
- Use structured categories for API documentation
- K-pop and K-beauty specialized content emphasis
- Practical examples and code samples included
- Real-world use cases and implementation guides

## Current Documentation Status

**Completed Sections:**
- API Services documentation (Video, Image, Text APIs)
- Console setup and usage guides (Initial setup, Content scheduling)
- Excel Plugin integration guide
- Local RAG solution overview
- All template content removed and replaced with actual kvidAI content
- **Custom homepage with video showcases** - Native multi-shot storytelling examples
- **Homepage features redesign** - K-pop/K-beauty specialized AI demonstrations

**Key Features Documented:**
- Complete API technical specifications with pricing
- Step-by-step console setup for new users
- Real code examples in multiple programming languages
- K-pop/K-beauty specific use cases and prompts
- Enterprise-grade Local RAG solution details
- **Cafe content scheduling automation** - Blog writing reservation system
- **Video generation examples** - Professional showcases with actual generated content

## Important Notes

- Always run `yarn typecheck` before committing changes
- Test builds locally with `yarn build` before deployment
- Netlify deployment recommended for full CMS functionality
- GitHub OAuth required for Decap CMS admin access
- **Primary language**: English as default with Korean support (i18n configured)
- All content based on actual kvidAI services (no fictional features)
- Template content (tutorial-basics, tutorial-extras) completely removed
- Clean documentation structure focused on real product features
- **Filename compatibility**: All spaces automatically converted to hyphens for Claude Code CLI
- **Homepage videos**: Auto-playing showcase videos demonstrate actual AI capabilities
- **No Seedance references**: All proprietary technology references removed from public-facing content
- **International ready**: Interface optimized for global audience with upcoming international payment support

## Content Creation Guidelines

**When adding new content:**
1. Verify information accuracy with actual kvidAI services
2. Include practical code examples and real use cases
3. Focus on K-pop/K-beauty specialized features and applications
4. Maintain consistent branding and terminology
5. Provide clear, actionable instructions for users
6. **Primary language**: Write in English first, Korean translation secondary
7. **Filename best practices**: Use hyphens instead of spaces in all filenames
8. **Video content**: Include relevant showcase videos when documenting features
9. **Reference accuracy**: Only document features that actually exist in kvidAI services
10. **International audience**: Consider global users while maintaining K-pop/K-beauty specialization

## Technical Implementation Details

**Homepage Components:**
- `src/components/HomepageFeatures/index.tsx` - Custom React component with video integration
- Auto-playing videos showcasing AI capabilities (4 demo videos included)
- Responsive design with mobile optimization
- **English-first interface** with international call-to-action buttons
- Direct links to app and documentation optimized for global users

**Decap CMS Collections:**
- **Blog Posts** - Blog content management
- **English - Getting Started** - English getting started guides
- **English - API Services** - English API documentation
- **English - Console Guide** - English console guides
- **English - Root Documents** - English root-level documents
- **한국어 - API 서비스** - Korean API documentation
- **한국어 - 콘솔 가이드** - Korean console guides
- **한국어 - 루트 문서** - Korean root-level documents

**Decap CMS Troubleshooting:**
- **DOM Error Resolution**: Fixed "Failed to execute 'removeChild'" React DOM errors
- **Invalid Event Listener**: Removed unsupported 'login' event listener
- **Stable Configuration**: Folder-based collections prevent CMS interface conflicts
- **JavaScript Fixes**: Custom `static/admin/index.html` with proper event handling

**API Documentation Structure:**
- Consistent pricing information in credits and USD
- Real endpoint URLs (api.kvid.ai domain)
- Actual code examples tested with live services
- Practical use cases with K-pop/K-beauty focus