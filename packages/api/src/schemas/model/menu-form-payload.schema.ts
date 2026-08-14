import { createMenuPayloadSchema } from "@ssurak/api/schemas/model/menu.schema";
import z from "zod";

const sortOrderFormSchema = z
  .array(z.string())
  .min(1, "정렬할 메뉴가 하나 이상 있어야 합니다.");

// isAvailable은 폼이 항상 토글 값을 들고 있으므로 default를 벗겨 input/output 타입을 맞춘다.
export const menuFormPayloadSchema = createMenuPayloadSchema.extend({
  sortOrder: sortOrderFormSchema,
  isAvailable: z.boolean(),
});
