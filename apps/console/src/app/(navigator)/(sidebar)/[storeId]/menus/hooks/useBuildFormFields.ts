import { DynamicFormFields } from "../../components/form/FormFields.type";
import { SelectOption } from "../../components/form/SelectFormField";
import { WatchingMenuForm } from "./useMenuFormControl";
import { staticAddMenuFields } from "../add/components/staticAddMenuFields";
import {
  Control,
  FormState,
  UseFormGetFieldState,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { MenuFormPayload } from "../types/menu-form-payload.type";

type UseBuildFormFieldsProps = {
  categoryOptions: SelectOption[];
  filteredEditMenu: { name: string; sortOrder: number }[];
  watchingMenuForm: WatchingMenuForm;
  control: Control<MenuFormPayload>;
  formState: FormState<MenuFormPayload>;
  getFieldState: UseFormGetFieldState<MenuFormPayload>;
  setIsSortActive: Dispatch<SetStateAction<boolean>>;
  register: UseFormRegister<MenuFormPayload>;
};

export default function useBuildFormFields({
  categoryOptions,
  control,
  filteredEditMenu,
  formState,
  getFieldState,
  setIsSortActive,
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

  const forefront: SelectOption = { label: "맨 앞에 표시", value: 0 };
  const sortOptions: SelectOption[] = [
    forefront,
    ...filteredEditMenu.map((menu) => ({
      label: `${menu.name} 다음`,
      value: menu.sortOrder,
    })),
  ];
  const isCategorySelect =
    !watchingMenuForm.categoryId && watchingMenuForm.sortOrder === undefined;

  const fields: DynamicFormFields<MenuFormPayload>[] = staticAddMenuFields.map(
    (field) => {
      const errorMessage = getFieldState(field.id, formState).error?.message;
      switch (field.type) {
        case "switch":
          return { ...field, control };
        case "select": {
          const fieldsWithoutOptions = {
            ...field,
            errorMessage,
            control,
          };
          if (field.id === "categoryId") {
            return { ...fieldsWithoutOptions, options: categoryOptions };
          }
          return {
            ...fieldsWithoutOptions,
            options: sortOptions,
            disabled: isCategorySelect,
            description: isCategorySelect ? field.description : null,
            onActiveChange: setIsSortActive,
          };
        }
        case "file":
          return {
            ...field,
            errorMessage,
            control,
          };
        case "option":
          return { ...field, control };
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
