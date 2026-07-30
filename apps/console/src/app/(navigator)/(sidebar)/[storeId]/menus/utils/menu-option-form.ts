import {
  MenuCustomOption,
  MenuCustomOptionValue,
  MenuOptionValue,
  MenuRequiredOption,
} from "@ssurak/api/types/menu/menuOptions.interface";
import {
  OptionGroupForm,
  OptionTriggerForm,
  OptionValueForm,
} from "../types/menu-form-payload.type";

/** 서버 Record 한 쌍. 편집 화면의 초기값과 제출 payload가 모두 이 모양이다. */
type MenuOptionRecords = {
  requiredOptions?: MenuRequiredOption | null;
  customOptions?: MenuCustomOption | null;
};

/** 폼 배열 한 쌍. trigger가 두 목록을 서로 참조할 수 있어 항상 같이 다룬다. */
type OptionGroupForms = {
  requiredOptions: OptionGroupForm[];
  customOptions: OptionGroupForm[];
};

type IdentifiedGroup = {
  groupId: string;
  groupKey: string;
  optionInfo: MenuCustomOptionValue;
};

/**
 * 폼 수명 동안만 유일하면 되는 값이다(서버로 나가지 않는다).
 * 랜덤 대신 순번을 쓰면 테스트에서 값을 예측할 수 있다.
 */
let optionGroupSequence = 0;
function createOptionGroupId(): string {
  optionGroupSequence += 1;
  return `optionGroup-${optionGroupSequence}`;
}

export function createEmptyOptionValue(): OptionValueForm {
  return { key: "", price: null };
}

export function createEmptyOptionGroup(): OptionGroupForm {
  return {
    groupId: createOptionGroupId(),
    groupKey: "",
    options: [createEmptyOptionValue()],
    defaultIndex: 0,
    trigger: [],
  };
}

export function createEmptyOptionTrigger(): OptionTriggerForm {
  return { groupId: "", in: [] };
}

function identifyGroups(
  record: MenuRequiredOption | MenuCustomOption | null | undefined
): IdentifiedGroup[] {
  if (!record) return [];

  return Object.entries(record).map(([groupKey, optionInfo]) => ({
    groupId: createOptionGroupId(),
    groupKey,
    optionInfo,
  }));
}

function toOptionGroupForm(
  { groupId, groupKey, optionInfo }: IdentifiedGroup,
  groupIdByGroupKey: Map<string, string>
): OptionGroupForm {
  const defaultIndex = optionInfo.options.findIndex(
    (option) => option.key === optionInfo.defaultKey
  );

  return {
    groupId,
    groupKey,
    options: optionInfo.options.map((option) => ({
      key: option.key,
      price: option.price,
      ...(option.description === undefined
        ? {}
        : { description: option.description }),
    })),
    defaultIndex: defaultIndex === -1 ? 0 : defaultIndex,
    // 대상 그룹이 사라진 조건은 폼에서 되살릴 방법이 없으므로 버린다.
    trigger: (optionInfo.trigger ?? []).flatMap((trigger) => {
      const targetGroupId = groupIdByGroupKey.get(trigger.group);
      if (!targetGroupId) return [];

      return [{ groupId: targetGroupId, in: trigger.in }];
    }),
  };
}

/**
 * 서버 Record → 폼 배열. 편집 화면 초기값에 쓴다.
 * 서버 trigger는 대상 그룹을 이름으로 가리키므로 groupId로 옮겨 담는다. 필수 옵션과 선택
 * 옵션은 서로를 조건으로 쓸 수 있어서, 두 Record를 한 번에 변환해야 이름을 모두 찾을 수 있다.
 */
export function toOptionGroupForms({
  requiredOptions,
  customOptions,
}: MenuOptionRecords): OptionGroupForms {
  const identified = {
    requiredOptions: identifyGroups(requiredOptions),
    customOptions: identifyGroups(customOptions),
  };

  const groupIdByGroupKey = new Map(
    [...identified.requiredOptions, ...identified.customOptions].map(
      ({ groupKey, groupId }) => [groupKey, groupId]
    )
  );

  return {
    requiredOptions: identified.requiredOptions.map((group) =>
      toOptionGroupForm(group, groupIdByGroupKey)
    ),
    customOptions: identified.customOptions.map((group) =>
      toOptionGroupForm(group, groupIdByGroupKey)
    ),
  };
}

function toMenuOptionRecord(
  groups: OptionGroupForm[],
  groupKeyByGroupId: Map<string, string>
): MenuRequiredOption | undefined {
  if (groups.length === 0) return undefined;

  const entries = groups.map((group) => {
    const options: MenuOptionValue[] = group.options.map((option) => ({
      key: option.key,
      price: option.price ?? 0,
      ...(option.description === undefined
        ? {}
        : { description: option.description }),
    }));
    const defaultKey =
      options[group.defaultIndex]?.key ?? options[0]?.key ?? "";

    // 대상 그룹이 사라졌으면 이름을 만들 수 없다. 제출은 스키마가 먼저 막고, 미리보기에서는 조건 없이 보여준다.
    const trigger = group.trigger.flatMap((trigger) => {
      const targetGroupKey = groupKeyByGroupId.get(trigger.groupId);
      if (!targetGroupKey) return [];

      return [{ group: targetGroupKey, in: trigger.in }];
    });

    return [
      group.groupKey,
      {
        options,
        defaultKey,
        ...(trigger.length === 0 ? {} : { trigger }),
      },
    ] as const;
  });

  return Object.fromEntries(entries);
}

/**
 * 폼 배열 → 서버 Record. 그룹이 하나도 없으면 undefined(= 옵션 없음).
 * 고객 앱은 trigger 대상을 그룹 이름으로 찾으므로(`packages/ui/src/utils/menu/optionTrigger.ts`)
 * groupId를 제출 시점의 이름으로 되돌린다.
 */
export function toMenuOptionRecords({
  requiredOptions,
  customOptions,
}: OptionGroupForms): MenuOptionRecords {
  const groupKeyByGroupId = new Map(
    [...requiredOptions, ...customOptions].map((group) => [
      group.groupId,
      group.groupKey,
    ])
  );

  return {
    requiredOptions: toMenuOptionRecord(requiredOptions, groupKeyByGroupId),
    customOptions: toMenuOptionRecord(customOptions, groupKeyByGroupId),
  };
}
