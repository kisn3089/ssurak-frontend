"use client";

import { Field, FieldTitle } from "@ssurak/ui/components/forms/field";
import { Input } from "@ssurak/ui/components/forms/input";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import FormLabel from "../../../../components/form/FormLabel";
import { OptionGroupForm } from "../../../types/option-form.type";

type OptionHeaderProps = {
  control: Control<OptionGroupForm>;
  /** 카드마다 독립된 폼이라 입력 id가 겹치지 않도록 붙이는 접두사. */
  formId: string;
};

export default function OptionHeader({ control, formId }: OptionHeaderProps) {
  const { field, fieldState } = useController({ control, name: "name" });
  const id = `${formId}-name`;

  return (
    <Field className="gap-2">
      <FormLabel
        id={id}
        required={false}
        label={
          <FieldTitle className="text-xs font-bold text-muted-foreground">
            {"옵션 이름"}
          </FieldTitle>
        }
      />
      <Input
        id={id}
        placeholder={"새 옵션 이름"}
        type={"text"}
        className="h-11 rounded-xl"
        aria-invalid={!!fieldState.error}
        {...field}
      />
      {fieldState.error?.message && (
        <ErrorMessage errorMessage={fieldState.error?.message} />
      )}
    </Field>
  );
}
