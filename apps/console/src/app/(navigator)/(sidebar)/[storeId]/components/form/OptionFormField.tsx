"use client";

import { Field, FieldDescription } from "@ssurak/ui/components/forms/field";
import { Control, useFieldArray } from "react-hook-form";
import AddOptionGroupButton from "../../menus/add/components/option-field/AddOptionGroupButton";
import OptionFields from "../../menus/add/components/OptionFields";
import {
  MenuFormPayload,
  MenuOptionFieldName,
} from "../../menus/types/menu-form-payload.type";
import { createEmptyOptionGroup } from "../../menus/utils/menu-option-form";
import FormLabel from "./FormLabel";

export type StaticOptionField = {
  id: MenuOptionFieldName;
  label: string;
  required?: boolean;
  type: "option";
  addOptionGroupButtonLabel: string;
  description?: React.ReactNode;
};

export type DynamicOptionField = StaticOptionField & {
  control: Control<MenuFormPayload>;
};

export default function OptionFormField({
  id,
  label,
  description,
  required,
  addOptionGroupButtonLabel,
  control,
}: DynamicOptionField) {
  "use no memo";

  const { fields, append, remove } = useFieldArray({ control, name: id });

  return (
    <Field className="gap-1 py-2">
      <FormLabel id={id} required={required} label={label} />
      <FieldDescription className="whitespace-pre">
        {description}
      </FieldDescription>
      <div className="mt-2 flex flex-col gap-y-2">
        {fields.map((group, index) => (
          <OptionFields
            key={group.id}
            control={control}
            name={`${id}.${index}`}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
      <AddOptionGroupButton onClick={() => append(createEmptyOptionGroup())}>
        <span className="text-muted-foreground font-bold">
          {addOptionGroupButtonLabel}
        </span>
      </AddOptionGroupButton>
    </Field>
  );
}
