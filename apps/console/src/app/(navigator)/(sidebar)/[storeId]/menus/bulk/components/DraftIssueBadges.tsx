import { Badge } from "@ssurak/ui/components/forms/badge";
import { MenuDraftIssue } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { isBlockingIssue, MENU_DRAFT_ISSUE_LABEL } from "../utils/draft-review";

/**
 * 조치가 필요한 표시는 붉게, 알아만 두면 되는 표시는 앰버로 구분한다 —
 * 붉은 배지가 하나도 없으면 그대로 등록해도 된다는 뜻이 되게 한다.
 */
export default function DraftIssueBadges({
  issues,
}: {
  issues: MenuDraftIssue[];
}) {
  if (issues.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {issues.map((issue) => (
        <Badge
          key={issue}
          variant={isBlockingIssue(issue) ? "destructive" : "highlight"}
        >
          {MENU_DRAFT_ISSUE_LABEL[issue]}
        </Badge>
      ))}
    </div>
  );
}
