# llm-platform LLM endpoints (내부, 비공개)

내부 개발자용. **공개 사이트(`docs/`)에는 아직 올리지 않았다**: 공개 가격과 사용자용 문서는 제품 결정이 필요하다. 공개용 초안은 `docs/` 와 같은 경로·이름으로 이 폴더에 있다: `api-services/llm-api.md`, `pricing.md`(조각), 한국어는 `i18n/ko/docusaurus-plugin-content-docs/current/` 아래. 확정되면 `docs/` 로 옮긴다. 요청·응답·에러의 상세 명세는 한 곳에만 둔다: 모노레포 `api-tests/azure-api-management/llm-platform/` (Bruno collection, 각 `.yml` 의 `docs:`). 이 문서는 어디에 무엇이 있는지와 상태만 적는다.

## 세 가지 길

| 길 | URL | 인증 | 과금 |
| --- | --- | --- | --- |
| **APIM (정식, 2026-11-24 게시)** | `POST https://api.kvid.ai/llm/chat/completions` | APIM 구독 키 (`api-key`) | 구독 키 소유자의 크레딧 차감. 항상 production |
| Strapi 직결 | `POST https://console.kvid.ai/api/llm/chat/completions` | 사용자 Strapi JWT | 크레딧 차감 (실제 토큰 사용량) |
| 게이트웨이 직접 | `https://llm-gateway-staging.kvid.ai/v1/...`, `https://llm-gateway-production.kvid.ai/v1/...` | virtual key (`x-bf-vk` 또는 `Authorization: Bearer`) | 크레딧 없음, 키별 한도만 |

- 지원 모델: `openrouter/openai/gpt-6-luna` 하나. 다른 모델은 게이트웨이 403 `model_blocked`, Strapi 400 `UNKNOWN_MODEL`.
- 게이트웨이는 인터넷에 `/v1/` 만 연다 (UI·관리 API 는 로그인이 없어 터널에서 막음: 그 밖의 경로는 404).
- 한도 (게이트웨이, 노드 단위, 재배포하면 사용량 초기화): 개발 환경이 쓰는 `developers` 키는 분당 60회 · 시간당 2,000,000 토큰 · 월 $100. 배포된 Strapi 의 키는 한도 없음 (과금은 Strapi 가 한다).

## 호출 예

```bash
# 0) APIM (정식): 구독 키로 호출 — 구독 키 소유자의 크레딧이 차감된다
curl -s https://api.kvid.ai/llm/chat/completions -H "api-key: $APIM_KEY" -H 'content-type: application/json' \
  -d '{"model":"openrouter/openai/gpt-6-luna","max_tokens":300,"messages":[{"role":"user","content":"Say hi in 3 words."}]}'

# 1) Strapi 직결: 사용자 JWT 를 받아 호출 (크레딧이 차감된다; 응답 헤더 x-llm-platform-charged-micro-credits)
JWT=$(curl -s -X POST https://console.kvid.ai/api/auth/local -H 'content-type: application/json' \
  -d '{"identifier":"<email>","password":"<password>"}' | jq -r .jwt)
curl -s https://console.kvid.ai/api/llm/chat/completions -H "authorization: Bearer $JWT" -H 'content-type: application/json' \
  -d '{"model":"openrouter/openai/gpt-6-luna","max_tokens":300,"messages":[{"role":"user","content":"Say hi in 3 words."}]}'

# 2) 게이트웨이 직접 (개발 환경: staging + developers 키)
curl -s https://llm-gateway-staging.kvid.ai/v1/chat/completions -H "x-bf-vk: $KVIDAI_LLM_GATEWAY_KEY" -H 'content-type: application/json' \
  -d '{"model":"openrouter/openai/gpt-6-luna","max_tokens":300,"messages":[{"role":"user","content":"Say hi in 3 words."}]}'
```

`max_tokens` 는 reasoning 토큰도 센다: 너무 작으면 보이는 답 없이 끝난다 (300 권장). Strapi 경로의 기본 출력 한도는 4096, 상한은 8192.

## 가격

Strapi 경로의 가격은 가격표(`pricing-table`, `service_type=llm_api`)에 있고 **이 사이트의 `docs/pricing.md` 에는 아직 없다** (공개 가격 확정은 제품 결정). 현재 값 (1K 토큰당 크레딧, OpenRouter 정가 × 1.2): 입력 0.012, 출력 0.06, 캐시 읽기 0.0012, 캐시 쓰기 0.015. 최소 차감 단위 0.01 크레딧. 값은 운영팀이 Strapi 콘솔에서 바꿀 수 있어 코드의 `apps/strapi-ts/database/pricing-config.ts` 와 다를 수 있다 (production 이 기준).

## 상태와 검증 (2026-11-24)

- staging, production 모두 게이트웨이 공개 URL 점검 14/14, Strapi 경로 실제 호출 6/6.
- APIM `llm` API 는 2026-11-24 게시됐다 (`infrastructure/azure-apim/artifacts/apis/llm`, 정책은 production 백엔드와 서버 토큰, 키 없음 401 · 구독 키 200 실측). 남은 일: 공개 `docs/api-services/` 의 사용법 페이지와 `docs/pricing.md` 의 가격 (제품 결정).
- 구현·운영: 모노레포 `services/llm-platform/` (게이트웨이 설정·배포), `apps/strapi-ts/src/api/llm-chat-completions/` (Strapi 경로).
