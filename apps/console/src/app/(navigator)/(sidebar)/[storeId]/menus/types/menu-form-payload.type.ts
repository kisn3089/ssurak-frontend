import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";

export type OptionValueForm = {
  key: string;
  price: number | null;
  /** 아직 입력 UI가 없다. 편집 시 서버 값이 지워지지 않도록 그대로 들고만 있는다. */
  description?: string;
};

/** 노출 조건 한 줄. "groupId 그룹의 선택값이 in 중 하나일 때 이 그룹을 노출한다." */
export type OptionTriggerForm = {
  /** 대상 그룹의 {@link OptionGroupForm.groupId}. 이름은 편집 중 바뀌므로 참조에 쓰지 않는다. */
  groupId: string;
  in: string[];
};

export type OptionGroupForm = {
  /**
   * TODO: 서버에서 groupId를 생성하도록 바꾸면 이 필드는 필요 없어진다. 지금은 편집 중에 이름을 바꿔도 trigger가 끊기지 않도록
   * 폼 안에서만 통하는 식별자를 만들어 쓴다. 서버 payload에는 나가지 않는다.
   */
  groupId: string;
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
