import { DynamicFormFields } from "../../components/form/FormFields.type";
import { SelectOption } from "../../components/form/select-form-field/SelectFormField";
import { ReorderRowData } from "../../components/form/reorder-form-field/ReorderForm";
import { WatchingMenuForm } from "./useMenuFormControl";
import { staticAddMenuFields } from "../add/components/staticAddMenuFields";
import {
  Control,
  FormState,
  UseFormGetFieldState,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";
import { MenuFormPayload } from "../types/menu-form-payload.type";

type UseBuildFormFieldsProps = {
  categoryOptions: SelectOption[];
  sortOrderRows: ReorderRowData[];
  watchingMenuForm: WatchingMenuForm;
  control: Control<MenuFormPayload>;
  formState: FormState<MenuFormPayload>;
  selfId: string;
  getFieldState: UseFormGetFieldState<MenuFormPayload>;
  register: UseFormRegister<MenuFormPayload>;
};

export default function useBuildFormFields({
  categoryOptions,
  control,
  sortOrderRows,
  formState,
  selfId,
  getFieldState,
  register,
  watchingMenuForm,
}: UseBuildFormFieldsProps) {
  "use no memo";

  const inputDynamicFields: Record<string, UseFormRegisterReturn> = {
    name: { ...register("name") },
    price: {
      ...register("price", {
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      }),
    },
    description: {
      ...register("description", { setValueAs: (v) => v || undefined }),
    },
  };

  const isCategoryUnselected = !watchingMenuForm.categoryId;

  const fields: DynamicFormFields<MenuFormPayload>[] = staticAddMenuFields.map(
    (field) => {
      if (!("id" in field)) return field;

      const errorMessage = getFieldState(field.id, formState).error?.message;
      switch (field.type) {
        case "switch":
          return { ...field, control };
        case "select":
          return {
            ...field,
            errorMessage,
            control,
            options: categoryOptions,
          };
        case "file":
          return {
            ...field,
            errorMessage,
            control,
          };
        case "option":
          return { ...field, control };
        case "reorder":
          return {
            ...field,
            control,
            reorderRow: sortOrderRows,
            disabled: isCategoryUnselected,
            description: isCategoryUnselected
              ? field.preDescription
              : field.description,
            isHighlightRow(rows) {
              return rows.find((r) => r.id === selfId)?.id;
            },
            badgeLabel: "이 메뉴",
          };
        default:
          return {
            ...field,
            errorMessage,
            registration: inputDynamicFields[field.id],
          };
      }
    }
  );

  return fields;
}
