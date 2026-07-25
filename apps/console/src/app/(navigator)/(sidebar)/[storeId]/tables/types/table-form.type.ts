import useTableMutation from "@ssurak/api/core/store/table/useTableMutation";
import { CreateTablePayload } from "@ssurak/api/schemas/model/table.schema";
import { UseFormSetError } from "react-hook-form";

export interface TableFormValues {
  tableNumber: string;
  seats?: number;
  floor?: number;
  section?: string;
  isActive: boolean;
}

type TableMutations = ReturnType<typeof useTableMutation>;

type TableBaseForm = {
  formDefaultValues: TableFormValues;
  linkToCancel: string;
  children: React.ReactNode;
  buttonText: string;
  formSubmit: (
    payload: CreateTablePayload,
    setError: UseFormSetError<CreateTablePayload>
  ) => void;
};

export type TableFormProps = TableBaseForm & {
  mutation: TableMutations["createTable"] | TableMutations["updateTable"];
};
