import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeQueryKey } from "../../../utils/makeQueryKey";
import { CategoryWithMenusResponse } from "../../../types/category/category.interface";
import {
  CreateCategoryParams,
  DeleteCategoryParams,
  httpCategories,
  ReorderCategoryParams,
  UpdateCategoryParams,
} from "./httpCategory";
import { HttpAxiosError } from "../../axios/http";
import { buildPendingCategory, isPendingCategoryId } from "./pendingCategory";
import { isCategoryOrderMismatch } from "./httpCategoryErrors";
import { isSameOrder, syncDraftOrder } from "../../../utils/reorder";

type CategoryMutationOptions = {
  onReorderError?: (error: HttpAxiosError) => void;
};

type ReorderCategoriesVariables = Omit<ReorderCategoryParams, "storeId"> & {
  isRetry?: boolean;
};

export default function useCategoryMutation(
  storeId: string,
  { onReorderError }: CategoryMutationOptions = {}
) {
  const queryClient = useQueryClient();
  /** 점주 카테고리 목록은 별도 엔드포인트가 아니라 이 메뉴판 응답(`CategoryWithMenusResponse[]`)에 실려 온다. */
  const menusQueryKey = makeQueryKey(`/stores/v1/${storeId}/menus`);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: menusQueryKey, exact: true });
  };

  const applyOptimisticMenus = async (
    update: (
      categories: CategoryWithMenusResponse[]
    ) => CategoryWithMenusResponse[]
  ) => {
    await queryClient.cancelQueries({ queryKey: menusQueryKey, exact: true });

    const previousMenus =
      queryClient.getQueryData<CategoryWithMenusResponse[]>(menusQueryKey);
    if (previousMenus) {
      queryClient.setQueryData(menusQueryKey, update(previousMenus));
    }

    return { previousMenus };
  };

  const rollbackMenus = (
    _error: HttpAxiosError,
    _variables: unknown,
    context?: { previousMenus?: CategoryWithMenusResponse[] }
  ) => {
    if (context?.previousMenus) {
      queryClient.setQueryData(menusQueryKey, context.previousMenus);
    }
  };

  const createCategory = useMutation({
    mutationFn: (args: Omit<CreateCategoryParams, "storeId">) =>
      httpCategories.createCategory({ storeId, ...args }),
    onMutate: ({ createCategoryPayload }) =>
      applyOptimisticMenus((categories) => [
        ...categories,
        buildPendingCategory(createCategoryPayload.name, categories),
      ]),
    onError: rollbackMenus,
    // 자리표시자 publicId를 서버가 발급한 cuid2로 갈아 끼우려면 무효화가 반드시 필요하다.
    onSettled: invalidateQueries,
  });

  const updateCategory = useMutation({
    mutationFn: (args: Omit<UpdateCategoryParams, "storeId">) =>
      httpCategories.updateCategory({ storeId, ...args }),
    onMutate: ({ categoryId, updateCategoryPayload }) =>
      applyOptimisticMenus((categories) =>
        categories.map((category) =>
          category.publicId === categoryId
            ? { ...category, ...updateCategoryPayload }
            : category
        )
      ),
    onError: rollbackMenus,
    onSettled: invalidateQueries,
  });

  /** 집합 불일치(409)는 최신 목록을 받아 원하던 순서를 다시 얹어 한 번만 재시도한다. */
  const retryReorderWithFreshOrder = async (desiredIds: string[]) => {
    await queryClient.refetchQueries({ queryKey: menusQueryKey, exact: true });

    const freshCategories =
      queryClient.getQueryData<CategoryWithMenusResponse[]>(menusQueryKey) ??
      [];
    const freshServerIds = freshCategories
      .map((category) => category.publicId)
      .filter((publicId) => !isPendingCategoryId(publicId));
    const retryIds = syncDraftOrder(desiredIds, freshServerIds);

    if (isSameOrder(retryIds, freshServerIds)) return;

    reorderCategories.mutate({
      reorderCategoriesPayload: { categoryIds: retryIds },
      isRetry: true,
    });
  };

  const reorderCategories = useMutation({
    mutationFn: ({ reorderCategoriesPayload }: ReorderCategoriesVariables) =>
      httpCategories.reorderCategories({ storeId, reorderCategoriesPayload }),
    onMutate: ({ reorderCategoriesPayload }) =>
      applyOptimisticMenus((categories) => {
        const categoryByPublicId = new Map(
          categories.map((category) => [category.publicId, category])
        );
        return reorderCategoriesPayload.categoryIds
          .map((publicId) => categoryByPublicId.get(publicId))
          .filter((category) => category !== undefined);
      }),
    onError: (error, variables, context) => {
      rollbackMenus(error, variables, context);

      if (!variables.isRetry && isCategoryOrderMismatch(error)) {
        void retryReorderWithFreshOrder(
          variables.reorderCategoriesPayload.categoryIds
        );
        return;
      }

      onReorderError?.(error);
    },
    // 서버가 카테고리 집합 불일치를 409로 거절할 수 있으므로 실패해도 진짜 순서를 다시 가져온다.
    onSettled: invalidateQueries,
  });

  const deleteCategory = useMutation({
    mutationFn: (args: Omit<DeleteCategoryParams, "storeId">) =>
      httpCategories.deleteCategory({ storeId, ...args }),
    onMutate: ({ categoryId }) =>
      applyOptimisticMenus((categories) =>
        categories.filter((category) => category.publicId !== categoryId)
      ),
    onError: rollbackMenus,
    onSettled: invalidateQueries,
  });

  return { createCategory, updateCategory, reorderCategories, deleteCategory };
}
