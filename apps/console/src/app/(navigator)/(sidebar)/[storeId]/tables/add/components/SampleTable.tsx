import { CardFooter } from "@ssurak/ui/components/layouts/card";
import QrButton from "@ssurak/ui/components/qr-scan/QrButton";
import { BoardTable } from "@ssurak/ui/components/board-table";
import { cn } from "@ssurak/ui/lib/utils";
import { TableOrder } from "../../../orders/components/table-order-list/table-order";

type Table = {
  tableNumber: string;
  seats?: number | null;
  section?: string | null;
  floor?: number | null;
  disabled?: boolean;
};
type SampleTableProps = {
  table: Table;
  children?: React.ReactNode;
  isSuccess?: boolean;
};

export default function SampleTable({
  table,
  children,
  isSuccess,
}: SampleTableProps) {
  return (
    <BoardTable.Provider table={table}>
      <BoardTable.Layout
        className={cn(
          "pointer-events-none overflow-hidden",
          { "opacity-50": table.disabled },
          { "animate-tzCard mb-3 border-green-200 bg-green-50": isSuccess }
        )}
      >
        <BoardTable.Header
          className={cn({ "border-green-200 bg-green-50": isSuccess })}
        >
          <BoardTable.LeftLayout>
            <div className="pointer-events-none">
              <QrButton isSuccess={isSuccess} />
            </div>
            <BoardTable.Title />
            <BoardTable.Section />
          </BoardTable.LeftLayout>
          <BoardTable.RightLayout>
            {!isSuccess && <BoardTable.MetaInfo />}
            <BoardTable.SuccessBadge isSuccess={isSuccess} />
          </BoardTable.RightLayout>
        </BoardTable.Header>
        <BoardTable.Content
          className={cn("min-h-52", { "flex border-green-100": isSuccess })}
        >
          {children}
          {!isSuccess && (
            <div className="flex flex-col gap-y-1 p-2">
              <TableOrder.ItemLayout>
                <TableOrder.StatusBadge
                  orderStatus={"PENDING"}
                  isLoading={false}
                />
                <TableOrder.MenuInfo menuName={"아메리카노"} quantity={2} />
                <TableOrder.MenuInfo menuName={"카페 라떼"} quantity={4} />
              </TableOrder.ItemLayout>
            </div>
          )}
        </BoardTable.Content>
        <CardFooter className="p-2 min-h-9"></CardFooter>
      </BoardTable.Layout>
    </BoardTable.Provider>
  );
}
