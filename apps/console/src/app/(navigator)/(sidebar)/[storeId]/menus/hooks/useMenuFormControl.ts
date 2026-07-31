import { Resolver, useForm, useWatch } from "react-hook-form";
import { MenuFormValues } from "../../tables/types/menu-form.type";
import {
  MenuFormPayload,
  OptionGroupForm,
} from "../types/menu-form-payload.type";
import { toOptionGroupForms } from "../utils/menu-option-form";

type UseMenuFormControlProps = {
  defaultCategoryId: string | undefined;
  defaultSortOrder: string[];
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
  isAvailable: boolean | undefined;
  sortOrder: string[];
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
      // trigger가 필수 ↔ 선택 옵션을 서로 참조할 수 있어 두 목록을 한 번에 변환한다.
      ...toOptionGroupForms(defaultFormValues),
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
    isAvailable,
    sortOrder,
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
      "isAvailable",
      "sortOrder",
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
    isAvailable,
    sortOrder,
  };

  return { ...form, watchingMenuForm };
}
