"use client";

import useBuildControlForm from "./hooks/useBuildControlForm";
import { CategoryReorderControlProps } from "./category-reorder-control.type";
import useCategoryMutations from "./hooks/useCategoryMutations";
import useSyncDraftOrderEffect from "./hooks/useSyncDraftOrderEffect";
import useInvokeReorderToCommitEffect from "./hooks/useInvokeReorderToCommitEffect";

export default function CategoryReorderControl({
  children,
  renamingCategoryId,
  registerCommit,
}: CategoryReorderControlProps) {
  const { categoryWithMenus, rows, field, getValues, setValue, resolver } =
    useBuildControlForm(renamingCategoryId);

  const { createRow, deleteRow, renameRow } = useCategoryMutations();

  useSyncDraftOrderEffect({ categoryWithMenus, getValues, setValue });

  useInvokeReorderToCommitEffect({
    categoryWithMenus,
    getValues,
    registerCommit,
  });

  return children({
    rows,
    onReorder: field.onChange,
    resolver,
    createRow,
    renameRow,
    deleteRow,
  });
}
