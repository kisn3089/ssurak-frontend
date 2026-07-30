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

export default function MenuEditForm() {
  const { storeId, menuId } = useParams<{ storeId: string; menuId: string }>();
  const { updateMenu, reorderMenus, invalidateQueries } = useMenuMutation(
    storeId,
    { ignoreInvalidation: true }
  );

  const { data: menu } = useSuspenseWithAuth<Menu>(
    `/stores/v1/${storeId}/menus/${menuId}`
  );

  const formDefaultValues: MenuFormValues = {
    publicId: menu.publicId,
    name: menu.name,
    price: menu.price,
    categoryId: menu.categoryId,
    isAvailable: menu.isAvailable,
    customOptions: menu.customOptions ?? undefined,
    requiredOptions: menu.requiredOptions ?? undefined,
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
      invalidateQueries();
      return { reorderFailed: false };
    } catch {
      return { reorderFailed: true };
    }
  };

  const errorMessage = updateMenu.error
    ? httpMenuErrors.patch(updateMenu.error)
    : undefined;

  return (
    <MenuForm
      formDefaultValues={formDefaultValues}
      buttonText="메뉴 수정"
      linkToCancel={`/${storeId}/menus`}
      mutation={updateMenu}
      formSubmit={formSubmit}
    >
      <FormErrorWithRetry
        title={`메뉴를 수정하지 못했어요.`}
        errorMessage={errorMessage}
      />
    </MenuForm>
  );
}
