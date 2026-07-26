"use client";

import { useParams } from "next/navigation";
import PreviewTable from "../add/components/PreviewTable";
import SampleTable from "../add/components/SampleTable";
import { Button } from "@ssurak/ui/components/buttons/button";
import {
  CreateTablePayload,
  createTablePayloadSchema,
} from "@ssurak/api/schemas/model/table.schema";
import { useForm, UseFormRegisterReturn, useWatch } from "react-hook-form";
import useResetPreviewOnEdit from "../add/hooks/useResetPreviewOnEdit";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { Table } from "@ssurak/api/types/table/table.interface";
import { staticAddTableFields } from "../add/components/staticAddTableFields";
import useFormResolver from "../../menus/hooks/useFormResolver";
import BackListAfterAdd from "../add/components/BackListAfterAdd";
import { DynamicFormFields } from "../../components/form/FormFields.type";
import Link from "next/link";
import { TableFormProps } from "../types/table-form.type";
import { BoardTable } from "@ssurak/ui/components/board-table";
import FormSubmitLabel, {
  previewSuccessContent,
} from "../../components/form/FormSubmitLabel";
import FormFields from "../../components/form/FormFields";

export default function TableForm({
  linkToCancel,
  formDefaultValues,
  mutation,
  formSubmit,
  children,
  buttonText,
}: TableFormProps) {
  "use no memo";

  const { storeId } = useParams<{ storeId: string }>();
  const { data: tables } = useSuspenseWithAuth<Table[]>(
    `/stores/v1/${storeId}/tables`
  );

  const existingTableNumbers = new Set(
    tables.map((table) => table.tableNumber)
  );

  if (formDefaultValues.tableNumber) {
    existingTableNumbers.delete(formDefaultValues.tableNumber);
  }

  const resolver = useFormResolver<CreateTablePayload>({
    schema: createTablePayloadSchema,
    existingValues: existingTableNumbers,
    field: "tableNumber",
    duplicateMessage: "이미 존재하는 테이블 번호입니다.",
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    getFieldState,
    formState,
    setError,
  } = useForm<CreateTablePayload>({
    resolver,
    mode: "all",
    defaultValues: formDefaultValues,
  });

  const { isSubmitting, isValid } = formState;

  const { isSuccess, reset, isPending } = mutation;

  const isLoading = isSubmitting || isPending;

  const [tableNumber, section, seats, floor] = useWatch({
    control,
    name: ["tableNumber", "section", "seats", "floor"],
  });

  const tableInfo = { tableNumber, section, seats, floor, disabled: isPending };

  const inputDynamicFields: Record<string, UseFormRegisterReturn> = {
    tableNumber: { ...register("tableNumber") },
    seats: {
      ...register("seats", {
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      }),
    },
    floor: {
      ...register("floor", {
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      }),
    },
    section: {
      ...register("section", {
        setValueAs: (v) => v || undefined,
      }),
    },
  };

  const fields: DynamicFormFields<CreateTablePayload>[] =
    staticAddTableFields.map((field) =>
      field.type === "switch"
        ? { ...field, control }
        : {
            ...field,
            registration: inputDynamicFields[field.id],
            errorMessage: getFieldState(field.id, formState).error?.message,
          }
    );

  const addSetErorrOnSubmit = (payload: CreateTablePayload) => {
    formSubmit(payload, setError);
  };
  const onSubmit = handleSubmit(addSetErorrOnSubmit);
  useResetPreviewOnEdit(watch, isSuccess, reset);

  return (
    <form className="flex flex-col grow" noValidate onSubmit={onSubmit}>
      <div className="@container">
        <div className="flex gap-6 flex-col @3xl:flex-row pb-10">
          <FormFields fields={fields} />
          <PreviewTable>
            <SampleTable table={tableInfo} isSuccess={isSuccess}>
              <BoardTable.SuccessContent
                isSuccess={isSuccess}
                successText={previewSuccessContent(buttonText)}
              />
            </SampleTable>
            <BackListAfterAdd isSuccess={isSuccess} />
            {children}
          </PreviewTable>
        </div>
      </div>
      <div className="flex justify-end gap-x-2 pb-4">
        <Link href={linkToCancel}>
          <Button variant={"outline"}>취소</Button>
        </Link>
        <Button type="submit" disabled={!isValid || isLoading}>
          <FormSubmitLabel isLoading={isLoading} buttonText={buttonText} />
        </Button>
      </div>
    </form>
  );
}
