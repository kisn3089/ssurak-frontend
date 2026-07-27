import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import {
  MenuCustomOption,
  MenuRequiredOption,
} from "@ssurak/api/types/menu/menuOptions.interface";
import { UseFormSetError } from "react-hook-form";
import { MenuFormPayload } from "../../menus/types/menu-form-payload.type";

export interface MenuFormValues {
  name: string;
  publicId?: string;
  price?: number;
  categoryId?: string;
  sortOrder?: number;
  requiredOptions?: MenuRequiredOption;
  customOptions?: MenuCustomOption;
  description?: string;
  isAvailable?: boolean;
  imageKey?: string;
}

type MenuMutations = ReturnType<typeof useMenuMutation>;

type MenuBaseForm = {
  formDefaultValues: MenuFormValues;
  linkToCancel: string;
  children: React.ReactNode;
  buttonText: string;
  /** payload는 이미 폼 배열 → 서버 Record로 변환된 상태로 넘어온다. */
  formSubmit: (
    payload: CreateMenuPayload,
    setError: UseFormSetError<MenuFormPayload>
  ) => void;
};

export type MenuFormProps = MenuBaseForm & {
  mutation: MenuMutations["createMenu"] | MenuMutations["updateMenu"];
};
