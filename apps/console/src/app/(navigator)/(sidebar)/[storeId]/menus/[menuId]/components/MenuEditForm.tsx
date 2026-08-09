"use client";

import { useParams } from "next/navigation";
import FormErrorWithRetry from "../../../components/FormErrorWithRetry";
import MenuForm from "../../components/MenuForm";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";
import {
  MenuFormValues,
  MenuSubmitContext,
} from "../../../tables/types/menu-form.type";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { Menu } from "@ssurak/api/types/menu/menu.interface";
import {
  CreateMenuPayload,
  UpdateMenuPayload,
} from "@ssurak/api/schemas/model/menu.schema";
import { parseImageUrlToImageKey } from "@utils/buildImageUrl";
import { menuDiffFromDefaults } from "../../../tables/utils/menu-diff-from-defaults";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { menuOptionsUrl } from "@ssurak/api/core/store/menu/option/httpMenuOption";
import OptionFields from "../../add/components/OptionFields";
import OptionGroupList from "../../add/components/option-field/OptionGroupList";
import useBuildOptionMutateCallback from "../../hooks/useBuildOptionMutateCallback";
import useDragSort, {
  reorder,
  resolveDropEdge,
} from "../../../hooks/useDragSort";
import useAddOption from "../../hooks/useAddOption";
import useOptionPreviewDrafts, {
  OptionPreviewDraftContext,
} from "../../hooks/useOptionPreviewDrafts";
import { mergePreviewOptions } from "../../utils/option-preview";
import OptionFormField from "../../../components/form/OptionFormField";
import { createOptionGroupId } from "../../utils/menu-option-form";
import { Button } from "@ssurak/ui/components/buttons/button";

const DESCRIPTION = `손님이 주문할 때 고르는 항목입니다.`;

export default function MenuEditForm() {
  const { storeId, menuId } = useParams<{ storeId: string; menuId: string }>();
  const { updateMenu, reorderMenus, invalidateQueries } = useMenuMutation(
    storeId,
    { ignoreInvalidation: true }
  );

  const { data: menu } = useSuspenseWithAuth<Menu>(
    `/stores/v1/${storeId}/menus/${menuId}`
  );

  const { data: options } = useSuspenseWithAuth<MenuOptionGroup[]>(
    menuOptionsUrl(storeId, menuId)
  );

  const formDefaultValues: MenuFormValues = {
    publicId: menu.publicId,
    name: menu.name,
    price: menu.price,
    categoryId: menu.categoryId,
    isAvailable: menu.isAvailable,
    description: menu.description ?? undefined,
    imageKey: parseImageUrlToImageKey(menu.images?.hero),
  };

  const formSubmit = async (
    payload: CreateMenuPayload,
    { setError, resolveReorder }: MenuSubmitContext
  ) => {
    const updateMenuPayload: UpdateMenuPayload = menuDiffFromDefaults(
      payload,
      formDefaultValues
    );
    const reorderMenusPayload = resolveReorder(menuId);
    const hasMenuChanges = Object.keys(updateMenuPayload).length > 0;

    if (!hasMenuChanges && !reorderMenusPayload) {
      setError(
        "name",
        {
          type: "manual",
          message: "변경된 사항이 없습니다.",
        },
        { shouldFocus: true }
      );
      return;
    }

    // 카테고리를 옮기는 경우, 수정이 먼저 반영돼야 대상 카테고리의 메뉴 집합에 이 메뉴가 포함된다.
    if (hasMenuChanges) {
      try {
        await updateMenu.mutateAsync({ updateMenuPayload, menuId });
      } catch {
        return;
      }
    }

    if (!reorderMenusPayload) {
      invalidateQueries();
      return { reorderFailed: false };
    }

    try {
      await reorderMenus.mutateAsync({ reorderMenusPayload });
      return { reorderFailed: false };
    } catch {
      return { reorderFailed: true };
    } finally {
      invalidateQueries();
    }
  };

  const errorMessage = updateMenu.error
    ? httpMenuErrors.patch(updateMenu.error)
    : undefined;

  const {
    mutations,
    createOption,
    deleteOption,
    updateOption,
    invalidateOptions,
  } = useBuildOptionMutateCallback(storeId, menuId);

  const isReordering = mutations.reorderOptions.isPending;

  const { listRef, draggingIndex, targetIndex, getHandleProps, getItemProps } =
    useDragSort(
      options.length,
      (from, to) =>
        mutations.reorderOptions.mutate({
          menuId,
          reorderMenuOptionsPayload: {
            optionIds: reorder(options, from, to).map(
              (option) => option.publicId
            ),
          },
        }),
      { disabled: isReordering }
    );

  const { draftIds, setDraftIds, discardDraft } = useAddOption();
  const { drafts, setDrafts } = useOptionPreviewDrafts();

  return (
    <MenuForm
      formDefaultValues={formDefaultValues}
      buttonText="메뉴 수정"
      linkToCancel={`/${storeId}/menus`}
      mutation={updateMenu}
      options={mergePreviewOptions(options ?? [], draftIds, drafts)}
      renderError={
        <FormErrorWithRetry
          title={`메뉴를 수정하지 못했어요.`}
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
          isSuccess={mutations.reorderOptions.isSuccess}
          onAddOptionGroup={() =>
            setDraftIds((prev) => [...prev, createOptionGroupId()])
          }
        >
          <OptionGroupList
            ref={listRef}
            isEmpty={options.length + draftIds.length === 0}
          >
            {options?.map((option, index) => (
              <OptionFields
                key={option.publicId}
                formId={option.publicId}
                option={option}
                savedOptions={options}
                invalidateOptions={invalidateOptions}
                createOptionCallback={createOption}
                deleteOptionCallback={deleteOption}
                updateOptionCallbackWithCreatedIdIndex={updateOption}
                drag={{
                  handleProps: getHandleProps(index),
                  itemProps: getItemProps(index),
                  isDragging: draggingIndex === index,
                  dropEdge: resolveDropEdge(draggingIndex, targetIndex, index),
                  isDisabled: isReordering,
                }}
              >
                {(save, formState) => (
                  <Button
                    type="button"
                    onClick={save}
                    disabled={formState.isSubmitting}
                  >
                    저장하기
                  </Button>
                )}
              </OptionFields>
            ))}
            {draftIds.map((draftId) => (
              <OptionFields
                key={draftId}
                formId={draftId}
                savedOptions={options}
                onDiscard={() => discardDraft(draftId)}
                invalidateOptions={invalidateOptions}
                createOptionCallback={createOption}
                deleteOptionCallback={deleteOption}
                updateOptionCallbackWithCreatedIdIndex={updateOption}
              >
                {(save, formState) => (
                  <Button
                    type="button"
                    onClick={save}
                    disabled={formState.isSubmitting}
                  >
                    추가하기
                  </Button>
                )}
              </OptionFields>
            ))}
          </OptionGroupList>
        </OptionFormField>
      </OptionPreviewDraftContext.Provider>
    </MenuForm>
  );
}
