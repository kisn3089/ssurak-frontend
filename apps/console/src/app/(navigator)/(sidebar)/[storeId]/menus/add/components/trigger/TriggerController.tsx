"use client";

import { Control, useFieldArray } from "react-hook-form";
import { OptionGroupForm } from "../../../types/option-form.type";
import { createEmptyOptionTrigger } from "../../../utils/menu-option-form";
import AddTrigger from "./AddTrigger";
import TriggerCondition, { TriggerGroupChoice } from "./TriggerCondition";
import TriggerHeader from "./TriggerHeader";

type TriggerControllerProps = {
  control: Control<OptionGroupForm>;
  /** 자기 자신을 뺀, 이미 저장된 다른 옵션들. */
  groupChoices: TriggerGroupChoice[];
};

export default function TriggerController({
  control,
  groupChoices,
}: TriggerControllerProps) {
  "use no memo";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "trigger",
  });

  const hasGroupChoices = groupChoices.length > 0;

  return (
    <div className="flex flex-col gap-[3px] rounded-2xl bg-blue-primary border border-blue-primary-edge p-3.5 mt-3">
      <TriggerHeader />
      {fields.map((trigger, index) => (
        <TriggerCondition
          key={trigger.id}
          control={control}
          name={`trigger.${index}`}
          groupChoices={groupChoices}
          onRemove={() => remove(index)}
        />
      ))}
      {!hasGroupChoices && (
        <span className="text-muted-foreground text-xs mt-2">
          조건으로 쓸 다른 옵션이 없습니다. 조건이 될 옵션을 먼저 저장해 주세요.
        </span>
      )}
      <AddTrigger
        disabled={!hasGroupChoices}
        onClick={() => append(createEmptyOptionTrigger())}
      />
    </div>
  );
}
