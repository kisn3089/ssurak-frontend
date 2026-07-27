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
  const currentGroupKey = useWatch({ control, name: `${groupName}.groupKey` });

  const excludeCurrentGroup = (group: OptionGroupForm): boolean =>
    group.groupKey !== currentGroupKey;

  const groupChoices: TriggerGroupChoice[] = [
    ...new Map(
      [...requiredGroups, ...customGroups]
        .filter(excludeCurrentGroup)
        .map((group) => [
          group.groupKey,
          {
            groupKey: group.groupKey,
            optionKeys: group.options
              .map((option) => option.key)
              .filter((key) => key !== ""),
          },
        ])
    ).values(),
  ];

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
      <AddTrigger onClick={() => append(createEmptyOptionTrigger())} />
    </div>
  );
}
