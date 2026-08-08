import type { DetailOptionGroup } from "../menu-detail/menu-detail.type";
import OptionItem from "./OptionItem";

type OptionsProps = {
  options: DetailOptionGroup[];
  visibleOptionIds: Set<string>;
};

export default function Options({ options, visibleOptionIds }: OptionsProps) {
  return (
    <>
      {options.map((option) => (
        <OptionItem
          key={option.publicId}
          option={option}
          visible={visibleOptionIds.has(option.publicId)}
        />
      ))}
    </>
  );
}
