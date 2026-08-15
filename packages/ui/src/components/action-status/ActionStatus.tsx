"use client";

import { Check, CircleAlert, Loader2 } from "lucide-react";
import { useActionStatus } from "./ActionStatusContext";
import { cn } from "@ssurak/ui/lib/utils";

export default function ActionStatus() {
  const { actionStatus, statusMetaText } = useActionStatus();

  if (actionStatus === "idle") return null;

  return (
    <div className="flex items-center gap-x-1.5">
      {actionStatus === "loading" && (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      )}
      {actionStatus === "success" && (
        <Check className="size-4 text-muted-foreground" />
      )}
      {actionStatus === "error" && (
        <CircleAlert className="size-4 text-destructive" />
      )}
      {statusMetaText && (
        <span
          className={cn(
            "text-xs font-semibold",
            actionStatus === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {statusMetaText[actionStatus]}
        </span>
      )}
    </div>
  );
}
