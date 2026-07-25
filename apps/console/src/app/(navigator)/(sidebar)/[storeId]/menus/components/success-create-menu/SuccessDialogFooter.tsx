"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import {
  DialogClose,
  DialogFooter,
} from "@ssurak/ui/components/layouts/dialog";
import { cn } from "@ssurak/ui/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const commonButtonClassName =
  "w-36 py-5.5 rounded-xl font-semibold animate-tzRiseFast";
export default function SuccessDialogFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storeId } = useParams<{ storeId: string }>();
  return (
    <DialogFooter className="flex gap-2">
      <DialogClose asChild>
        <Button
          variant={"outline"}
          style={{ animationDelay: "0.24s" }}
          className={cn(commonButtonClassName, "shadow-none")}
        >
          {children}
        </Button>
      </DialogClose>
      <Button
        asChild
        className={commonButtonClassName}
        style={{ animationDelay: "0.28s" }}
      >
        <Link href={`/${storeId}/menus`}>메뉴 목록으로</Link>
      </Button>
    </DialogFooter>
  );
}
