import { createMenuPayloadSchema } from "@ssurak/api/schemas/model/menu.schema";
import z from "zod";

const optionValueFormSchema = z.object({
  key: z.string().trim().min(1, "옵션 값 이름을 입력해 주세요."),
  price: z
    .number({
      required_error: "추가 금액을 입력해 주세요.",
      invalid_type_error: "추가 금액을 입력해 주세요.",
    })
    .min(0, "추가 금액은 0원 이상이어야 합니다."),
  // 아직 입력 UI가 없지만, 선언해두지 않으면 parse에서 잘려나가 편집 시 서버 값이 지워진다.
  description: z.string().optional(),
});

const triggerFormSchema = z.object({
  group: z.string().min(1, "조건이 될 옵션 그룹을 선택해 주세요."),
  in: z
    .array(z.string())
    .min(1, "노출 조건이 될 선택값을 1개 이상 골라 주세요."),
});

const optionGroupFormSchema = z
  .object({
    groupKey: z.string().trim().min(1, "옵션 이름을 입력해 주세요."),
    options: z
      .array(optionValueFormSchema)
      .min(1, "옵션 값을 1개 이상 추가해 주세요."),
    defaultIndex: z.number().min(0),
    trigger: z.array(triggerFormSchema),
  })
  .superRefine((group, ctx) => {
    // 주문 시 옵션 값은 key로 스냅샷되므로 한 그룹 안에서 이름이 겹치면 안 된다.
    const usedKeys = new Set<string>();

    group.options.forEach((option, index) => {
      if (usedKeys.has(option.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", index, "key"],
          message: "이미 사용한 옵션 값 이름입니다.",
        });
      }
      usedKeys.add(option.key);
    });
  });

const optionGroupsFormSchema = z
  .array(optionGroupFormSchema)
  .superRefine((groups, ctx) => {
    // 그룹 이름은 Record의 key가 되므로, 겹치면 뒤 그룹이 앞 그룹을 덮어쓴다.
    const usedGroupKeys = new Set<string>();

    groups.forEach((group, index) => {
      if (usedGroupKeys.has(group.groupKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "groupKey"],
          message: "이미 사용한 옵션 이름입니다.",
        });
      }
      usedGroupKeys.add(group.groupKey);
    });
  });

const sortOrderFormSchema = z
  .array(z.string())
  .min(1, "정렬할 메뉴가 하나 이상 있어야 합니다.");

/**
 * 폼 전용 스키마.
 * 옵션만 Record → 배열로 갈아끼우고 나머지 필드는 서버 스키마(createMenuPayloadSchema)를 그대로 쓴다.
 * 두 스키마가 갈라지지 않도록 필드를 복사하지 않고 omit + extend로 파생시킨다.
 */
export const menuFormPayloadSchema = createMenuPayloadSchema
  .omit({ requiredOptions: true, customOptions: true })
  .extend({
    requiredOptions: optionGroupsFormSchema,
    customOptions: optionGroupsFormSchema,
    sortOrder: sortOrderFormSchema,
  });
