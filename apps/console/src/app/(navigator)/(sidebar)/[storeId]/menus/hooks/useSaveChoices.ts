import useMenuOptionMutation from "@ssurak/api/core/store/menu/option/useMenuOptionMutation";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { OptionGroupForm } from "../types/option-form.type";
import {
  planChoiceChanges,
  resolveChoiceOrder,
} from "../utils/menu-option-form";
import { isSameOrder } from "@ssurak/api/utils/reorder";

export default function useSaveChoices(storeId: string, menuId: string) {
  const { createChoice, updateChoice, deleteChoice, reorderChoices } =
    useMenuOptionMutation(storeId);

  const saveChoices = async (
    saved: MenuOptionGroup,
    values: OptionGroupForm
  ): Promise<Map<number, string>> => {
    const plan = planChoiceChanges(saved.choices, values.choices);
    const createdPublicIdByIndex = new Map<number, string>();

    // 생성 → 수정 → 삭제 순서를 지켜야 한다(선택지가 0개가 되는 순간을 만들지 않는다).
    for (const { index, payload } of plan.creates) {
      const created = await createChoice.mutateAsync({
        menuId,
        optionId: saved.publicId,
        createOptionChoicePayload: payload,
      });
      createdPublicIdByIndex.set(index, created.publicId);
    }
    for (const { publicId, payload } of plan.updates) {
      await updateChoice.mutateAsync({
        menuId,
        choiceId: publicId,
        updateOptionChoicePayload: payload,
      });
    }
    for (const choiceId of plan.deletes) {
      await deleteChoice.mutateAsync({ menuId, choiceId });
    }

    // 생성·삭제가 반영된 서버 순서와 폼 순서를 견줘 달라졌을 때만 재정렬한다.
    const serverOrder = [
      ...saved.choices
        .map((choice) => choice.publicId)
        .filter((publicId) => !plan.deletes.includes(publicId)),
      ...plan.creates.flatMap(({ index }) => {
        const created = createdPublicIdByIndex.get(index);
        return created ? [created] : [];
      }),
    ];
    const formOrder = resolveChoiceOrder(plan.order, createdPublicIdByIndex);

    if (formOrder.length > 1 && !isSameOrder(serverOrder, formOrder)) {
      await reorderChoices.mutateAsync({
        menuId,
        optionId: saved.publicId,
        reorderOptionChoicesPayload: { choiceIds: formOrder },
      });
    }

    return createdPublicIdByIndex;
  };

  return saveChoices;
}
