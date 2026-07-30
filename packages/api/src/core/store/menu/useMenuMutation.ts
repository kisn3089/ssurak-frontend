import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
    updateMenu,
    reorderMenus,
    deleteMenu,
    invalidateQueries,
  };
}
