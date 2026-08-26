import { Item, ItemTitle } from "@ssurak/ui/components/item";
import { Badge } from "@ssurak/ui/components/forms/badge";
import {
  isSelectable,
  selectedQuantity,
} from "@ssurak/ui/utils/menu/optionSelection";
import type { DetailOptionGroup } from "../menu-detail/menu-detail.type";
import { cn } from "@ssurak/ui/lib/utils";
import { buttonVariants } from "../../buttons/button";
import ChoiceHint from "./ChoiceHint";
import { useMenuDetailContext } from "../menu-detail/MenuDetailContext";
import Counter from "../menu-detail/Counter";

type OptionItemProps = {
  option: DetailOptionGroup;
  visible: boolean;
};

export default function OptionItem({ option, visible }: OptionItemProps) {
  const {
    state: { selections },
    actions: { toggleChoice, changeChoiceQuantity },
  } = useMenuDetailContext();
  const pickedCount = selections.get(option.publicId)?.size ?? 0;
  const reachedMax =
    option.selectionType === "MULTIPLE" && pickedCount >= option.maxSelect;

  return (
    <Item className="flex-nowrap flex-col py-1 px-2 gap-1 items-start">
      <div className="flex items-center gap-x-2">
        <ItemTitle className="font-bold text-sm whitespace-pre">
          {option.name}
        </ItemTitle>
        <Badge variant={option.required ? "destructive" : "secondary"}>
          {option.required ? "필수" : "선택"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {selectionHint(option)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1 w-full">
        {option.choices.map((choice) => {
          const quantity = selectedQuantity(
            selections,
            option.publicId,
            choice.publicId
          );
          const selected = quantity > 0;
          const soldOut = !isSelectable(choice);
          // 이미 고른 항목은 해제할 수 있어야 하므로 한도 초과여도 막지 않는다.
          const disabled = !visible || soldOut || (reachedMax && !selected);

          return (
            <div
              role="button"
              key={choice.publicId}
              data-disabled={disabled}
              aria-pressed={selected}
              onClick={() => toggleChoice(option.publicId, choice.publicId)}
              className={cn(
                buttonVariants({ variant: selected ? "default" : "outline" }),
                "flex flex-col min-h-14 h-fit min-w-24 gap-2 px-5 py-2 font-semibold border rounded-2xl",
                "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
              )}
            >
              <span>{choice.name}</span>
              {choice.quantityEnabled && selected ? (
                <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                  <Counter
                    quantity={quantity}
                    onChange={(next) =>
                      changeChoiceQuantity(
                        option.publicId,
                        choice.publicId,
                        next
                      )
                    }
                    min={0}
                    max={choice.maxQuantity}
                    commonClassName="border-accent/30 bg-background-foreground dark:bg-background-foreground"
                    buttonSize="icon-sm"
                  />
                </div>
              ) : (
                <ChoiceHint choice={choice} soldOut={soldOut} />
              )}
            </div>
          );
        })}
      </div>
    </Item>
  );
}

/** 몇 개를 골라야 하는지 미리 알려준다 — 담기 버튼이 왜 막혀 있는지 찾게 만들지 않는다. */
function selectionHint(option: DetailOptionGroup): string {
  if (option.selectionType === "SINGLE") return "1개 선택";
  if (option.minSelect === option.maxSelect) {
    return `${option.maxSelect}개 선택`;
  }
  if (option.minSelect === 0) return `최대 ${option.maxSelect}개`;

  return `${option.minSelect}~${option.maxSelect}개 선택`;
}
