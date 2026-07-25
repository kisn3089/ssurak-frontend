import { Field, FieldDescription } from "@ssurak/ui/components/forms/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ssurak/ui/components/forms/select";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { useEffect, useState } from "react";
import ErrorMessage from "./ErrorMessage";
import FormLabel from "./FormLabel";

export type StaticSelectField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: "select";
  description?: React.ReactNode;
  disabled?: boolean;
};

export type DynamicSelectField<Payload extends FieldValues> =
  StaticSelectField<Payload> & {
    control: Control<Payload>;
    options: SelectOption[];
    errorMessage?: string;
    onActiveChange?: (active: boolean) => void;
  };

export type SelectOption = {
  value: string | number;
  label: string;
};

export default function FormSelectField<Field extends FieldValues>({
  id,
  label,
  placeholder,
  required,
  description,
  errorMessage,
  control,
  options,
  disabled,
  onActiveChange,
}: DynamicSelectField<Field>) {
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const isActive = focused || open;

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  return (
    <div className="grid gap-2">
      <Field>
        <FormLabel id={id} required={required}>
          {label}
        </FormLabel>
        <Controller
          name={id}
          control={control}
          render={({ field: selectField }) => (
            <Select
              value={
                selectField.value === undefined || selectField.value === null
                  ? ""
                  : String(selectField.value)
              }
              onValueChange={(value) => {
                const selected = options.find(
                  (option) => String(option.value) === value
                );
                selectField.onChange(selected ? selected.value : value);
              }}
              onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) setFocused(true);
              }}
            >
              <SelectTrigger
                id={id}
                ref={selectField.ref}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  selectField.onBlur();
                  setFocused(false);
                }}
                aria-invalid={!!errorMessage}
                className="w-full aria-invalid:border-destructive h-11"
                disabled={disabled}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                    className="h-11"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
