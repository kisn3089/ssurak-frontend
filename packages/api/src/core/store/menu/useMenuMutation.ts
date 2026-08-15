import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BulkCreateMenusParams,
  CreateMenuParams,
  DeleteMenuParams,
  httpMenus,
  ReorderMenusParams,
  UpdateMenuParams,
} from "./httpMenu";
import { makeQueryKey } from "../../../utils/makeQueryKey";

export default function useMenuMutation(
  storeId: string,
  { ignoreInvalidation }: { ignoreInvalidation?: boolean } = {}
) {
  const queryClient = useQueryClient();

  const invalidQueryKeys = [makeQueryKey(`/stores/v1/${storeId}/menus`)];

  const invalidateQueries = () => {
    invalidQueryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  const createMenu = useMutation({
    mutationFn: (args: Omit<CreateMenuParams, "storeId">) =>
      httpMenus.createMenu({ storeId, ...args }),
    onSuccess: () => !ignoreInvalidation && invalidateQueries(),
  });

  // 카테고리가 새로 생길 수 있어(항목의 categoryName) 카테고리 캐시도 함께 무효화한다.
  const bulkCreateMenus = useMutation({
    mutationFn: (args: Omit<BulkCreateMenusParams, "storeId">) =>
      httpMenus.bulkCreateMenus({ storeId, ...args }),
    onSuccess: () => {
      if (ignoreInvalidation) return;
      invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: makeQueryKey(`/stores/v1/${storeId}/categories`),
      });
    },
  });

  const updateMenu = useMutation({
    mutationFn: (args: Omit<UpdateMenuParams, "storeId">) =>
      httpMenus.updateMenu({ storeId, ...args }),
    onSuccess: () => !ignoreInvalidation && invalidateQueries(),
  });

  const reorderMenus = useMutation({
    mutationFn: (args: Omit<ReorderMenusParams, "storeId">) =>
      httpMenus.reorderMenus({ storeId, ...args }),
    // 서버가 카테고리 메뉴 집합 불일치를 409로 거절할 수 있으므로 실패해도 진짜 순서를 다시 가져온다.
    onSettled: () => !ignoreInvalidation && invalidateQueries(),
  });

  const deleteMenu = useMutation({
    mutationFn: (args: Omit<DeleteMenuParams, "storeId">) =>
      httpMenus.deleteMenu({ storeId, ...args }),
    onSuccess: () => !ignoreInvalidation && invalidateQueries(),
  });

  return {
    createMenu,
    bulkCreateMenus,
    updateMenu,
    reorderMenus,
    deleteMenu,
    invalidateQueries,
  };
}
