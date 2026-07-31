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

export default function useCategoryMutation(storeId: string) {
  const queryClient = useQueryClient();

  const menusQueryKey = makeQueryKey(`/stores/v1/${storeId}/menus`);

  const invalidQueryKeys = [
    makeQueryKey(`/stores/v1/${storeId}/categories`),
    menusQueryKey,
  ];

  const invalidateQueries = () => {
    invalidQueryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  const applyOptimisticMenus = async (
    update: (
      categories: CategoryWithMenusResponse[]
    ) => CategoryWithMenusResponse[]
  ) => {
    await queryClient.cancelQueries({ queryKey: menusQueryKey });

    const previousMenus =
      queryClient.getQueryData<CategoryWithMenusResponse[]>(menusQueryKey);
    if (previousMenus) {
      queryClient.setQueryData(menusQueryKey, update(previousMenus));
    }

    return { previousMenus };
  };

  const rollbackMenus = (
    // unknown으로 두면 TError 추론이 unknown으로 내려앉아 호출부가 HttpAxiosError를 못 읽는다.
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
    onSuccess: invalidateQueries,
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
  });

  const reorderCategories = useMutation({
    mutationFn: (args: Omit<ReorderCategoryParams, "storeId">) =>
      httpCategories.reorderCategories({ storeId, ...args }),
    onMutate: ({ reorderCategoriesPayload }) =>
      applyOptimisticMenus((categories) => {
        const categoryByPublicId = new Map(
          categories.map((category) => [category.publicId, category])
        );
        return reorderCategoriesPayload.categoryIds
          .map((publicId) => categoryByPublicId.get(publicId))
          .filter((category) => category !== undefined);
      }),
    onError: rollbackMenus,
    // 서버가 카테고리 집합 불일치를 409로 거절할 수 있으므로 실패해도 진짜 순서를 다시 가져온다.
    onSettled: invalidateQueries,
  });

  const deleteCategory = useMutation({
    mutationFn: (args: Omit<DeleteCategoryParams, "storeId">) =>
      httpCategories.deleteCategory({ storeId, ...args }),
    onSuccess: invalidateQueries,
  });

  return { createCategory, updateCategory, reorderCategories, deleteCategory };
}
