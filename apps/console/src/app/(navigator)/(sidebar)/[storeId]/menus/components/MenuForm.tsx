"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import Link from "next/link";
import { useState } from "react";
import FormSubmitLabel from "../../components/form/FormSubmitLabel";
import {
  MenuFormProps,
  MenuSubmitOutcome,
} from "../../tables/types/menu-form.type";
import FormFields from "../../components/form/FormFields";
import { ReorderRowData } from "../../components/form/reorder-form-field/ReorderForm";
import PreviewMenu from "../add/components/PreviewMenu";
import { DetailMenu } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import SuccessMenuDialog from "./success-create-menu/SuccessMenuDialog";
import useMenuForm from "../hooks/useMenuForm";
import useFormResolver from "../hooks/useFormResolver";
import useMenuFormControl from "../hooks/useMenuFormControl";
import useBuildFormFields from "../hooks/useBuildFormFields";
import useResetSortOrderOnCategoryChange from "../hooks/useResetSortOrderOnCategoryChange";
import { menuFormPayloadSchema } from "@ssurak/api/schemas/model/menu-form-payload.schema";
import { MenuFormPayload } from "../types/menu-form-payload.type";
import { toMenuOptionRecords } from "../utils/menu-option-form";
import { buildExpectedOrder, resolveMenuIds } from "../utils/menu-sort-order";
import { isSameOrder } from "@ssurak/api/utils/reorder";

const NEW_MENU_NAME_PLACEHOLDER = "새 메뉴";
/** 폼을 열어둔 사이 목록이 바뀌어 이름을 찾지 못한 행. 제출 시 서버가 409로 걸러낸다. */
const UNKNOWN_MENU_NAME = "알 수 없는 메뉴";

export default function MenuForm({
  formDefaultValues,
  buttonText,
  children,
  linkToCancel,
  mutation,
  formSubmit,
}: MenuFormProps) {
  const {
    categoryWithMenus,
    categoryOptions,
    defaultCategory,
    defaultCategoryId,
    defaultSortOrder,
    existingMenuNames,
    selfId,
  } = useMenuForm(formDefaultValues);

  const resolver = useFormResolver<MenuFormPayload>({
    schema: menuFormPayloadSchema,
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
  const { reset, isPending } = mutation;
  const isLoading = isSubmitting || isPending;

  // 제출 체인(메뉴 저장 → 필요 시 재정렬)이 모두 끝나야 성공 다이얼로그를 연다.
  const [submitOutcome, setSubmitOutcome] = useState<MenuSubmitOutcome | null>(
    null
  );

  const selectedCategory = categoryWithMenus.find(
    (category) => category.publicId === watchingMenuForm.categoryId
  );
  const categoryMenuIds = (selectedCategory?.menus ?? []).map(
    (menu) => menu.publicId
  );

  useResetSortOrderOnCategoryChange({
    watchingCategoryId: watchingMenuForm.categoryId,
    categoryMenuIds,
    selfId,
    setValue,
  });

  const menuNameById = new Map(
    (selectedCategory?.menus ?? []).map((menu) => [menu.publicId, menu.name])
  );

  // 편집 중인 메뉴는 저장 전이라도 입력 중인 이름으로 보여줘야 어느 행이 자기 자신인지 알 수 있다.
  const sortOrderRows: ReorderRowData[] = watchingMenuForm.sortOrder.map(
    (id) => ({
      id,
      name:
        id === selfId
          ? watchingMenuForm.name || NEW_MENU_NAME_PLACEHOLDER
          : (menuNameById.get(id) ?? UNKNOWN_MENU_NAME),
    })
  );

  const fields = useBuildFormFields({
    categoryOptions,
    control,
    sortOrderRows,
    formState,
    getFieldState,
    register,
    watchingMenuForm,
    selfId,
  });

  const addSetErrorOnSubmit = async ({
    sortOrder,
    ...payload
  }: MenuFormPayload) => {
    const categoryId =
      defaultCategory?.publicId === payload.categoryId
        ? defaultCategory.id.toString()
        : payload.categoryId;

    const resolveReorder = (menuId: string) => {
      const expectedOrder = buildExpectedOrder(categoryMenuIds, selfId);
      if (isSameOrder(expectedOrder, sortOrder)) return null;

      return {
        categoryId: payload.categoryId,
        menuIds: resolveMenuIds(sortOrder, menuId),
      };
    };

    const { requiredOptions, customOptions } = toMenuOptionRecords(payload);

    const outcome = await formSubmit(
      {
        ...payload,
        categoryId,
        requiredOptions,
        customOptions,
      },
      { setError, resolveReorder }
    );

    setSubmitOutcome(outcome ?? null);
  };
  const onSubmit = handleSubmit(addSetErrorOnSubmit);

  const closeSuccessDialog = () => {
    setSubmitOutcome(null);
    reset();
  };

  const previewOptions = toMenuOptionRecords(watchingMenuForm);

  const menu: DetailMenu = {
    publicId: "",
    name: watchingMenuForm.name || "",
    price: watchingMenuForm.price || 0,
    imageKey: watchingMenuForm.imageKey || null,
    description: watchingMenuForm.description || null,
    requiredOptions: previewOptions.requiredOptions ?? null,
    customOptions: previewOptions.customOptions ?? null,
    isAvailable: watchingMenuForm.isAvailable ?? true,
  };

  return (
    <form className="flex flex-col grow" noValidate onSubmit={onSubmit}>
      <div className="@container">
        <div className="flex gap-6 flex-col @3xl:flex-row pb-10">
          <FormFields fields={fields} />

          <div className="flex flex-col w-full @3xl:max-w-100 @3xl:sticky @3xl:top-14 @3xl:h-fit">
            <PreviewMenu menu={menu}>{children}</PreviewMenu>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-2 pb-4">
        <Link href={linkToCancel}>
          <Button variant={"outline"}>취소</Button>
        </Link>
        <SuccessMenuDialog
          menu={menu}
          outcome={submitOutcome}
          reset={closeSuccessDialog}
        >
          <Button type="submit" disabled={!isValid || isLoading}>
            <FormSubmitLabel isLoading={isLoading} buttonText={buttonText} />
          </Button>
        </SuccessMenuDialog>
      </div>
    </form>
  );
}
