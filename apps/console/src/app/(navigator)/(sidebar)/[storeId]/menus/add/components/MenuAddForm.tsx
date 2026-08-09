"use client";

import { useParams } from "next/navigation";
import {
  MenuFormValues,
  MenuSubmitContext,
} from "../../../tables/types/menu-form.type";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import MenuForm from "../../components/MenuForm";
import FormErrorWithRetry from "../../../components/FormErrorWithRetry";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";
import useDragSort, {
  reorder,
  resolveDropEdge,
} from "../../../hooks/useDragSort";
import { useState } from "react";
import useAddOption from "../../hooks/useAddOption";
import useOptionPreviewDrafts, {
  OptionPreviewDraftContext,
} from "../../hooks/useOptionPreviewDrafts";
import OptionFormField from "../../../components/form/OptionFormField";
import { createOptionGroupId } from "../../utils/menu-option-form";
import OptionFields from "./OptionFields";
import OptionGroupList from "./option-field/OptionGroupList";
import { mergePreviewOptions } from "../../utils/option-preview";
import useDraftOptions from "../../hooks/useDraftOptions";
import { syncDraftOrder } from "@ssurak/api/utils/reorder";

const DESCRIPTION = `손님이 주문할 때 고르는 항목입니다.`;

const formDefaultValues: MenuFormValues = {
  name: "",
  price: undefined,
  categoryId: "",
  isAvailable: true,
  description: undefined,
  imageKey: undefined,
};

export default function MenuAddForm() {
  const { storeId } = useParams<{ storeId: string }>();
  const { createMenu, reorderMenus, invalidateQueries } = useMenuMutation(
    storeId,
    { ignoreInvalidation: true }
  );

  const { draftIds, setDraftIds, discardDraft } = useAddOption();
  const { drafts, setDrafts } = useOptionPreviewDrafts();
  const { resolveDraftOptions, saveDraftOptions } = useDraftOptions(storeId);

  const [optionDragOrder, setOptionDragOrder] = useState<string[]>([]);
  const orderedDraftIds = syncDraftOrder(optionDragOrder, draftIds);

  const { listRef, draggingIndex, targetIndex, getHandleProps, getItemProps } =
    useDragSort(orderedDraftIds.length, (from, to) =>
      setOptionDragOrder(reorder(orderedDraftIds, from, to))
    );

  const formSubmit = async (
    payload: CreateMenuPayload,
    { resolveReorder }: MenuSubmitContext
  ) => {
    // 메뉴부터 만들면 옵션이 잘못됐을 때 되돌릴 수 없다. 옵션 검증을 먼저 끝낸다.
    const draftOptions = resolveDraftOptions(draftIds, drafts);
    if (!draftOptions) return;

    let createdMenuId: string;
    try {
      const createdMenu = await createMenu.mutateAsync({
        createMenuPayload: payload,
      });
      createdMenuId = createdMenu.publicId;
    } catch {
      // 생성 실패는 createMenu.error를 읽는 FormErrorWithRetry가 폼 안에서 알린다.
      return;
    }

    const { optionsFailed } = await saveDraftOptions(
      createdMenuId,
      draftOptions,
      orderedDraftIds
    );

    const reorderMenusPayload = resolveReorder(createdMenuId);
    if (!reorderMenusPayload) {
      invalidateQueries();
      return { reorderFailed: false, optionsFailed };
    }

    try {
      await reorderMenus.mutateAsync({ reorderMenusPayload });
      return { reorderFailed: false, optionsFailed };
    } catch {
      return { reorderFailed: true, optionsFailed };
    } finally {
      invalidateQueries();
    }
  };

  const errorMessage = createMenu.error
    ? httpMenuErrors.post(createMenu.error)
    : undefined;

  return (
    <MenuForm
      formDefaultValues={formDefaultValues}
      buttonText="메뉴 추가"
      linkToCancel={`/${storeId}/menus`}
      mutation={createMenu}
      options={mergePreviewOptions([], orderedDraftIds, drafts)}
      renderError={
        <FormErrorWithRetry
          title={`메뉴를 추가하지 못했어요.`}
          errorMessage={errorMessage}
        />
      }
      formSubmit={formSubmit}
    >
      <OptionPreviewDraftContext.Provider value={setDrafts}>
        <OptionFormField
          id="menu-options"
          label="옵션"
          description={DESCRIPTION}
          onAddOptionGroup={() =>
            setDraftIds((prev) => [...prev, createOptionGroupId()])
          }
        >
          <OptionGroupList ref={listRef} isEmpty={orderedDraftIds.length === 0}>
            {orderedDraftIds.map((draftId, index) => (
              <OptionFields
                key={draftId}
                formId={draftId}
                savedOptions={[]}
                onDiscard={() => discardDraft(draftId)}
                drag={{
                  handleProps: getHandleProps(index),
                  itemProps: getItemProps(index),
                  isDragging: draggingIndex === index,
                  dropEdge: resolveDropEdge(draggingIndex, targetIndex, index),
                }}
              />
            ))}
          </OptionGroupList>
        </OptionFormField>
      </OptionPreviewDraftContext.Provider>
    </MenuForm>
  );
}
