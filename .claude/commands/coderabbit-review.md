---
description: 별 10개 미만 공개 저장소라 자동 리뷰가 꺼진 CodeRabbit 리뷰를 PR 코멘트로 수동 실행
allowed-tools: Bash(gh:*), Bash(git:*)
argument-hint: [PR 번호] [full]
---

# CodeRabbit Review Trigger

CodeRabbit은 **별 10개 미만 공개 저장소에서 리뷰를 수동으로만 실행**합니다 ([Plans 문서](https://docs.coderabbit.ai/management/plans.md)).
`.coderabbit.yaml`의 `auto_review.enabled: true`와 무관하게 PR을 열면 "This repository does not receive automatic reviews because it has fewer than 10 stars." 안내만 남기므로, 이 스킬로 리뷰 요청 코멘트를 남깁니다.

## 인자

`$ARGUMENTS`

- PR 번호: 없으면 현재 브랜치의 PR을 사용합니다.
- `full`: 포함되면 `@coderabbitai full review`(PR 전체 재리뷰), 없으면 `@coderabbitai review`(마지막 리뷰 이후 변경분)를 요청합니다.

## 실행 단계

### 1. 대상 PR 확인

```bash
# 인자로 번호가 없으면 현재 브랜치의 PR
gh pr view [<PR 번호>] --json number,url,state,headRefOid -q '.'
```

- PR이 없거나 `state`가 `OPEN`이 아니면 중단합니다.

### 2. 수동 실행이 필요한지 확인

```bash
gh repo view --json stargazerCount,visibility -q '.'
```

- 별이 10개 이상이거나 비공개 저장소면 자동 리뷰 대상이므로, 코멘트를 남기지 않고 그 사실만 알립니다.

### 3. 중복 요청 방지

CodeRabbit 상태 코멘트와 기존 요청 코멘트를 확인합니다.

```bash
gh api repos/{owner}/{repo}/issues/<PR 번호>/comments \
  --jq '.[] | select(.user.login == "coderabbitai[bot]" or (.body | test("@coderabbitai (full )?review"))) | {user: .user.login, created_at, body: (.body | .[0:600])}'
```

다음 중 하나면 새 코멘트를 남기지 않습니다 (`full` 인자가 있으면 무시하고 진행).

- 상태 코멘트가 `Currently processing`(리뷰 진행 중)을 표시
- 상태 코멘트의 `Trigger review` 체크박스가 이미 체크됨(`[x]`)
- 현재 head 커밋(`headRefOid`) 이후에 이미 `@coderabbitai review` 요청 코멘트가 있음

### 4. 리뷰 요청

```bash
gh pr comment <PR 번호> --body "@coderabbitai review"
# full 인자가 있으면
gh pr comment <PR 번호> --body "@coderabbitai full review"
```

코멘트는 사용자 계정으로 남깁니다. 봇 계정(GitHub Actions 등)의 코멘트는 CodeRabbit이 무시할 수 있습니다.

### 5. 출력

- 요청했으면: 남긴 코멘트 URL과 "리뷰는 보통 수 분 내에 PR에 달립니다" 안내
- 건너뛰었으면: 건너뛴 이유(자동 리뷰 대상 / 이미 진행 중 / 이미 요청됨)
