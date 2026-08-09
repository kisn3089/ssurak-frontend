import { ItemDescription } from "@ssurak/ui/components/item";
import { MenuDetail } from "@ssurak/ui/components/menu/menu-detail";
import MenuImage from "./MenuImage";
import { DetailMenu } from "@ssurak/ui/components/menu/menu-detail/menu-detail.type";
import { isSelectable } from "@ssurak/ui/utils/menu/optionSelection";
import { buildImageUrl } from "@utils/buildImageUrl";

function toDefaultSelectionKey(menu: DetailMenu) {
  return menu.options
    .map((option) => {
      const defaultChoiceIds = option.choices
        .filter((choice) => choice.isDefault && isSelectable(choice))
        .map((choice) => choice.publicId)
        .join(",");

      return `${option.publicId}:${defaultChoiceIds}`;
    })
    .join("|");
}

type PreviewMenuProps = { menu: DetailMenu; children?: React.ReactNode };
export default function PreviewMenu({ menu, children }: PreviewMenuProps) {
  return (
    <>
      <header className="pb-4">
        <h3 className="text-lg md:text-xl font-bold">메뉴 미리보기</h3>
        <p className="text-muted-foreground text-sm md:text-base">
          고객에게 노출될 메뉴를 미리 확인하세요.
        </p>
      </header>
      <div className="flex flex-col items-center justify-center">
        <MenuDetail.Provider key={toDefaultSelectionKey(menu)} menu={menu}>
          <main className="bg-accent flex flex-col gap-y-2 max-w-100 min-w-100 @3xl:max-w-100">
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
              <MenuDetail.Options />
            </section>
          </main>
        </MenuDetail.Provider>
      </div>
      {children}
    </>
  );
}
