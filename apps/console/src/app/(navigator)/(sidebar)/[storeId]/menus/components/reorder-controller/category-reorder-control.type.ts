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
  deleteRow: (categoryId: string, name: string) => void;
};

export type CategoryReorderControlProps = Omit<
  SelectFromChildrenProps,
  "setIsRenderChild"
> & {
  children: (props: CategoryReorderChildrenProps) => React.ReactNode;
};
