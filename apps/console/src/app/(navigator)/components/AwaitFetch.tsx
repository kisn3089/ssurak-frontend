"use client";

import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { OrderBoardByStoreResponse } from "@ssurak/api/types/board/board.interface";

export default function AwaitFetch({
  url,
  children,
  onSuccess,
}: {
  url: string;
  children: React.ReactNode;
  onSuccess?: (data: OrderBoardByStoreResponse) => void;
}) {
  const { isSuccess } = useSuspenseWithAuth<OrderBoardByStoreResponse>(url, {
    onSuccess,
  });

  if (!isSuccess) {
    return null;
  }

  return children;
}
