import { createMenuPayloadSchema } from "@ssurak/api/schemas/model/menu.schema";
import z from "zod";

const sortOrderFormSchema = z
  .array(z.string())
  .min(1, "정렬할 메뉴가 하나 이상 있어야 합니다.");

export const menuFormPayloadSchema = createMenuPayloadSchema.extend({
  sortOrder: sortOrderFormSchema,
});
