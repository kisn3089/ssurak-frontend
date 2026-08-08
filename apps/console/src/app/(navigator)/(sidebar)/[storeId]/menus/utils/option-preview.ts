import { CreateMenuOptionPayload } from "@ssurak/api/schemas/model/menuOption.schema";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import {
  DetailOptionGroup,
  DetailOptionChoice,
} from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import { OptionGroupForm } from "../types/option-form.type";

/**
 * 편집 중인 폼 값 → 미리보기 옵션 그룹.
 *
 * 저장 전에도 손님 화면 그대로 보여줘야 하므로, 아직 비어 있는 숫자 칸은 제출 때와 같은
 * 기본값으로 채운다(`toOptionPayload`와 같은 규칙).
 */
export function toPreviewOptionGroup(
  formId: string,
  form: OptionGroupForm,
  savedOption?: MenuOptionGroup
): DetailOptionGroup {
  return {
    // 저장된 그룹은 조건(trigger)이 이 id를 가리키므로 반드시 publicId를 유지한다.
    publicId: savedOption?.publicId ?? formId,
    name: form.name,
    selectionType: form.selectionType,
    required: form.required,
    minSelect: form.minSelect ?? 0,
    maxSelect: form.maxSelect ?? 1,
    enabled: form.enabled,
    trigger: form.trigger.length > 0 ? form.trigger : null,
    choices: form.choices
      .map(toPreviewChoice(formId))
      // 이름 없는 행은 아직 입력 중이다. 미리보기에 빈 선택지로 세우지 않는다.
      .filter((choice) => choice.name !== ""),
  };
}

function toPreviewChoice(formId: string) {
  return (
    choice: OptionGroupForm["choices"][number],
    index: number
  ): DetailOptionChoice => ({
    // 저장 전 행은 id가 없다. 선택 상태를 행마다 구분할 수 있으면 되므로 폼 위치로 만든다.
    publicId: choice.publicId ?? `${formId}-choice-${index}`,
    name: choice.name.trim(),
    priceDelta: choice.priceDelta ?? 0,
    quantityEnabled: choice.quantityEnabled,
    maxQuantity: choice.maxQuantity ?? 1,
    isDefault: choice.isDefault,
    state: choice.state,
  });
}

/**
 * 미리보기에 넣을 옵션 목록.
 *
 * 저장된 그룹은 편집 중인 값이 있으면 그것으로 덮고, 아직 저장되지 않은 초안은 카드가
 * 놓인 순서대로 뒤에 붙인다. 이름도 선택지도 비어 있는 초안은 아직 보여줄 게 없어 뺀다.
 */
export function mergePreviewOptions(
  savedOptions: MenuOptionGroup[],
  draftIds: string[],
  drafts: Record<string, DetailOptionGroup>
): DetailOptionGroup[] {
  const savedGroups = savedOptions.map(
    (option) => drafts[option.publicId] ?? option
  );

  const draftGroups = draftIds
    .map((draftId) => drafts[draftId])
    .filter((group) => group !== undefined)
    .filter(hasPreviewContent);

  return [...savedGroups, ...draftGroups];
}

/** 이름도 선택지도 없는 초안. 카드만 열어 두고 손대지 않은 상태다. */
export function hasPreviewContent(group: DetailOptionGroup): boolean {
  return group.name.trim() !== "" || group.choices.length > 0;
}

/**
 * 미리보기 그룹 → 옵션 생성 페이로드.
 *
 * 메뉴 생성 화면의 카드에는 저장 버튼이 없다 — 메뉴와 함께 제출되므로, 제출 시점의 값을
 * 미리보기 초안에서 그대로 가져온다. `toPreviewOptionGroup`이 빈 칸을 제출과 같은 기본값으로
 * 이미 채워 두기 때문에 여기서는 화면에 없는 값(publicId)만 걷어내면 된다.
 */
export function toCreateOptionPayload(
  group: DetailOptionGroup
): CreateMenuOptionPayload {
  return {
    name: group.name.trim(),
    selectionType: group.selectionType,
    required: group.required,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    enabled: group.enabled,
    trigger: group.trigger,
    choices: group.choices.map(({ publicId: _publicId, ...choice }) => choice),
  };
}
