"use client";

import { Item } from "@ssurak/ui/components/item";
import MenuContent from "./MenuContent";
import { MenuDetailCounter } from "./MenuDetailCounter";

export default function MenuDetailInfo({
  children,
  className,
  description,
}: {
  children?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
}) {
  return (
    <Item
      className={`flex flex-col items-center p-0 rounded-none ${className || ""}`}
    >
      {children}
      <MenuContent description={description}>
        <MenuDetailCounter />
      </MenuContent>
    </Item>
  );
}
