"use server";

import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { http } from "@ssurak/api/core/axios/http";
import { makeQueryKey } from "@ssurak/api/utils/makeQueryKey";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

type ServerPrefetchProps<T> = {
  url: string;
  children: React.ReactNode;
} & (
  | {
      shouldSuccess: true;
      onSuccess?: (data: T, queryClient: QueryClient) => void;
    }
  | { shouldSuccess?: false; onSuccess?: never }
);

export default async function ServerPrefetch<T>({
  url,
  children,
  shouldSuccess,
  onSuccess,
}: ServerPrefetchProps<T>) {
  const queryClient = new QueryClient();
  const accessToken = await getAccessToken();
  const queryKey = makeQueryKey(url);

  const fetchData = async (): Promise<T> => {
    return http
      .get<T>(url, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => res.data);
  };

  /**
   * shouldSuccess가 true인 경우 fetchQuery를 사용하는데 실패할 경우 상위 컴포넌트에서
   * 에러 처리를 할 수 있도록 하기 위함이다.
   * 그렇지 않은 경우 prefetchQuery를 사용하여 에러가 발생하더라도 무시하고 클라이언트에서 시도한다.
   *
   * onSuccess는 fetch가 성공해 데이터가 캐시에 존재할 때만 resolve된 데이터로 실행된다.
   *
   * @see {@link file://./(navigator)/error.tsx}
   */
  if (shouldSuccess) {
    try {
      const data = await queryClient.fetchQuery({
        queryKey,
        queryFn: fetchData,
      });
      onSuccess?.(data, queryClient);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          redirect("/signin");
        } else if (error.response?.status === 404) {
          notFound();
        } else if (error.response?.status === 419) {
          console.info(
            "Access token expired. Handing off to the client to refresh..."
          );
          /**
           * 에러가 담긴 queryClient를 hydrate하지 않고 children만 렌더해, 클라이언트 쿼리 훅이
           * 재요청 → axios 인터셉터가 토큰을 갱신한 뒤 재시도하도록 위임한다.
           */
          return children;
        } else {
          console.error(error);
        }
      }
      throw error;
    }
  } else {
    await queryClient.prefetchQuery({ queryKey, queryFn: fetchData });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
