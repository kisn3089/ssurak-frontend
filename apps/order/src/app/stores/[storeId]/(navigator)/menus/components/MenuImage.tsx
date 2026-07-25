import { ItemMedia } from "@ssurak/ui/components/item";
import Image from "next/image";

type MenuImageSize = "cover" | "thumbnail" | "tiny";
type MenuImagePreset = {
  class: string;
  width: number;
  height: number;
};

const sizeClassMap = {
  cover: {
    class: "size-full aspect-[4/3]",
    width: 1080,
    height: 810,
  },
  thumbnail: {
    class: "size-24",
    width: 240,
    height: 240,
  },
  tiny: {
    class: "size-16",
    width: 160,
    height: 160,
  },
} satisfies Record<MenuImageSize, MenuImagePreset>;

type MenuImageProps = {
  src: string | null;
  alt: string;
  size: MenuImageSize;
  className?: string;
  priority?: boolean;
};
export default function MenuImage({
  src,
  alt,
  size,
  className = "",
  priority = false,
}: MenuImageProps) {
  return (
    <ItemMedia
      variant={"image"}
      className={`${sizeClassMap[size].class} shadow-lg ${className}`}
    >
      <Image
        src={src || "/coffee_sample.jpg"}
        alt={alt}
        width={sizeClassMap[size].width}
        height={sizeClassMap[size].height}
        priority={priority}
      />
    </ItemMedia>
  );
}
