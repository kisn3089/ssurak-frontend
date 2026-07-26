import {
  DynamicInputField,
  StaticInputField,
} from "@/app/(navigator)/(sidebar)/[storeId]/components/form/InputFormField";
import { FieldValues } from "react-hook-form";
import { DynamicSelectField, StaticSelectField } from "./SelectFormField";
import { CheckboxField, StaticCheckboxField } from "./ToggleFormField";
import { DynamicUploadField, StaticUploadField } from "./UploadFormField";

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
