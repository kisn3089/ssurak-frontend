"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@ssurak/ui/components/combobox";
import { CATEGORY_NAME_MAX } from "@ssurak/api/schemas/model/category.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@ssurak/ui/lib/utils";
import { Badge } from "@ssurak/ui/components/forms/badge";

export type CategoryOption = { publicId: string; name: string };

type CategoryChoice =
  | { kind: "existing"; categoryId: string; name: string }
  | { kind: "new"; name: string };

export type CategorySelection = {
  categoryId?: string;
  categoryName?: string;
};

type DraftCategoryComboboxProps = {
  categories: CategoryOption[];
  selection: CategorySelection;
  onSelect: (selection: CategorySelection) => void;
  disabled?: boolean;
  invalid?: boolean;
};

function toChoice(
  categories: CategoryOption[],
  { categoryId, categoryName }: CategorySelection
): CategoryChoice | null {
  if (categoryId) {
    const matched = categories.find(
      (category) => category.publicId === categoryId
    );
    return matched
      ? { kind: "existing", categoryId, name: matched.name }
      : null;
  }
  if (categoryName) return { kind: "new", name: categoryName };
  return null;
}

/** 두 갈래(기존 선택·새로 만들기)를 각각 좁혀서 비교한다. */
function isSameChoice(item: CategoryChoice, current: CategoryChoice) {
  if (item.kind === "existing" && current.kind === "existing") {
    return item.categoryId === current.categoryId;
  }
  if (item.kind === "new" && current.kind === "new") {
    return item.name === current.name;
  }
  return false;
}

export default function DraftCategoryCombobox({
  categories,
  selection,
  onSelect,
  disabled = false,
  invalid = false,
}: DraftCategoryComboboxProps) {
  const [query, setQuery] = useState("");

  const value = toChoice(categories, selection);

  const keyword = query.trim();
  const filtered = keyword
    ? categories.filter((category) => category.name.includes(keyword))
    : categories;

  const isExistingName = categories.some(
    (category) => category.name === keyword
  );
  const creatable =
    keyword.length > 0 &&
    keyword.length <= CATEGORY_NAME_MAX &&
    !isExistingName;

  const handleValueChange = (choice: CategoryChoice | null) => {
    if (!choice) return onSelect({});
    onSelect(
      choice.kind === "existing"
        ? { categoryId: choice.categoryId }
        : { categoryName: choice.name }
    );
  };

  return (
    <Combobox<CategoryChoice>
      value={value}
      onValueChange={handleValueChange}
      onInputValueChange={setQuery}
      // 열 때마다 전체 목록을 보여준다. 직전 선택 이름이 필터로 남으면 다른 걸 고르기 어렵다.
      onOpenChange={(open) => open && setQuery("")}
      itemToStringLabel={(choice) => choice.name}
      isItemEqualToValue={isSameChoice}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="카테고리 선택"
        aria-label="카테고리"
        aria-invalid={invalid}
        disabled={disabled}
        onChange={(event) => setQuery(event.currentTarget.value)}
        className={cn("w-full bg-background dark:bg-background", {
          "opacity-50": disabled,
        })}
      />
      <ComboboxContent>
        <ComboboxList>
          {filtered.map((category) => (
            <ComboboxItem
              key={category.publicId}
              value={
                {
                  kind: "existing",
                  categoryId: category.publicId,
                  name: category.name,
                } satisfies CategoryChoice
              }
              className={"font-semibold cursor-pointer py-2"}
            >
              {category.name}
            </ComboboxItem>
          ))}
          {creatable && (
            <ComboboxItem
              className="pr-2 cursor-pointer"
              value={{ kind: "new", name: keyword } satisfies CategoryChoice}
            >
              <Plus className="text-muted-foreground" />
              <span className="text-sm font-semibold">{`"${keyword}"`}</span>
              <Badge variant={"active"} className="ml-auto">
                NEW
              </Badge>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty className="text-xs font-semibold px-4">
          이름을 입력해 새로 만들 수 있습니다.
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
