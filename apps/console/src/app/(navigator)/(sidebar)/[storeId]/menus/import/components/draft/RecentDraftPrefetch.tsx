import { getCachedMenuDrafts } from "@/app/common/servers/menuDraftsCache";
import { menuDraftListUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { makeQueryKey } from "@ssurak/api/utils/makeQueryKey";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

/**
 * 초안 목록 전용 프리페치. 범용 `ServerPrefetch`와 달리 매 렌더 백엔드로 나가지 않고
 * 서버 캐시(`getCachedMenuDrafts`)에서 읽어 하이드레이션 상태를 만든다.
 */
export default async function RecentDraftPrefetch({
  storeId,
  children,
}: {
  storeId: string;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  try {
    const drafts = await getCachedMenuDrafts(storeId);
    queryClient.setQueryData(makeQueryKey(menuDraftListUrl(storeId)), drafts);
  } catch (error) {
    console.error("[RecentDraftPrefetch] Failed to load menu drafts", error);
    return children;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
