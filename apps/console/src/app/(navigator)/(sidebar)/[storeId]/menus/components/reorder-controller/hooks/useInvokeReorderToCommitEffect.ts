import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { useEffect } from "react";
import { UseFormGetValues } from "react-hook-form";
import useCategoryMutations from "./useCategoryMutations";
import { isSameOrder, syncDraftOrder } from "@ssurak/api/utils/reorder";
import { isPendingCategoryId } from "@ssurak/api/core/store/category/pendingCategory";

type UseInvokeReorderToCommitEffectProps = {
  categoryWithMenus: CategoryWithMenusResponse[];
  getValues: UseFormGetValues<{ categoryIds: string[] }>;
  registerCommit: (handler: (() => void) | null) => void;
};

/** 카테고리 변경 시 재정렬하여 맞춘다. */
export default function useInvokeReorderToCommitEffect({
  categoryWithMenus,
  getValues,
  registerCommit,
}: UseInvokeReorderToCommitEffectProps) {
  const { reorderCategoriesMutate } = useCategoryMutations();

  useEffect(() => {
    const commitReorder = () => {
      // 낙관적으로 붙여 둔 카테고리는 서버가 모르는 id다. 실어 보내면 집합 검사에서 409로 막힌다.
      const serverIds = categoryWithMenus
        .map((category) => category.publicId)
        .filter((publicId) => !isPendingCategoryId(publicId));
      const reorderedIds = syncDraftOrder(getValues("categoryIds"), serverIds);

      if (isSameOrder(reorderedIds, serverIds)) return;

      reorderCategoriesMutate({
        reorderCategoriesPayload: { categoryIds: reorderedIds },
      });
    };

    registerCommit(commitReorder);
    return () => registerCommit(null);
  }, [registerCommit, categoryWithMenus, getValues, reorderCategoriesMutate]);
}
