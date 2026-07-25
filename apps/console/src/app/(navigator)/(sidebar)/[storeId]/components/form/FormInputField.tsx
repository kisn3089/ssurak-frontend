import { Field, FieldDescription } from "@ssurak/ui/components/forms/field";
import { Input } from "@ssurak/ui/components/forms/input";
import { FieldPath, FieldValues, UseFormRegisterReturn } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import FormLabel from "./FormLabel";

export type StaticInputField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: "text" | "number";
  description?: React.ReactNode;
  disabled?: boolean;
};

export type DynamicInputField<Payload extends FieldValues> =
  StaticInputField<Payload> & {
    registration: UseFormRegisterReturn;
    errorMessage?: string;
  };

export default function FormInputField<Field extends FieldValues>({
  id,
  label,
  placeholder,
  required,
  type = "text",
  errorMessage,
  registration,
  description,
  disabled,
}: DynamicInputField<Field>) {
  return (
    <div className="grid gap-2">
      <Field>
        <FormLabel id={id} required={required}>
          {label}
        </FormLabel>
        <Input
          id={id}
          placeholder={placeholder}
          required={required}
          type={type}
          aria-invalid={!!errorMessage}
          {...registration}
          disabled={disabled}
          className="h-11"
        />
        {description && (
          <FieldDescription className="whitespace-pre">
            {description}
          </FieldDescription>
        )}
      </Field>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
