"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { RotateCcw } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

type FailedGetTableViewProps = {
  title: string;
} & FallbackProps;
export default function FailedGetTableView({
  title,
  resetErrorBoundary,
}: FailedGetTableViewProps) {
  return (
    <div className="pt-3">
      <div className="p-6 pb-8 bg-background rounded-lg border border-border flex flex-col gap-2 items-center justify-between">
        <p className="font-semibold p-6">{title}</p>
        <Button
          type="button"
          className="rounded-3xl font-semibold"
          onClick={resetErrorBoundary}
        >
          <RotateCcw />
          재시도
        </Button>
      </div>
    </div>
  );
}
