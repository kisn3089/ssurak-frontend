interface MenuOptionTrigger {
  group: string;
  in: string[];
}

interface TriggerableOptionInfo {
  defaultKey: string;
  trigger?: MenuOptionTrigger[];
}

function matchesTrigger(
  trigger: MenuOptionTrigger,
  selectedOptions: Map<string, string>
): boolean {
  return trigger.in.includes(selectedOptions.get(trigger.group) ?? "");
}

export function isTrigger(
  optionInfo: TriggerableOptionInfo,
  selectedOptions: Map<string, string>
): boolean {
  const { trigger } = optionInfo;

  if (!trigger?.length) {
    return true;
  }

  return trigger.every((t) => matchesTrigger(t, selectedOptions));
}

export function deleteNoneTriggeredOptions(
  options: { optionInfo: TriggerableOptionInfo; key: string }[],
  target: Map<string, string>,
  compareWith: Map<string, string>
): Map<string, string> {
  const selectedOptionsMap = new Map(target);

  options.forEach(({ optionInfo, key }) => {
    if (!isTrigger(optionInfo, compareWith)) {
      selectedOptionsMap.delete(key);
    }
  });

  return selectedOptionsMap;
}
