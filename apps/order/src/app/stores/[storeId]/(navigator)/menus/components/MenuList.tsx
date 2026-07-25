import MenuCard from "@/app/stores/[storeId]/(navigator)/menus/components/MenuCard";
import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { cn } from "@ssurak/ui/lib/utils";

export default function MenuList({
  menus,
  priority = false,
}: {
  menus: Menu[];
  priority: boolean;
}) {
  return (
    <>
      {menus.map((menu) => (
        <div
          key={menu.publicId}
          className={cn(
            `rounded-md hover:bg-accent transition-all duration-200`,
            "active:not-aria-[haspopup]:scale-98 active:not-aria-[haspopup]:bg-accent hover:scale-98 hover:bg-accent",
            !menu.isAvailable && "opacity-50"
          )}
        >
          <MenuCard menu={menu} priority={priority} />
        </div>
      ))}
    </>
  );
}
