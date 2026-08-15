import z from "zod";
import { commonSchema } from "../common";

export type CreateMenuPayload = z.infer<typeof createMenuPayloadSchema>;
export type UpdateMenuPayload = z.infer<typeof updateMenuPayloadSchema>;

export const menuNameSchema = z
  .string()
  .trim()
  .min(1, "메뉴 이름은 필수입니다.")
  .max(30, "메뉴 이름은 최대 30자까지 가능합니다.");

export const MENU_NAME_MAX = 30;

export const menuDescriptionSchema = z
  .string()
  .max(100, "메뉴 설명은 최대 100자까지 가능합니다.");

export const MENU_DESCRIPTION_MAX = 100;

export const createMenuPayloadSchema = z
  .object({
    name: menuNameSchema,
    price: commonSchema.menuPrice,
    categoryId: z
      .string()
      .min(1, "카테고리를 선택해 주세요.")
      .pipe(commonSchema.cuid2("Category")),
    description: menuDescriptionSchema.nullable().optional(),
    imageKey: z.string().nullable().optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict();

export const updateMenuPayloadSchema = createMenuPayloadSchema.partial();

export type ReorderMenusPayload = z.infer<typeof reorderMenusPayloadSchema>;

export const reorderMenusPayloadSchema = z
  .object({
    categoryId: commonSchema.cuid2("Category"),
    menuIds: z
      .array(commonSchema.cuid2("Menu"))
      .min(1, "정렬할 메뉴를 하나 이상 보내주세요.")
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "메뉴 ID가 중복되었습니다."
      ),
  })
  .strict();
