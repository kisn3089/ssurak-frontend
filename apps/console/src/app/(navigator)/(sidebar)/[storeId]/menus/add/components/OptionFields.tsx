"use client";

import { Control, useWatch } from "react-hook-form";
import {
  MenuFormPayload,
  OptionGroupFieldName,
} from "../../types/menu-form-payload.type";
import OptionGroup from "./option-field/OptionGroup";
import OptionHeader from "./option-field/OptionHeader";
import OptionLine from "./option-field/OptionLine";
import OptionValues from "./option-field/OptionValues";

type OptionFieldsProps = {
  control: Control<MenuFormPayload>;
  name: OptionGroupFieldName;
  onRemove: () => void;
};

export default function OptionFields({
  control,
  name,
  onRemove,
}: OptionFieldsProps) {
  const groupKey = useWatch({ control, name: `${name}.groupKey` });
  const options = useWatch({ control, name: `${name}.options` });

  const optionKeys = options
    .map((option) => option.key.trim())
    .filter((optionKey) => optionKey !== "");

  return (
    <OptionGroup
      title={groupKey}
      optionKeys={optionKeys}
      isRequiredOption={name.startsWith("requiredOptions")}
      onRemove={onRemove}
    >
      <OptionHeader control={control} name={`${name}.groupKey`} />
      <OptionLine label="옵션값" />
      <OptionValues control={control} groupName={name} />
    </OptionGroup>
  );
}
