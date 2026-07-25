"use client";

import { Table } from "@ssurak/api/types/table/table.interface";
import EntityListView, {
  EntityRow,
} from "../../components/table-view/table/EntityListView";
import useTableMutation from "@ssurak/api/core/store/table/useTableMutation";
import { httpTableErrors } from "@ssurak/api/core/store/table/httpTableErrors";
import { useParams } from "next/navigation";
import { activeBadge } from "../../components/table-view/table/activate-badge.const";

interface TableListViewProps {
  tableList: Table[];
  hrefPrefix: string;
  toastPrefix: string;
}

export default function TableListView({
  tableList,
  hrefPrefix,
  toastPrefix,
}: TableListViewProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const { updateTable, deleteTable } = useTableMutation(storeId);

  const updateActivate = async (publicId: string, isActive: boolean) => {
    await updateTable.mutateAsync({
      tableId: publicId,
      updateTablePayload: { isActive },
    });
  };

  const deleteAction = async (publicId: string) => {
    await deleteTable.mutateAsync({ tableId: publicId });
  };

  const toRow = (table: Table): EntityRow => ({
    publicId: table.publicId,
    isActive: table.isActive,
    name: table.tableNumber,
    cells: [
      { content: table.seats ?? "", className: "line-clamp-1" },
      { content: table.section ?? "", className: "line-clamp-1" },
      { content: table.floor ?? "", className: "line-clamp-1" },
    ],
  });

  return (
    <EntityListView
      list={tableList}
      toRow={toRow}
      hrefPrefix={hrefPrefix}
      toastPrefix={toastPrefix}
      mutation={{ updateActivate, deleteAction }}
      httpErrors={httpTableErrors}
      activeBadge={activeBadge(["활성화", "비활성화"])}
    />
  );
}
