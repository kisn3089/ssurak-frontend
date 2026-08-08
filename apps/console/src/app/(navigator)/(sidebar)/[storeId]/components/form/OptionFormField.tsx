"use client";

import { Field, FieldDescription } from "@ssurak/ui/components/forms/field";
import AddOptionGroupButton from "../../menus/add/components/option-field/AddOptionGroupButton";
import FormLabel from "./FormLabel";
import SuccessCheck from "@ssurak/ui/components/SuccessCheck";

type OptionFormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: React.ReactNode;
  isSuccess?: boolean;
  onAddOptionGroup: () => void;
  children: React.ReactNode;
};

export default function OptionFormField({
  id,
  label,
  description,
  required,
  isSuccess,
  onAddOptionGroup,
  children,
}: OptionFormFieldProps) {
  return (
    <Field className="gap-1 py-2">
      <FormLabel id={id} required={required} label={label}>
        {isSuccess && (
          <div className="flex items-center gap-x-2">
            <SuccessCheck size="sm" />
            <span className="font-semibold text-sm text-teal animate-fade-in-up">
              변경되었습니다.
            </span>
          </div>
        )}
      </FormLabel>
      <FieldDescription className="whitespace-pre-line">
        {description}
      </FieldDescription>
      <div className="mt-2 flex flex-col gap-y-2">{children}</div>
      <AddOptionGroupButton onClick={onAddOptionGroup}>
        <span className="text-muted-foreground font-bold">
          + 옵션 그룹 추가
        </span>
      </AddOptionGroupButton>
    </Field>
  );
}
