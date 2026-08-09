import {
  CreateMenuOptionPayload,
  CreateOptionChoicePayload,
  UpdateOptionChoicePayload,
} from "@ssurak/api/schemas/model/menuOption.schema";
import {
  MenuOptionChoice,
  MenuOptionGroup,
  OptionChoiceState,
  OptionSelectionType,
} from "@ssurak/api/types/menu/menuOptions.interface";
import { FieldPath } from "react-hook-form";
import {
  OptionGroupForm,
  OptionTriggerForm,
  OptionValueForm,
} from "../types/option-form.type";

/**
 * 폼 수명 동안만 유일하면 되는 값이다(서버로 나가지 않는다).
 * 랜덤 대신 순번을 쓰면 테스트에서 값을 예측할 수 있다.
 */
let optionGroupSequence = 0;
export function createOptionGroupId(): string {
  optionGroupSequence += 1;
  return `optionGroup-${optionGroupSequence}`;
}

export function createEmptyOptionValue(): OptionValueForm {
  return {
    name: "",
    priceDelta: null,
    quantityEnabled: false,
    maxQuantity: 1,
    isDefault: false,
    state: OptionChoiceState.AVAILABLE,
  };
}

export function createEmptyOptionGroup(): OptionGroupForm {
  return {
    name: "",
    selectionType: OptionSelectionType.SINGLE,
    required: false,
    minSelect: 0,
    maxSelect: 1,
    enabled: true,
    choices: [createEmptyOptionValue()],
    trigger: [],
  };
}

export function createEmptyOptionTrigger(): OptionTriggerForm {
  return { optionId: "", choiceIds: [] };
}

function toOptionValueForm(choice: MenuOptionChoice): OptionValueForm {
  return {
    publicId: choice.publicId,
    name: choice.name,
    priceDelta: choice.priceDelta,
    quantityEnabled: choice.quantityEnabled,
    maxQuantity: choice.maxQuantity,
    isDefault: choice.isDefault,
    state: choice.state,
  };
}

export function toOptionGroupForm(option: MenuOptionGroup): OptionGroupForm {
  return {
    name: option.name,
    selectionType: option.selectionType,
    required: option.required,
    minSelect: option.minSelect,
    maxSelect: option.maxSelect,
    enabled: option.enabled,
    choices: option.choices.map(toOptionValueForm),
    trigger: option.trigger ?? [],
  };
}

/** 폼 값 → 옵션 본문. 빈 입력은 서버 기본값과 같은 값으로 채운다. */
export function toOptionPayload(
  form: OptionGroupForm
): Omit<CreateMenuOptionPayload, "choices"> {
  return {
    name: form.name.trim(),
    selectionType: form.selectionType,
    required: form.required,
    minSelect: form.minSelect ?? 0,
    maxSelect: form.maxSelect ?? 1,
    enabled: form.enabled,
    // 빈 배열이 아니라 null을 보내야 "조건 없음"이 서버 컬럼에서도 비워진다.
    trigger: form.trigger.length > 0 ? form.trigger : null,
  };
}

export function toChoicePayload(
  value: OptionValueForm
): CreateOptionChoicePayload {
  return {
    name: value.name.trim(),
    priceDelta: value.priceDelta ?? 0,
    quantityEnabled: value.quantityEnabled,
    maxQuantity: value.maxQuantity ?? 1,
    isDefault: value.isDefault,
    state: value.state,
  };
}

/** 저장 후 기대 순서의 한 칸. 새 선택지는 아직 id가 없어 폼 인덱스로 자리만 잡아 둔다. */
export type ChoiceOrderSlot = { publicId: string } | { index: number };

export type ChoiceChangePlan = {
  creates: { index: number; payload: CreateOptionChoicePayload }[];
  updates: { publicId: string; payload: UpdateOptionChoicePayload }[];
  deletes: string[];
  order: ChoiceOrderSlot[];
};

function isSameChoice(
  saved: MenuOptionChoice,
  payload: CreateOptionChoicePayload
): boolean {
  return (
    saved.name === payload.name &&
    saved.priceDelta === payload.priceDelta &&
    saved.quantityEnabled === payload.quantityEnabled &&
    saved.maxQuantity === payload.maxQuantity &&
    saved.isDefault === payload.isDefault &&
    saved.state === payload.state
  );
}

/**
 * 저장된 선택지와 폼 값을 대조해 실제로 보낼 요청만 골라낸다.
 *
 * 선택지에는 옵션과 달리 통째 교체 API가 없다 — 장바구니가 선택지 publicId를 들고 있어서
 * 지웠다 다시 만들면 담아둔 주문이 끊긴다. 그래서 남는 행은 반드시 수정으로 처리한다.
 *
 * 호출 순서는 생성 → 수정 → 삭제여야 한다. 삭제를 먼저 하면 선택지가 0개가 되는 순간이
 * 생겨 서버가 409(MENU_OPTION_LAST_CHOICE)로 거절한다.
 */
export function planChoiceChanges(
  saved: MenuOptionChoice[],
  form: OptionValueForm[]
): ChoiceChangePlan {
  const savedByPublicId = new Map(
    saved.map((choice) => [choice.publicId, choice])
  );

  const plan: ChoiceChangePlan = {
    creates: [],
    updates: [],
    deletes: [],
    order: [],
  };
  const keptPublicIds = new Set<string>();

  form.forEach((value, index) => {
    const payload = toChoicePayload(value);
    const savedChoice = value.publicId
      ? savedByPublicId.get(value.publicId)
      : undefined;

    if (!savedChoice) {
      plan.creates.push({ index, payload });
      plan.order.push({ index });
      return;
    }

    keptPublicIds.add(savedChoice.publicId);
    plan.order.push({ publicId: savedChoice.publicId });

    if (!isSameChoice(savedChoice, payload)) {
      plan.updates.push({ publicId: savedChoice.publicId, payload });
    }
  });

  plan.deletes = saved
    .filter((choice) => !keptPublicIds.has(choice.publicId))
    .map((choice) => choice.publicId);

  return plan;
}

/** 생성 응답으로 받은 publicId를 자리표시자에 채워 최종 순서를 만든다. */
export function resolveChoiceOrder(
  order: ChoiceOrderSlot[],
  createdPublicIdByIndex: Map<number, string>
): string[] {
  return order.flatMap((slot) => {
    if ("publicId" in slot) return [slot.publicId];

    const created = createdPublicIdByIndex.get(slot.index);
    return created ? [created] : [];
  });
}

function toChoiceFieldPath(
  index: number,
  leaf: string | number | undefined
): FieldPath<OptionGroupForm> | undefined {
  switch (leaf) {
    case undefined:
      return `choices.${index}`;
    case "name":
      return `choices.${index}.name`;
    case "priceDelta":
      return `choices.${index}.priceDelta`;
    case "quantityEnabled":
      return `choices.${index}.quantityEnabled`;
    case "maxQuantity":
      return `choices.${index}.maxQuantity`;
    case "isDefault":
      return `choices.${index}.isDefault`;
    case "state":
      return `choices.${index}.state`;
    default:
      return undefined;
  }
}

function toTriggerFieldPath(
  index: number,
  leaf: string | number | undefined
): FieldPath<OptionGroupForm> | undefined {
  switch (leaf) {
    case undefined:
      return `trigger.${index}`;
    case "optionId":
      return `trigger.${index}.optionId`;
    case "choiceIds":
      return `trigger.${index}.choiceIds`;
    default:
      return undefined;
  }
}

/**
 * zod 이슈 경로 → 폼 필드 경로.
 *
 * 두 경로가 같은 모양이라 문자열로 이어 붙이면 끝이지만, 그러면 타입이 `string`이 되어
 * `setError`가 받아 주지 않는다. 아는 필드만 명시적으로 매핑해 캐스팅 없이 좁힌다.
 * 매핑되지 않는 경로(스키마 전역 이슈 등)는 undefined를 돌려 카드 전체 메시지로 보낸다.
 */
export function toOptionFieldPath(
  path: readonly (string | number)[]
): FieldPath<OptionGroupForm> | undefined {
  const [head, second, third] = path;

  if (head === "choices" && typeof second === "number") {
    return toChoiceFieldPath(second, third);
  }
  if (head === "trigger" && typeof second === "number") {
    return toTriggerFieldPath(second, third);
  }

  switch (head) {
    case "name":
      return "name";
    case "selectionType":
      return "selectionType";
    case "required":
      return "required";
    case "minSelect":
      return "minSelect";
    case "maxSelect":
      return "maxSelect";
    case "enabled":
      return "enabled";
    case "choices":
      return "choices";
    case "trigger":
      return "trigger";
    default:
      return undefined;
  }
}
