"use client";

import {
  ActiveSessionResponse,
  BoardTableWithSessionResponse,
} from "@ssurak/api/types/board/board.interface";
import { TableOrder } from "./table-order";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { BoardTable } from "@ssurak/ui/components/board-table";
import SheetQrCode from "../SheetQrCode";
import ConditionalLink from "@/app/(navigator)/components/ConditionalLink";
import QrButton from "@ssurak/ui/components/qr-scan/QrButton";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@ssurak/ui/lib/utils";

type TableListProps = {
  sanitizedTable: BoardTableWithSessionResponse;
};

export default function TableList({ sanitizedTable }: TableListProps) {
  const { data: session } = useSuspenseWithAuth<ActiveSessionResponse>(
    `/orders/v1/tables/${sanitizedTable.publicId}/active-session`
  );
  const { tableId } = useParams<{ tableId: string }>();
  const [pathname] = usePathname().split("orders");

  const isActivatedTable = sanitizedTable.isActive === true;
  const isSelected = tableId === sanitizedTable.publicId;
  const orders = session?.orders ?? [];

  return (
    <ConditionalLink
      condition={isActivatedTable && !isSelected}
      href={`${pathname}orders/${sanitizedTable.publicId}`}
      className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BoardTable.Provider table={sanitizedTable}>
        <BoardTable.Layout
          className={cn(
            !isActivatedTable
              ? "opacity-20 cursor-not-allowed"
              : "hover:shadow-md hover:shadow-stone-500",
            {
              "shadow-lg shadow-stone-500 hover:shadow-lg": isSelected,
            }
          )}
        >
          <BoardTable.Header>
            <BoardTable.LeftLayout>
              <SheetQrCode
                tableNumber={sanitizedTable.tableNumber}
                qrCode={sanitizedTable.qrCode}
              >
                <QrButton disabled={!sanitizedTable.isActive} />
              </SheetQrCode>
              <BoardTable.Title />
              <BoardTable.Section />
            </BoardTable.LeftLayout>
            <BoardTable.RightLayout>
              <BoardTable.MetaInfo />
            </BoardTable.RightLayout>
          </BoardTable.Header>
          <BoardTable.Content>
            <TableOrder.AcceptAllButton
              orders={orders}
              tableId={sanitizedTable.publicId}
            />
            <TableOrder.OrderList
              orders={orders}
              tableId={sanitizedTable.publicId}
            />
          </BoardTable.Content>
          <BoardTable.Footer />
        </BoardTable.Layout>
      </BoardTable.Provider>
    </ConditionalLink>
  );
}
