import { createMenuPayloadSchema } from "@ssurak/api/schemas/model/menu.schema";
import z from "zod";

const sortOrderFormSchema = z
  .array(z.string())
  .min(1, "정렬할 메뉴가 하나 이상 있어야 합니다.");

/**
 * 폼 전용 스키마.
 *
 * 서버 스키마(createMenuPayloadSchema)에 폼에서만 쓰는 필드를 얹어 파생시킨다 —
 * 두 스키마가 갈라지지 않도록 필드를 복사하지 않는다.
 *
 * 옵션은 여기 없다. 옵션은 메뉴 페이로드에 실리지 않고 publicId 기반 옵션 API
 * (`/menus/{menuId}/options`, `/options/{optionId}`, `/options/{optionId}/choices`)로
 * 따로 관리하므로, 옵션 편집 폼은 메뉴 폼과 분리된 스키마를 가져야 한다.
 */
export const menuFormPayloadSchema = createMenuPayloadSchema.extend({
  sortOrder: sortOrderFormSchema,
});
