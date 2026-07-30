"use client";

import { Control, useFieldArray, useWatch } from "react-hook-form";
import {
  MenuFormPayload,
  OptionGroupFieldName,
  OptionGroupForm,
} from "../../../types/menu-form-payload.type";
import { createEmptyOptionTrigger } from "../../../utils/menu-option-form";
import AddTrigger from "./AddTrigger";
import TriggerCondition, { TriggerGroupChoice } from "./TriggerCondition";
import TriggerHeader from "./TriggerHeader";

type TriggerControllerProps = {
  control: Control<MenuFormPayload>;
  groupName: OptionGroupFieldName;
};

export default function TriggerController({
  control,
  groupName,
}: TriggerControllerProps) {
  "use no memo";

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${groupName}.trigger`,
  });

  const [requiredGroups, customGroups] = useWatch({
    control,
    name: ["requiredOptions", "customOptions"],
  });
  const currentGroupId = useWatch({ control, name: `${groupName}.groupId` });

  /**
   * 자기 자신은 조건이 될 수 없고, 이름 없는 그룹은 셀렉트에 빈 항목으로 들어가 고를 수 없다
   * (Radix Select는 빈 문자열 값을 "선택 없음"으로 취급한다).
   */
  const isSelectableGroup = (group: OptionGroupForm): boolean =>
    group.groupId !== currentGroupId && group.groupKey.trim() !== "";

  // 식별자가 groupId라 이름이 겹쳐도 후보가 뭉개지지 않는다.
  const groupChoices: TriggerGroupChoice[] = [
    ...requiredGroups,
    ...customGroups,
  ]
    .filter(isSelectableGroup)
    .map((group) => ({
      groupId: group.groupId,
      groupKey: group.groupKey.trim(),
      // 제출 시 옵션 값 이름은 trim되므로 조건에도 같은 형태로 담는다.
      optionKeys: group.options
        .map((option) => option.key.trim())
        .filter((key) => key !== ""),
    }));

  const hasGroupChoices = groupChoices.length > 0;

  return (
    <div className="flex flex-col gap-[3px] rounded-2xl bg-blue-primary border border-blue-primary-edge p-3.5 mt-3">
      <TriggerHeader />
      {fields.map((trigger, index) => (
        <TriggerCondition
          key={trigger.id}
          control={control}
          name={`${groupName}.trigger.${index}`}
          groupChoices={groupChoices}
          onRemove={() => remove(index)}
        />
      ))}
      {!hasGroupChoices && (
        <span className="text-muted-foreground text-xs mt-2">
          조건으로 쓸 다른 옵션 그룹이 없습니다. 먼저 다른 그룹의 이름을 입력해
          주세요.
        </span>
      )}
      <AddTrigger
        disabled={!hasGroupChoices}
        onClick={() => append(createEmptyOptionTrigger())}
      />
    </div>
  );
}
