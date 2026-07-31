export const NEW_MENU_ID = "__new-menu__";

/**
 * 메뉴 요청이 끝난 뒤 서버가 갖게 될 순서를 계산한다.
 * 이 값과 폼이 들고 있는 순서를 비교한 결과가 곧 "재정렬 요청이 필요한가"다.
 */
export function buildExpectedOrder(categoryMenuIds: string[], selfId: string) {
  return categoryMenuIds.includes(selfId)
    ? categoryMenuIds
    : [...categoryMenuIds, selfId];
}

/** 자리표시자를 확정된 publicId로 바꾼다. 수정 화면에서는 이미 실제 id이므로 그대로 통과한다. */
export function resolveMenuIds(sortOrder: string[], menuId: string) {
  return sortOrder.map((id) => (id === NEW_MENU_ID ? menuId : id));
}
