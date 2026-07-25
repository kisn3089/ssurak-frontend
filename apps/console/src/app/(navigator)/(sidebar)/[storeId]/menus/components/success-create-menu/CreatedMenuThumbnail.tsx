import {
  Item,
  ItemContent,
  ItemFooter,
  ItemTitle,
} from "@ssurak/ui/components/item";
import MenuImage from "../../add/components/MenuImage";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { buildImageUrl } from "@utils/buildImageUrl";
import { Badge } from "@ssurak/ui/components/forms/badge";

const isAvailable = {
  isAvailable: <Badge variant={"active"}>판매중</Badge>,
  isNotAvailable: <Badge variant={"inactive"}>미판매중</Badge>,
};

export type CreatedMenu = {
  name: string;
  imageKey?: string | null;
  isAvailable: boolean;
  price: number;
};

type CreatedMenuThumbnailProps = {
  menu: CreatedMenu;
};

export default function CreatedMenuThumbnail({
  menu,
}: CreatedMenuThumbnailProps) {
  if (!menu.imageKey) {
    return null;
  }

  return (
    <div
      style={{ animationDelay: "0.20s" }}
      className="rounded-xl bg-muted animate-tzRiseFast"
    >
      <Item className="gap-2 p-2">
        <MenuImage
          src={buildImageUrl(menu.imageKey, "thumbnail")}
          priority={true}
          alt={menu.name}
          size="tiny"
          className="rounded-lg"
        />
        <ItemContent>
          <ItemTitle className="font-bold text-md">{menu.name}</ItemTitle>
          <ItemFooter className="text-muted-foreground text-xs">
            {transCurrencyFormat(menu.price)}
          </ItemFooter>
        </ItemContent>
        {isAvailable[menu.isAvailable ? "isAvailable" : "isNotAvailable"]}
      </Item>
    </div>
  );
}
