"use client";

import { useState } from "react";
import type {
  MenuDetailProviderProps,
  OptionSelectionPayload,
  OptionSelections,
} from "./menu-detail.type";
import { MenuDetailContext, MenuDetailContextValue } from "./MenuDetailContext";
import {
  dropHiddenSelections,
  visibleOptionIds,
} from "@ssurak/ui/utils/menu/optionTrigger";
import {
  changeChoiceQuantity as applyChoiceQuantity,
  toDefaultSelections,
  toDisplaySnapshot,
  toggleChoiceSelection,
  toSelectionPayload,
  totalPrice,
  unsatisfiedOptions,
} from "@ssurak/ui/utils/menu/optionSelection";

export function MenuDetailProvider({
  menu,
  initialSelections,
  children,
}: MenuDetailProviderProps) {
  const options = menu.options ?? [];

  const [quantity, setQuantity] = useState(menu.quantity ?? 1);
  const [selections, setSelections] = useState<OptionSelections>(() =>
    initialSelections
      ? toSelections(initialSelections)
      : toDefaultSelections(options)
  );

  const visibleIds = visibleOptionIds(options, selections);
  const priceParams = { options, selections, visibleIds };

  const price = totalPrice({ ...priceParams, quantity, menuPrice: menu.price });

  const optionById = new Map(
    options.map((option) => [option.publicId, option] as const)
  );

  const toggleChoice = (optionId: string, choiceId: string) => {
    const option = optionById.get(optionId);
    if (!option) return;

    setSelections((prev) => toggleChoiceSelection(prev, option, choiceId));
  };

  const changeChoiceQuantity = (
    optionId: string,
    choiceId: string,
    nextQuantity: number
  ) => {
    const option = optionById.get(optionId);
    const choice = option?.choices.find(
      (candidate) => candidate.publicId === choiceId
    );
    if (!option || !choice) return;

    setSelections((prev) =>
      applyChoiceQuantity(prev, option, choice, nextQuantity)
    );
  };

  const snapshotToFetch = () => {
    // 조건이 풀린 옵션의 선택이 남아 있을 수 있다. 그대로 보내면 서버가 400으로 거절한다.
    const kept = dropHiddenSelections(selections, visibleIds);
    const payload = toSelectionPayload({
      options,
      selections: kept,
      visibleIds,
    });

    return {
      menuPublicId: menu.publicId,
      menuName: menu.name,
      quantity,
      price,
      ...(payload.length > 0 && { options: payload }),
    };
  };

  const contextValue: MenuDetailContextValue = {
    state: { menu, quantity, selections },
    actions: {
      setQuantity,
      toggleChoice,
      changeChoiceQuantity,
      snapshotToFetch,
    },
    meta: {
      options,
      visibleOptionIds: visibleIds,
      unsatisfiedOptions: unsatisfiedOptions(priceParams),
      selectedSnapshot: toDisplaySnapshot(priceParams),
      price,
    },
  };

  return (
    <MenuDetailContext.Provider value={contextValue}>
      {children}
    </MenuDetailContext.Provider>
  );
}

/** 서버 페이로드 모양의 선택을 내부 Map으로 되돌린다. */
function toSelections(payload: OptionSelectionPayload[]): OptionSelections {
  return new Map(
    payload.map((selection) => [
      selection.optionId,
      new Map(
        selection.choices.map((choice) => [choice.choiceId, choice.quantity])
      ),
    ])
  );
}
