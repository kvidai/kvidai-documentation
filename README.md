# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

### Deploy via Netlify (Recommended for Decap CMS)

필수: https://decapcms.org/docs/docusaurus/
```
https://github.com/settings/developers - NEw OAuth App 만들기 "App Name: decap-cms-docusaurus-template.netlify.app"

github_client_id=Ov23lilv7YY6t8ZFrvC1
github_client_secret=9ab23aba0dbd7f6bc326a404f74f2f57c74aa70d
```

For the best experience with Decap CMS, deploy your site to Netlify:

1. **Connect your repository to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build command: `yarn build`
   - Set publish directory: `build`

2. **Configure GitHub OAuth for Decap CMS:**
   - In your Netlify dashboard, go to Site settings > Identity
   - Enable Identity service
   - Go to Identity > Registration > Registration preferences
   - Set to "Invite only" or "Open"
   - Go to Identity > Services > Git Gateway
   - Enable Git Gateway

3. **Access your CMS:**
   - Visit `https://your-site-name.netlify.app/admin`
   - You'll be redirected to authenticate with GitHub

### Deploy via Netlify CLI

First, install the Netlify CLI globally:

```
$ npm install -g netlify-cli
```

Login to your Netlify account:

```
$ netlify login
```

Initialize your site (run this in your project directory):

```
$ netlify init
```

This will guide you through connecting your site to Netlify. Choose "Create & configure a new site" and follow the prompts.

For subsequent deployments:

```
$ netlify deploy --prod
```

Or for a draft deployment (preview):

```
$ netlify deploy
```

You can also set up continuous deployment by connecting your Git repository during the init process.

### Deploy via Vercel CLI

First, install the Vercel CLI globally:

```
$ npm i -g vercel
```

Then, deploy your website:

```
$ vercel
```

For production deployment:

```
$ vercel --prod
```

The Vercel CLI will automatically detect that this is a Docusaurus project and configure the build settings appropriately. Your site will be deployed to a Vercel URL and can be connected to a custom domain through the Vercel dashboard.

**Note:** If you're using Decap CMS, you'll need to manually authenticate with GitHub when accessing `/admin`. The Netlify authentication flow won't work on Vercel. Consider using Netlify deployment for the best Decap CMS experience.
