"use client";

import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CreateOrderPayload } from "@ssurak/api/schemas/model/order.schema";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { generateFingerprint } from "@utils/fingerprint";
import { useParams } from "next/navigation";
import { createContext, useContext, useState } from "react";

type CreateOrderProviderProps = {
  children: React.ReactNode;
};
export type SnapshotMenu = CreateOrderPayload["orderItems"][number] &
  Pick<Menu, "price"> & { menuName: string };
type MenuLike = Pick<
  Menu,
  | "publicId"
  | "name"
  | "price"
  | "customOptions"
  | "requiredOptions"
  | "description"
  | "isAvailable"
> &
  Partial<Pick<SnapshotMenu, "quantity">>;

/** 표시·전송용 스냅샷과 편집 복원용 메뉴 정의를 한 값에 보관 */
export type AddedMenuEntry = { snapshot: SnapshotMenu; menu: MenuLike };
type AddedMenu = Map<string, AddedMenuEntry>;

export function CreateOrderProvider({ children }: CreateOrderProviderProps) {
  const { storeId } = useParams<{
    storeId: string;
    tableId: string;
  }>();
  const { data: categories } = useSuspenseWithAuth<CategoryWithMenusResponse[]>(
    `/stores/v1/${storeId}/menus`
  );
  const [selectedMenu, setSelectedMenu] = useState<MenuLike | null>(null);
  const [editingMenu, setEditingMenu] = useState<SnapshotMenu | null>(null);

  const [addedMenus, setAddedMenus] = useState<AddedMenu>(new Map());

  const selectMenu = (menu: MenuLike) => {
    setEditingMenu(null);
    if (selectedMenu?.publicId === menu.publicId) {
      selectMenuClear();
    } else {
      setSelectedMenu(menu);
    }
  };

  const editMenu = (menu: MenuLike, item: SnapshotMenu) => {
    setSelectedMenu(menu);
    setEditingMenu(item);
  };

  const selectMenuClear = () => {
    setSelectedMenu(null);
    setEditingMenu(null);
  };
  const clearAddedMenus = () => setAddedMenus(new Map());

  const deleteMenu = (menu: SnapshotMenu) => {
    const fingerprint = generateFingerprint([
      menu.menuPublicId,
      menu.requiredOptions,
      menu.customOptions,
    ]);

    setAddedMenus((prev) => {
      const updatedMenus = new Map(prev);
      updatedMenus.delete(fingerprint);
      return updatedMenus;
    });
  };

  const addMenu = (menuSnapshot: SnapshotMenu, menu: MenuLike) => {
    const fingerprint = generateFingerprint([
      menuSnapshot.menuPublicId,
      menuSnapshot.requiredOptions,
      menuSnapshot.customOptions,
    ]);

    setAddedMenus((prev) => {
      const next = new Map(prev);
      const existing = next.get(fingerprint);
      next.set(
        fingerprint,
        existing
          ? { menu, snapshot: mergeQuantity(existing.snapshot, menuSnapshot) }
          : { menu, snapshot: menuSnapshot }
      );
      return next;
    });
  };

  const mergeQuantity = (
    existing: SnapshotMenu,
    incoming: SnapshotMenu
  ): SnapshotMenu => ({
    ...existing,
    quantity: existing.quantity + incoming.quantity,
    price: existing.price + incoming.price,
  });

  const updateMenu = (
    menuSnapshot: SnapshotMenu,
    menu: MenuLike,
    originalItem: SnapshotMenu
  ) => {
    const originalFingerprint = generateFingerprint([
      originalItem.menuPublicId,
      originalItem.requiredOptions,
      originalItem.customOptions,
    ]);
    const nextFingerprint = generateFingerprint([
      menuSnapshot.menuPublicId,
      menuSnapshot.requiredOptions,
      menuSnapshot.customOptions,
    ]);

    setAddedMenus((prev) => {
      const next = new Map(prev);
      next.delete(originalFingerprint);

      const existing = next.get(nextFingerprint);
      next.set(
        nextFingerprint,
        existing
          ? { menu, snapshot: mergeQuantity(existing.snapshot, menuSnapshot) }
          : { menu, snapshot: menuSnapshot }
      );
      return next;
    });
  };

  const totalPrice: number = Array.from(addedMenus.values()).reduce(
    (acc, { snapshot }) => snapshot.price + acc,
    0
  );

  const contextValue = {
    state: { selectedMenu, editingMenu, categories, addedMenus },
    meta: { totalPrice },
    actions: {
      selectMenu,
      editMenu,
      selectMenuClear,
      addMenu,
      updateMenu,
      clearAddedMenus,
      deleteMenu,
    },
  };

  return (
    <CreateOrderContext.Provider value={contextValue}>
      <div className="flex h-full overflow-y-scroll scrollbar-hide py-1">
        {children}
      </div>
    </CreateOrderContext.Provider>
  );
}

interface CreateOrderState {
  selectedMenu: MenuLike | null;
  editingMenu: SnapshotMenu | null;
  categories: CategoryWithMenusResponse[];
  addedMenus: Map<string, AddedMenuEntry>;
}

interface CreateOrderActions {
  selectMenu: (menu: MenuLike) => void;
  editMenu: (menu: MenuLike, item: SnapshotMenu) => void;
  selectMenuClear: () => void;
  addMenu: (menuSnapshot: SnapshotMenu, menu: MenuLike) => void;
  updateMenu: (
    menuSnapshot: SnapshotMenu,
    menu: MenuLike,
    originalItem: SnapshotMenu
  ) => void;
  deleteMenu: (menu: SnapshotMenu) => void;
  clearAddedMenus: () => void;
}

interface CreateOrderMeta {
  totalPrice: number;
}

interface CreateOrderContextValue {
  state: CreateOrderState;
  meta: CreateOrderMeta;
  actions: CreateOrderActions;
}

const CreateOrderContext = createContext<CreateOrderContextValue | null>(null);

export function useCreateOrderContext() {
  const context = useContext(CreateOrderContext);
  if (!context) {
    throw new Error(
      "useCreateOrderContext must be used within a CreateOrderProvider"
    );
  }
  return context;
}
