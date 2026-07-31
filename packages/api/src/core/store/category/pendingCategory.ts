import { CategoryWithMenusResponse } from "../../../types/category/category.interface";

/** 서버가 발급한 cuid2와 절대 겹치지 않도록 콜론을 넣은 접두사를 쓴다. */
const PENDING_CATEGORY_ID_PREFIX = "pending-category:";

/** 카테고리 sortOrder는 Sparse 패턴(10, 20, 30...)이므로 새 항목은 마지막 값 다음 칸에 붙인다. */
const SORT_ORDER_STEP = 10;

/** 낙관적으로 먼저 그려 둔, 아직 서버가 모르는 카테고리인지 판단한다. */
export function isPendingCategoryId(publicId: string) {
  return publicId.startsWith(PENDING_CATEGORY_ID_PREFIX);
}

/** 생성 응답이 도착하기 전까지 목록에서 자리를 지킬 임시 카테고리. */
export function buildPendingCategory(
  name: string,
  categories: CategoryWithMenusResponse[]
): CategoryWithMenusResponse {
  const lastSortOrder = categories.reduce(
    (max, category) => Math.max(max, category.sortOrder),
    0
  );

  return {
    // 서버 내부 id(bigint)는 클라이언트가 알 수 없다. 무효화로 교체되기 전까지만 자리를 잡는다.
    id: BigInt(0),
    publicId: `${PENDING_CATEGORY_ID_PREFIX}${crypto.randomUUID()}`,
    name,
    sortOrder: lastSortOrder + SORT_ORDER_STEP,
    menus: [],
  };
}
