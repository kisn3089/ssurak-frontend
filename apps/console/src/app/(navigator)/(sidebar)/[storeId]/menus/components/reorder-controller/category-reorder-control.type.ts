import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { ReorderRowData } from "../../../components/form/reorder-form-field/ReorderForm";
import { Resolver } from "react-hook-form";
import { CreateCategoryPayload } from "@ssurak/api/schemas/model/category.schema";
import { SelectFromChildrenProps } from "../../../components/form/select-form-field/SelectFormField";

export type CategoryReorderRow = ReorderRowData &
  Pick<CategoryWithMenusResponse, "menus">;

export type CategoryReorderChildrenProps = {
  rows: CategoryReorderRow[];
  onReorder: (reorderedIds: string[]) => void;
  createRow: (name: string) => void;
  renameRow: (categoryId: string, name: string) => void;
  resolver: Resolver<CreateCategoryPayload>;
  deleteRow: (
    categoryId: string,
    name: string,
    onSuccess?: () => void
  ) => void;
};

export type CategoryReorderControlProps = Pick<
  SelectFromChildrenProps,
  "registerCommit"
> & {
  /** 지금 이름을 고치는 중인 카테고리. 인덱스는 드래그로 밀리므로 id로 잡는다. */
  renamingCategoryId: string | null;
  children: (props: CategoryReorderChildrenProps) => React.ReactNode;
};
