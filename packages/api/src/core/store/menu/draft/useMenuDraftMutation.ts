import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateMenuDraftParams,
  httpMenuDrafts,
  UpdateMenuDraftParams,
} from "./httpMenuDraft";
import { makeQueryKey } from "../../../../utils/makeQueryKey";
import { MenuDraftResponse } from "../../../../types/menuDraft/menuDraft.interface";

export function menuDraftListUrl(storeId: string) {
  return `/stores/v1/${storeId}/menus/drafts`;
}

export function menuDraftUrl(storeId: string, draftId: string) {
  return `${menuDraftListUrl(storeId)}/${draftId}`;
}

export default function useMenuDraftMutation(storeId: string) {
  const queryClient = useQueryClient();

  /** 응답을 상세 캐시에 그대로 심어서 추출 직후 리뷰 화면으로 이동할 때 네트워크 왕복을 없앤다. */
  const seedDraftCache = (draft: MenuDraftResponse) => {
    queryClient.setQueryData(
      makeQueryKey(menuDraftUrl(storeId, draft.draftId)),
      draft
    );
  };

  const createDraft = useMutation({
    mutationFn: (args: Omit<CreateMenuDraftParams, "storeId">) =>
      httpMenuDrafts.createDraft({ storeId, ...args }),
    onSuccess: (draft) => {
      seedDraftCache(draft);
      queryClient.invalidateQueries({
        queryKey: makeQueryKey(menuDraftListUrl(storeId)),
      });
    },
  });

  const updateDraft = useMutation({
    mutationFn: (args: Omit<UpdateMenuDraftParams, "storeId">) =>
      httpMenuDrafts.updateDraft({ storeId, ...args }),
    onSuccess: seedDraftCache,
  });

  return { createDraft, updateDraft };
}
