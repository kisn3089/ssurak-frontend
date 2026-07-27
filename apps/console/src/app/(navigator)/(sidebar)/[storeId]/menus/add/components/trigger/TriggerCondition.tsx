"use client";

import { Select } from "@ssurak/ui/components/forms/select";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import { SelectOption } from "../../../../components/form/SelectFormField";
import {
  MenuFormPayload,
  OptionTriggerFieldName,
} from "../../../types/menu-form-payload.type";
import DeleteCondition from "./DeleteCondition";
import SetTriggerCondition from "./SetTriggerCondition";
import TriggerSelect from "./TriggerSelect";
import TriggerSelectOptions from "./TriggerSelectOptions";

/** 조건으로 고를 수 있는 다른 옵션 그룹과, 그 그룹이 가진 선택값들. */
export type TriggerGroupChoice = {
  groupKey: string;
  optionKeys: string[];
};

type TriggerConditionProps = {
  control: Control<MenuFormPayload>;
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
  const { field: groupField, fieldState: groupState } = useController({
    control,
    name: `${name}.group`,
  });
  const { field: selectedKeysField, fieldState: selectedKeysState } =
    useController({ control, name: `${name}.in` });

  const selectedKeys = selectedKeysField.value ?? [];
  const groupOptions: SelectOption[] = groupChoices.map((choice) => ({
    label: choice.groupKey,
    value: choice.groupKey,
  }));
  const optionKeys =
    groupChoices.find((choice) => choice.groupKey === groupField.value)
      ?.optionKeys ?? [];

  // 조건 그룹을 바꾸면 앞 그룹의 선택값 이름은 의미가 없어지므로 같이 비운다.
  const changeGroup = (nextGroupKey: string) => {
    groupField.onChange(nextGroupKey);
    selectedKeysField.onChange([]);
  };

  const toggleOptionKey = (optionKey: string) => {
    selectedKeysField.onChange(
      selectedKeys.includes(optionKey)
        ? selectedKeys.filter((key) => key !== optionKey)
        : [...selectedKeys, optionKey]
    );
  };

  const errorMessage =
    groupState.error?.message ?? selectedKeysState.error?.message;

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center gap-x-2 bg-background rounded-2xl border border-blue-primary-edge mt-2 px-3 py-2.5 text-muted-foreground">
        <Select value={groupField.value} onValueChange={changeGroup}>
          <TriggerSelect />
          <TriggerSelectOptions options={groupOptions} />
        </Select>
        <span className="text-xs">가(이)</span>
        {optionKeys.map((optionKey) => (
          <SetTriggerCondition
            key={optionKey}
            isActive={selectedKeys.includes(optionKey)}
            onClick={() => toggleOptionKey(optionKey)}
          >
            {optionKey}
          </SetTriggerCondition>
        ))}
        <span className="text-xs">일 때 노출</span>
        <DeleteCondition onClick={onRemove} />
      </div>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
