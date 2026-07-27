"use client";

import { Field, FieldTitle } from "@ssurak/ui/components/forms/field";
import { Input } from "@ssurak/ui/components/forms/input";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import FormLabel from "../../../../components/form/FormLabel";
import {
  MenuFormPayload,
  OptionGroupFieldName,
} from "../../../types/menu-form-payload.type";

type OptionHeaderProps = {
  control: Control<MenuFormPayload>;
  name: `${OptionGroupFieldName}.groupKey`;
};

export default function OptionHeader({ control, name }: OptionHeaderProps) {
  const { field, fieldState } = useController({ control, name });

  return (
    <Field className="gap-2">
      <FormLabel id={name} required={false}>
        <FieldTitle className="text-xs font-bold text-muted-foreground">
          {"옵션 이름"}
        </FieldTitle>
      </FormLabel>
      <Input
        id={name}
        placeholder={"새 옵션 이름"}
        type={"text"}
        className="h-11 rounded-xl"
        aria-invalid={!!fieldState.error}
        name={field.name}
        ref={field.ref}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
      <ErrorMessage errorMessage={fieldState.error?.message} />
    </Field>
  );
}
