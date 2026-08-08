import { useState } from "react";

export default function useAddOption() {
  /** 아직 서버에 없는 새 그룹들. 저장에 성공하면 서버 목록이 대신 그리므로 여기서 빠진다. */
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const discardDraft = (draftId: string) =>
    setDraftIds((prev) => prev.filter((id) => id !== draftId));

  return { draftIds, setDraftIds, discardDraft };
}
