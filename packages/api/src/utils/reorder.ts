/** 순서 배열이 같은지 비교한다. 재정렬 요청 여부를 가르는 유일한 기준이다. */
export function isSameOrder(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index])
  );
}

/**
 * 사용자가 끌어 놓은 순서를 서버의 현재 집합에 다시 얹는다.
 * 서버에서 사라진 id는 버리고, 그 사이 새로 생긴 id는 뒤에 붙인다.
 * 재정렬 API가 집합 전체를 대조하므로 요청 직전에 항상 이걸로 맞춰야 한다.
 */
export function syncDraftOrder(draftIds: string[], serverIds: string[]) {
  const serverIdSet = new Set(serverIds);
  const draftIdSet = new Set(draftIds);

  return [
    ...draftIds.filter((id) => serverIdSet.has(id)),
    ...serverIds.filter((id) => !draftIdSet.has(id)),
  ];
}
