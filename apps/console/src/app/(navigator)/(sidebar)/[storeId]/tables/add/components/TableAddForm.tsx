"use client";

import { httpTableErrors } from "@ssurak/api/core/store/table/httpTableErrors";
import useTableMutation from "@ssurak/api/core/store/table/useTableMutation";
import { CreateTablePayload } from "@ssurak/api/schemas/model/table.schema";
import { useParams } from "next/navigation";
import TableForm from "../../components/TableForm";
import FormErrorWithRetry from "../../../components/FormErrorWithRetry";

const formDefaultValues = {
  tableNumber: "",
  seats: undefined,
  floor: undefined,
  section: undefined,
  isActive: true,
};

export default function TableAddForm() {
  const { storeId } = useParams<{ storeId: string }>();
  const { createTable } = useTableMutation(storeId);

  const formSubmit = (payload: CreateTablePayload) => {
    const { tableNumber, floor, isActive, seats, section } = payload;

    createTable.mutate({
      createTablePayload: {
        tableNumber,
        ...(seats ? { seats } : {}),
        ...(floor !== undefined ? { floor } : {}),
        ...(section ? { section } : {}),
        isActive,
      },
    });
  };

  const errorMessage = createTable.error
    ? httpTableErrors.post(createTable.error)
    : undefined;

  return (
    <TableForm
      formDefaultValues={formDefaultValues}
      buttonText="테이블 추가"
      linkToCancel={`/${storeId}/tables`}
      mutation={createTable}
      formSubmit={formSubmit}
    >
      <FormErrorWithRetry
        title={`테이블을 추가하지 못했어요.`}
        errorMessage={errorMessage}
      />
    </TableForm>
  );
}
