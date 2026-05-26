# Meilisearch Search Setup — Netlify + docs-scraper + GitHub Actions

Coding agent용 재현 가이드. 다른 환경에서 처음부터 세팅할 때 이 문서만 보면 됨.

---

## 아키텍처

```
[Netlify deploy succeeded]
  └─ Netlify Build Plugin (plugins/trigger-scrape/index.js)
       └─ POST /repos/kvidai/kvidai-documentation/dispatches  (GITHUB_PAT 사용)
            └─ GitHub Actions: .github/workflows/meilisearch-scrape-docs.yml
                 ├─ python3 scripts/meilisearch-generate-scraper-config.py
                 ├─ docker run getmeili/docs-scraper  →  Meilisearch Cloud index push
                 └─ python3 scripts/meilisearch-add-lang-field.py  →  lang 필드 PUT
```

- Production deploy → `docs` index
- Deploy preview → `docs-staging` index
- 인덱스 스키마: DocSearch 호환 (hierarchy.lvl0~lvl6, content, url, objectID)
- lang 필드: URL에 `/ko/` 포함 여부로 분류 (en/ko)

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `.meilisearch-docs-scraper.json` | scraper 설정 (selectors, filterableAttributes: ["lang"]) |
| `.github/workflows/meilisearch-scrape-docs.yml` | GitHub Actions workflow |
| `scripts/meilisearch-generate-scraper-config.py` | index_uid/start_url/sitemap을 env로 받아 /tmp/scraper-config.json 생성 |
| `scripts/meilisearch-add-lang-field.py` | 인덱싱 후 문서마다 lang 필드 PUT (부분 업데이트) |
| `plugins/trigger-scrape/index.js` | Netlify Build Plugin — onSuccess에서 GitHub dispatch 호출 |
| `netlify.toml` | `[[plugins]] package = "./plugins/trigger-scrape"` 등록 |
| `src/theme/SearchBar.tsx` | 검색 위젯 — en locale은 `lang = "en"` 필터 적용 |

---

## 필요한 계정/권한

- **Meilisearch Cloud**: index 생성 권한 (admin API key)
- **GitHub**: `repo` scope PAT (repository_dispatch 트리거용)
- **Netlify**: 프로젝트 env 설정 권한

---

## 1단계: GitHub Secrets 설정

workflow에서 사용하는 secrets. GitHub repo → Settings → Secrets에 추가.

```bash
# gh CLI로 설정 (kvidai/kvidai-documentation repo 기준)
gh secret set MEILISEARCH_HOST_URL \
  --repo kvidai/kvidai-documentation \
  --body "https://ms-XXXXXXXX-XXXXX.jpn.meilisearch.io"

gh secret set MEILISEARCH_ADMIN_API_KEY \
  --repo kvidai/kvidai-documentation \
  --body "<admin-api-key-from-meilisearch-cloud>"
```

> **주의**: `MEILISEARCH_ADMIN_API_KEY`는 write 권한 — 절대 클라이언트 코드에 넣지 말 것.
> SearchBar.tsx는 별도 read-only search key 사용 (`MEILISEARCH_SEARCH_API_KEY` → `.env.local`).

---

## 2단계: Netlify 환경변수 설정

Netlify Build Plugin이 GitHub dispatch를 호출할 때 사용하는 PAT.

```bash
# netlify CLI로 설정
netlify env:set GITHUB_PAT "<github-pat-with-repo-scope>" \
  --context production,deploy-preview,branch-deploy

# deploy-preview는 docs-staging 인덱스 사용 (trigger-scrape plugin이 자동 분기)
# MEILISEARCH_INDEX_UID는 plugin이 CONTEXT 값으로 판단하므로 별도 설정 불필요
```

**GitHub PAT 발급 방법:**
1. GitHub → Settings → Developer settings → Personal access tokens (classic)
2. 권한: `repo` (repository_dispatch 호출에 필요)

---

## 3단계: Meilisearch Index 초기 설정

인덱스가 없으면 scraper가 첫 실행 시 자동 생성.
단, `filterableAttributes`는 scraper config의 `custom_settings`에서 설정됨.

```json
// .meilisearch-docs-scraper.json 핵심 설정
{
  "custom_settings": {
    "filterableAttributes": ["lang"],   // ← 반드시 lang 포함
    "distinctAttribute": "url"
  }
}
```

> **핵심 주의**: `filterableAttributes: ["tags"]`로 두면 lang 필터가 동작하지 않음.
> scraper 실행 시마다 이 설정으로 index settings를 덮어쓰기 때문.

---

## 4단계: Workflow 파일 위치 확인

`repository_dispatch`와 `workflow_dispatch` 모두 **default branch(main)** 에서 실행됨.
workflow 파일과 script 파일이 `main` 브랜치에 있어야 함.

```bash
# 확인
gh api repos/kvidai/kvidai-documentation/contents/.github/workflows?ref=main \
  --jq '.[].name'
# → meilisearch-scrape-docs.yml 있어야 함
```

`develop`에서 작업 후 main에 반영 방법:
```bash
# main이 diverge된 경우 gh api로 직접 push
SHA=$(gh api repos/.../contents/<path>?ref=main --jq '.sha')
B64=$(base64 -w0 <local-file>)
gh api -X PUT repos/.../contents/<path> \
  -f message="..." -f content="$B64" -f sha="$SHA" -f branch="main"

# 새 파일 생성 (sha 없이)
gh api -X PUT repos/.../contents/<path> \
  -f message="..." -f content="$B64" -f branch="main"
```

---

## 5단계: 수동 테스트

```bash
# workflow 수동 트리거
gh workflow run meilisearch-scrape-docs.yml \
  --repo kvidai/kvidai-documentation

# 실행 감시
gh run list --repo kvidai/kvidai-documentation \
  --workflow=meilisearch-scrape-docs.yml --limit 1
gh run watch <run-id> --repo kvidai/kvidai-documentation
```

---

## 6단계: 검색 필터 동작 확인

```bash
# .env.local의 MEILISEARCH_URL, MEILISEARCH_SEARCH_API_KEY 사용
set -a && source .env.local && set +a
HOST="https://$MEILISEARCH_URL"

# 영어 필터
curl -s -H "Authorization: Bearer $MEILISEARCH_SEARCH_API_KEY" \
  -X POST "$HOST/indexes/docs/search" \
  -H "Content-Type: application/json" \
  -d '{"q":"video","filter":"lang = \"en\"","limit":3}' \
  | python3 -c "import json,sys; r=json.load(sys.stdin); print('en:', r['estimatedTotalHits'], 'hits')"

# 한국어 필터
curl -s -H "Authorization: Bearer $MEILISEARCH_SEARCH_API_KEY" \
  -X POST "$HOST/indexes/docs/search" \
  -H "Content-Type: application/json" \
  -d '{"q":"video","filter":"lang = \"ko\"","limit":3}' \
  | python3 -c "import json,sys; r=json.load(sys.stdin); print('ko:', r['estimatedTotalHits'], 'hits')"

# 정상: en ≈ 94, ko ≈ 56 (숫자는 문서 수에 따라 달라짐)
```

---

## SearchBar 동작 원리

```
English locale (/docs/...) → filter: 'lang = "en"' → 영어 결과만
Korean locale (/ko/docs/...) → 필터 없음 → en+ko 전체 (한국어 쿼리는 ko 상위 랭크)
```

`src/theme/SearchBar.tsx`:
```tsx
...(i18n.currentLocale === 'en' && { searchParams: { filter: 'lang = "en"' } }),
```

---

## Staging 환경 (Preview 배포)

### 인덱스 구조

| 환경 | Meilisearch 인덱스 | 데이터 소스 |
|------|-------------------|------------|
| Production (`docs.kvid.ai`) | `docs` | Netlify onSuccess 자동 트리거 |
| Staging (Netlify preview) | `docs-staging` | **수동 실행 필요** |
| 로컬 개발 | `docs` (`.env.local`) | production 인덱스 공유 |

### Preview URL에서 자동 스크레이프가 안 되는 이유

Netlify preview URL 형식: `https://main--kvidai-documentation.netlify.app/`

`getmeili/docs-scraper` 내부의 `to_other_scheme()` 함수가 URL을 정규식으로 파싱해 http↔https 전환 URL을 만드는데, `--` 포함 서브도메인이 regex에 매칭 안 됨 → `assert match` → `AssertionError`.

→ `plugins/trigger-scrape/index.js`에서 `CONTEXT !== 'production'`이면 dispatch skip하도록 처리됨.

### Netlify Custom Preview Domain (`deploy-preview-123.docs.kvid.ai`)

Netlify 대시보드에 deploy preview 전용 서브도메인 기능이 있으나, **Netlify DNS 관리가 필요**. `kvid.ai`는 Cloudflare DNS라서 사용 불가. Cloudflare wildcard CNAME만으로는 Netlify가 SSL 인증서를 자동 발급하지 못함. 해결하려면 `docs.kvid.ai` 서브도메인을 Netlify DNS로 위임하거나 전체 DNS를 이전해야 함.

> 참고: 이 형식(`deploy-preview-123.docs.kvid.ai`)은 `--` 없는 일반 서브도메인이라 docs-scraper가 파싱 가능 → DNS 이전 시 자동 staging 스크레이프도 가능해짐.

### Staging 인덱스 수동 업데이트

Preview 배포에서 검색 기능 테스트가 필요할 때 실행. `docs.kvid.ai`(production URL)를 크롤링해 `docs-staging` 인덱스에 채움.

```bash
gh workflow run meilisearch-scrape-docs.yml \
  --repo kvidai/kvidai-documentation \
  -f index_uid=docs-staging \
  -f start_url=https://docs.kvid.ai/
```

실행 후 Netlify preview URL 접속 → 검색 작동 확인.

> staging 인덱스는 preview URL 콘텐츠가 아닌 production 기준 데이터임. 새 문서를 추가하고 preview에서 해당 문서가 검색되길 원하면 production merge 후 scrape 실행.

---

## 자주 발생한 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| lang 필터 0 hits | `filterableAttributes`가 `["tags"]` 또는 `["lang"]` 아님 | `.meilisearch-docs-scraper.json` 확인 후 workflow 재실행 |
| workflow 404 | workflow 파일이 default branch(main)에 없음 | gh api로 main에 직접 push |
| 검색 결과 없음 | SearchBar에서 `tags = "en"` 필터 사용 (filterableAttribute 아님) | `lang = "en"`으로 수정 |
| POST로 lang 추가 시 데이터 유실 | POST = 전체 replace | 반드시 `PUT` 사용 (부분 업데이트) |
| Netlify plugin 미작동 | `GITHUB_PAT` env 미설정 또는 repo 권한 없음 | PAT 권한 확인, netlify env:set 재실행 |
