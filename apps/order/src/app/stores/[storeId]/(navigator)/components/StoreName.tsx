"use client";

import useQueryWithSession from "@ssurak/api/hooks/useQueryWithSession";
import { StoreContextResponse } from "@ssurak/api/types/store/store.interface";

export default function StoreName() {
  const { data: storeName } = useQueryWithSession<StoreContextResponse, string>(
    "/stores/v1/sessions/me/store-context",
    {
      queryOptions: {
        select: (storeContext) => storeContext.table.store.name,
      },
    }
  );

  return (
    <div className="flex flex-wrap overflow-hidden w-48">
      <h1 className="md:text-lg font-bold truncate">{storeName}</h1>
    </div>
  );
}
