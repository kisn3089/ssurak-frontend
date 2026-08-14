import z from "zod";
import { commonSchema } from "../common";

export type CreateCategoryPayload = z.infer<typeof createCategoryPayloadSchema>;

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "카테고리 이름은 필수입니다.")
  .max(20, "카테고리 이름은 최대 20자까지 가능합니다.");

export const CATEGORY_NAME_MAX = 20;

export const createCategoryPayloadSchema = z
  .object({
    name: categoryNameSchema,
  })
  .strict();

export type UpdateCategoryPayload = z.infer<typeof updateCategoryPayloadSchema>;

export const updateCategoryPayloadSchema =
  createCategoryPayloadSchema.partial();

export type ReorderCategoriesPayload = z.infer<
  typeof reorderCategoriesPayloadSchema
>;

/**
 * 매장 카테고리 전체를 원하는 순서로 나열해 보낸다(부분 목록이 아니다).
 * 서버가 이 배열과 현재 카테고리 집합이 같은지 대조하므로, 다른 곳에서
 * 카테고리가 추가·삭제됐다면 409로 거절된다 — 집합 검사가 곧 버전 체크다.
 */
export const reorderCategoriesPayloadSchema = z
  .object({
    categoryIds: z
      .array(commonSchema.cuid2("Category"))
      .min(1, "정렬할 카테고리를 하나 이상 보내주세요.")
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "카테고리 ID가 중복되었습니다."
      ),
  })
  .strict();
