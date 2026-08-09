import {
  OptionChoiceState,
  OptionSelectionType,
} from "@ssurak/api/types/menu/menuOptions.interface";

/**
 * 옵션 편집 폼 값.
 *
 * 필드 이름을 서버 페이로드와 일부러 똑같이 맞춰 뒀다 — zod 이슈의 path를 그대로
 * react-hook-form 필드 경로로 옮길 수 있어 에러 위치를 다시 계산할 필요가 없다.
 *
 * 숫자는 입력을 지우는 순간 빈 문자열이 되므로 `number | null`로 들고 있다가 제출 때 채운다.
 * 0으로 강제하면 "0개"와 "아직 안 씀"이 구분되지 않아 입력 중에 칸이 제멋대로 채워진다.
 */
export type OptionValueForm = {
  /** 이미 저장된 선택지면 publicId. 이번에 추가한 행은 undefined다. */
  publicId?: string;
  name: string;
  priceDelta: number | null;
  quantityEnabled: boolean;
  maxQuantity: number | null;
  isDefault: boolean;
  state: OptionChoiceState;
};

/** 조건 하나. 여기 담기는 id는 모두 서버에 저장된 옵션·선택지의 publicId다. */
export type OptionTriggerForm = {
  optionId: string;
  choiceIds: string[];
};

export type OptionGroupForm = {
  name: string;
  selectionType: OptionSelectionType;
  required: boolean;
  minSelect: number | null;
  maxSelect: number | null;
  enabled: boolean;
  choices: OptionValueForm[];
  trigger: OptionTriggerForm[];
};

export type OptionValueFieldName = `choices.${number}`;
export type OptionTriggerFieldName = `trigger.${number}`;
