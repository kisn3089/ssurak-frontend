import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { useParams } from "next/navigation";
import { CategoryReorderRow } from "../category-reorder-control.type";
import { useController, useForm } from "react-hook-form";
import {
  CreateCategoryPayload,
  createCategoryPayloadSchema,
  ReorderCategoriesPayload,
  reorderCategoriesPayloadSchema,
} from "@ssurak/api/schemas/model/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import useFormResolver from "../../../hooks/useFormResolver";
import { syncDraftOrder } from "../../../utils/menu-sort-order";

export default function useBuildControlForm(isRenderChild: number | undefined) {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: categoryWithMenus } = useSuspenseWithAuth<
    CategoryWithMenusResponse[]
  >(`/stores/v1/${storeId}/menus`);

  const serverCategoryIds = categoryWithMenus.map(
    (category) => category.publicId
  );

  const categoryByPublicId = new Map(
    categoryWithMenus.map((category) => [category.publicId, category])
  );

  const { control, getValues, setValue } = useForm<ReorderCategoriesPayload>({
    resolver: zodResolver(reorderCategoriesPayloadSchema),
    mode: "onChange",
    defaultValues: { categoryIds: serverCategoryIds },
  });

  const { field } = useController({ control, name: "categoryIds" });
  const draftCategoryIds = field.value ?? [];

  const orderedCategoryIds = syncDraftOrder(
    draftCategoryIds,
    serverCategoryIds
  );

  const rows: CategoryReorderRow[] = orderedCategoryIds.flatMap(
    (categoryId) => {
      const category = categoryByPublicId.get(categoryId);
      if (!category) return [];

      return [
        { id: category.publicId, name: category.name, menus: category.menus },
      ];
    }
  );

  const existingCategoryNames = new Set<string>(
    rows.filter((_, index) => index !== isRenderChild).map((row) => row.name)
  );

  const resolver = useFormResolver<CreateCategoryPayload>({
    schema: createCategoryPayloadSchema,
    field: "name",
    existingValues: existingCategoryNames,
    duplicateMessage: "이미 존재하는 카테고리 이름입니다.",
  });

  return { categoryWithMenus, rows, field, getValues, setValue, resolver };
}
