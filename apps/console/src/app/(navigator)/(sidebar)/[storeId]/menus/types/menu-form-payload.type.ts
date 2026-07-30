import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";

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

export type OptionGroupForm = {
  groupKey: string;
  options: OptionValueForm[];
  trigger: OptionTriggerForm[];
  defaultIndex: number;
};

export type MenuOptionFieldName = "requiredOptions" | "customOptions";
export type OptionGroupFieldName = `${MenuOptionFieldName}.${number}`;
export type OptionValuesFieldName = `${OptionGroupFieldName}.options`;
export type OptionValueFieldName = `${OptionValuesFieldName}.${number}`;
export type OptionTriggersFieldName = `${OptionGroupFieldName}.trigger`;
export type OptionTriggerFieldName = `${OptionTriggersFieldName}.${number}`;

export type MenuFormPayload = Omit<CreateMenuPayload, MenuOptionFieldName> & {
  requiredOptions: OptionGroupForm[];
  customOptions: OptionGroupForm[];
  sortOrder: string[];
};
