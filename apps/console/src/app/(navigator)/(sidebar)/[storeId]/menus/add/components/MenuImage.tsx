import { ItemMedia } from "@ssurak/ui/components/item";
import { cn } from "@ssurak/ui/lib/utils";
import { ImagePlus } from "lucide-react";
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
    class: "size-14",
    width: 140,
    height: 140,
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
      className={cn(sizeClassMap[size].class, className)}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizeClassMap[size].width}
          height={sizeClassMap[size].height}
          priority={priority}
        />
      ) : (
        <EmptyImage />
      )}
    </ItemMedia>
  );
}

function EmptyImage() {
  return (
    <div className="flex flex-col items-center gap-y-2">
      <ImagePlus className="mb-2" />
      <p className="font-semibold">이미지가 아직 업로드되지 않았습니다.</p>
      <p className="whitespace-pre text-center text-accent-foreground text-sm">
        {`메뉴 이미지를 업로드하여 \n고객에게 어떻게 보일지 미리 확인하세요!`}
      </p>
    </div>
  );
}
