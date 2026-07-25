import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { MenuFormValues } from "../../tables/types/menu-form.type";

type UseMenuFormControlProps = {
  defaultCategoryId: string | undefined;
  defaultSortOrder: number | undefined;
  defaultFormValues: Omit<MenuFormValues, "publicId">;
  resolver: Resolver<CreateMenuPayload>;
};

export type WatchingMenuForm = {
  name: string;
  price: number | null;
  imageKey: string | null;
  description: string | null | undefined;
  // requiredOptions: string[] | null;
  // customOptions: string[] | null;
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

  const form = useForm<CreateMenuPayload>({
    resolver,
    mode: "all",
    defaultValues: {
      ...defaultFormValues,
      categoryId: defaultCategoryId,
      sortOrder: defaultSortOrder,
    },
  });

  const [
    name,
    price,
    imageKey,
    description,
    // requiredOptions,
    // customOptions,
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
      //   "requiredOptions",
      //   "customOptions",
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
    // requiredOptions,
    // customOptions,
    categoryId,
    sortOrder,
    isAvailable,
  };

  return { ...form, watchingMenuForm };
}
