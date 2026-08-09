import { TableHead, TableHeader, TableRow } from "@ssurak/ui/components/table";
import { flexRender, Header, Table } from "@tanstack/react-table";

type OrderTableHeaderProps<TData> = { table: Table<TData> };
export function OrderTableHeader<TData>({
  table,
}: OrderTableHeaderProps<TData>) {
  return (
    <TableHeader className="sticky top-0 bg-background">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          className="grid grid-cols-[1.5fr_1fr_1fr] xl:grid-cols-[2fr_1fr_1fr]"
          key={headerGroup.id}
        >
          {headerGroup.headers.map((header) => (
            <Head key={header.id} header={header} />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

function Head<TData>({ header }: { header: Header<TData, unknown> }) {
  return (
    <TableHead key={header.id} className="flex items-center whitespace-pre">
      {flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}
