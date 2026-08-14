"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { Input } from "@ssurak/ui/components/forms/input";
import { cn } from "@ssurak/ui/lib/utils";
import { MenuDraftIssue } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import {
  MENU_DESCRIPTION_MAX,
  MENU_NAME_MAX,
} from "@ssurak/api/schemas/model/menu.schema";
import { memo } from "react";
import {
  Control,
  Controller,
  useWatch,
  UseFormRegister,
  UseFormSetValue,
  UseFieldArrayRemove,
} from "react-hook-form";
import DraftCategoryCombobox, {
  CategoryOption,
  CategorySelection,
} from "./DraftCategoryCombobox";
import DraftIssueBadges from "./DraftIssueBadges";
import {
  deriveItemIssues,
  DraftReviewFormValues,
  isBlockingIssue,
} from "../utils/draft-review";

type DraftItemRowProps = {
  index: number;
  control: Control<DraftReviewFormValues>;
  register: UseFormRegister<DraftReviewFormValues>;
  /** 값 갱신을 행이 직접 한다. 부모가 콜백을 만들어 내리면 입력마다 새 참조가 생겨 `memo`가 깨진다. */
  setValue: UseFormSetValue<DraftReviewFormValues>;
  remove: UseFieldArrayRemove;
  categories: CategoryOption[];
  isDuplicate: boolean;
};

function DraftItemRow({
  index,
  control,
  register,
  setValue,
  remove,
  categories,
  isDuplicate,
}: DraftItemRowProps) {
  const item = useWatch({ control, name: `items.${index}` });
  const { excluded } = item;

  const issues = deriveItemIssues({ item, isDuplicate });
  const invalid = issues.some(isBlockingIssue) && !excluded;

  const invalidPrice =
    issues.includes(MenuDraftIssue.PRICE_MISSING) ||
    issues.includes(MenuDraftIssue.PRICE_OUT_OF_RANGE);
  const missingCategory = issues.includes(MenuDraftIssue.CATEGORY_UNKNOWN);

  const selectCategory = ({ categoryId, categoryName }: CategorySelection) => {
    setValue(`items.${index}.categoryId`, categoryId);
    setValue(`items.${index}.categoryName`, categoryName);
  };

  return (
    <li
      className={cn("rounded-2xl border border-border p-4 transition-all", {
        "border-red-300 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20":
          invalid,
        "border-transparent bg-muted/60 shadow-none scale-90": excluded,
      })}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          {...register(`items.${index}.name`)}
          aria-label="메뉴 이름"
          maxLength={MENU_NAME_MAX}
          disabled={excluded}
          className="h-10 flex-1 basis-48 rounded-xl"
        />

        <div className="w-full sm:w-44">
          <DraftCategoryCombobox
            categories={categories}
            selection={{
              categoryId: item.categoryId,
              categoryName: item.categoryName,
            }}
            onSelect={selectCategory}
            disabled={excluded}
            invalid={missingCategory && !excluded}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Controller
            control={control}
            name={`items.${index}.price`}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                aria-label="가격"
                aria-invalid={invalidPrice && !excluded}
                placeholder="가격 입력"
                disabled={excluded}
                value={field.value ?? ""}
                onChange={(event) => {
                  const digits = event.target.value.replace(/[^0-9]/g, "");
                  // 빈 칸은 0이 아니라 "아직 못 정함"이다. 서버도 null을 그대로 받는다.
                  field.onChange(digits === "" ? null : Number(digits));
                }}
                onBlur={field.onBlur}
                className="h-10 w-28 rounded-xl text-right"
              />
            )}
          />
          <span className="text-sm text-muted-foreground">원</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setValue(`items.${index}.excluded`, !excluded)}
          className="h-10 rounded-lg"
        >
          {excluded ? "되돌리기" : "제외"}
        </Button>
        {excluded && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
            className="h-10 rounded-lg"
          >
            {"삭제"}
          </Button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Controller
          control={control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <input
              aria-label="메뉴 설명"
              placeholder="설명 없음"
              maxLength={MENU_DESCRIPTION_MAX}
              disabled={excluded}
              value={field.value ?? ""}
              onChange={(event) =>
                field.onChange(
                  event.target.value === "" ? null : event.target.value
                )
              }
              onBlur={field.onBlur}
              className="min-w-0 flex-1 basis-48 rounded-md bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
            />
          )}
        />
        <DraftIssueBadges issues={issues} />
      </div>
    </li>
  );
}

/**
 * 앱 코드에서 유일하게 손으로 메모이즈하는 곳이다. React Compiler는 `fields.map(...)` 결과를
 * 통째로 메모이즈하는데, 그 의존성인 `isDuplicate` 배열이 입력마다 새로 만들어져 매번
 * 무효화된다 — 그러면 props가 같아도 엘리먼트 참조가 바뀌어 모든 행이 다시 렌더된다.
 * props 비교로 그 자리에서 끊는다.
 */
export default memo(DraftItemRow);
