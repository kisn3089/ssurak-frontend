import z from "zod";
import type {
  MenuCustomOptionValue,
  MenuOptionValue,
  MenuRequiredOptionValue,
} from "../../types/menu/menuOptions.interface";
import { commonSchema } from "../common";

export type CreateMenuPayload = z.infer<typeof createMenuPayloadSchema>;
export type UpdateMenuPayload = z.infer<typeof updateMenuPayloadSchema>;

const optionSchema = z
  .object({
    key: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })
  .strict() satisfies z.ZodType<MenuOptionValue>;

const requiredOptionValuesSchema = z.object({
  options: z.array(optionSchema),
  defaultKey: z.string(),
}) satisfies z.ZodType<MenuRequiredOptionValue>;

const triggerSchema = z
  .object({ group: z.string(), in: z.array(z.string()) })
  .strict();

const customOptionValueSchema = z
  .object({
    options: z.array(optionSchema),
    trigger: z.array(triggerSchema).optional(),
    defaultKey: z.string(),
  })
  .strict() satisfies z.ZodType<MenuCustomOptionValue>;

const requiredOptionsSchema = z
  .record(z.string(), requiredOptionValuesSchema)
  .nullable();

const customOptionsSchema = z
  .record(z.string(), customOptionValueSchema)
  .nullable();

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
    sortOrder: z.number().min(0, "정렬 순서는 0 이상이어야 합니다.").optional(),
    description: z
      .string()
      .max(100, "메뉴 설명은 최대 100자까지 가능합니다.")
      .nullable()
      .optional(),
    imageKey: z
      .string({
        required_error: "이미지는 필수입니다.",
        invalid_type_error: "이미지를 업로드해 주세요.",
      })
      .min(1, "이미지를 업로드해 주세요.")
      .nullable(),
    isAvailable: z.boolean().optional(),
    requiredOptions: requiredOptionsSchema.optional(),
    customOptions: customOptionsSchema.optional(),
  })
  .strict();

export const updateMenuPayloadSchema = createMenuPayloadSchema.partial();
