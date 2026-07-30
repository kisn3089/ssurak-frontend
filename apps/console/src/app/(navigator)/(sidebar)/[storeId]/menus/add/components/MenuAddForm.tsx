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

const formDefaultValues: MenuFormValues = {
  name: "",
  price: undefined,
  categoryId: "",
  isAvailable: true,
  customOptions: undefined,
  requiredOptions: undefined,
  description: undefined,
  imageKey: undefined,
};

export default function MenuAddForm() {
  const { storeId } = useParams<{ storeId: string }>();
  const { createMenu, reorderMenus, invalidateQueries } = useMenuMutation(
    storeId,
    { ignoreInvalidation: true }
  );

  const formSubmit = async (
    payload: CreateMenuPayload,
    { resolveReorder }: MenuSubmitContext
  ) => {
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

    const reorderMenusPayload = resolveReorder(createdMenuId);
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

  const errorMessage = createMenu.error
    ? httpMenuErrors.post(createMenu.error)
    : undefined;

  return (
    <MenuForm
      formDefaultValues={formDefaultValues}
      buttonText="메뉴 추가"
      linkToCancel={`/${storeId}/menus`}
      mutation={createMenu}
      formSubmit={formSubmit}
    >
      <FormErrorWithRetry
        title={`메뉴를 추가하지 못했어요.`}
        errorMessage={errorMessage}
      />
    </MenuForm>
  );
}
