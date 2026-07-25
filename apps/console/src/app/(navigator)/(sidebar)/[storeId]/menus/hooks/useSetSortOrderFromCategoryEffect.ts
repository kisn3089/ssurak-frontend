import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import { useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";

type UseSetSortOrderFromCategoryEffectProps = {
  watchingCategoryId: string | null;
  defaultCategoryId: string | undefined;
  defaultSortOrder: number | undefined;
  filteredEditMenu: { name: string; sortOrder: number }[];
  setValue: UseFormSetValue<CreateMenuPayload>;
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
