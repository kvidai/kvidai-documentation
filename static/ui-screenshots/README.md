# UI Screenshots

주요 페이지 UI 스크린샷. UI 변경 시 업데이트 후 커밋.
업데이트 방법: `apps/web-service/CLAUDE.md` → "Browser Automation & UI 스크린샷 테스트" 섹션 참조.

## 비로그인 (Public)

| 파일 | URL |
|------|-----|
| home.png | `/en/` |
| login.png | `/en/login` |
| register.png | `/en/register` |
| forgot-password.png | `/en/auth/forgot-password` |
| credits-purchase.png | `/en/credits/purchase` |
| openclaw.png | `/en/openclaw` (비로그인 시 인증 필요 메시지) |

## 로그인 후 (Authenticated)

테스트 계정: `user1@test.kvidai.local` (`.env.test` 참조)

| 파일 | URL |
|------|-----|
| dashboard.png | `/en/dashboard` |
| generate-image.png | `/en/generate/image` |
| generate-text-to-video.png | `/en/generate/text-to-video` |
| generate-image-to-video.png | `/en/generate/image-to-video` |
| generate-lip-sync.png | `/en/generate/talk-v2v` |
| my-content.png | `/en/content` |
| credits.png | `/en/credits` |
| plugin-attendance-card.png | `/en/credits` (플러그인 `credits.page` 슬롯의 출석 카드 — mocked backend, `tests/e2e/plugin-slots.spec.ts`) |
| openclaw-logged-in.png | `/en/openclaw` (로그인 후 VM 목록) |
| print-design-agent-empty.png | `/en/print-design` (초기/빈 상태) |
| print-design-agent-gallery-passed.png | `/en/print-design` (페이지 갤러리, preflight Pass, print-ready — mocked SSE) |
| print-design-agent-blocked.png | `/en/print-design` (preflight 실패/human 이관 상태 — mocked SSE) |

## 공유 복사본 (shared copies, mocked backend — `UI_SCREENSHOTS=1`로 `tests/e2e/shared-copies-screenshots.spec.ts` 실행)

각각 `-en.png` / `-ko.png` 두 장.

| 파일 | URL |
|------|-----|
| shared-copy-share-confirm-{en,ko}.png | `/{locale}/print-design` → My designs → 공유 (수정 전/후 비교 확인 패널, 점검 못 한 파일 안내) |
| shared-copy-progress-{en,ko}.png | `/{locale}/print-design` → My designs → 공유 → 점검 중 진행 안내 (서버가 알려 준 단계, 점검 대상 개수, 점검 못 하는 영상 안내, 경과 시간, 취소) |
| shared-copy-my-copies-{en,ko}.png | `/{locale}/content` ("내가 공유한 복사본") |
| shared-copy-content-check-{en,ko}.png | `/{locale}/print-design` → My designs → 콘텐츠 점검 결과 |
| shared-copy-upload-removed-{en,ko}.png | 업로드 파일이 정책 위반으로 삭제되었다는 토스트 |
| shared-copy-template-detail-{en,ko}.png | `/{locale}/gallery/templates/:id` ("이 템플릿으로 시작" 버튼) |

- [Attachment warnings (isolated mocked web-component verification)](./attachment-upload/README.md)
