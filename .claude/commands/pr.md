---
description: PR 템플릿 기반으로 git history를 분석하여 PR 설명을 생성하고 gh로 PR까지 생성
allowed-tools: Bash(git:*), Bash(gh:*), Bash(mktemp:*), Read, Write, Skill
argument-hint: [base-branch]
---

# PR Description Generator

PR 템플릿(`.github/pull_request_template.md`)과 git history를 분석하여 PR 설명을 생성하고, `gh pr create`로 PR까지 생성합니다.

## 실행 단계

### 1. PR 템플릿 읽기

`.github/pull_request_template.md` 파일을 읽어 템플릿 구조를 파악합니다.

### 2. Git 컨텍스트 수집

Base branch를 결정합니다:

- `$ARGUMENTS` 인자가 있으면 해당 브랜치 사용
- 없으면 `main` 사용

다음 git 명령어들을 실행하여 컨텍스트를 수집합니다.
비교 기준은 로컬 브랜치가 아니라 `origin/<base-branch>`입니다. 현재 브랜치가 base branch 자체여도(로컬 `main`에 커밋한 경우) push 대상 커밋을 잡을 수 있습니다.

```bash
# 원격 base 최신화
git fetch origin <base-branch>

# 현재 브랜치
git branch --show-current

# 커밋 로그 (base branch 이후)
git log origin/<base-branch>..HEAD --pretty=format:"%h %s%n%b---"

# 변경 파일 요약
git diff --stat origin/<base-branch>...HEAD

# 전체 diff
git diff origin/<base-branch>...HEAD
```

### 3. 변경 사항 분석

**변경 유형 감지 (커밋 prefix 기반):**

| Prefix             | 변경 유형                               |
| ------------------ | --------------------------------------- |
| `feat:`, `*/feat:` | ✨ 새로운 기능 (New feature)            |
| `fix:`, `*/fix:`   | 🐛 버그 수정 (Bug fix)                  |
| `refactor:`        | 🎨 코드 리팩토링 (Code refactoring)     |
| `ui:`, `style:`    | 🎨 프론트엔드 UI/UX (Frontend UI/UX)    |
| `docs:`            | 📚 문서 업데이트 (Documentation update) |
| `test:`            | 🧪 테스트 관련 (Test related)           |
| `perf:`            | ⚡ 성능 개선 (Performance improvement)  |
| `chore:`, `lint:`  | 🔧 설정 변경 (Configuration change)     |
| `docker:`          | 🐳 Docker 관련 (Docker related)         |

**영향 범위 감지 (파일 경로 기반):**

| 경로 패턴                          | 영향 범위                          |
| ---------------------------------- | ---------------------------------- |
| `apps/ssurak/`                     | 백엔드 API (Backend API)           |
| `apps/order/`, `apps/console/`     | 프론트엔드 UI (Frontend UI)        |
| `packages/db/`, `prisma/`          | 데이터베이스 (Database)            |
| `docker-compose.yml`, `Dockerfile` | Docker 설정 (Docker Configuration) |
| 그 외                              | 기타 (Other)                       |

### 4. PR 템플릿 섹션 작성

#### 설명 (Description)

커밋 메시지와 diff를 기반으로 목적과 변경 내용을 요약합니다.

**GitHub 마크다운 포맷팅 규칙:**

1. ### 번호 + 제목으로 주요 변경 사항을 구분
2. **백틱(`)**으로 코드, 컴포넌트명, 파일명, 태그 강조
3. **화살표(→)**로 변경 전/후를 명확하게 표현
4. **불릿 포인트(-)**로 세부 설명 추가

**출력 형식 예시:**

```markdown
### 1. Compound Component 패턴 적용

- `TableOrderList` → `TableOrderCard` compound component로 리팩토링
- `OrderCard.Header`, `OrderCard.Body`, `OrderCard.Footer` 서브 컴포넌트 분리

### 2. Web Accessibility 향상

- 테이블 클릭 시 상세 페이지 이동 로직을 `<button>` → `<Link>` 태그로 변경하여 웹 표준 준수
- click event가 있는 요소에 `tabIndex`, `disabled` 속성 추가

### 3. 타입 안정성 개선

- `OrderTableProps` 타입에 `orderStatus` 필드 추가
- `any` 타입 → 명시적 타입으로 변경
```

**작성 원칙:**

- 추상적 표현 대신 구체적 기술 내용 작성
  - 나쁜 예: "접근성 개선"
  - 좋은 예: "`<button>` → `<Link>` 태그로 변경하여 웹 표준 준수"
- 실제 변경된 파일, 컴포넌트, 로직을 구체적으로 명시
- 커밋 메시지의 prefix별로 그룹화하여 정리

#### 변경 유형 (Type of Change)

- 감지된 유형만 체크 (`[x]`)로 표시
- 해당하지 않는 유형은 삭제

#### 영향 범위 (Scope)

- 감지된 범위만 체크 (`[x]`)로 표시
- 해당하지 않는 범위는 삭제

#### 테스트 (Testing)

변경 유형에 따른 적절한 테스트 유형 제안:

- Backend 변경: API 테스트, 단위 테스트
- Frontend 변경: 프론트엔드 테스트, 수동 테스트
- Database 변경: 통합 테스트

#### 테스트 단계 (Test Steps)

실제 변경 사항 기반 구체적인 테스트 단계 작성:

1. 구체적인 테스트 시나리오
2. 예상 결과
3. 확인 방법

#### 체크리스트 (Checklist)

모든 항목 미체크 상태(`[ ]`)로 유지 (작성자가 확인)

#### 관련 Issue

커밋 메시지에서 issue 참조 추출 (예: "Fixes #123", "Closes #456")

#### 스크린샷/화면 녹화

Frontend UI 변경이 감지되면 스크린샷 추가 안내 문구 작성

#### 데이터베이스 마이그레이션

- `packages/db/` 또는 `prisma/` 변경이 있으면: `[x] 데이터베이스 마이그레이션 필요`
- 없으면: `[x] 데이터베이스 마이그레이션 불필요`

#### 설정 변경 (Configuration Changes)

변경된 설정 파일 명시 (.env, package.json, tsconfig 등)

#### 배포 참고사항 (Deployment Notes)

- DB 마이그레이션 실행 필요 여부
- 환경변수 추가/변경 여부
- 의존성 설치 필요 여부

#### 추가 정보 (Additional Information)

커밋 메시지의 body에서 추가 컨텍스트 추출

### 5. PR 제목 생성

커밋 메시지를 분석하여 PR 제목을 생성합니다.

**제목 작성 규칙:**

1. Conventional Commits 형식 사용: `type(scope): description`
2. 70자 이내로 작성
3. 주요 변경 사항을 간결하게 요약
4. 여러 유형의 변경이 있을 경우 가장 중요한 것을 선택

**유형 우선순위:**

1. `feat` - 새로운 기능이 포함된 경우
2. `fix` - 버그 수정이 주요 목적인 경우
3. `refactor` - 코드 구조 개선이 주요 목적인 경우
4. `chore` - 설정/유지보수 변경인 경우

**scope 결정:**

- 단일 앱/패키지 변경: 해당 앱/패키지명 (예: `ssurak`, `console`, `db`)
- 여러 앱/패키지 변경: 가장 영향이 큰 것 또는 생략

**예시:**

```text
feat(ssurak): Owner/Admin 통합 인증 시스템 구축
refactor(ssurak): 도메인 기반 모듈 아키텍처 재설계
fix(console): 주문 목록 필터링 및 데이터 동기화 오류 수정
chore: reactCompiler 설정 제거 및 API 버전화 적용
```

### 6. PR 생성 (gh)

작성한 제목과 본문으로 PR을 생성합니다.

1. **사전 확인**
   - 현재 브랜치가 base branch이거나 `main`이면 중단하지 않고 새 브랜치를 만들어 이어갑니다.
     - `git log origin/<base-branch>..HEAD`의 커밋을 분석해 `<type>/<kebab-case-요약>` 형식의 브랜치명을 정합니다 (예: `fix/realtime-handshake-token-refresh`, `feat/deleted-menu-restore`). type은 5단계의 PR 제목 type과 맞추고, 요약은 영어 소문자로 3~5단어 이내로 작성합니다.
     - `git switch -c <새 브랜치>`로 현재 커밋에서 브랜치를 만든 뒤, 로컬 base 브랜치는 `git branch -f <base-branch> origin/<base-branch>`로 원격 상태로 되돌립니다 (커밋은 새 브랜치에 남습니다).
     - `origin/<base-branch>` 이후 커밋이 없으면 PR로 만들 변경이 없으므로 중단합니다.
   - `gh pr view --json url -q .url`로 이미 열린 PR이 있는지 확인합니다. 있으면 새로 만들지 않고 `gh pr edit --title ... --body-file ...`로 갱신할지 사용자에게 묻습니다.
   - `git status -sb`로 원격 추적 브랜치와 비교해 push되지 않은 커밋이 있으면 `git push -u origin <현재 브랜치>`를 먼저 실행합니다 (pre-push 훅이 `pnpm build`를 돌립니다).
2. **본문 파일 작성**: 백틱·따옴표가 셸에서 깨지지 않도록 본문은 `mktemp`로 만든 임시 파일에 Write 도구로 저장합니다.
3. **생성**

   ```bash
   gh pr create --base <base-branch> --head <현재 브랜치> --title "<PR 제목>" --body-file <본문 파일>
   ```

### 7. CodeRabbit 리뷰 요청

PR이 새로 생성되었으면 Skill 도구로 `coderabbit-review` 스킬을 생성된 PR 번호와 함께 호출합니다 (`args: "<PR 번호>"`).
이 저장소는 별 10개 미만 공개 저장소라 CodeRabbit 자동 리뷰가 동작하지 않기 때문입니다. 실행 여부·중복 판단은 해당 스킬이 담당합니다.
기존 PR을 `gh pr edit`으로 갱신만 한 경우에는 호출하지 않습니다.

### 8. 출력

**출력 순서:**

1. PR 제목 (## PR 제목)
2. 생성된 PR URL
3. CodeRabbit 리뷰 요청 결과 (요청한 코멘트 URL 또는 건너뛴 이유)
4. PR 본문은 다시 출력하지 않습니다 (PR 페이지에서 확인). `gh` 실행이 실패한 경우에만 본문을 마크다운 코드 블록으로 출력해 수동으로 붙여넣을 수 있게 합니다.
