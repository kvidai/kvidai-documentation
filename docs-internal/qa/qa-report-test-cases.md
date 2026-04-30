# QA문서 Table - kvidai-documentation

https://www.notion.so/epicmoble/kvidai-documentation-QA-__docs-kvid-ai-234228ab36a0807bb62bfd87e6edf174?source=copy_link

## QA Table 메타데이터 공통내용 정의 - notion QA table 컬럼별 옵션 값과 동일하게 맞추기
- Priority: [P1**, P2, P3] | P1(높음), P2(중간), P3(낮음) 등으로 구분
- Class1: [공통, 이메일, miniprogram, 광고신청, 자동글발행]
- Class2: [/miniprogram-credit, /api-credit, ...]
- Status: [To do, Init Request, Re-Request, Edit In progress, Edit Completed, Review in progress, Reviewer approved, Final Approved, Completed archive]
- Platform Type: [android 10, ios 14, windows 10 chrome, windows 10 edge, macos 15 safari, Android, iOS, web-PC, web-mobile, ...]
- confirm_staging: [X Android, X iOS, X Backend, X, O Android, O iOS, O Backend, O]
- confirm_production: [X Android, X iOS, X Backend, X, O Android, O iOS, O Backend, O]
- Description: 작업내용 text로 작성 - 복잡한 내용은 "notion QA문서리스트 - 해당repo QARow"에 작성 후, "notion QA문서내용 참고" 라고 적어주기
- ~~Category: [frontend, backend, design]~~
- ~~Sprint: [Sprint 1, Sprint 2, Sprint 3, ...]~~
- ~~Product Version: [v0.0.5, v1.0, v1.1, v1.2, ...]~~
- ~~Product Name: [admin페이지, 위젯nextjs, ...]~~
- ~~Reporter: [김선호, 이승철, ...]~~


## QA Table 메타데이터 내용별 정의 - notion QA table 컬럼별 옵션 값과 동일하게 맞추기
- Class1: [공통, 이메일, miniprogram, 광고신청, 자동글발행]
- Class2: [/miniprogram-credit, /api-credit, /gallery, /credit-usage, /api-auth, /admin-dashboard, /file-management, /ai-image, /ai-video, /ai-text, /credit-exchange, /ui-defaults]
- Platform Type: [android 10, ios 14, windows 10 chrome, windows 10 edge, macos 15 safari, Android, iOS, web-PC, web-mobile, ...]


## QA Table - All

| Title | Priority | Class1 | Class2 | Status | confirm_staging | confirm_production | Platform Type | Description |
|-------|----------|---------|---------|---------|-----------------|-------------------|---------------|-------------|
| Docusaurus 빌드 최적화 | P2 | 공통 | - | Edit Completed | O | O | windows 10 chrome, macos 15 safari | Docusaurus v3.8 최적화 플래그 적용 및 빌드 성능 개선 완료 |
| SEO 메타태그 구성 | P1** | 공통 | - | Edit Completed | O | O | web-PC, web-mobile | Open Graph, Twitter Card 메타태그 추가 및 SNS 공유 최적화 완료 |
| 다국어 지원 (i18n) | P1** | 공통 | - | Edit Completed | O | O | web-PC, web-mobile | 영어 기본, 한국어 보조 언어 설정 완료 |
| Sitemap 자동 생성 | P2 | 공통 | - | Edit Completed | O | O | web-PC | sitemap.xml 자동 생성 및 배포 스크립트 완료 |
| LLMs.txt 생성 | P3 | 공통 | - | Edit Completed | O | O | web-PC | AI/LLM 소비용 llms.txt, llms-full.txt 파일 생성 완료 |
| Decap CMS 통합 | P1** | 공통 | - | Edit Completed | O | O | web-PC | GitHub OAuth 로그인 기반, 콘텐츠 관리 시스템 통합 완료 |
| docs main page - 홈페이지 비디오 쇼케이스 | P1** | 공통 | - | Edit Completed | O | O | web-PC, web-mobile | 4개 데모 비디오 자동재생 쇼케이스 구현 완료 |
| docs내용 - API 문서 Credit 정보 분리 | P2 | 공통 | - | Edit Completed | O | O | web-PC | API 서비스 문서에서 크레딧 정보 분리하여 pricing.md로 이동 완료 |
| 파일명 자동 정리 | P3 | 공통 | - | Edit Completed | O | O | web-PC | 업로드 이미지 파일명 공백을 하이픈으로 자동 변환 기능 완료 |
| Netlify 배포 설정 | P1** | 공통 | - | Edit Completed | O | O | web-PC | Netlify 자동 배포 및 Decap CMS 연동 완료 |