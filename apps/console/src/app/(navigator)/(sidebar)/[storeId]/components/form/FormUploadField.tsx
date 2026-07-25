import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { Field } from "@ssurak/ui/components/forms/field";
import FormLabel from "./FormLabel";
import ImageUploader from "./ImageUploader";

export type StaticUploadField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  required?: boolean;
  type: "file";
  description?: React.ReactNode;
};

export type DynamicUploadField<Payload extends FieldValues> =
  StaticUploadField<Payload> & {
    control: Control<Payload>;
    errorMessage?: string;
  };

export default function FormUploadField<Payload extends FieldValues>({
  id,
  control,
  label,
  errorMessage,
  required,
}: DynamicUploadField<Payload>) {
  return (
    <div className="flex flex-col gap-2">
      <Field>
        <FormLabel id={id} required={required}>
          {label}
        </FormLabel>
        <Controller
          control={control}
          name={id}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errorMessage}
            />
          )}
        />
      </Field>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
