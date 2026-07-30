import { createMenuPayloadSchema } from "@ssurak/api/schemas/model/menu.schema";
import z from "zod";

const optionValueFormSchema = z.object({
  key: z.string().trim().min(1, "옵션 값 이름을 입력해 주세요."),
  // 빈 칸(null)은 "추가 금액 없음"으로 본다. 0을 일일이 지우고 쓰지 않도록 입력을 강제하지 않고 0으로 채운다.
  price: z
    .number()
    .min(0, "추가 금액은 0원 이상이어야 합니다.")
    .nullable()
    .transform((price) => price ?? 0),
  // 아직 입력 UI가 없지만, 선언해두지 않으면 parse에서 잘려나가 편집 시 서버 값이 지워진다.
  description: z.string().optional(),
});

const triggerFormSchema = z.object({
  // 대상 그룹은 이름이 아니라 폼 내부 식별자로 가리킨다. 이름은 편집 중 바뀌기 때문이다.
  groupId: z.string().min(1, "조건이 될 옵션 그룹을 선택해 주세요."),
  in: z
    .array(z.string())
    .min(1, "노출 조건이 될 선택값을 1개 이상 골라 주세요."),
});

const optionGroupFormSchema = z
  .object({
    // 폼 안에서만 쓰는 식별자. 선언하지 않으면 parse에서 잘려나가 trigger가 대상을 잃는다.
    groupId: z.string().min(1),
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
  })
  // trigger는 필수·선택 옵션을 서로 참조할 수 있어 두 목록을 다 볼 수 있는 여기서만 검증된다.
  .superRefine((payload, ctx) => {
    const optionKeysByGroupId = new Map(
      [...payload.requiredOptions, ...payload.customOptions].map((group) => [
        group.groupId,
        new Set(group.options.map((option) => option.key)),
      ])
    );

    (["requiredOptions", "customOptions"] as const).forEach((fieldName) => {
      payload[fieldName].forEach((group, groupIndex) => {
        group.trigger.forEach((trigger, triggerIndex) => {
          const path = [fieldName, groupIndex, "trigger", triggerIndex];
          const targetOptionKeys = optionKeysByGroupId.get(trigger.groupId);

          // 조건으로 지정한 그룹을 지운 경우. 그대로 저장하면 성립 불가능한 조건이 되어 고객 앱에서 영구 미노출된다.
          if (!targetOptionKeys) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [...path, "groupId"],
              message:
                "조건으로 지정한 옵션 그룹이 없습니다. 다시 골라 주세요.",
            });
            return;
          }

          // 조건으로 고른 뒤 대상 그룹의 옵션 값 이름이 바뀐 경우.
          const missingKeys = trigger.in.filter(
            (optionKey) => !targetOptionKeys.has(optionKey)
          );
          if (missingKeys.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [...path, "in"],
              message: `'${missingKeys.join(", ")}' 선택값이 더 이상 없습니다. 조건을 다시 골라 주세요.`,
            });
          }
        });
      });
    });
  });
