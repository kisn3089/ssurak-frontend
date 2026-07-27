import { useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { MenuFormPayload } from "../types/menu-form-payload.type";

type UseSetSortOrderFromCategoryEffectProps = {
  watchingCategoryId: string | null;
  defaultCategoryId: string | undefined;
  defaultSortOrder: number | undefined;
  filteredEditMenu: { name: string; sortOrder: number }[];
  setValue: UseFormSetValue<MenuFormPayload>;
};
export default function useSetSortOrderFromCategoryEffect({
  watchingCategoryId,
  defaultCategoryId,
  defaultSortOrder,
  filteredEditMenu,
  setValue,
}: UseSetSortOrderFromCategoryEffectProps) {
  const previousCategoryId = useRef(watchingCategoryId);
  useEffect(() => {
    if (previousCategoryId.current === watchingCategoryId) return;
    previousCategoryId.current = watchingCategoryId;

    if (watchingCategoryId === defaultCategoryId) {
      setValue("sortOrder", defaultSortOrder, {
        shouldValidate: false,
      });
    } else {
      setValue("sortOrder", filteredEditMenu.at(-1)?.sortOrder, {
        shouldValidate: false,
      });
    }
  }, [
    watchingCategoryId,
    setValue,
    filteredEditMenu,
    defaultCategoryId,
    defaultSortOrder,
  ]);
}
