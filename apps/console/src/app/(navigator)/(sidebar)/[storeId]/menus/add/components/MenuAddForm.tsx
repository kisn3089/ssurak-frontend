"use client";

import { useParams } from "next/navigation";
import { MenuFormValues } from "../../../tables/types/menu-form.type";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import MenuForm from "../../components/MenuForm";
import FormErrorWithRetry from "../../../components/FormErrorWithRetry";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";

const formDefaultValues: MenuFormValues = {
  name: "",
  price: undefined,
  categoryId: "",
  sortOrder: undefined,
  isAvailable: true,
  customOptions: undefined,
  requiredOptions: undefined,
  description: undefined,
  imageKey: undefined,
};

export default function MenuAddForm() {
  const { storeId } = useParams<{ storeId: string }>();
  const { createMenu } = useMenuMutation(storeId);

  const formSubmit = (payload: CreateMenuPayload) => {
    createMenu.mutate({ createMenuPayload: payload });
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
