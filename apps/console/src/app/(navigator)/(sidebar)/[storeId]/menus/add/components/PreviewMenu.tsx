import { ItemDescription } from "@ssurak/ui/components/item";
import { MenuDetail } from "@ssurak/ui/components/menu/menu-detail";
import MenuImage from "./MenuImage";
import { DetailMenu } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import { buildImageUrl } from "@utils/buildImageUrl";

type PreviewMenuProps = { menu: DetailMenu; children?: React.ReactNode };
export default function PreviewMenu({ menu, children }: PreviewMenuProps) {
  return (
    <>
      <MenuDetail.Provider menu={menu}>
        <main className="bg-accent flex flex-col gap-y-2">
          <MenuDetail.Info
            className="bg-background pointer-events-none"
            description={
              <ItemDescription className="text-base line-clamp-none">
                {menu.description}
              </ItemDescription>
            }
          >
            <MenuImage
              src={buildImageUrl(menu.imageKey, "hero")}
              priority={true}
              alt={menu.name}
              size="cover"
              className="rounded-3xl shadow-2xl"
            />
          </MenuDetail.Info>
          <section
            className="bg-background py-4 pb-[81px]"
            aria-label="메뉴 옵션 선택"
          >
            <MenuDetail.RequiredOptions />
            <MenuDetail.CustomOptions />
          </section>
        </main>
      </MenuDetail.Provider>
      {children}
    </>
  );
}
