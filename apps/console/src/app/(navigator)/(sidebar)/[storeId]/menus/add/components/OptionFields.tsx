"use client";

import { Control, useFormState, useWatch } from "react-hook-form";
import {
  MenuFormPayload,
  MenuOptionFieldName,
  OptionGroupFieldName,
} from "../../types/menu-form-payload.type";
import OptionGroup from "./option-field/OptionGroup";
import OptionHeader from "./option-field/OptionHeader";
import OptionLine from "./option-field/OptionLine";
import OptionValues from "./option-field/OptionValues";

type OptionFieldsProps = {
  control: Control<MenuFormPayload>;
  fieldName: MenuOptionFieldName;
  index: number;
  onRemove: () => void;
};

export default function OptionFields({
  control,
  fieldName,
  index,
  onRemove,
}: OptionFieldsProps) {
  const name: OptionGroupFieldName = `${fieldName}.${index}`;

  const groupKey = useWatch({ control, name: `${name}.groupKey` });
  const options = useWatch({ control, name: `${name}.options` });
  const formState = useFormState({ control, name });

  const optionKeys = options
    .map((option) => option.key.trim())
    .filter((optionKey) => optionKey !== "");

  return (
    <OptionGroup
      title={groupKey}
      optionKeys={optionKeys}
      isRequiredOption={fieldName === "requiredOptions"}
      hasError={control.getFieldState(name, formState).invalid}
      onRemove={onRemove}
    >
      <OptionHeader control={control} name={`${name}.groupKey`} />
      <OptionLine label="옵션값" />
      <OptionValues control={control} groupName={name} />
    </OptionGroup>
  );
}
