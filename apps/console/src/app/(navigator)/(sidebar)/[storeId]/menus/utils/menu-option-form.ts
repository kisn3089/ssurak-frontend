import {
  MenuCustomOption,
  MenuOptionValue,
  MenuRequiredOption,
} from "@ssurak/api/types/menu/menuOptions.interface";
import {
  OptionGroupForm,
  OptionTriggerForm,
  OptionValueForm,
} from "../types/menu-form-payload.type";

type MenuOptionRecord = MenuCustomOption;

export function createEmptyOptionValue(): OptionValueForm {
  return { key: "", price: null };
}

export function createEmptyOptionGroup(): OptionGroupForm {
  return {
    groupKey: "",
    options: [createEmptyOptionValue()],
    defaultIndex: 0,
    trigger: [],
  };
}

export function createEmptyOptionTrigger(): OptionTriggerForm {
  return { group: "", in: [] };
}

/** 서버 Record → 폼 배열. 편집 화면 초기값에 쓴다. */
export function toOptionGroupForms(
  record: MenuOptionRecord | null | undefined
): OptionGroupForm[] {
  if (!record) return [];

  return Object.entries(record).map(([groupKey, optionInfo]) => {
    const defaultIndex = optionInfo.options.findIndex(
      (option) => option.key === optionInfo.defaultKey
    );

    return {
      groupKey,
      options: optionInfo.options.map((option) => ({
        key: option.key,
        price: option.price,
        ...(option.description === undefined
          ? {}
          : { description: option.description }),
      })),
      defaultIndex: defaultIndex === -1 ? 0 : defaultIndex,
      trigger: optionInfo.trigger ?? [],
    };
  });
}

/** 폼 배열 → 서버 Record. 그룹이 하나도 없으면 undefined(= 옵션 없음). */
export function toMenuOptionRecord(
  groups: OptionGroupForm[]
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

    return [
      group.groupKey,
      {
        options,
        defaultKey,
        ...(group.trigger.length === 0 ? {} : { trigger: group.trigger }),
      },
    ] as const;
  });

  return Object.fromEntries(entries);
}
