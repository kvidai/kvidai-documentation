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
- [app.kvid.ai](http://app.kvid.ai) - Main AI app interface
- [console.kvid.ai](https://console.kvid.ai) - User console and API management
- [developers.kvid.ai](http://developers.kvid.ai) - API key issuance
- [docs.kvid.ai](http://docs.kvid.ai) - Documentation site (this project)
- [kvid.ai.kr](https://kvid.ai.kr/) - Korean shopping mall
- [Discord](https://discord.gg/wvsecByF) - kvidAI community

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
  - `intro.md` - Main introduction page (English)
  - `api-services/` - API documentation (English)
    - `overview.md` - Complete API services overview
    - `video-api.md` - Video generation API guide
  - `console-guide/` - Console usage guides (English)
    - `initial-setup.md` - Account setup and API key issuance
  - `getting-started/` - Getting started guides (English)
    - `quick-start.md` - 5-minute quick start guide
  - `ko/` - **Korean documentation** (separate sidebar)
    - `intro.md` - Korean main page
    - `api-services/` - Korean API documentation (moved from root)
    - `console-guide/` - Korean console guides (moved from root)
    - `getting-started.md` - Korean quick start guide
- `blog/` - Blog posts (authors.yml maintained)
- `src/` - React components and custom pages
  - `components/HomepageFeatures/` - Custom homepage with video showcases
  - `components/LanguageSwitcher/` - Language switching component
- `static/` - Static assets and Decap CMS admin
  - `img/` - Images and videos for documentation
  - `admin/` - Decap CMS configuration and custom scripts
- `plugins/` - Custom Docusaurus plugins
- `scripts/` - Utility scripts for content processing
- `references_deprecated/` - Legacy Notion export content for reference

## Content Management

**Decap CMS Integration:**
- Admin interface: `/admin` (requires GitHub OAuth)
- **English Documents**: `docs/` folder management (excluding `ko/` subfolder)
- **Korean Documents**: `docs/ko/` folder management
- Media files in `static/img/`
- Configuration: `static/admin/config.yml`
- **Custom filename sanitization**: Automatically replaces spaces with hyphens in uploaded images
- Custom JavaScript handlers for file upload processing (`filename-sanitizer.js`)

**Document Creation:**
- **Team Separation**: Content team manages `docs/`, developers manage `src/`
- Auto-generated sidebar from folder structure (separate for English/Korean)
- Support for Korean content and filenames
- **File naming**: All filenames automatically cleaned (spaces → hyphens) for CLI compatibility
- **Language Structure**: English docs in root, Korean docs in `ko/` subfolder

## Build Configuration

**Docusaurus Config** (`docusaurus.config.ts`):
- Tailwind CSS integration via custom plugin
- Customizable navbar and footer
- GitHub edit links configured
- Prism syntax highlighting with GitHub/Dracula themes

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
- **English Documentation**:
  - API Services overview and video API guide
  - Console initial setup guide
  - Quick start guide for developers
  - Complete technical specifications
- **Korean Documentation**:
  - API 서비스 개요 (comprehensive overview)
  - Console guides (initial setup, content scheduling)
  - Getting started guide in Korean
  - Excel Plugin and Local RAG documentation
- **Template Cleanup**: All Docusaurus template content removed
- **Custom homepage with video showcases** - Native multi-shot storytelling examples
- **Homepage features redesign** - K-pop/K-beauty specialized AI demonstrations

**Key Features Documented:**
- **Bilingual Structure**: Complete English docs with Korean translations
- **Team Workflow**: Clear separation between content team (`docs/`) and developers (`src/`)
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
6. **Primary language**: Write in English first (`docs/`), Korean secondary (`docs/ko/`)
7. **Team coordination**: Content teams work in `docs/`, developers in `src/`
8. **Filename best practices**: Use hyphens instead of spaces in all filenames
9. **Video content**: Include relevant showcase videos when documenting features
10. **Reference accuracy**: Only document features that actually exist in kvidAI services
11. **International audience**: Consider global users while maintaining K-pop/K-beauty specialization
12. **Language linking**: Add cross-language links between English and Korean versions

## Technical Implementation Details

**Homepage Components:**
- `src/components/HomepageFeatures/index.tsx` - Custom React component with video integration
- Auto-playing videos showcasing AI capabilities (4 demo videos included)
- Responsive design with mobile optimization
- **English-first interface** with international call-to-action buttons
- Direct links to app and documentation optimized for global users

**Decap CMS Enhancements:**
- `static/admin/filename-sanitizer.js` - Custom file upload handler
- **Dual Language Support**: Separate collections for English and Korean docs
- Automatic space-to-hyphen conversion for uploaded media
- Korean filename support with proper encoding
- Browser-level file input interception for seamless UX

**API Documentation Structure:**
- **Bilingual Documentation**: Complete English docs with Korean equivalents
- Consistent pricing information in credits and USD
- Real endpoint URLs (api.hometip.net domain)
- Actual code examples tested with live services
- Practical use cases with K-pop/K-beauty focus
- Cross-language navigation links on every page

**Language Management:**
- **URL Structure**: `/docs/intro` (English), `/docs/ko/intro` (Korean)
- **Automatic Sidebars**: Separate navigation for each language
- **Team Workflow**: Content creators manage `docs/` folder exclusively
- **Decap CMS Collections**: "English Documents" and "한국어 문서" sections