import { useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { MenuFormPayload } from "../types/menu-form-payload.type";
import { buildExpectedOrder } from "../utils/menu-sort-order";

type UseResetSortOrderOnCategoryChangeProps = {
  watchingCategoryId: string | null;
  /** 선택된 카테고리에 지금 들어 있는 메뉴들의 publicId 순서 */
  categoryMenuIds: string[];
  selfId: string;
  setValue: UseFormSetValue<MenuFormPayload>;
};

/**
 * 카테고리를 바꾸면 정렬 목록은 이전 카테고리의 메뉴를 가리키고 있으므로 통째로 갈아끼운다.
 * 새 기준값은 "그 카테고리로 저장했을 때 서버가 갖게 될 순서"다.
 */
export default function useResetSortOrderOnCategoryChange({
  watchingCategoryId,
  categoryMenuIds,
  selfId,
  setValue,
}: UseResetSortOrderOnCategoryChangeProps) {
  const previousCategoryId = useRef(watchingCategoryId);

  useEffect(() => {
    if (previousCategoryId.current === watchingCategoryId) return;
    previousCategoryId.current = watchingCategoryId;

    setValue("sortOrder", buildExpectedOrder(categoryMenuIds, selfId), {
      shouldValidate: false,
    });
  }, [watchingCategoryId, categoryMenuIds, selfId, setValue]);
}
