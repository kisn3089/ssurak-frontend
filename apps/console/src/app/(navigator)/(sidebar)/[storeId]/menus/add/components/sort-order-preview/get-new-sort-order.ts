import { Menu } from "@ssurak/api/types/menu/menu.interface";

const SORT_STEP = 10;

/**
 * 선택한 삽입 위치를 기존 메뉴 배열에서의 삽입 인덱스로 바꾼다.
 * (0=맨 앞, 특정 값=그 sortOrder 메뉴 다음, undefined=맨 뒤)
 */
export function getInsertIndex(
  menus: Menu[],
  sortOrder: number | undefined
): number {
  if (sortOrder === undefined) return menus.length;
  if (sortOrder === 0) return 0;
  const afterIndex = menus.findIndex((menu) => menu.sortOrder === sortOrder);
  return afterIndex === -1 ? menus.length : afterIndex + 1;
}

/**
 * 실제 저장할 정렬 순서를 구한다.
 * 삽입 지점 앞·뒤 메뉴 순서의 중앙값을 쓰고, 맨 뒤면 마지막 순서 + STEP을 쓴다.
 */
export function getNewSortOrder(
  menus: Menu[],
  sortOrder: number | undefined
): number {
  const insertIndex = getInsertIndex(menus, sortOrder);
  const before = insertIndex > 0 ? menus[insertIndex - 1].sortOrder : 0;
  const after = menus[insertIndex]?.sortOrder;

  return after === undefined
    ? before + SORT_STEP
    : Math.floor((before + after) / 2);
}
