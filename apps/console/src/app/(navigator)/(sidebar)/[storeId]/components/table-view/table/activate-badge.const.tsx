import { Badge } from "@ssurak/ui/components/forms/badge";

export const activatePrefix = (isActive: boolean) => (isActive ? "비" : "");

export const activeBadge = ([activeText, inactiveText]: [string, string]) => {
  return {
    active: (
      <Badge variant={"active"} className="text-xs">
        {activeText}
      </Badge>
    ),
    inactive: (
      <Badge variant={"inactive"} className="text-xs">
        {inactiveText}
      </Badge>
    ),
  };
};
