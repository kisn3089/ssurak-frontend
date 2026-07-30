import { FieldValues } from "react-hook-form";
import { DynamicFormFields } from "./FormFields.type";
import InputFormField from "@/app/(navigator)/(sidebar)/[storeId]/components/form/InputFormField";
import SelectFormField from "@/app/(navigator)/(sidebar)/[storeId]/components/form/select-form-field/SelectFormField";
import ToggleFormField from "./ToggleFormField";
import UploadFormField from "./UploadFormField";
import OptionFormField from "./OptionFormField";
import ReorderFormField from "./reorder-form-field/ReorderFormField";

type FormFieldProps<Payload extends FieldValues> = {
  fields: DynamicFormFields<Payload>[];
};

export default function FormFields<Payload extends FieldValues>({
  fields,
}: FormFieldProps<Payload>) {
  return (
    <div className="flex flex-col gap-y-2 mb-6 grow">
      {fields.map((field) => {
        if (field.type === "option") {
          return <OptionFormField key={field.id} {...field} />;
        }

        if (field.type === "switch") {
          return <ToggleFormField key={field.id} {...field} />;
        }

        if (field.type === "text" || field.type === "number") {
          return <InputFormField key={field.id} {...field} />;
        }

        if (field.type === "select") {
          return (
            <SelectFormField key={field.id} {...field}>
              {field.children}
            </SelectFormField>
          );
        }

        if (field.type === "file") {
          return <UploadFormField key={field.id} {...field} />;
        }

        if (field.type === "reorder") {
          return <ReorderFormField key={field.id} {...field} />;
        }

        return null;
      })}
    </div>
  );
}
