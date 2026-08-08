"use client";

import { OptionSelectionType } from "@ssurak/api/types/menu/menuOptions.interface";
import { Label } from "@ssurak/ui/components/forms/label";
import {
  Control,
  useController,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import { OptionGroupForm } from "../../../types/option-form.type";
import Counter from "@ssurak/ui/components/menu/menu-detail/Counter";
import OptionSettingTabs from "./OptionSettingTabs";

const selectionTypes = [
  { label: "하나만", value: OptionSelectionType.SINGLE },
  { label: "여러 개", value: OptionSelectionType.MULTIPLE },
];

const requireOptions = [
  { label: "선택", value: "false" },
  { label: "필수", value: "true" },
];

const enabledOptions = [
  { label: "노출", value: "true" },
  { label: "숨김", value: "false" },
];

type OptionSettingsProps = {
  control: Control<OptionGroupForm>;
  setValue: UseFormSetValue<OptionGroupForm>;
  formId: string;
};

export default function OptionSettings({
  control,
  setValue,
  formId,
}: OptionSettingsProps) {
  const { field: selectionTypeField } = useController({
    control,
    name: "selectionType",
  });
  const { field: requiredField } = useController({ control, name: "required" });
  const { field: enabledField } = useController({ control, name: "enabled" });
  const { field: minSelectField, fieldState: minSelectState } = useController({
    control,
    name: "minSelect",
  });
  const { field: maxSelectField, fieldState: maxSelectState } = useController({
    control,
    name: "maxSelect",
  });

  const isMultiple = selectionTypeField.value === OptionSelectionType.MULTIPLE;

  const choices = useWatch({ control, name: "choices" });
  const maxSelectCondition = choices.length;

  // 단일 선택은 최대 개수가 항상 1이다. 값을 남겨 두면 화면과 저장값이 어긋난다.
  const changeSelectionType = (selectionType: string) => {
    const narrowedSelectionType =
      selectionType === OptionSelectionType.SINGLE
        ? OptionSelectionType.SINGLE
        : OptionSelectionType.MULTIPLE;

    selectionTypeField.onChange(narrowedSelectionType);
    if (selectionType === OptionSelectionType.SINGLE) {
      setValue("maxSelect", 1);
    }
  };

  // 필수 여부와 최소 선택 개수는 같은 사실을 두 번 적은 것이라 서버가 일치를 강제한다.
  const changeRequired = (required: string) => {
    requiredField.onChange(required === "true");
    setValue(
      "minSelect",
      required === "true" ? Math.max(minSelectField.value ?? 1, 1) : 0
    );
  };

  return (
    <div className="flex flex-col gap-y-1.5">
      <OptionSettingTabs
        formId={`${formId}-selection-type`}
        tabs={selectionTypes}
        value={selectionTypeField.value ?? OptionSelectionType.SINGLE}
        onValueChange={changeSelectionType}
      >
        선택 방식
      </OptionSettingTabs>

      <OptionSettingTabs
        formId={`${formId}-required`}
        tabs={requireOptions}
        value={String(requiredField.value ?? false)}
        onValueChange={changeRequired}
      >
        필수 선택 여부
      </OptionSettingTabs>

      <OptionSettingTabs
        formId={`${formId}-enabled`}
        tabs={enabledOptions}
        value={String(enabledField.value ?? false)}
        onValueChange={(value) => enabledField.onChange(value === "true")}
      >
        손님에게 노출
      </OptionSettingTabs>

      {isMultiple && (
        <div className="px-2 py-1 flex justify-between">
          <div className="flex gap-2">
            <Label
              className="text-xs font-bold text-muted-foreground"
              htmlFor={`${formId}-min-select`}
            >
              최소 선택 개수
            </Label>
            <Counter
              id={`${formId}-min-select`}
              min={requiredField.value ? 1 : 0}
              max={maxSelectCondition}
              buttonSize={"icon-sm"}
              disabled={!requiredField.value}
              aria-invalid={!!minSelectState.error}
              quantity={minSelectField.value ?? 0}
              onChange={minSelectField.onChange}
            />
            {minSelectState.error?.message && (
              <ErrorMessage errorMessage={minSelectState.error?.message} />
            )}
          </div>
          <div className="flex gap-2">
            <Label
              className="text-xs font-bold text-muted-foreground"
              htmlFor={`${formId}-max-select`}
            >
              최대 선택 개수
            </Label>
            <Counter
              id={`${formId}-max-select`}
              min={1}
              max={maxSelectCondition}
              buttonSize={"icon-sm"}
              disabled={!requiredField.value}
              aria-invalid={!!maxSelectState.error}
              quantity={maxSelectField.value ?? 1}
              onChange={maxSelectField.onChange}
            />
            {maxSelectState.error?.message && (
              <ErrorMessage errorMessage={maxSelectState.error?.message} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
