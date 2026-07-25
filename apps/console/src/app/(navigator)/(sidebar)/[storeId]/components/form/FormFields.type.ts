import {
  DynamicInputField,
  StaticInputField,
} from "@/app/(navigator)/(sidebar)/[storeId]/components/form/FormInputField";
import { FieldValues } from "react-hook-form";
import { DynamicSelectField, StaticSelectField } from "./FormSelectField";
import { CheckboxField, StaticCheckboxField } from "./FormToggleField";
import { DynamicUploadField, StaticUploadField } from "./FormUploadField";

export type DynamicFormFields<Payload extends FieldValues> =
  | DynamicInputField<Payload>
  | CheckboxField<Payload>
  | DynamicSelectField<Payload>
  | DynamicUploadField<Payload>;

export type StaticFormField<Payload extends FieldValues> =
  | StaticInputField<Payload>
  | StaticCheckboxField<Payload>
  | StaticSelectField<Payload>
  | StaticUploadField<Payload>;
