import z from "zod";
import { commonSchema } from "../common";
import { categoryNameSchema } from "./category.schema";

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

export const BULK_MENU_MAX = 100;

const bulkMenuItemSchema = z
  .object({
    name: menuNameSchema,
    price: commonSchema.menuPrice,
    description: menuDescriptionSchema.nullable().optional(),
    categoryId: commonSchema.cuid2("Category").optional(),
    categoryName: categoryNameSchema.optional(),
    isAvailable: z.boolean().default(true),
  })
  .strict()
  .superRefine((item, ctx) => {
    const hasId = item.categoryId !== undefined;
    const hasName = item.categoryName !== undefined;

    if (hasId === hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: hasId
          ? "기존 카테고리(categoryId)와 새 카테고리(categoryName) 중 하나만 지정해 주세요."
          : "카테고리를 지정해 주세요.",
      });
    }
  });

export type BulkMenuItem = z.infer<typeof bulkMenuItemSchema>;

export type BulkCreateMenusPayload = z.infer<
  typeof bulkCreateMenusPayloadSchema
>;

export const bulkCreateMenusPayloadSchema = z
  .object({
    items: z
      .array(bulkMenuItemSchema)
      .min(1, "등록할 메뉴를 하나 이상 보내주세요.")
      .max(
        BULK_MENU_MAX,
        `한 번에 최대 ${BULK_MENU_MAX}개까지 등록할 수 있습니다.`
      ),
  })
  .strict();

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
