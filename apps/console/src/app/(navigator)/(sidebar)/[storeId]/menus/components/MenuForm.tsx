"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import Link from "next/link";
import FormSubmitLabel from "../../components/form/FormSubmitLabel";
import { MenuFormProps } from "../../tables/types/menu-form.type";
import {
  CreateMenuPayload,
  createMenuPayloadSchema,
} from "@ssurak/api/schemas/model/menu.schema";
import FormFields from "../../components/form/FormFields";
import PreviewMenu from "../add/components/PreviewMenu";
import SortOrderPreview from "../add/components/sort-order-preview/SortOrderPreview";
import { getNewSortOrder } from "../add/components/sort-order-preview/get-new-sort-order";
import { DetailMenu } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import { useState } from "react";
import SuccessMenuDialog from "./success-create-menu/SuccessMenuDialog";
import { buildRows } from "../add/components/sort-order-preview/build-rows";
import useMenuForm from "../hooks/useMenuForm";
import useFormResolver from "../hooks/useFormResolver";
import useMenuFormControl from "../hooks/useMenuFormControl";
import useBuildFormFields from "../hooks/useBuildFormFields";
import useSetSortOrderFromCategoryEffect from "../hooks/useSetSortOrderFromCategoryEffect";
import useSyncDefaultSortOrderEffect from "../hooks/useSyncDefaultSortOrderEffect";

export default function MenuForm({
  formDefaultValues,
  buttonText,
  children,
  linkToCancel,
  mutation,
  formSubmit,
}: MenuFormProps) {
  const [isSortActive, setIsSortActive] = useState(false);

  const {
    categoryWithMenus,
    categoryOptions,
    defaultCategory,
    defaultCategoryId,
    defaultSortOrder,
    existingMenuNames,
  } = useMenuForm(formDefaultValues);

  const resolver = useFormResolver<CreateMenuPayload>({
    schema: createMenuPayloadSchema,
    existingValues: existingMenuNames,
    field: "name",
    duplicateMessage: "이미 존재하는 메뉴 이름입니다.",
  });

  const { publicId: _publicId, ...payloadDefaults } = formDefaultValues;

  const {
    watchingMenuForm,
    control,
    formState,
    handleSubmit,
    getFieldState,
    register,
    setError,
    setValue,
  } = useMenuFormControl({
    defaultCategoryId,
    defaultSortOrder,
    defaultFormValues: payloadDefaults,
    resolver,
  });

  const { isSubmitting, isValid } = formState;
  const { isSuccess, reset, isPending } = mutation;
  const isLoading = isSubmitting || isPending;

  const selectedCategory = categoryWithMenus.find(
    (category) => category.publicId === watchingMenuForm.categoryId
  );

  const filteredEditMenu = (selectedCategory?.menus ?? []).filter(
    (menu) => menu.publicId !== formDefaultValues.publicId
  );

  useSetSortOrderFromCategoryEffect({
    watchingCategoryId: watchingMenuForm.categoryId,
    defaultCategoryId,
    defaultSortOrder,
    filteredEditMenu,
    setValue,
  });

  useSyncDefaultSortOrderEffect({
    persistedSortOrder: formDefaultValues.sortOrder,
    defaultSortOrder,
    setValue,
  });

  const fields = useBuildFormFields({
    categoryOptions,
    control,
    filteredEditMenu,
    formState,
    getFieldState,
    setIsSortActive,
    register,
    watchingMenuForm,
  });

  const addSetErrorOnSubmit = (payload: CreateMenuPayload) => {
    const isCategoryChanged = payload.categoryId !== defaultCategoryId;
    const isSortOrderChanged =
      payload.sortOrder !== undefined && payload.sortOrder !== defaultSortOrder;

    const sortOrder =
      selectedCategory && (isCategoryChanged || isSortOrderChanged)
        ? getNewSortOrder(selectedCategory.menus, payload.sortOrder)
        : formDefaultValues.sortOrder;

    const categoryId =
      defaultCategory?.publicId === payload.categoryId
        ? defaultCategory.id.toString()
        : payload.categoryId;

    formSubmit({ ...payload, sortOrder, categoryId }, setError);
  };
  const onSubmit = handleSubmit(addSetErrorOnSubmit);

  const menu: DetailMenu = {
    publicId: "",
    name: watchingMenuForm.name || "",
    price: watchingMenuForm.price || 0,
    imageKey: watchingMenuForm.imageKey || null,
    description: watchingMenuForm.description || null,
    requiredOptions: null,
    customOptions: null,
    // requiredOptions: requiredOptions || null,
    // customOptions: customOptions || null,
    isAvailable: watchingMenuForm.isAvailable ?? true,
  };

  const isChanged = watchingMenuForm.sortOrder !== defaultSortOrder;

  const previewSortOrder = isChanged ? undefined : formDefaultValues.sortOrder;

  const rows = buildRows(
    filteredEditMenu,
    watchingMenuForm.name || "새 메뉴",
    watchingMenuForm.sortOrder,
    previewSortOrder
  );

  return (
    <form className="flex flex-col grow" noValidate onSubmit={onSubmit}>
      <div className="@container">
        <div className="flex gap-6 flex-col @3xl:flex-row pb-10">
          <FormFields fields={fields} />
          <div className="flex flex-col w-full @3xl:max-w-100 @3xl:sticky @3xl:top-14 @3xl:h-fit">
            {isSortActive && selectedCategory ? (
              <SortOrderPreview
                categoryName={selectedCategory.name}
                rows={rows}
              />
            ) : (
              <PreviewMenu menu={menu}>{children}</PreviewMenu>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-2 pb-4">
        <Link href={linkToCancel}>
          <Button variant={"outline"}>취소</Button>
        </Link>
        <SuccessMenuDialog menu={menu} isSuccess={isSuccess} reset={reset}>
          <Button type="submit" disabled={!isValid || isLoading}>
            <FormSubmitLabel isLoading={isLoading} buttonText={buttonText} />
          </Button>
        </SuccessMenuDialog>
      </div>
    </form>
  );
}
