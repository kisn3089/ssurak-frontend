import { Badge } from "@ssurak/ui/components/forms/badge";
import {
  toSnapshotBadges,
  type SnapshotGroup,
} from "@ssurak/ui/utils/menu/optionSnapshot";

/** 확정된 옵션 스냅샷을 배지로 보여준다 (장바구니·주문 목록). */
export default function OptionTags({
  options,
  variant,
}: {
  options: SnapshotGroup[] | null | undefined;
  variant: "destructive" | "secondary";
}) {
  const badges = toSnapshotBadges(options);
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map(({ key, label }) => (
        <Badge
          key={key}
          variant={variant}
          className="whitespace-pre-wrap text-center tabular-nums"
        >
          {label}
        </Badge>
      ))}
    </div>
  );
}
