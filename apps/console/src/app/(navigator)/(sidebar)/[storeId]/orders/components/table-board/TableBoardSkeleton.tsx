import { Skeleton } from "@ssurak/ui/components/skeleton";
import TableBoardLayout from "./TableOrderListLayout";

const PLACEHOLDER_CARDS = 8;

export default function TableBoardSkeleton() {
  return (
    <>
      <TableBoardLayout>
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
          <Skeleton key={index} />
        ))}
      </TableBoardLayout>
      <div className="w-xl min-w-xs rounded-3xl border bg-background shadow-sm" />
    </>
  );
}
