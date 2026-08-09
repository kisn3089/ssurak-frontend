import type {
  DetailOptionChoice,
  DetailOptionGroup,
  OptionSelectionPayload,
  OptionSelections,
} from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import type { SnapshotGroup } from "@ssurak/ui/utils/menu/optionSnapshot";

/** 고를 수 있는 선택지만 기본 선택으로 삼는다 — 품절을 기본값으로 열면 담기 버튼이 죽는다. */
export function toDefaultSelections(
  options: DetailOptionGroup[]
): OptionSelections {
  const selections: OptionSelections = new Map();

  options.forEach((option) => {
    const defaults = option.choices.filter(
      (choice) => choice.isDefault && isSelectable(choice)
    );
    if (defaults.length === 0) return;

    selections.set(
      option.publicId,
      new Map(defaults.map((choice) => [choice.publicId, 1]))
    );
  });

  return selections;
}

export function isSelectable(choice: DetailOptionChoice): boolean {
  return choice.state === "AVAILABLE";
}

export function selectedQuantity(
  selections: OptionSelections,
  optionId: string,
  choiceId: string
): number {
  return selections.get(optionId)?.get(choiceId) ?? 0;
}

/**
 * 선택지를 켜고 끈다.
 * - SINGLE: 항상 하나만 남긴다(같은 걸 다시 눌러도 필수 옵션이면 유지).
 * - MULTIPLE: maxSelect에 도달하면 더 담지 않는다 — 서버가 400으로 거절할 조합을 만들지 않는다.
 */
export function toggleChoiceSelection(
  selections: OptionSelections,
  option: DetailOptionGroup,
  choiceId: string
): OptionSelections {
  const next = cloneSelections(selections);
  const picked = next.get(option.publicId) ?? new Map<string, number>();

  if (option.selectionType === "SINGLE") {
    if (picked.has(choiceId) && !option.required) {
      next.delete(option.publicId);
      return next;
    }

    next.set(option.publicId, new Map([[choiceId, 1]]));
    return next;
  }

  if (picked.has(choiceId)) {
    picked.delete(choiceId);
  } else {
    if (picked.size >= option.maxSelect) return selections;
    picked.set(choiceId, 1);
  }

  if (picked.size === 0) {
    next.delete(option.publicId);
  } else {
    next.set(option.publicId, picked);
  }

  return next;
}

export function changeChoiceQuantity(
  selections: OptionSelections,
  option: DetailOptionGroup,
  choice: DetailOptionChoice,
  quantity: number
): OptionSelections {
  const next = cloneSelections(selections);
  const picked = next.get(option.publicId) ?? new Map<string, number>();
  const clamped = Math.min(Math.max(quantity, 0), choice.maxQuantity);

  if (clamped === 0) {
    picked.delete(choice.publicId);
  } else {
    picked.set(choice.publicId, clamped);
  }

  if (picked.size === 0) {
    next.delete(option.publicId);
  } else {
    next.set(option.publicId, picked);
  }

  return next;
}

type OptionsPriceParams = {
  options: DetailOptionGroup[];
  selections: OptionSelections;
  visibleIds: Set<string>;
};

/** 메뉴 1개당 옵션 금액. 노출되지 않는 옵션은 서버도 계산에 넣지 않는다. */
export function optionsPrice({
  options,
  selections,
  visibleIds,
}: OptionsPriceParams): number {
  return options.reduce((total, option) => {
    if (!visibleIds.has(option.publicId)) return total;

    const picked = selections.get(option.publicId);
    if (!picked) return total;

    return (
      total +
      option.choices.reduce((sum, choice) => {
        const quantity = picked.get(choice.publicId) ?? 0;
        return sum + choice.priceDelta * quantity;
      }, 0)
    );
  }, 0);
}

type TotalPriceParams = OptionsPriceParams & {
  quantity: number;
  menuPrice: number;
};

export function totalPrice({
  quantity,
  menuPrice,
  ...rest
}: TotalPriceParams): number {
  return quantity * (menuPrice + optionsPrice(rest));
}

/**
 * 아직 채우지 못한 필수 옵션. 담기 버튼을 막는 근거이자 안내 문구의 재료다.
 * 노출되지 않는 옵션은 필수여도 면제된다 — 서버도 같은 규칙이다.
 */
export function unsatisfiedOptions({
  options,
  selections,
  visibleIds,
}: OptionsPriceParams): DetailOptionGroup[] {
  return options.filter((option) => {
    if (!visibleIds.has(option.publicId)) return false;

    const picked = selections.get(option.publicId)?.size ?? 0;
    if (picked === 0) return option.required;

    return picked < option.minSelect;
  });
}

/** 서버로 보낼 선택 목록. 노출되는 옵션만, 메뉴에 실린 선택지 순서대로 담는다. */
export function toSelectionPayload({
  options,
  selections,
  visibleIds,
}: OptionsPriceParams): OptionSelectionPayload[] {
  return options.flatMap((option) => {
    if (!visibleIds.has(option.publicId)) return [];

    const picked = selections.get(option.publicId);
    if (!picked?.size) return [];

    return [
      {
        optionId: option.publicId,
        choices: option.choices
          .filter((choice) => picked.has(choice.publicId))
          .map((choice) => ({
            choiceId: choice.publicId,
            quantity: picked.get(choice.publicId) ?? 1,
          })),
      },
    ];
  });
}

/**
 * 화면 표시용 스냅샷. 이름과 금액을 함께 담아 서버 스냅샷과 같은 모양으로 만든다 —
 * 아직 주문 전이라 서버 스냅샷이 없는 화면(콘솔의 주문 추가 목록)이 같은 컴포넌트를 쓴다.
 */
export function toDisplaySnapshot({
  options,
  selections,
  visibleIds,
}: OptionsPriceParams): SnapshotGroup[] {
  return options.flatMap((option) => {
    if (!visibleIds.has(option.publicId)) return [];

    const picked = selections.get(option.publicId);
    if (!picked?.size) return [];

    return [
      {
        optionId: option.publicId,
        name: option.name,
        choices: option.choices
          .filter((choice) => picked.has(choice.publicId))
          .map((choice) => ({
            choiceId: choice.publicId,
            name: choice.name,
            priceDelta: choice.priceDelta,
            quantity: picked.get(choice.publicId) ?? 1,
          })),
      },
    ];
  });
}

function cloneSelections(selections: OptionSelections): OptionSelections {
  return new Map(
    Array.from(selections, ([optionId, choices]) => [
      optionId,
      new Map(choices),
    ])
  );
}
