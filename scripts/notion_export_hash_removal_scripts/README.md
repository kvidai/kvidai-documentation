# Notion Export Hash Removal Scripts

이 디렉토리는 Notion에서 export한 파일들의 hash suffix를 제거하는 스크립트들을 포함하고 있습니다.

## 문제 상황

Notion에서 페이지를 export할 때, 파일명 뒤에 hash 값이 붙어서 저장됩니다:
- 예: `홈팁스 콘솔 - 카페 글쓰기 예약 3df28ca81aa24200bb703731fd80d1b4.md`

이는 다음과 같은 문제를 야기합니다:
- OS 파일명 길이 제한 문제
- 호스팅 URL에 hash string 표시
- 가독성 저하
- 내부 링크 참조 복잡성

## 스크립트 목록

### 주요 스크립트

#### 1. `remove_hash_suffixes_final.sh`
**가장 완성된 파일명 정리 스크립트**
- 32자 hex hash suffix 자동 감지 및 제거
- 한글 문자 지원
- 중첩 디렉토리 처리 (깊은 레벨부터)
- 충돌 감지 및 백업 생성
- 매핑 파일 생성

```bash
cd /path/to/target/directory
./scripts/remove_hash_suffixes_final.sh [--dry-run]
```

#### 2. `generate_comprehensive_mappings.py`
**경로 매핑 분석 스크립트**
- 디렉토리 구조 분석
- hash suffix가 있는 파일/폴더 식별
- 변경 전후 경로 매핑 생성

```bash
python ./scripts/generate_comprehensive_mappings.py
```

#### 3. `update_markdown_links_v2.py`
**마크다운 내부 링크 업데이트 스크립트**
- 매핑 파일 기반 링크 수정
- URL encoding/decoding 지원
- 자동 백업 생성
- 상세 로그 기록

```bash
python ./scripts/update_markdown_links_v2.py
```

### 보조 스크립트

#### 단순 실행용
- `direct_rename.sh` - 직접 실행형 간단 버전

#### 검증/분석용
- `verification_summary.py` - 결과 검증용

## 사용 방법

### 완전 자동화 실행
```bash
# 1. 백업 생성 및 파일명 정리
./scripts/remove_hash_suffixes_final.sh

# 2. 마크다운 링크 업데이트
python ./scripts/update_markdown_links_v2.py
```

### 단계별 실행
```bash
# 1. 현재 상태 분석
python ./scripts/generate_comprehensive_mappings.py

# 2. 테스트 실행 (실제 변경 없음)
./scripts/remove_hash_suffixes_final.sh --dry-run

# 3. 실제 파일명 변경
./scripts/remove_hash_suffixes_final.sh

# 4. 마크다운 링크 업데이트
python ./scripts/update_markdown_links_v2.py
```

## 주요 기능

### 파일명 정리 기능
- ✅ 32자 hex hash suffix 제거 (`1ab228ab36a0802f9f4ccaecf8be36d4` 형태)
- ✅ 파일 확장자 보존
- ✅ 한글 및 특수문자 지원
- ✅ 중첩 디렉토리 처리
- ✅ 충돌 감지 및 회피
- ✅ 자동 백업 생성

### 링크 업데이트 기능
- ✅ 마크다운 내부 링크 자동 수정
- ✅ URL encoding/decoding
- ✅ 상대 경로 지원
- ✅ 이미지 링크 지원
- ✅ 패턴 기반 매칭

## 생성되는 파일들

### 로그 파일 (`.gitignore`에 포함됨)
- `hash_mapping.txt` - 파일명 변경 매핑
- `comprehensive_mapping.txt` - 종합 매핑 정보
- `link_update_*.log` - 링크 업데이트 로그
- `verification_*.log` - 검증 로그

### 백업 디렉토리 (`.gitignore`에 포함됨)
- `backup_*` - 자동 백업 폴더
- `*_backup/` - 백업 디렉토리 패턴

## 예시

### 변경 전
```
제품서비스 매뉴얼 223228ab36a080e7a125cb37d6573e10/
├── API 데이터 솔루션 - 홈팁스 BIZ fbf293e16ca04d6dbb93d39f0a82c641.md
└── 홈팁스 콘솔 - AI 미디어 자동생성 초기설정 208228ab36a0803aa18ef6af4d0cccf3.md
```

### 변경 후
```
제품서비스 매뉴얼/
├── API 데이터 솔루션 - 홈팁스 BIZ.md
└── 홈팁스 콘솔 - AI 미디어 자동생성 초기설정.md
```

## 주의사항

1. **백업 필수**: 모든 스크립트는 자동 백업을 생성하지만, 수동 백업도 권장
2. **테스트 실행**: `--dry-run` 옵션으로 먼저 테스트
3. **권한 확인**: 스크립트 실행 권한 필요 (`chmod +x script_name.sh`)
4. **경로 확인**: 올바른 디렉토리에서 실행

## 문제 해결

### 권한 오류
```bash
chmod +x ./scripts/*.sh
```

### 한글 인코딩 문제
```bash
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

### Python 스크립트 실행 오류
```bash
python3 ./scripts/script_name.py
```

---

**작성일**: 2025-07-14  
**버전**: 1.0  
**목적**: Notion export 파일의 hash suffix 제거 및 내부 링크 정리