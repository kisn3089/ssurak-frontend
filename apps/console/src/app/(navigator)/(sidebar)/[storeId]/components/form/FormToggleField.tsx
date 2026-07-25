import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@ssurak/ui/components/forms/field";
import { Switch } from "@ssurak/ui/components/forms/switch";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import FormLabel from "./FormLabel";

export type StaticCheckboxField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  legend: string;
  type: "switch";
  description: React.ReactNode;
};

export type DynamicCheckboxField<Payload extends FieldValues> = {
  control: Control<Payload>;
};

export type CheckboxField<Payload extends FieldValues> =
  StaticCheckboxField<Payload> & DynamicCheckboxField<Payload>;

export default function FormToggleField<Payload extends FieldValues>({
  legend,
  label,
  description,
  id,
  control,
}: CheckboxField<Payload>) {
  return (
    <FieldSet className="gap-3">
      <FormLabel id={id}>{legend}</FormLabel>
      <FieldDescription>{description}</FieldDescription>
      <Field orientation="horizontal" className="w-fit">
        <Controller
          name={id}
          control={control}
          render={({ field: checkboxField }) => (
            <Switch
              id={id}
              ref={checkboxField.ref}
              name={checkboxField.name}
              checked={checkboxField.value}
              onBlur={checkboxField.onBlur}
              onCheckedChange={checkboxField.onChange}
            />
          )}
        />
        <FieldLabel htmlFor={id} className="font-normal">
          {label}
        </FieldLabel>
      </Field>
    </FieldSet>
  );
}
