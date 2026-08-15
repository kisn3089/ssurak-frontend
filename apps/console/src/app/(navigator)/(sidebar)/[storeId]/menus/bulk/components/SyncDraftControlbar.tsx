"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { Pen, RefreshCw, RefreshCwOff, Undo2 } from "lucide-react";
import useDraftAutosave from "../hooks/useDraftAutosave";
import { useParams, useSearchParams } from "next/navigation";
import {
  DraftItemFormValue,
  DraftReviewFormValues,
  toFormValuesFromPayload,
} from "../utils/draft-review";
import { DEFAULT_FORM_VALUES } from "./BulkCreateMenuForm";
import { UseFormReset } from "react-hook-form";
import { useEffect, useRef } from "react";
import Link from "next/link";

type BulkFormControlbarProps = {
  items: DraftItemFormValue[];
  reset: UseFormReset<DraftReviewFormValues>;
  hasServerDraft: boolean;
};

export default function SyncDraftControlbar({
  items,
  reset,
  hasServerDraft,
}: BulkFormControlbarProps) {
  const searchParams = useSearchParams();
  const validatedDraftId = searchParams.get("draftId");
  const draftId = validatedDraftId ? validatedDraftId : undefined;

  const { storeId } = useParams<{ storeId: string }>();

  const { localDraft, clearLocalDraft } = useDraftAutosave({
    storeId,
    draftId,
    items,
  });

  const hasLocalDraft = localDraft.items.length > 0;
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (hasServerDraft || hasRestoredRef.current) return;
    if (localDraft.items.length === 0) return;

    hasRestoredRef.current = true;
    reset(toFormValuesFromPayload(localDraft.items));
  }, [localDraft, reset, hasServerDraft]);

  const clearDraft = () => {
    clearLocalDraft();
    reset(DEFAULT_FORM_VALUES);
  };

  const UNDO_BUTTON_MAP = {
    write: {
      label: "직접 작성하기",
      icon: <Pen />,
      href: `/${storeId}/menus/bulk`,
    },
    restore: {
      label: "돌아가기",
      icon: <Undo2 />,
      href: `/${storeId}/menus/add`,
    },
  };
  const undoButtonType = hasServerDraft ? "write" : "restore";

  return (
    <header className="flex items-center pt-4">
      <Button asChild className="text-xs font-semibold" variant={"outline"}>
        <Link href={UNDO_BUTTON_MAP[undoButtonType].href}>
          {UNDO_BUTTON_MAP[undoButtonType].icon}
          {UNDO_BUTTON_MAP[undoButtonType].label}
        </Link>
      </Button>
      <Button
        type="button"
        onClick={clearDraft}
        variant={"outline"}
        className="text-xs font-semibold ml-auto"
        disabled={(items.length === 0 && !hasLocalDraft) || hasServerDraft}
      >
        {hasServerDraft ? <RefreshCwOff /> : <RefreshCw />}
        {hasServerDraft ? "추출한 메뉴는 초기화 불가" : "초기화"}
      </Button>
    </header>
  );
}
