import { FieldValues } from "react-hook-form";
import { DynamicFormFields } from "./FormFields.type";
import FormInputField from "@/app/(navigator)/(sidebar)/[storeId]/components/form/FormInputField";
import FormSelectField from "@/app/(navigator)/(sidebar)/[storeId]/components/form/FormSelectField";
import FormToggleField from "./FormToggleField";
import FormUploadField from "./FormUploadField";

type FormFieldProps<Payload extends FieldValues> = {
  fields: DynamicFormFields<Payload>[];
};

export default function FormFields<Payload extends FieldValues>({
  fields,
}: FormFieldProps<Payload>) {
  return (
    <div className="flex flex-col gap-y-2 mb-6 grow">
      {fields.map((field) => {
        if (field.type === "switch") {
          return <FormToggleField key={field.id} {...field} />;
        }

        if (field.type === "text" || field.type === "number") {
          return <FormInputField key={field.id} {...field} />;
        }

        if (field.type === "select") {
          return <FormSelectField key={field.id} {...field} />;
        }

        if (field.type === "file") {
          return <FormUploadField key={field.id} {...field} />;
        }
      })}
    </div>
  );
}
