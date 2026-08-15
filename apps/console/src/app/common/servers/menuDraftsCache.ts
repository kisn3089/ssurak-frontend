import { menuDraftListUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { http } from "@ssurak/api/core/axios/http";
import { MenuDraftListResponse } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { getTokenSubject } from "@ssurak/auth/utils/decodedToken";
import { unstable_cache } from "next/cache";
import { getAccessToken } from "./getAccessToken";

/**
 * 매장 단위 태그. 초안이 생기거나 바뀌면 이 태그로 한 번에 무효화한다.
 * 캐시 키는 사용자별로 갈리지만 태그는 공유하므로, 무효화는 매장의 모든 항목에 닿는다.
 */
export function menuDraftsTag(storeId: string) {
  return `menu-drafts:${storeId}`;
}

const MENU_DRAFTS_REVALIDATE_SECONDS = 300;

export async function getCachedMenuDrafts(
  storeId: string
): Promise<MenuDraftListResponse> {
  const accessToken = await getAccessToken();
  const ownerId = getTokenSubject(accessToken);

  const loadMenuDrafts = unstable_cache(
    async () => {
      const response = await http.get<MenuDraftListResponse>(
        menuDraftListUrl(storeId),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    },
    ["menu-drafts", storeId, ownerId ?? "anonymous"],
    {
      tags: [menuDraftsTag(storeId)],
      revalidate: MENU_DRAFTS_REVALIDATE_SECONDS,
    }
  );

  return loadMenuDrafts();
}
