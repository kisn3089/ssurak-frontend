import {
  DetailMenu,
  MenuOptionEntry,
} from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";

export function toOptionEntries<MenuLike extends DetailMenu>(
  options: MenuLike["requiredOptions"] | MenuLike["customOptions"]
): MenuOptionEntry[] {
  if (!options) return [];
  return Object.entries(options).map(([key, value]) => ({
    key,
    optionInfo: value,
  }));
}

export function toDefaultSelection(
  entries: MenuOptionEntry[]
): Map<string, string> {
  return new Map(
    entries.map(({ key, optionInfo }) => [key, optionInfo.defaultKey])
  );
}

type TotalPriceParams = {
  quantity: number;
  menuPrice: number;
  allOptions: MenuOptionEntry[];
  allSelectedOptions: Map<string, string>;
};
export function totalPrice({
  quantity,
  menuPrice,
  allOptions,
  allSelectedOptions,
}: TotalPriceParams) {
  return (
    quantity *
    (menuPrice +
      allOptions.reduce((acc, option) => {
        const selectedKey = allSelectedOptions.get(option.key);
        const selectedOption = option.optionInfo.options.find(
          (opt) => opt.key === selectedKey
        );
        return acc + (selectedOption ? selectedOption.price : 0);
      }, 0))
  );
}
