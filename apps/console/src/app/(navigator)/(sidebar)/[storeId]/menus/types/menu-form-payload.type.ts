import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";

/** 옵션 그룹 안의 값 한 줄. (예: "케냐 + 500원") */
export type OptionValueForm = {
  key: string;
  price: number | null;
  /** 아직 입력 UI가 없다. 편집 시 서버 값이 지워지지 않도록 그대로 들고만 있는다. */
  description?: string;
};

/** 노출 조건 한 줄. "group의 선택값이 in 중 하나일 때 이 그룹을 노출한다." */
export type OptionTriggerForm = {
  group: string;
  in: string[];
};

/**
 * 옵션 그룹 한 개.
 *
 * 서버 페이로드는 그룹 이름을 key로 쓰는 Record지만, 폼에서는 배열로 다룬다.
 * Record 그대로 두면 이름을 한 글자 고칠 때마다 key가 바뀌어 필드가 새로 마운트되고(포커스 유실),
 * 이름이 비었거나 다른 그룹과 겹치는 "입력 중" 상태를 표현할 수 없다.
 * 배열이어야 useFieldArray로 추가·삭제·순서를 다룰 수 있다.
 */
export type OptionGroupForm = {
  groupKey: string;
  options: OptionValueForm[];
  /**
   * 선택 옵션의 노출 조건. 서버 페이로드에서는 optional이지만 폼에서는 항상 배열이다.
   * useFieldArray가 `X[] | undefined` 경로를 필드 배열로 받지 않고,
   * 조건 없음을 undefined와 빈 배열 두 가지로 표현할 이유도 없다. 변환 시 비어 있으면 뺀다.
   */
  trigger: OptionTriggerForm[];
  /**
   * 기본값으로 표시할 options의 인덱스. 제출 시 defaultKey(문자열)로 변환한다.
   * 이름(key)이 아니라 인덱스로 들고 있어야 옵션 이름을 수정해도 기본값 선택이 풀리지 않는다.
   */
  defaultIndex: number;
};

export type MenuOptionFieldName = "requiredOptions" | "customOptions";
export type OptionGroupFieldName = `${MenuOptionFieldName}.${number}`;
export type OptionValuesFieldName = `${OptionGroupFieldName}.options`;
export type OptionValueFieldName = `${OptionValuesFieldName}.${number}`;
export type OptionTriggersFieldName = `${OptionGroupFieldName}.trigger`;
export type OptionTriggerFieldName = `${OptionTriggersFieldName}.${number}`;

/** 메뉴 폼이 실제로 들고 있는 값. 제출 직전에 CreateMenuPayload로 변환된다. */
export type MenuFormPayload = Omit<CreateMenuPayload, MenuOptionFieldName> & {
  requiredOptions: OptionGroupForm[];
  customOptions: OptionGroupForm[];
};
