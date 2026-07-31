import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NavLogoLink from "./components/NavLogoLink";
import NavTableNumber from "./components/NavTableNumber";
import { StoreContextResponse } from "@ssurak/api/types/store/store.interface";
import { Cart } from "@ssurak/api/types/cart/cart.interface";
import { OrderWithItemsResponse } from "@ssurak/api/types/order/order.interface";
import { cookies } from "next/headers";
import SyncDaemon from "./components/daemon/SyncDaemon";
import { makeQueryKey } from "@ssurak/api/utils/makeQueryKey";
import SessionExpiredError from "../components/SessionExpiredError";

const STORE_CONTEXT_PATH = "/stores/v1/sessions/me/store-context";
const CART_LIST_PATH = "/carts/v1/sessions/carts";
const ORDER_HISTORY = "/orders/v1/sessions/orders";
const baseUrl =
  process.env.NEXT_PUBLIC_SSURAK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_SSURAK_URL ??
  "http://localhost:8080";

export default async function NavigatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const sessionToken = (await cookies()).get(COOKIE_TABLE.SESSION_TOKEN)?.value;

  if (!sessionToken) {
    return <SessionExpiredError />;
  }

  const queryClient = new QueryClient();

  // store-context는 prefetchQuery가 아니라 직접 await한다. prefetchQuery는 에러를
  // 삼켜버려 세션 만료를 감지할 수 없고, throwError: false인 나머지 조회는 401 에러
  // 본문을 그대로 데이터로 캐시해 클라이언트에서 orders.filter 같은 호출이 깨진다.
  const [storeContext] = await Promise.all([
    fetchWithSessionToken<StoreContextResponse>(
      STORE_CONTEXT_PATH,
      sessionToken
    ).catch(() => null),
    queryClient.prefetchQuery({
      queryKey: makeQueryKey(CART_LIST_PATH),
      queryFn: async () =>
        fetchWithSessionToken<Cart>(CART_LIST_PATH, sessionToken, {
          throwError: false,
        }),
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: makeQueryKey(ORDER_HISTORY),
      queryFn: async () =>
        fetchWithSessionToken<OrderWithItemsResponse[]>(
          ORDER_HISTORY,
          sessionToken,
          {
            throwError: false,
          }
        ),
      staleTime: 60 * 1000,
    }),
  ]);

  if (!storeContext) {
    return <SessionExpiredError />;
  }

  queryClient.setQueryData(makeQueryKey(STORE_CONTEXT_PATH), storeContext);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <header className="flex flex-col items-center sticky bg-white top-0 z-10">
        <nav className="w-full h-12 flex items-center justify-between px-4">
          <NavLogoLink storeId={storeId} />
          <NavTableNumber />
        </nav>
      </header>
      <main>
        <SyncDaemon />
        {children}
      </main>
    </HydrationBoundary>
  );
}

async function fetchWithSessionToken<ResponseType>(
  url: string,
  sessionToken: string,
  option?: { throwError: boolean }
): Promise<ResponseType> {
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      Cookie: `${COOKIE_TABLE.SESSION_TOKEN}=${sessionToken}`,
    },
    cache: "no-store",
  });

  const { throwError = true } = option || {};

  if (throwError && !response.ok) {
    throw new Error(`Failed to fetch: ${url}, status: ${response.status}`);
  }

  return response.json();
}
