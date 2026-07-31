"use client";

import { Control, useController, useFieldArray } from "react-hook-form";
import {
  MenuFormPayload,
  OptionGroupFieldName,
  OptionValuesFieldName,
} from "../../../types/menu-form-payload.type";
import { createEmptyOptionValue } from "../../../utils/menu-option-form";
import OptionAddButton from "./OptionAddButton";
import OptionValue from "./OptionValue";
import TriggerController from "../trigger/TriggerController";

type OptionValuesProps = {
  control: Control<MenuFormPayload>;
  groupName: OptionGroupFieldName;
};

export default function OptionValues({
  control,
  groupName,
}: OptionValuesProps) {
  "use no memo";

  const name: OptionValuesFieldName = `${groupName}.options`;

  const { fields, append, remove } = useFieldArray({ control, name });
  const { field: defaultIndexField } = useController({
    control,
    name: `${groupName}.defaultIndex`,
  });

  const defaultIndex = defaultIndexField.value ?? 0;
  const isCustomOption = groupName.startsWith("customOptions");

  const removeOptionValue = (index: number) => {
    remove(index);

    if (index === defaultIndex) {
      defaultIndexField.onChange(0);
      return;
    }
    if (index < defaultIndex) {
      defaultIndexField.onChange(defaultIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 pb-4">
      {fields.map((optionValue, index) => (
        <OptionValue
          key={optionValue.id}
          control={control}
          name={`${name}.${index}`}
          index={index}
          isDefault={index === defaultIndex}
          removable={fields.length > 1}
          onSelectDefault={() => defaultIndexField.onChange(index)}
          onRemove={() => removeOptionValue(index)}
        />
      ))}
      <OptionAddButton onClick={() => append(createEmptyOptionValue())} />
      {isCustomOption && (
        <TriggerController control={control} groupName={groupName} />
      )}
    </div>
  );
}
