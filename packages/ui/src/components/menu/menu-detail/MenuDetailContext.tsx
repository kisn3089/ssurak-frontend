"use client";

import { createContext, useContext } from "react";
import {
  DetailMenu,
  MenuOptionEntry,
  SnapshotToFetch,
  SelectedOptions,
  SelectOption,
} from "./menu-detail.type";

export interface MenuDetailState {
  menu: DetailMenu;
  quantity: number;
  selectedOptions: SelectedOptions;
}

export interface MenuDetailActions {
  setQuantity: (next: number) => void;
  selectRequiredOption: SelectOption;
  selectCustomOption: SelectOption;
  snapshotToFetch: SnapshotToFetch;
}

export interface MenuDetailMeta {
  requiredOptions: MenuOptionEntry[];
  customOptions: MenuOptionEntry[];
  allSelectedOptions: Map<string, string>;
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
