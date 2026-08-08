import z from "zod";
import { commonSchema } from "../common";

export type CreateMenuPayload = z.infer<typeof createMenuPayloadSchema>;
export type UpdateMenuPayload = z.infer<typeof updateMenuPayloadSchema>;

export const createMenuPayloadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "메뉴 이름은 필수입니다.")
      .max(30, "메뉴 이름은 최대 30자까지 가능합니다."),
    price: z
      .number({
        required_error: "메뉴 가격은 필수입니다.",
        invalid_type_error: "메뉴 가격은 숫자로 입력해 주세요.",
      })
      .min(0, "메뉴 가격은 0원 이상이어야 합니다."),
    categoryId: z
      .string()
      .min(1, "카테고리를 선택해 주세요.")
      .pipe(commonSchema.cuid2("Category")),
    description: z
      .string()
      .max(100, "메뉴 설명은 최대 100자까지 가능합니다.")
      .nullable()
      .optional(),
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
