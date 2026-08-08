import {
  DynamicInputField,
  StaticInputField,
} from "@/app/(navigator)/(sidebar)/[storeId]/components/form/InputFormField";
import { FieldValues } from "react-hook-form";
import {
  DynamicSelectField,
  StaticSelectField,
} from "./select-form-field/SelectFormField";
import { CheckboxField, StaticCheckboxField } from "./ToggleFormField";
import { DynamicUploadField, StaticUploadField } from "./UploadFormField";
import {
  DynamicReorderField,
  StaticReorderField,
} from "./reorder-form-field/ReorderFormField";

export type PresentationField =
  | { type: "line"; label?: React.ReactNode }
  | { type: "custom"; render: React.ReactNode };

export type DynamicControlField<Payload extends FieldValues> =
  | DynamicInputField<Payload>
  | CheckboxField<Payload>
  | DynamicSelectField<Payload>
  | DynamicUploadField<Payload>
  | DynamicReorderField<Payload>;

export type StaticControlField<Payload extends FieldValues> =
  | StaticInputField<Payload>
  | StaticCheckboxField<Payload>
  | StaticSelectField<Payload>
  | StaticUploadField<Payload>
  | (StaticReorderField<Payload> & { preDescription?: React.ReactNode });

export type DynamicFormFields<Payload extends FieldValues> =
  | DynamicControlField<Payload>
  | PresentationField;

export type StaticFormField<Payload extends FieldValues> =
  | StaticControlField<Payload>
  | PresentationField;
