import { useEffect } from "react";
import { isSameOrder, syncDraftOrder } from "../../../utils/menu-sort-order";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";

type UseSyncDraftOrderEffectProps = {
  categoryWithMenus: CategoryWithMenusResponse[];
  getValues: UseFormGetValues<{ categoryIds: string[] }>;
  setValue: UseFormSetValue<{ categoryIds: string[] }>;
};

export default function useSyncDraftOrderEffect({
  categoryWithMenus,
  getValues,
  setValue,
}: UseSyncDraftOrderEffectProps) {
  useEffect(() => {
    const draftIds = getValues("categoryIds");
    const syncedIds = syncDraftOrder(
      draftIds,
      categoryWithMenus.map((category) => category.publicId)
    );

    if (!isSameOrder(syncedIds, draftIds)) {
      setValue("categoryIds", syncedIds);
    }
  }, [categoryWithMenus, getValues, setValue]);
}
