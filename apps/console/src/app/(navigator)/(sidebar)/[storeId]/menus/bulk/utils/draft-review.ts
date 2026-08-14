import { PRICE_MAX } from "@ssurak/api/schemas/common";
import {
  BulkMenuItem,
  MenuDraftItemPayload,
} from "@ssurak/api/schemas/model/menuDraft.schema";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import {
  MenuDraftIssue,
  MenuDraftItem,
} from "@ssurak/api/types/menuDraft/menuDraft.interface";

/**
 * 리뷰 화면이 한 행에 대해 들고 있는 값.
 *
 * `excluded`는 서버 계약에 없다 — 초안 항목에 제외 플래그가 없어서 로컬 상태로만 둔다.
 * 저장(PATCH)에는 제외한 행도 그대로 실어 보내고, 등록(bulk)에서만 뺀다. 새로고침하면
 * 수동 제외는 풀리지만 이름이 겹치는 행은 서버가 `DUPLICATE_NAME`을 다시 계산해 주므로
 * 자동 제외가 그대로 재현된다.
 */
export type DraftItemFormValue = {
  name: string;
  price: number | null;
  description: string | null;
  /** 기존 카테고리를 고른 경우. `categoryName`는 채우지 않는다. */
  categoryId?: string;
  /** 매장에 없는 카테고리를 새로 만들 경우. 등록 시점에 서버가 만들어 준다. */
  categoryName?: string;
  /** 제외된 행을 표시한다. 서버에 보내지 않는다. */
  excluded: boolean;
  /**
   * 추출 시점에 서버가 붙인 정보성 표시. 조치가 필요한 표시(가격·카테고리·중복)는
   * 편집에 맞춰 실시간으로 다시 계산하므로 서버에 보내지 않는다.
   */
  extractionIssues: MenuDraftIssue[];
};

export type DraftReviewFormValues = {
  items: DraftItemFormValue[];
};

/** 사용자가 바로 고칠 수 있고, 고치지 않으면 등록을 막는 표시. */
const BLOCKING_ISSUES: MenuDraftIssue[] = [
  MenuDraftIssue.PRICE_MISSING,
  MenuDraftIssue.PRICE_OUT_OF_RANGE,
  MenuDraftIssue.CATEGORY_UNKNOWN,
];

/**
 * 서버가 계산해 주지만 편집에 맞춰 즉시 갱신돼야 하는 표시.
 * 저장이 디바운스되어 있어 서버 응답을 기다리면 배지가 한 박자 늦게 사라진다.
 */
const LIVE_ISSUES: MenuDraftIssue[] = [
  ...BLOCKING_ISSUES,
  MenuDraftIssue.DUPLICATE_NAME,
];

export const MENU_DRAFT_ISSUE_LABEL: Record<MenuDraftIssue, string> = {
  PRICE_MISSING: "가격 입력 필요",
  CATEGORY_UNKNOWN: "카테고리 지정 필요",
  DUPLICATE_NAME: "기존 메뉴와 이름 중복",
  PRICE_OUT_OF_RANGE: "가격 다시 확인",
  PRICE_ROUNDED: "가격을 원 단위로 반올림함",
  NAME_TRUNCATED: "이름이 30자로 잘림",
  DESCRIPTION_TRUNCATED: "설명이 100자로 잘림",
};

export function isBlockingIssue(issue: MenuDraftIssue) {
  return BLOCKING_ISSUES.includes(issue);
}

/** 초안 항목의 카테고리 판별 유니온을 폼이 다루는 두 필드로 편다. */
function toCategoryFields(item: MenuDraftItem) {
  switch (item.category.kind) {
    case "existing":
      return { categoryId: item.category.categoryId };
    case "new":
      return { categoryName: item.category.name };
    case "unknown":
      return {};
  }
}

export function toFormValues(items: MenuDraftItem[]): DraftReviewFormValues {
  return {
    items: items.map((item) => ({
      name: item.name,
      price: item.price,
      description: item.description,
      ...toCategoryFields(item),

      // 이미 있는 메뉴와 겹치는 행은 처음부터 빼둔다 — 대부분 다시 등록할 의도가 아니다.
      excluded: item.issues.includes(MenuDraftIssue.DUPLICATE_NAME),
      extractionIssues: item.issues.filter(
        (issue) => !LIVE_ISSUES.includes(issue)
      ),
    })),
  };
}

export function toFormValuesFromPayload(
  items: MenuDraftItemPayload[]
): DraftReviewFormValues {
  return {
    items: items.map(
      ({ name, price, description, categoryId, categoryName }) => ({
        name,
        price,
        description: description ?? null,
        ...(categoryId ? { categoryId } : {}),
        ...(categoryName ? { categoryName } : {}),
        excluded: false,
        extractionIssues: [],
      })
    ),
  };
}

const normalizeName = (name: string) => name.trim();

export function collectExistingMenuNames(
  categoryWithMenuList: CategoryWithMenusResponse[]
) {
  return new Set(
    categoryWithMenuList.flatMap((category) =>
      category.menus.map((menu) => normalizeName(menu.name))
    )
  );
}

/**
 * 이번 초안 안에서 두 번 이상 나온 이름. 사진 여러 장에 같은 메뉴가 찍힌 경우다.
 * 제외한 행은 세지 않는다 — 둘 중 하나를 빼는 것이 이 중복을 해소하는 방법이고,
 * 뺐는데도 경고가 남으면 무엇을 더 해야 하는지 알 수 없다.
 */
function collectRepeatedNames(items: DraftItemFormValue[]) {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  items.filter(nonExclude).forEach(({ name }) => {
    const normalized = normalizeName(name);
    if (!normalized) return;
    if (seen.has(normalized)) repeated.add(normalized);
    seen.add(normalized);
  });

  return repeated;
}

type DeriveDuplicateFlagsParams = {
  items: DraftItemFormValue[];
  existingMenuNames: Set<string>;
};

export function deriveDuplicateFlags({
  items,
  existingMenuNames,
}: DeriveDuplicateFlagsParams): boolean[] {
  const repeatedNames = collectRepeatedNames(items);

  return items.map(({ name }) => {
    const normalized = normalizeName(name);
    if (!normalized) return false;

    return existingMenuNames.has(normalized) || repeatedNames.has(normalized);
  });
}

function deriveSelfIssues(item: DraftItemFormValue): MenuDraftIssue[] {
  const issues: MenuDraftIssue[] = [];

  if (item.price === null) {
    issues.push(MenuDraftIssue.PRICE_MISSING);
  } else if (item.price > PRICE_MAX) {
    issues.push(MenuDraftIssue.PRICE_OUT_OF_RANGE);
  }
  if (!item.categoryId && !item.categoryName) {
    issues.push(MenuDraftIssue.CATEGORY_UNKNOWN);
  }

  return issues;
}

type DeriveItemIssuesParams = {
  item: DraftItemFormValue;
  isDuplicate: boolean;
};

export function deriveItemIssues({
  item,
  isDuplicate,
}: DeriveItemIssuesParams): MenuDraftIssue[] {
  const issues = deriveSelfIssues(item);
  if (isDuplicate) issues.push(MenuDraftIssue.DUPLICATE_NAME);

  return [...issues, ...item.extractionIssues];
}

export function countBlockedItems(items: DraftItemFormValue[]) {
  return items.filter(
    (item) => nonExclude(item) && deriveSelfIssues(item).some(isBlockingIssue)
  ).length;
}

/**
 * 저장 페이로드. 제외한 행도 포함한다 — 제외는 등록 대상에서 빼는 것일 뿐,
 * 초안에서 지우는 것이 아니다.
 */
export function toUpdatePayloadItems(
  items: DraftItemFormValue[]
): MenuDraftItemPayload[] {
  return items.map(
    ({ name, price, description, categoryId, categoryName }) => ({
      name,
      price,
      description,
      ...(categoryId ? { categoryId } : {}),
      ...(categoryName ? { categoryName } : {}),
    })
  );
}

/**
 * 등록 페이로드. 가격·카테고리가 채워진 행만 남는다.
 * 카테고리는 둘 중 정확히 하나여야 해서 스프레드 순서가 아니라 분기로 싣는다.
 */
export function toBulkPayloadItems(
  items: DraftItemFormValue[]
): BulkMenuItem[] {
  return items
    .filter(nonExclude)
    .flatMap<BulkMenuItem>(
      ({ name, price, description, categoryId, categoryName }) => {
        if (price === null) return [];

        const menu = {
          name,
          price,
          description,
          isAvailable: true,
        };
        if (categoryId) return [{ ...menu, categoryId }];
        if (categoryName) return [{ ...menu, categoryName }];

        return [];
      }
    );
}

function nonExclude(item: DraftItemFormValue) {
  return !item.excluded;
}
