"use client";

import { useParams } from "next/navigation";
import TableForm from "../../components/TableForm";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { Table } from "@ssurak/api/types/table/table.interface";
import useTableMutation from "@ssurak/api/core/store/table/useTableMutation";
import {
  CreateTablePayload,
  UpdateTablePayload,
} from "@ssurak/api/schemas/model/table.schema";
import { TableFormValues } from "../../types/table-form.type";
import { UseFormSetError } from "react-hook-form";
import { tableDiffFromDefaults } from "../../utils/table-diff-from-defaults";
import FormErrorWithRetry from "../../../components/FormErrorWithRetry";
import { httpTableErrors } from "@ssurak/api/core/store/table/httpTableErrors";

export default function TableEditForm() {
  const { storeId, tableId } = useParams<{
    storeId: string;
    tableId: string;
  }>();

  const { data: table } = useSuspenseWithAuth<Table>(
    `/stores/v1/${storeId}/tables/${tableId}`
  );

  const { updateTable } = useTableMutation(storeId);

  const formDefaultValues: TableFormValues = {
    tableNumber: table?.tableNumber,
    seats: table.seats ?? undefined,
    floor: table.floor ?? undefined,
    section: table.section ?? undefined,
    isActive: table.isActive,
  };

  const formSubmit = (
    payload: CreateTablePayload,
    setError: UseFormSetError<CreateTablePayload>
  ) => {
    const updateTablePayload: UpdateTablePayload = tableDiffFromDefaults(
      payload,
      formDefaultValues
    );

    if (Object.keys(updateTablePayload).length === 0) {
      setError(
        "tableNumber",
        {
          type: "manual",
          message: "변경된 사항이 없습니다.",
        },
        { shouldFocus: true }
      );
      return;
    }

    updateTable.mutate({ updateTablePayload, tableId });
  };

  const errorMessage = updateTable.error
    ? httpTableErrors.patch(updateTable.error)
    : undefined;

  return (
    <TableForm
      formDefaultValues={formDefaultValues}
      buttonText="테이블 수정"
      linkToCancel={`/${storeId}/tables`}
      mutation={updateTable}
      formSubmit={formSubmit}
    >
      <FormErrorWithRetry
        title={`테이블을 수정하지 못했어요.`}
        errorMessage={errorMessage}
      />
    </TableForm>
  );
}
