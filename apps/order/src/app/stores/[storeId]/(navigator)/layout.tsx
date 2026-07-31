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

  const queryClient = new QueryClient();

  if (sessionToken) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: makeQueryKey(STORE_CONTEXT_PATH),
        queryFn: async () =>
          fetchWithSessionToken<StoreContextResponse>(
            STORE_CONTEXT_PATH,
            sessionToken
          ),
        staleTime: 60 * 1000,
      }),
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
  }

  if (!sessionToken) {
    return <SessionExpiredError />;
  }

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
