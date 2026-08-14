"use client";

import { formatDate } from "@ssurak/ui/utils/date-format";

export default function DraftCreatedAt({ createdAt }: { createdAt: string }) {
  return (
    <p className="text-xs text-muted-foreground text-right">
      {`생성일 ${formatDate(createdAt, {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`}
    </p>
  );
}
