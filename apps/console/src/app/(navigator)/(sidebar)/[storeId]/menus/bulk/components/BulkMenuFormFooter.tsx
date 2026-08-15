"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  const canCommit = registrableCount > 0 && blockedCount === 0;

  return (
    <footer className="grid grid-cols-4 md:flex md:justify-end py-4 gap-x-2">
      <Link href={`/${storeId}/menus/import`}>
        <Button
          variant={"outline"}
          isLoading={isCommitting}
          className="h-11 rounded-3xl font-semibold"
        >
          목록으로
        </Button>
      </Link>
      <Button
        onClick={onCommit}
        disabled={!canCommit}
        isLoading={isCommitting}
        className="h-11 px-6 rounded-3xl font-bold col-span-3"
      >
        {`메뉴 ${registrableCount}개 등록`}
      </Button>
    </footer>
  );
}
