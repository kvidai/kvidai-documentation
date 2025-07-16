# kvidAI documentation

This website is built using [Docusaurus](https://docusaurus.io/), [Decap CMS](https://decapcms.org/docs/docusaurus/) - a modern static website generator.

## 작업 history
### 20250717 decapcms에 이용약관 파일 올리고 url 쓸 수 있나 했는데... 실패함; 일반 wordpress 같은 cms 시스템이 아닌 것 같음
```
git연동기반 외에, 아 불편하고 복잡함;; 파일 올려서 url 호스팅으로 접속 되게 기능 만들어볼려고 했는데;;
파일이 업로드 되고 글이 작성되도, 서버 호스팅된 storage에 바로 저장이 안되는건가?;; 뭔가 설정을 잘못한건가? 모르겠음;;
docusaurus가 static asset을 관리하고 있어서;; decapcms에서 static asset hosting 컨트롤이 쉽게 불가능함 -> 그냥 docs 문서 올리는 용도로만 쓰자;;

=> 이용약관 같은 법적문서 url로 제공할 때는, 그냥 [google drive, onedrive, 아니면 aws s3(compatible) storage 하나 까서 파일이나 올리는 용도+ftp client tool] 쓰는게 낫겠음
```



## [scripts](./scripts)



## prompt list
```
https://docs.kvid.ai/1ab228ab-36a0-8020-8eb0-df5500b695f6 
@references_deprecated/**/"Video 생성 AI API.md" 
@references_deprecated/제품서비스매뉴얼_from-notion-export_20250714/제품서비스매뉴얼/**/"Video 생성 AI API"/  참고해서, 
@docs/api-services/video-api.md 내용 수정하기. 참고내용에 없는 내용 과장해서 작성하지 말고, 
참고내용에 이미지 video 포함되어 있으면, 해당 리소스 다운로드 받아서 .md파일에 visible되게 추가해줘 

"콘솔 가이드"에서 문서 정렬 순서 1번으로
```

```
메인 페이지 내용 꾸며줘. 

-- 동영상 삽입
dog_and_man_cheese_16-9.mp4
baby_fox_seed_16-9.mp4
squid_game_season_3_U.S._Edition_Insights_TikTok_9-16.mp4
말자말자의_댄스_퍼포먼스_TikTok_9-16.mp4


-- text내용 삽입 - seedance 1.0 내용은 삭제하고(seedance 1.0 사용내용 노출하고 싶지 않음)

Native Multi-Shot Storytelling
Natively supports the generation of narrative videos with multiple cohesive shots. It maintains consistency in the main subject, visual style, and atmosphere across shot transitions and temporal-spatial shifts.

Diverse Stylistic Expression
From photorealism and cyberpunk to illustration and felt texture, Seedance 1.0 can accurately interpret diverse stylistic prompts to support a wide range of creative needs.

Creativity Unleashed, Explore the Possibilities
From surreal fantasy and daily life documentaries to professional-grade commercial shorts, Seedance empowers creators and developers worldwide. Browse our curated showcase to spark your next great idea.
```

```
@src/components/HomepageFeatures/ mainpage, header, footer 
  text는 전부 영어 default로 표시 - 해외 결제도 곧 지원함
```


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



## 참고자료
- notion mcp 연동: https://www.notion.so/profile/integrations
- notion epicmobile apikey: https://www.notion.so/epicmoble/notion-epicmobile-22f228ab36a080b5a1b6febc825406e5?source=copy_link