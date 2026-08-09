"use client";

import { Select } from "@ssurak/ui/components/forms/select";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import { SelectOption } from "../../../../components/form/select-form-field/SelectFormField";
import {
  OptionGroupForm,
  OptionTriggerFieldName,
} from "../../../types/option-form.type";
import DeleteCondition from "./DeleteCondition";
import SetTriggerCondition from "./SetTriggerCondition";
import TriggerSelect from "./TriggerSelect";
import TriggerSelectOptions from "./TriggerSelectOptions";

/** 조건으로 고를 수 있는 다른 옵션과, 그 옵션이 가진 선택지들. */
export type TriggerGroupChoice = {
  /** 셀렉트에 저장되는 값. 이름이 바뀌어도 조건이 끊기지 않도록 publicId를 쓴다. */
  optionId: string;
  /** 화면에 보여줄 이름. */
  name: string;
  choices: { publicId: string; name: string }[];
};

type TriggerConditionProps = {
  control: Control<OptionGroupForm>;
  name: OptionTriggerFieldName;
  groupChoices: TriggerGroupChoice[];
  onRemove: () => void;
};

export default function TriggerCondition({
  control,
  name,
  groupChoices,
  onRemove,
}: TriggerConditionProps) {
  const { field: optionField, fieldState: optionState } = useController({
    control,
    name: `${name}.optionId`,
  });
  const { field: choiceIdsField, fieldState: choiceIdsState } = useController({
    control,
    name: `${name}.choiceIds`,
  });

  const selectedChoiceIds = choiceIdsField.value ?? [];
  const groupOptions: SelectOption[] = groupChoices.map((choice) => ({
    label: choice.name,
    value: choice.optionId,
  }));
  const choices =
    groupChoices.find((choice) => choice.optionId === optionField.value)
      ?.choices ?? [];

  // 조건 옵션을 바꾸면 앞 옵션의 선택지 id는 의미가 없어지므로 같이 비운다.
  const changeOption = (nextOptionId: string) => {
    optionField.onChange(nextOptionId);
    choiceIdsField.onChange([]);
  };

  const toggleChoice = (choiceId: string) => {
    choiceIdsField.onChange(
      selectedChoiceIds.includes(choiceId)
        ? selectedChoiceIds.filter((id) => id !== choiceId)
        : [...selectedChoiceIds, choiceId]
    );
  };

  const errorMessage =
    optionState.error?.message ?? choiceIdsState.error?.message;

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center gap-x-2 bg-background rounded-2xl border border-blue-primary-edge mt-2 px-3 py-2.5 text-muted-foreground">
        <Select value={optionField.value} onValueChange={changeOption}>
          <TriggerSelect />
          <TriggerSelectOptions options={groupOptions} />
        </Select>
        <span className="text-xs">가(이)</span>
        {choices.map((choice) => (
          <SetTriggerCondition
            key={choice.publicId}
            isActive={selectedChoiceIds.includes(choice.publicId)}
            onClick={() => toggleChoice(choice.publicId)}
          >
            {choice.name}
          </SetTriggerCondition>
        ))}
        <span className="text-xs">일 때 노출</span>
        <DeleteCondition onClick={onRemove} />
      </div>
      {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
    </div>
  );
}
