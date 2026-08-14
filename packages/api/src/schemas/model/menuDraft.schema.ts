import z from "zod";
import { commonSchema } from "../common";
import { categoryNameSchema } from "./category.schema";
import {
  BULK_MENU_MAX,
  menuDescriptionSchema,
  menuNameSchema,
} from "./menu.schema";

export const DRAFT_ID_LENGTH = 22;

export const draftIdSchema = z
  .string()
  .regex(
    new RegExp(`^[A-Za-z0-9_-]{${DRAFT_ID_LENGTH}}$`),
    "draftId 형식이 올바르지 않습니다."
  );

const menuDraftItemPayloadSchema = z
  .object({
    name: menuNameSchema,
    price: commonSchema.menuPrice.nullable(),
    description: menuDescriptionSchema.nullable().optional(),
    categoryId: commonSchema.cuid2("Category").optional(),
    categoryName: categoryNameSchema.optional(),
  })
  .strict()
  .superRefine((item, ctx) => {
    if (item.categoryId !== undefined && item.categoryName !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message:
          "기존 카테고리(categoryId)와 새 카테고리(categoryName) 중 하나만 지정해 주세요.",
      });
    }
  });

export type MenuDraftItemPayload = z.infer<typeof menuDraftItemPayloadSchema>;

/**
 * 부분 수정이 아니라 배열 통째 교체다
 * `issues`는 보내지 않는다: 서버가 저장 시점의 매장 상태로 다시 계산한다.
 */
export const updateMenuDraftPayloadSchema = z
  .object({
    items: z
      .array(menuDraftItemPayloadSchema)
      .max(
        BULK_MENU_MAX,
        `초안에는 최대 ${BULK_MENU_MAX}개까지 담을 수 있습니다.`
      ),
  })
  .strict();

export type UpdateMenuDraftPayload = z.infer<
  typeof updateMenuDraftPayloadSchema
>;
