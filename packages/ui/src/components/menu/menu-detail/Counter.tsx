import { Button } from "@ssurak/ui/components/buttons/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@ssurak/ui/components/buttons/button-group";
import { cn } from "@ssurak/ui/lib/utils";
import { MinusIcon, PlusIcon } from "lucide-react";
import { ComponentProps } from "react";

type CounterProps = {
  isAvailable?: boolean;
  quantity: number;
  buttonSize?: "icon-sm" | "icon";
  commonClassName?: string;
  onChange: (newQuantity: number) => void;
} & Omit<ComponentProps<"input">, "onChange" | "value" | "type" | "className">;

export default function Counter({
  isAvailable = true,
  quantity,
  buttonSize = "icon",
  commonClassName,
  onChange,
  disabled,
  ...props
}: CounterProps) {
  const min = props.min !== undefined ? Number(props.min) : 1;
  const max = props.max !== undefined ? Number(props.max) : Infinity;
  const isInteractive = isAvailable && !disabled;
  const minDisabled = quantity <= min;
  const maxDisabled = quantity >= max;

  return (
    <>
      <ButtonGroup className="shadow-md rounded-md">
        <Button
          type="button"
          variant={"outline"}
          size={buttonSize}
          disabled={minDisabled || !isInteractive}
          className={cn(
            "border-r disabled:opacity-100 shadow-none",
            {
              "border-r-0": buttonSize === "icon-sm",
            },
            commonClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            onChange(Math.max(min, quantity - 1));
          }}
        >
          <MinusIcon
            className={cn(
              { "opacity-30": minDisabled || !isInteractive },
              { "size-3.5": buttonSize === "icon-sm" }
            )}
          />
        </Button>
        <ButtonGroupText
          className={cn(
            "shadow-none justify-center min-w-10 border-x font-semibold text-base bg-background px-2",
            { "text-muted-foreground": !isInteractive },
            { "px-0 min-w-6 border-x-0 h-8 text-sm": buttonSize === "icon-sm" },
            commonClassName
          )}
        >
          {quantity}
        </ButtonGroupText>
        <Button
          type="button"
          variant={"outline"}
          size={buttonSize}
          className={cn(
            "border-l-0 disabled:opacity-100 shadow-none",
            commonClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            onChange(quantity + 1);
          }}
          disabled={maxDisabled || !isInteractive}
        >
          <PlusIcon
            className={cn(
              { "opacity-30": maxDisabled || !isInteractive },
              { "size-3.5": buttonSize === "icon-sm" }
            )}
          />
        </Button>
      </ButtonGroup>
      <input type="hidden" value={quantity} {...props} />
    </>
  );
}
