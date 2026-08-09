"use client";

import Counter from "./Counter";
import { useMenuDetailContext } from "./MenuDetailContext";

export function MenuDetailCounter() {
  const {
    state: { menu, quantity },
    actions: { setQuantity },
  } = useMenuDetailContext();

  return (
    <Counter
      isAvailable={menu.isAvailable}
      quantity={quantity}
      onChange={setQuantity}
    />
  );
}
