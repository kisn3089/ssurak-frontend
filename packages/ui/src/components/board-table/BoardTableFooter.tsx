"use client";

import { CardFooter } from "@ssurak/ui/components/layouts/card";
import ActivityRender from "@ssurak/ui/components/activity-render/ActivityRender";
import { useBoardTableContext } from "./BoardTableContext";
import SessionExpireTime from "../session-timer/SessionExpireTime";

export function BoardTableFooter() {
  const { expiresAt } = useBoardTableContext("BoardTableFooter");

  return (
    <CardFooter className="p-2 min-h-9">
      <ActivityRender value={expiresAt}>
        {(expiresAt) => <SessionExpireTime expiresAt={expiresAt} />}
      </ActivityRender>
    </CardFooter>
  );
}
