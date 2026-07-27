import { Resolver, useForm, useWatch } from "react-hook-form";
import { MenuFormValues } from "../../tables/types/menu-form.type";
import {
  MenuFormPayload,
  OptionGroupForm,
} from "../types/menu-form-payload.type";
import { toOptionGroupForms } from "../utils/menu-option-form";

type UseMenuFormControlProps = {
  defaultCategoryId: string | undefined;
  defaultSortOrder: number | undefined;
  defaultFormValues: Omit<MenuFormValues, "publicId">;
  resolver: Resolver<MenuFormPayload>;
};

export type WatchingMenuForm = {
  name: string;
  price: number | null;
  imageKey: string | null | undefined;
  description: string | null | undefined;
  requiredOptions: OptionGroupForm[];
  customOptions: OptionGroupForm[];
  categoryId: string | null;
  sortOrder: number | undefined;
  isAvailable: boolean | undefined;
};

export default function useMenuFormControl({
  defaultCategoryId,
  defaultSortOrder,
  defaultFormValues,
  resolver,
}: UseMenuFormControlProps) {
  "use no memo";

  const form = useForm<MenuFormPayload>({
    resolver,
    mode: "all",
    defaultValues: {
      ...defaultFormValues,
      categoryId: defaultCategoryId,
      sortOrder: defaultSortOrder,
      requiredOptions: toOptionGroupForms(defaultFormValues.requiredOptions),
      customOptions: toOptionGroupForms(defaultFormValues.customOptions),
    },
  });

  const [
    name,
    price,
    imageKey,
    description,
    requiredOptions,
    customOptions,
    categoryId,
    sortOrder,
    isAvailable,
  ] = useWatch({
    control: form.control,
    name: [
      "name",
      "price",
      "imageKey",
      "description",
      "requiredOptions",
      "customOptions",
      "categoryId",
      "sortOrder",
      "isAvailable",
    ],
  });

  const watchingMenuForm: WatchingMenuForm = {
    name,
    price,
    imageKey,
    description,
    requiredOptions,
    customOptions,
    categoryId,
    sortOrder,
    isAvailable,
  };

  return { ...form, watchingMenuForm };
}
