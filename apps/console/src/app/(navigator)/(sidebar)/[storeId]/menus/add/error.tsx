"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FailedGetCategoryList({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { storeId } = useParams<{ storeId: string }>();

  return (
    <div className="p-8 max-w-3xl mx-auto flex items-center flex-col gap-4">
      <div className="w-full flex p-8 items-center flex-col border border-border rounded-lg bg-background gap-y-4">
        <h1 className="font-bold text-lg">
          카테고리 목록을 불러오지 못했습니다.
        </h1>
        <Button className="rounded-3xl" onClick={reset}>
          <RotateCcw />
          재시도
        </Button>
      </div>
      <div className="flex justify-end w-full">
        <Button
          asChild
          variant={"outline"}
          className="rounded-3xl font-semibold"
        >
          <Link href={`/${storeId}/menus`}>목록으로</Link>
        </Button>
      </div>
    </div>
  );
}
