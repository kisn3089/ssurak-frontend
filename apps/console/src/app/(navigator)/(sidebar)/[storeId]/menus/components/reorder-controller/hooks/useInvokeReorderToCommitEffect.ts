import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { useEffect } from "react";
import { UseFormGetValues } from "react-hook-form";
import useCategoryMutations from "./useCategoryMutations";
import { isSameOrder, syncDraftOrder } from "../../../utils/menu-sort-order";
import notifyFailure from "../utils/notifyFailure";
import { httpCategoryErrors } from "@ssurak/api/core/store/category/httpCategoryErrors";

type UseInvokeReorderToCommitEffectProps = {
  categoryWithMenus: CategoryWithMenusResponse[];
  getValues: UseFormGetValues<{ categoryIds: string[] }>;
  registerCommit: (handler: (() => void) | null) => void;
};

export default function useInvokeReorderToCommitEffect({
  categoryWithMenus,
  getValues,
  registerCommit,
}: UseInvokeReorderToCommitEffectProps) {
  const { reorderCategoriesMutate } = useCategoryMutations();

  useEffect(() => {
    const commitReorder = () => {
      const serverIds = categoryWithMenus.map((category) => category.publicId);
      const reorderedIds = syncDraftOrder(getValues("categoryIds"), serverIds);

      if (isSameOrder(reorderedIds, serverIds)) return;

      reorderCategoriesMutate(
        { reorderCategoriesPayload: { categoryIds: reorderedIds } },
        {
          onError: (error) =>
            notifyFailure(
              "카테고리 순서를 저장하지 못했어요.",
              httpCategoryErrors.reorder(error)
            ),
        }
      );
    };

    registerCommit(commitReorder);
    return () => registerCommit(null);
  }, [registerCommit, categoryWithMenus, getValues, reorderCategoriesMutate]);
}
