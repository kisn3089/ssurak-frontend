/** 옵션 그룹의 선택 방식 */
export const OptionSelectionType = {
  /** 그룹에서 하나만 고른다 (maxSelect는 항상 1) */
  SINGLE: "SINGLE",
  /** 그룹에서 minSelect~maxSelect 개를 고른다 */
  MULTIPLE: "MULTIPLE",
} as const;

export type OptionSelectionType =
  (typeof OptionSelectionType)[keyof typeof OptionSelectionType];

/** 선택지의 판매 상태. */
export const OptionChoiceState = {
  AVAILABLE: "AVAILABLE",
  /** 목록에는 보이지만 고를 수 없다 (품절 표시) */
  SOLD_OUT: "SOLD_OUT",
  /** 고객에게 아예 노출되지 않는다. 점주 콘솔에서만 보인다 */
  HIDDEN: "HIDDEN",
} as const;

export type OptionChoiceState =
  (typeof OptionChoiceState)[keyof typeof OptionChoiceState];

/**
 * 다른 그룹의 선택 결과로 이 그룹의 노출 여부를 정하는 규칙.
 * 표시 순서와 무관하게 의존성 순서로 평가되므로 조건이 되는 그룹이 화면에서 뒤에 있어도 된다.
 * 순환 참조와 저장되지 않은 옵션 참조는 서버가 쓰기 시점에 거절한다.
 */
export type MenuOptionTriggerRule = {
  /** 조건이 되는 다른 그룹의 publicId */
  optionId: string;
  /** 그 그룹에서 이 중 하나라도 선택되면 조건 충족 (OR) */
  choiceIds: string[];
};

/** 규칙 간에는 AND. 빈 배열이거나 null이면 항상 노출된다. */
export type MenuOptionTrigger = MenuOptionTriggerRule[];

/** 옵션 선택지. 부모 그룹 id는 내려오지 않는다 — 중첩 구조로 이미 알 수 있다. */
export interface MenuOptionChoice {
  publicId: string;
  name: string;
  /** 이 선택지가 더하는 금액(개당). 할인 옵션은 음수이며 quantity와 곱해진다. */
  priceDelta: number;
  quantityEnabled: boolean;
  maxQuantity: number;
  isDefault: boolean;
  /** 옵션 내 표시 순서 (Sparse 패턴: 10, 20, 30...) */
  sortOrder: number;
  state: OptionChoiceState;
}

/**
 * 옵션 그룹.
 *
 * 점주 경로에서는 메뉴 응답에 실리지 않고 `GET /stores/{storeId}/menus/{menuId}/options`로
 * 따로 조회한다 — 옵션만 바뀌었을 때 메뉴 캐시까지 무효화하지 않기 위한 분리다.
 * 고객 메뉴판(`StoreContextResponse`)은 한 번에 렌더해야 하므로 메뉴에 포함돼 내려온다.
 */
export interface MenuOptionGroup {
  publicId: string;
  name: string;
  selectionType: OptionSelectionType;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  /** 메뉴 내 표시 순서 (Sparse 패턴: 10, 20, 30...) */
  sortOrder: number;
  /** false면 고객 메뉴판에서 그룹 전체가 빠진다 (점주 콘솔에는 남는다) */
  enabled: boolean;
  trigger: MenuOptionTrigger | null;
  choices: MenuOptionChoice[];
}

export type OptionSnapshotChoice = {
  choiceId: string;
  name: string;
  priceDelta: number;
  quantity: number;
};

export type OptionSnapshotGroup = {
  optionId: string;
  name: string;
  choices: OptionSnapshotChoice[];
};

/**
 * 주문·장바구니가 들고 다니는 확정 스냅샷.
 * 이름과 금액을 함께 담으므로 이후 메뉴 옵션이 바뀌거나 삭제돼도 그대로 렌더된다.
 */
export type OrderItemOptionSnapshot = { options: OptionSnapshotGroup[] };

/** 고객이 서버로 보내는 선택 페이로드 (장바구니·주문 공용) */
export type MenuOptionSelection = {
  optionId: string;
  choices: { choiceId: string; quantity: number }[];
};
