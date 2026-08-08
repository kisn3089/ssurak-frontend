import type {
  DetailOptionGroup,
  OptionSelections,
} from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";

/**
 * 조건부 노출(trigger) 평가.
 *
 * 순환 참조는 서버가 쓰기 시점에 막지만, 낡은 데이터가 내려와도 무한 재귀에 빠지지 않도록
 * 방문 중인 옵션을 다시 만나면 "조건 미충족"으로 끊는다.
 */
export function visibleOptionIds(
  options: DetailOptionGroup[],
  selections: OptionSelections
): Set<string> {
  const optionById = new Map(
    options.map((option) => [option.publicId, option])
  );
  const resolved = new Map<string, boolean>();
  const visiting = new Set<string>();

  const isVisible = (option: DetailOptionGroup): boolean => {
    const cached = resolved.get(option.publicId);
    if (cached !== undefined) return cached;

    visiting.add(option.publicId);
    const visible = option.enabled && isTriggerSatisfied(option);
    visiting.delete(option.publicId);

    resolved.set(option.publicId, visible);
    return visible;
  };

  const isTriggerSatisfied = (option: DetailOptionGroup): boolean => {
    if (!option.trigger?.length) return true;

    return option.trigger.every((rule) => {
      // 순환이거나 참조 대상이 사라졌으면 조건을 만족했다고 볼 근거가 없다.
      if (visiting.has(rule.optionId)) return false;

      const referenced = optionById.get(rule.optionId);
      if (!referenced || !isVisible(referenced)) return false;

      const picked = selections.get(rule.optionId);
      if (!picked) return false;

      return rule.choiceIds.some((choiceId) => picked.has(choiceId));
    });
  };

  return new Set(options.filter(isVisible).map((option) => option.publicId));
}

/** 노출되지 않게 된 옵션의 선택을 털어낸다 — 그대로 보내면 서버가 400으로 거절한다. */
export function dropHiddenSelections(
  selections: OptionSelections,
  visibleIds: Set<string>
): OptionSelections {
  const next: OptionSelections = new Map();

  selections.forEach((choices, optionId) => {
    if (visibleIds.has(optionId)) next.set(optionId, choices);
  });

  return next;
}
