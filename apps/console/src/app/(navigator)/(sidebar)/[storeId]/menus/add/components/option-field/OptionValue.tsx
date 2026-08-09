"use client";

import { OptionChoiceState } from "@ssurak/api/types/menu/menuOptions.interface";
import { Button } from "@ssurak/ui/components/buttons/button";
import { Input } from "@ssurak/ui/components/forms/input";
import { Label } from "@ssurak/ui/components/forms/label";
import { cn } from "@ssurak/ui/lib/utils";
import { PinIcon, XIcon } from "lucide-react";
import { Control, useController } from "react-hook-form";
import ErrorMessage from "../../../../components/form/ErrorMessage";
import {
  OptionGroupForm,
  OptionValueFieldName,
} from "../../../types/option-form.type";
import { isEnumValue } from "../../../utils/enum-value";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@ssurak/ui/components/animate-ui/components/tabs";
import DragReorder from "../../../../components/form/reorder-form-field/DragReorder";
import { DragHandleProps, DragItemProps } from "../../../../hooks/useDragSort";
import Counter from "@ssurak/ui/components/menu/menu-detail/Counter";

const quantityEnabledOptions = [
  { label: "기본", value: false },
  { label: "수량", value: true },
];

const CHOICE_STATE_LABEL: Record<OptionChoiceState, string> = {
  AVAILABLE: "판매중",
  SOLD_OUT: "품절",
  HIDDEN: "숨김",
};

type OptionValueProps = {
  control: Control<OptionGroupForm>;
  name: OptionValueFieldName;
  index: number;
  removable: boolean;
  dragHandleProps: DragHandleProps;
  dragItemProps: DragItemProps;
  isDragging: boolean;
  /** 끌고 있는 행이 들어올 경계. 자리바꿈이 확정된 쪽에 선을 긋는다. */
  dropEdge: "top" | "bottom" | null;
  onSelectDefault: () => void;
  onRemove: () => void;
};

export default function OptionValue({
  control,
  name,
  index,
  removable,
  dragHandleProps,
  dragItemProps,
  isDragging,
  dropEdge,
  onSelectDefault,
  onRemove,
}: OptionValueProps) {
  const { field: nameField, fieldState: nameState } = useController({
    control,
    name: `${name}.name`,
  });
  const { field: priceField, fieldState: priceState } = useController({
    control,
    name: `${name}.priceDelta`,
  });
  const { field: isDefaultField } = useController({
    control,
    name: `${name}.isDefault`,
  });
  const { field: stateField } = useController({
    control,
    name: `${name}.state`,
  });
  const { field: quantityEnabledField } = useController({
    control,
    name: `${name}.quantityEnabled`,
  });
  const { field: maxQuantityField, fieldState: maxQuantityState } =
    useController({ control, name: `${name}.maxQuantity` });

  const isAvailable = stateField.value === OptionChoiceState.AVAILABLE;
  const errorMessage =
    nameState.error?.message ??
    priceState.error?.message ??
    maxQuantityState.error?.message;

  // 수량을 안 쓰는 선택지의 최대 수량은 1이어야 한다 — 서버가 그렇게 강제한다.
  const changeQuantityEnabled = (quantityEnabled: boolean) => {
    quantityEnabledField.onChange(quantityEnabled);
    maxQuantityField.onChange(
      quantityEnabled ? Math.max(maxQuantityField.value ?? 1, 1) : 1
    );
  };

  // 판매 중이 아닌 선택지는 기본 선택으로 둘 수 없다. 고객 화면이 고를 수 없는 값으로 열린다.
  const changeState = (state: OptionChoiceState) => {
    stateField.onChange(state);
    if (state !== OptionChoiceState.AVAILABLE) isDefaultField.onChange(false);
  };

  // Radix는 선택 값을 string으로 넘긴다. 도메인 타입은 이 경계에서만 확인한다.
  const selectState = (value: string) => {
    if (isEnumValue(OptionChoiceState, value)) changeState(value);
  };

  return (
    <div
      className={cn("flex flex-col gap-y-1", {
        "shadow-lg": isDragging,
        "shadow-[inset_0_-2px_0_0_var(--color-primary)]": dropEdge === "bottom",
        "shadow-[inset_0_2px_0_0_var(--color-primary)]": dropEdge === "top",
      })}
      {...dragItemProps}
    >
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pr-2">
        <div className="flex flex-1 items-center gap-x-1.5 min-w-[370px]">
          <DragReorder
            dragHandleProps={dragHandleProps}
            aria-label={`옵션 값 ${index + 1} 순서 변경`}
            className="mr-0"
          />
          <Input
            id={`${name}.name`}
            placeholder={`옵션 ${index + 1}`}
            type="text"
            className="h-10 rounded-xl col-span-2"
            aria-label={`옵션 값 ${index + 1} 이름`}
            aria-invalid={!!nameState.error}
            {...nameField}
          />
          <Input
            id={`${name}.priceDelta`}
            placeholder="500"
            type="number"
            inputMode="numeric"
            className="h-10 rounded-xl w-28 min-w-20 text-right"
            aria-label={`옵션 값 ${index + 1} 추가 금액`}
            aria-invalid={!!priceState.error}
            {...priceField}
            // 빈 입력을 0이 아니라 null로 넘겨야 칸이 비어 있는 채로 남는다. 제출 시 0으로 채운다.
            value={priceField.value ?? ""}
            onChange={(event) =>
              priceField.onChange(
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
          />
          <div className="text-xs text-muted-foreground">원</div>
          <Tabs
            id={`${name}.state`}
            value={stateField.value ?? OptionChoiceState.AVAILABLE}
            onValueChange={selectState}
          >
            <TabsList className="h-10">
              {Object.values(OptionChoiceState).map((state) => (
                <TabsTrigger
                  key={state}
                  value={state}
                  className="text-[13px] h-8"
                >
                  {CHOICE_STATE_LABEL[state]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex shrink-0 items-center gap-x-1.5 ml-auto">
          <Tabs
            id={`${name}.quantityEnabled`}
            value={(quantityEnabledField.value ?? false).toString()}
            onValueChange={(value) => changeQuantityEnabled(value === "true")}
          >
            <TabsList className="h-10">
              {quantityEnabledOptions.map((option) => (
                <TabsTrigger
                  key={option.value.toString()}
                  value={option.value.toString()}
                  className="text-[13px] h-8"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className={"flex gap-x-1"}>
            <Label
              className={cn("text-xs font-bold text-muted-foreground", {
                "opacity-30": !quantityEnabledField.value,
              })}
              htmlFor={`${name}.maxQuantity`}
            >
              최대 수량
            </Label>
            <Counter
              id={`${name}.maxQuantity`}
              quantity={maxQuantityField.value ?? 1}
              min={1}
              buttonSize="icon-sm"
              onChange={maxQuantityField.onChange}
              isAvailable={quantityEnabledField.value}
            />
          </div>
          <Button
            type="button"
            variant={isDefaultField.value ? "default" : "outline"}
            className="shadow-sm"
            size={"icon-sm"}
            aria-label="기본값"
            aria-pressed={isDefaultField.value}
            disabled={!isAvailable}
            onClick={onSelectDefault}
          >
            <PinIcon width={16} height={16} />
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
      </div>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
