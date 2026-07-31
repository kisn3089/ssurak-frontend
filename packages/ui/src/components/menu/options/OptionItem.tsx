import ActivityRender from "@ssurak/ui/components/activity-render/ActivityRender";
import { Item, ItemTitle } from "@ssurak/ui/components/item";
import { isTrigger } from "@ssurak/ui/utils/menu/optionTrigger";
import type { MenuOptionEntry } from "../menu-detail/menu-detail.type";
import { Button } from "../../buttons/button";

type OptionItemProps = {
  option: MenuOptionEntry;
  selectedOptions: Map<string, string>;
  changeOption: (optionGroupKey: string, optionKey: string) => void;
};
export default function OptionItem({
  option,
  selectedOptions,
  changeOption,
}: OptionItemProps) {
  const { key, optionInfo } = option;

  const isTriggered = isTrigger(optionInfo, selectedOptions);

  return (
    <Item className="flex-nowrap flex-col py-1 px-2 gap-1 items-start">
      <ItemTitle className="font-bold text-sm whitespace-pre">{key}</ItemTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-1 w-full">
        {optionInfo.options.map((opt, index) => {
          const selected = selectedOptions.get(key) === opt.key;

          return (
            <Button
              key={`${opt.key}-${index}`}
              type="button"
              variant={selected ? "default" : "outline"}
              className={`h-14 min-w-fit font-semibold border rounded-2xl`}
              onClick={() => changeOption(key, opt.key)}
              disabled={!isTriggered}
            >
              <div className="flex flex-col">
                <span>{opt.key}</span>
                <ActivityRender value={opt.price > 0 ? opt.price : undefined}>
                  {(price) => (
                    <span>{`+${price.toLocaleString("ko-KR")}원`}</span>
                  )}
                </ActivityRender>
              </div>
            </Button>
          );
        })}
      </div>
    </Item>
  );
}
