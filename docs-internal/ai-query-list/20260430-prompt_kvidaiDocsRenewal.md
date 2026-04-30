## 20260426

<prompt>
`kvidai-documentation` kvidai 구매사용 유저(내부 회사용 아님) 매뉴얼 리뉴얼

- 어 master branch(docs.kvid.ai)에 보니까 이미 내용이 어느정도 적혀 있네, 이미 작성된 내용 은 삭제하면 안되겠는데
  * Getting Started with kvidAI
  * Getting Started
  * Web App Features
  * API Services
  * Pricing
  * Credits Policy
  * Frequently Asked Questions
=> master branch에서 documentation 내용은 전부 가져와서 develop branch에 merge시키자.
=> documentation 기능위주로 먼저 리뉴얼을 해야겠음. -> docs내용추가변경은 next plan파일 만들어서 작업하기 

## 기능 개선
- 오른쪽 상단 [한국어, English] 고쳐야됨 - "/home/ubuntu/code_workspace/affyink/apps/docs" 여기 기능이 언어toggle 기능 잘 작동함

=> docs내용 view 순서는 영어가 first이고, ko는 second지원(mainPage, header, footer 같은 언어선택 안되는 영역page는 영어docs내용만 작성)

** affyink/apps/docs 기능이 kvidai-documentation repo 기반 이었는데, 지금은 kvidai-documentation(https://docs.kvid.ai/) 보다 affyink/apps/docs(https://docs.affy.ink/docs/intro/) 기능이 더 잘 작동하네;

=> 배포는 netlify에 한다, decapcms 일단 연동되어 있어서, apps/documentation/netlify.toml 그대로 사용 하려고 해서
- 현재 monorepo가 pnpm 이라서, "apps/documentation" 도 yarn이 아닌 pnpm으로 변경 하는게 맞겠지??    "/home/ubuntu/code_workspace/affyink/apps/docs" 여기도 기존 yarn 에서 현재 pnpm으로 교체성공 완료했다.

"./apps/web-service/docs/ui-screenshots" 이미지를 user-docs(apps/documentation)에 사용 가능하게 `kvidai-documentation` 개발 가능할까?
** screenshot 느슨한 사용 - 이런식으로 "apps/docs/scripts/copy-screenshots.js"
```json
// packages.json
scripts: {
    "screenshots": "node scripts/copy-screenshots.js",
}
```

## 내용 개선
- Pricing 내용 삭제하지말고 일단 놔두자(kvid.ai에도 pricing 직접 적기로 했음)

- @agents/[goose, gsd(개발 안함 나중에 코드 삭제해야됨)] 는 아직 출시 안해서, 매뉴얼 작성 안해도 됨
- @agents/goose/agents/goose/target/release/kvidai   아직 출시 안해서, 매뉴얼 작성 안해도 됨
- @agents/goose/ui/goose-binary   아직 출시 안해서, 매뉴얼 작성 안해도 됨

- apps/chrome-extension 아직 기능 출시 안함, 매뉴얼 작성 안해도 됨
- apps/shopify-app 아직 기능 출시 안함, 매뉴얼 작성 안해도 됨
- apps/strapi-ts   백앤드 기능이라(api.kvid.ai는 azure api management 쪽에서 연동되서, strapi-ts의 api endpoint 호출방법과 완전 똑같이 작동하지는 않음)
- apps/video-editor   단독작동 app이 아님(web-service에 내장 되어 있음)
- apps/vm-health-monotor   user사용 app이 아님
- **@apps/web-service 현재 내용으로 매뉴얼 전면 교체 해야됨.**
- @apps/wordpress-plugin   아직 기능 출시 안함, 매뉴얼 작성 안해도 됨

- @services/remote-mcp-server   아직 기능 출시 안함, 매뉴얼 작성 안해도 됨

~~dir 파일구조 참고: /home/ubuntu/code_workspace/kvidai-documentation/docs~~
</prompt>
<answer>
←  ☒ 기존 섹션 처리  ☒ Netlify 배포  ☒ 언어 토글  ✔ Submit  →

-- 기존 `docs/api-services/` (overview, video-api, local-rag, image-api, text-api,
excel-plugin)와 `docs/console-guide/` (initial-setup, content-scheduling) 섹션은 어떻게
처리할까요?

1. 전부 삭제 (web-service 매뉴얼만)
     strapi-ts/api.kvid.ai 동작 차이 + console-guide도 정확치 않음 → 깔끔히 제거하고
     web-service 사용자 매뉴얼만 작성
  2. 삭제하되 deprecated 폴더로 이동
     현재 `references_deprecated/` 패턴처럼 보존만 (사이트 빌드에서는 제외)
  3. 유지 (지금은 그대로 두고 나중에 결정)
     기존 EN/KO 컨텐츠 그대로 두고 web-service 매뉴얼만 신규 추가
❯ 4.- 어 master branch(docs.kvid.ai)에 보니까 이미 내용이 어느정도 적혀 있네, 이미 작성된
   내용 은 삭제하면 안되겠는데
     * Getting Started with kvidAI
     * Getting Started
     * Web App Features
     * API Services
     * Pricing
     * Credits Policy
     * Frequently Asked Questions
   => master branch에서 documentation 내용은 전부 가져와서 develop branch에 merge시키자.
   => documentation 기능위주로 먼저 리뉴얼을 해야겠음.

-- Netlify 배포 구조를 어떻게 할까요? (web-service의 ui-screenshots을 빌드 시 가져오려면
모노레포 접근이 필요)

  1. 모노레포 연결 + base=apps/documentation + submodule clone (권장)
     Netlify를 kvidai 모노레포에 연결, `base = apps/documentation`,
     GIT_SUBMODULES_RECURSIVE=true → 빌드 시 web-service submodule도 fetch 되어 screenshots
      접근 가능. affyink 패턴과 동일.
❯ 2. documentation 단독 repo 빌드 + 사전 push 스크립트 ✔
     기존처럼 kvidai-documentation repo만 Netlify에 연결. 별도 CI/스크립트가
     web-service에서 screenshots를 documentation repo로 복사 push. 분리도는 높지만 운영
     복잡.
  3. screenshots 동기화 안 함 (당분간 텍스트만)
     1단계 매뉴얼은 텍스트 위주로 작성, screenshot 통합은 후순위로 미룸

-- 언어 토글 구현 방식은?

❯ 1. 표준 `localeDropdown` (affyink와 동일, 권장) ✔
     Docusaurus 내장 기능. 설정 한 줄로 끝, 유지보수 쉬움. affyink도 결국 이걸로 해결.
  2. 기존 swizzled Navbar + 커스텀 LanguageSwitcher 유지
     affyink가 작성했지만 실제로 안 쓰는 컴포넌트. '번역 진행 중' UX가 필요할 때만.
</answer>
