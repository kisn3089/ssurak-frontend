import { Skeleton } from "@ssurak/ui/components/skeleton";
import ConstructTableListLayout from "./ConstructTableListLayout";
import TableInfoRow from "./TableInfoRow";

type TableListSkeletonProps = {
  row: number;
  column: number;
  children?: React.ReactNode;
};

export default function TableListSkeleton({
  row,
  column,
  children,
}: TableListSkeletonProps) {
  return (
    <ConstructTableListLayout
      body={
        <>
          {Array.from({ length: row }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b last:border-b-0">
              {Array.from({ length: column }).map((_, columnIndex) => (
                <TableInfoRow key={columnIndex}>
                  <Skeleton className="h-3 p-3" />
                </TableInfoRow>
              ))}
            </tr>
          ))}
        </>
      }
    >
      {children}
    </ConstructTableListLayout>
  );
}
