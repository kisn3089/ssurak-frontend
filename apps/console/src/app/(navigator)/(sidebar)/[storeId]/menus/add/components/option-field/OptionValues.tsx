"use client";

import { OptionSelectionType } from "@ssurak/api/types/menu/menuOptions.interface";
import {
  Control,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import useDragSort, { resolveDropEdge } from "../../../../hooks/useDragSort";
import { OptionGroupForm } from "../../../types/option-form.type";
import { createEmptyOptionValue } from "../../../utils/menu-option-form";
import TriggerController from "../trigger/TriggerController";
import { TriggerGroupChoice } from "../trigger/TriggerCondition";
import OptionValue from "./OptionValue";
import AddFieldButton from "../../../../components/form/AddFieldButton";

type OptionValuesProps = {
  control: Control<OptionGroupForm>;
  setValue: UseFormSetValue<OptionGroupForm>;
  groupChoices: TriggerGroupChoice[];
};

export default function OptionValues({
  control,
  setValue,
  groupChoices,
}: OptionValuesProps) {
  "use no memo";

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "choices",
  });
  const selectionType = useWatch({ control, name: "selectionType" });
  const choices = useWatch({ control, name: "choices" });
  const minSelect = useWatch({ control, name: "minSelect" });
  const maxSelect = useWatch({ control, name: "maxSelect" });

  const { listRef, draggingIndex, targetIndex, getHandleProps, getItemProps } =
    useDragSort(fields.length, move);

  const toggleDefault = (index: number) => {
    const nextIsDefault = !choices[index]?.isDefault;

    if (nextIsDefault && selectionType === OptionSelectionType.SINGLE) {
      choices.forEach((_, at) =>
        setValue(`choices.${at}.isDefault`, at === index)
      );
      return;
    }

    setValue(`choices.${index}.isDefault`, nextIsDefault);
  };

  const clampSelectRange = (remaining: number) => {
    setValue("maxSelect", Math.min(maxSelect ?? 1, remaining));
    setValue("minSelect", Math.min(minSelect ?? 0, remaining));
  };

  return (
    <div ref={listRef} className="flex flex-col gap-y-2 pb-2">
      {fields.map((choice, index) => (
        <OptionValue
          key={choice.id}
          control={control}
          name={`choices.${index}`}
          index={index}
          removable={fields.length > 1}
          dragHandleProps={getHandleProps(index)}
          dragItemProps={getItemProps(index)}
          isDragging={draggingIndex === index}
          dropEdge={resolveDropEdge(draggingIndex, targetIndex, index)}
          onSelectDefault={() => toggleDefault(index)}
          onRemove={() => {
            remove(index);
            clampSelectRange(fields.length - 1);
          }}
        />
      ))}
      <AddFieldButton onClick={() => append(createEmptyOptionValue())}>
        + 옵션 값 추가
      </AddFieldButton>
      <TriggerController control={control} groupChoices={groupChoices} />
    </div>
  );
}
