"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type BulkMenuFormFooterProps = {
  registrableCount: number;
  blockedCount: number;
  isCommitting: boolean;
  onCommit: () => void;
};

export default function BulkMenuFormFooter({
  registrableCount,
  blockedCount,
  isCommitting,
  onCommit,
}: BulkMenuFormFooterProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const searchParams = useSearchParams();
  const hasDraftId = searchParams.get("draftId") !== null;
  const canCommit = registrableCount > 0 && blockedCount === 0;

  const goListClassName = "h-11 rounded-3xl font-semibold col-span-1";

  return (
    <footer className="grid grid-cols-4 md:flex md:justify-end py-4 gap-x-2">
      {hasDraftId &&
        (isCommitting ? (
          <Button variant="outline" disabled className={goListClassName}>
            목록으로
          </Button>
        ) : (
          <Button asChild variant="outline" className={goListClassName}>
            <Link href={`/${storeId}/menus/import`}>목록으로</Link>
          </Button>
        ))}
      <Button
        onClick={onCommit}
        disabled={!canCommit}
        isLoading={isCommitting}
        className={cn("h-11 px-6 rounded-3xl font-bold col-span-3", {
          "col-span-4": !hasDraftId,
        })}
      >
        {`메뉴 ${registrableCount}개 등록`}
      </Button>
    </footer>
  );
}
