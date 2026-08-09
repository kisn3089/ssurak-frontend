import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import {
  CreateMenuPayload,
  ReorderMenusPayload,
} from "@ssurak/api/schemas/model/menu.schema";
import { UseFormSetError } from "react-hook-form";
import { MenuFormPayload } from "../../menus/types/menu-form-payload.type";
import { DetailOptionGroup } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";

export interface MenuFormValues {
  name: string;
  publicId?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  isAvailable?: boolean;
  imageKey?: string;
}

type MenuMutations = ReturnType<typeof useMenuMutation>;

export type MenuSubmitOutcome = {
  reorderFailed: boolean;
  /** 메뉴는 만들어졌지만 함께 올리려던 옵션이 남았다(메뉴 생성 화면에서만 생긴다). */
  optionsFailed?: boolean;
};

export type MenuSubmitContext = {
  setError: UseFormSetError<MenuFormPayload>;
  resolveReorder: (menuId: string) => ReorderMenusPayload | null;
};

type MenuBaseForm = {
  formDefaultValues: MenuFormValues;
  linkToCancel: string;
  children: React.ReactNode;
  buttonText: string;
  renderError: React.ReactNode;
  options?: DetailOptionGroup[];
  formSubmit: (
    payload: CreateMenuPayload,
    context: MenuSubmitContext
  ) => Promise<MenuSubmitOutcome | void>;
};

export type MenuFormProps = MenuBaseForm & {
  mutation: MenuMutations["createMenu"] | MenuMutations["updateMenu"];
};
