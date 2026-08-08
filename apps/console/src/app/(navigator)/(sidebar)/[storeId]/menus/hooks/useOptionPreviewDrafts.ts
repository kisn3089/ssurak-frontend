"use client";

import { DetailOptionGroup } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

/** 편집 중인 옵션 그룹 모음 (formId → 그룹). */
export type OptionPreviewDrafts = Record<string, DetailOptionGroup>;

export type SetOptionPreviewDrafts = Dispatch<
  SetStateAction<OptionPreviewDrafts>
>;

/** 카드가 값을 올려보낼 통로로 setState를 그대로 내린다. */
const ignoreDrafts: SetOptionPreviewDrafts = () => {};

export const OptionPreviewDraftContext =
  createContext<SetOptionPreviewDrafts>(ignoreDrafts);

/** 미리보기가 없는 화면에서는 아무 일도 하지 않는다. */
export function useSetOptionPreviewDrafts(): SetOptionPreviewDrafts {
  return useContext(OptionPreviewDraftContext);
}

export default function useOptionPreviewDrafts() {
  const [drafts, setDrafts] = useState<OptionPreviewDrafts>({});

  return { drafts, setDrafts };
}

/** 카드가 올려보낸 값을 얹는다. 내용이 그대로면 같은 객체를 될돌린다. */
export function withOptionDraft(
  drafts: OptionPreviewDrafts,
  formId: string,
  draft: DetailOptionGroup
): OptionPreviewDrafts {
  const previous = drafts[formId];
  if (previous && JSON.stringify(previous) === JSON.stringify(draft)) {
    return drafts;
  }

  return { ...drafts, [formId]: draft };
}

/** 카드가 사라졌다. 미리보기에서도 뺀다. */
export function withoutOptionDraft(
  drafts: OptionPreviewDrafts,
  formId: string
): OptionPreviewDrafts {
  if (!(formId in drafts)) return drafts;

  const { [formId]: _removed, ...rest } = drafts;
  return rest;
}
