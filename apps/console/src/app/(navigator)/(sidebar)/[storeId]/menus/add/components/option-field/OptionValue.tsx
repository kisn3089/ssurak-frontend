"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { Input } from "@ssurak/ui/components/forms/input";
import { XIcon } from "lucide-react";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import {
  MenuFormPayload,
  OptionValueFieldName,
} from "../../../types/menu-form-payload.type";

type OptionValueProps = {
  control: Control<MenuFormPayload>;
  name: OptionValueFieldName;
  index: number;
  isDefault: boolean;
  removable: boolean;
  onSelectDefault: () => void;
  onRemove: () => void;
};

export default function OptionValue({
  control,
  name,
  index,
  isDefault,
  removable,
  onSelectDefault,
  onRemove,
}: OptionValueProps) {
  const { field: keyField, fieldState: keyState } = useController({
    control,
    name: `${name}.key`,
  });
  const { field: priceField, fieldState: priceState } = useController({
    control,
    name: `${name}.price`,
  });

  const errorMessage = keyState.error?.message ?? priceState.error?.message;

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center gap-x-2">
        <Input
          id={`${name}.key-${index}`}
          placeholder={`옵션 ${index + 1}`}
          type="text"
          className="h-10 rounded-xl"
          aria-label={`옵션 값 ${index + 1} 이름`}
          aria-invalid={!!keyState.error}
          {...keyField}
        />
        <div className="text-xs text-muted-foreground">+</div>
        <Input
          id={`${name}.price`}
          placeholder="500"
          type="number"
          inputMode="numeric"
          className="h-10 rounded-xl"
          aria-label={`옵션 값 ${index + 1} 추가 금액`}
          aria-invalid={!!priceState.error}
          {...priceField}
          // 빈 입력을 0이 아니라 null로 넘겨야 칸이 비어 있는 채로 남는다. 제출 시 스키마가 0으로 채운다.
          value={priceField.value ?? ""}
          onChange={(event) =>
            priceField.onChange(
              event.target.value === "" ? null : Number(event.target.value)
            )
          }
        />
        <div className="text-xs text-muted-foreground">원</div>
        <Button
          type="button"
          variant={isDefault ? "default" : "outline"}
          className="shadow-sm"
          aria-pressed={isDefault}
          onClick={onSelectDefault}
        >
          기본값
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shadow-sm"
          aria-label={`옵션 값 ${index + 1} 삭제`}
          disabled={!removable}
          onClick={onRemove}
        >
          <XIcon width={16} height={16} className="text-zinc-400" />
        </Button>
      </div>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
