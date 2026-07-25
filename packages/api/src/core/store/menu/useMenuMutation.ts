import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateMenuParams,
  DeleteMenuParams,
  httpMenus,
  UpdateMenuParams,
} from "./httpMenu";
import { makeQueryKey } from "../../../utils/makeQueryKey";

export default function useMenuMutation(storeId: string) {
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
    onSuccess: invalidateQueries,
  });

  const updateMenu = useMutation({
    mutationFn: (args: Omit<UpdateMenuParams, "storeId">) =>
      httpMenus.updateMenu({ storeId, ...args }),
    onSuccess: invalidateQueries,
  });

  const deleteMenu = useMutation({
    mutationFn: (args: Omit<DeleteMenuParams, "storeId">) =>
      httpMenus.deleteMenu({ storeId, ...args }),
    onSuccess: invalidateQueries,
  });

  return { createMenu, updateMenu, deleteMenu };
}
