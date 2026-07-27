import { useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { MenuFormPayload } from "../types/menu-form-payload.type";

type UseSyncDefaultSortOrderEffectProps = {
  persistedSortOrder: number | undefined;
  defaultSortOrder: number | undefined;
  setValue: UseFormSetValue<MenuFormPayload>;
};
export default function useSyncDefaultSortOrderEffect({
  persistedSortOrder,
  defaultSortOrder,
  setValue,
}: UseSyncDefaultSortOrderEffectProps) {
  /**
   * 감지는 persistedSortOrder(편집 메뉴 자신의 sortOrder = menu.sortOrder)로 한다.
   */
  const syncedSortOrder = useRef(persistedSortOrder);

  useEffect(() => {
    if (syncedSortOrder.current === persistedSortOrder) return;
    syncedSortOrder.current = persistedSortOrder;

    setValue("sortOrder", defaultSortOrder, { shouldValidate: false });
  }, [persistedSortOrder, defaultSortOrder, setValue]);
}
