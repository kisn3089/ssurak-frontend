"use client";

import TableList from "../table-order-list/TableList";
import { OrderBoardByStoreResponse } from "@ssurak/api/types/board/board.interface";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "./TableOrderListLayout";
import { useParams } from "next/navigation";
import { GlobalTimerProvider } from "@ssurak/ui/components/session-timer/GlobalTimerContext";
import { useSetCacheByStoreBoard } from "../../hooks/useSetCacheByStoreBoard";

export default function TableBoard() {
  const params = useParams<{ storeId: string }>();
  const { setCache } = useSetCacheByStoreBoard();

  /**
   * 같은 보드 키를 AwaitOrdersSummary도 구독한다. 재조회 때는 마지막으로 옵션을 설정한 옵저버의 queryFn이 쓰이므로,
   * 어느 쪽이 실행되더라도 테이블별 캐시가 채워지도록 여기에도 onSuccess를 건다.
   */
  const { data: tables } = useSuspenseWithAuth<OrderBoardByStoreResponse>(
    `/orders/v1/stores/${params.storeId}/board`,
    { onSuccess: setCache }
  );

  return (
    <GlobalTimerProvider>
      <TableBoardLayout>
        {tables.map((sanitizedTable) => (
          <TableList
            key={sanitizedTable.publicId}
            sanitizedTable={sanitizedTable}
          />
        ))}
      </TableBoardLayout>
    </GlobalTimerProvider>
  );
}
