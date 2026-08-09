/**
 * 메뉴 상세(옵션 선택) 화면이 쓰는 타입.
 *
 * `@ssurak/api`를 참조하지 않고 구조만 다시 선언한다 — ui는 리프 패키지라 api에 의존하지 않는다.
 * 필드는 `@ssurak/api/types/menu/menuOptions.interface`와 구조적으로 호환된다.
 */

export type DetailChoiceState = "AVAILABLE" | "SOLD_OUT" | "HIDDEN";

export interface DetailOptionChoice {
  publicId: string;
  name: string;
  /** 개당 추가 금액. 할인 옵션은 음수이며 수량과 곱해진다. */
  priceDelta: number;
  quantityEnabled: boolean;
  maxQuantity: number;
  isDefault: boolean;
  state: DetailChoiceState;
}

export interface DetailOptionTriggerRule {
  optionId: string;
  choiceIds: string[];
}

export interface DetailOptionGroup {
  publicId: string;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  required: boolean;
  minSelect: number;
  maxSelect: number;
  enabled: boolean;
  /** 규칙 간 AND, choiceIds 안에서는 OR. null·빈 배열이면 항상 노출된다. */
  trigger: DetailOptionTriggerRule[] | null;
  choices: DetailOptionChoice[];
}

export interface DetailMenu {
  publicId: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  options: DetailOptionGroup[];
  quantity?: number;
  imageKey?: string | null; // 이미지 키를 추가하여 이미지 URL을 가져올 수 있도록 함
}

/**
 * 선택 상태: 옵션 publicId → (선택지 publicId → 수량).
 *
 * 수량이 선택의 일부다 — 샷 2개와 1개는 장바구니에서 서로 다른 항목이라
 * 선택 여부와 수량을 따로 들고 있으면 두 값이 어긋난다.
 */
export type OptionSelections = Map<string, Map<string, number>>;

/** 서버로 보내는 선택 페이로드. `MenuOptionSelection[]`과 구조가 같다. */
export type OptionSelectionPayload = {
  optionId: string;
  choices: { choiceId: string; quantity: number }[];
};

export interface MenuDetailProviderProps {
  menu: DetailMenu;
  /**
   * 수정 진입 시 복원할 선택. 없으면 기본 선택(isDefault)으로 연다.
   * 담아둔 항목을 다시 열었을 때 고른 옵션이 초기화되면 사용자는 처음부터 다시 골라야 한다.
   */
  initialSelections?: OptionSelectionPayload[];
  children: React.ReactNode;
}

export type SnapshotToFetch = () => {
  menuPublicId: string;
  quantity: number;
  menuName: string;
  price: number;
  options?: OptionSelectionPayload[];
};

export type ToggleChoice = (optionId: string, choiceId: string) => void;
export type ChangeChoiceQuantity = (
  optionId: string,
  choiceId: string,
  quantity: number
) => void;
