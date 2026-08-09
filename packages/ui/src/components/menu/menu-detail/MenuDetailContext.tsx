"use client";

import { createContext, useContext } from "react";
import type { SnapshotGroup } from "@ssurak/ui/utils/menu/optionSnapshot";
import {
  ChangeChoiceQuantity,
  DetailMenu,
  DetailOptionGroup,
  OptionSelections,
  SnapshotToFetch,
  ToggleChoice,
} from "./menu-detail.type";

export interface MenuDetailState {
  menu: DetailMenu;
  quantity: number;
  selections: OptionSelections;
}

export interface MenuDetailActions {
  setQuantity: (next: number) => void;
  toggleChoice: ToggleChoice;
  changeChoiceQuantity: ChangeChoiceQuantity;
  snapshotToFetch: SnapshotToFetch;
}

export interface MenuDetailMeta {
  /** 메뉴에 걸린 옵션 전체(표시 순서). 조건 미충족 옵션도 들어 있다. */
  options: DetailOptionGroup[];
  /** 지금 고를 수 있는 옵션의 publicId. 조건부 노출 평가 결과다. */
  visibleOptionIds: Set<string>;
  /** 아직 채우지 못한 필수 옵션. 비어 있어야 담기 버튼이 열린다. */
  unsatisfiedOptions: DetailOptionGroup[];
  /** 지금 고른 옵션을 이름·금액까지 담아 표시용으로 만든 것. 주문 스냅샷과 같은 모양이다. */
  selectedSnapshot: SnapshotGroup[];
  price: number;
}

export interface MenuDetailContextValue {
  state: MenuDetailState;
  actions: MenuDetailActions;
  meta: MenuDetailMeta;
}

export const MenuDetailContext = createContext<MenuDetailContextValue | null>(
  null
);

export function useMenuDetailContext() {
  const context = useContext(MenuDetailContext);
  if (!context) {
    throw new Error(
      "useMenuDetailContext must be used within a MenuDetailProvider"
    );
  }
  return context;
}
