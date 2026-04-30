# QA문서 작성방법

https://github.com/epicmobile18/hometips-strapi-ts/blob/develop/docs/qa/README.md

-- QA작업은 기능작동확인 위주라, 기능작동에는 영향은 없지만 "생산성이나 안전성, 각종 상황에서의 대응능력 등" 에 꼭 필요한 작업사항은, 각 repo별 별도 Checklist를 만들어서 관리한다

-- README.md에 작성된 QA table은, 너무 가로로 길면 확인하기 어렵다; -> 덜 중요한 property(컬럼)은 README.md QA table에 작성 하지 말기

-- QA내용이 많지 않다면, 그냥 qa-report-test-cases.md 파일 하나에 작성하기

-- QA내용-문서 개수가 많을 때는, docs/qa/ 폴더 내에, qa기능 분야 별로 md파일을 나눠서 작성하기
```plaintext
** dir file 예시
docs/
└── qa/
    ├── qa-overview.md
    ├── qa-ai-video.md
    ├── qa-ai-image.md
    ├── qa-ai-text.md
    ├── qa-ai-text-llm.md
    ├── qa-credit-exchange.md
    ├── qa-ui-defaults.md
    ├── qa-file-management.md
    ├── qa-admin-dashboard.md
    ├── qa-admin-dashboard-date-range.md
    ├── qa-api-auth.md
    ├── qa-credit-usage.md
    ├── test-plan.md
    ├── test-cases.md
    ├── test-execution.md
    ├── test-report.md
    ├── bug-log.md
    ├── ...
```

- qa내용-문서 작성시 이미지 설명이 필요하면, ./qa/ 폴더 내에 이미지 파일 저장 후에, qa문서 설명내용 작성시 이미지파일 url파일 추가하기

- 만약 Markdown 기반 위키나 정적 문서사이트(Docusaurus, VitePress 등)와 연동할 예정이라면, README.md를 docs/qa/ 폴더 내에 만들어 개요 페이지로 사용하는 것도 좋습니다.



### QA Table 메타데이터 공통내용 정의 - notion QA table 컬럼별 옵션 값과 동일하게 맞추기
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

Description 내용은 맨 오른쪽에 작성 - 중간에 content 내용이 있으면, md text문법으로 작성해야 하는 QA table 수정이 너무 어려움;
> [!TIP]
>**✨notion QA table 컬럼 순서랑, readme QA table 컬럼 순서랑 같게 맞추기 - 컬럼 순서 맞춰 놓으면, README.md의 table preview에서 ctrl+cv로 notion에 복사해서 붙여넣기 지원함**


### QA내용 생성용 ai prompt 작성 예시
```plaintext
당신은 QA 엔지니어입니다. 다음 기능에 대한 **“테스트 케이스(Test Cases)”**를 Markdown 표 형식으로 작성.

프로젝트: “MyApp 웹서비스”
버전: 1.2.0
기능 목록:
1. 회원가입
   - 입력 조건: 이메일 유효성 검사, 비밀번호 최소 8자, 비밀번호 확인 일치 여부
   - 예외 케이스: 이메일 중복, 비밀번호 형식 불일치 등
2. 로그인
   - 정상 로그인(이메일 + 비밀번호)
   - 비밀번호 입력 오류
   - 미가입 이메일 로그인 시도
3. 게시판 글쓰기
   - 제목 1~100자, 내용 1~1000자
   - 첨부파일(선택) 최대 10MB
4. 게시판 글 읽기/수정/삭제
   - 본인 작성 글만 수정/삭제 가능
   - 타인 게시글 수정/삭제 불가 예외 처리
5. 알림 기능
   - 댓글이 달리면 푸시 알림 발송(정상 동작)
   - 푸시 토큰 미등록 시 예외 처리

참고자료: (기존 qa-test-case-report.md 파일이 있다면) @qa-test-case-report.md 파일 내용 참고


기존 작성된 qa-test-case-report.md 파일에 qa내용이 있다면, 그 내용을 참고하여 작성하고, 기존 작성된 qa test case report는 수정하지 않는다.
(이 내용을 prompt로 작성 안하면, 기존에 작성이 완료된 qa test case report 내용을 계속 수정한다;)

(선택) 현재 명시한 기능 목록에 대한 qa test case report 생성하기
(기존에 작성 완료된 qa test case report 내용을 계속 생성하지 않게 하기 위한 prompt, 
이 내용을 안쓰니까, 기존에 작성이 완료된 qa test case report 내용을 계속 생성해서 햇갈림)


(qa 표 양식이 없다면)각 테스트 케이스별로 다음 열을 포함하는 Markdown 표를 생성.
- 테스트 ID
- 테스트 시나리오 설명
- 사전 조건(Pre-condition)
- 입력 데이터(Input)
- 실행 단계(Steps)
- 기대 결과(Expected Result)
- 실제 결과(테스트 수행 후 기입할 항목)
- 상태(Pass/Fail/Blocked)
- 비고
=> ai가 먼저 자유롭게 표 생성을 해보라고 시킨 다음에, 사람이 표 양식에 필요한 열을 추가 해서, 최종 표 양식을 완성 시키는 것이 편함
```

```plaintext
당신은 QA 엔지니어입니다. 릴리즈 전 점검해야 할 **“QA 체크리스트(QA Checklist)”**를 Markdown 표 형식으로 작성하기.

점검 항목 예시:
- 기능 완전성(Functionality)
  - 회원가입/로그인/로그아웃 테스트 완료
  - 주요 화면 버튼 동작 확인
- UI/UX (사용성)
  - 모바일/PC 레이아웃 깨짐 여부 검증
  - 폰트, 버튼 색상 일관성 확인
- 보안(Security)
  - SQL 인젝션 테스트
  - XSS 취약점 테스트
- 성능(Performance)
  - 페이지 로드 시간 < 2초(로그인 후)
  - 동시 사용자 100명 부하 테스트
- 호환성(Compatibility)
  - 주요 브라우저(Chrome, Firefox, Edge, Safari) 확인
  - 주요 해상도(1920x1080, 1366x768) 테스트
- 회귀(Regression)
  - 지난 릴리즈 주요 버그 수정사항 재검증
- 문서화(Documentation)
  - 사용법 가이드/API 문서 최신화 여부
- 기타(Other)
  - 로그 레벨 확인
  - 배포 스크립트 동작 확인

참고자료: (기존에 작성 완료된 devops-checklist.md 파일이 있다면) @devops-checklist.md 파일 내용 참고
```



### "기능 QA"가 아니라 **환경별 품질관리 체크리스트(QA Checklist)**에 해당시, 파일명 별 포함내용 예시

=> 예시이므로, 상황조건별 필요한대로 파일명 및 내용 작성하기

| 파일명                           | 설명                                           |
| ----------------------------- | -------------------------------------------- |
| `devops-checklist.md`        | DevOps 흐름 속 품질 검토 체크리스트일 경우에 어울림             |
| `environment-qa-checklist.md` | 배포 환경·도구별 QA 체크리스트라는 의미가 직관적으로 전달됨           |
| `deployment-qa-guide.md`      | 실행/배포 환경 중심의 QA 가이드용 문서일 경우                  |
| `infra-qa-checklist.md`       | 인프라·배포환경 QA에 초점 맞출 때                         |
| `non-functional-qa.md`        | 기능 외 QA (환경, 로깅, 용량, 빌드 셋업 등)에 해당하는 내용을 다룰 때 |
| `qa-system-check.md`          | 시스템 셋업, 설정 중심의 QA 문서일 경우                     |





## 참고자료 

에픽모바일 QA문서리스트: https://www.notion.so/epicmoble/QA-7228b572aa524cf3955742882d23760d?source=copy_link

#### **— QA 내용을 repo의 README.md에 작성하는 이유**

20250603 AI 가 README 문서내용도 잘 써주고, TDD코드도 너무 잘 짜줘서

QA내용 뭘 해야되는지 AI가 TABLE 형태로 더 잘 만들어줌 → QA문서 작성 시간 단축 및 인간이 빼먹을 수 있는 case를 줄이기 위해서, QA 내용을 README.md에 우선 작성 - 지금까지 작성된 QA내용 대부분 이미지는 없고 상세페이지도 없고 text로만 작성 되니까, md문법으로 작성해도 불편하지 않을 것 같음

⇒ 주요 QA내용 작성은, 기능을 직접만든 개발자 본인이 AI를 이용해서 QA상세내용을 생성 후 [repo project dir내 README.md(우선), notion QA문서리스트]에 작성하고 

⇒ notion QA문서 에는, code repo를 직접 수정하지 않는 비개발자 인력이, QA내용을 추가 수정 

[notion mcp in cursor](https://cursor.directory/mcp/notion-6) 로, README.md에 작성된 QA내용을 notion QA문서리스트에 작동작성되게 사용할까? 했는데, [notion-server](https://github.com/v-3/notion-server) 설정도 해야되고 복잡함;

=> 그냥 .md table로, AI Assistant 이용해서 qa내용 주로 작성하고 관리하는 것이 편함