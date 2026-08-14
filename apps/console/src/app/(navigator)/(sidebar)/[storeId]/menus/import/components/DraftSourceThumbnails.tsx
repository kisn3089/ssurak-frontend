import { MenuDraftSourceImage } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import Image from "next/image";

const THUMBNAIL_SIZE = 48;

export default function DraftSourceThumbnails({
  sourceImages,
}: {
  sourceImages: MenuDraftSourceImage[];
}) {
  return (
    <ul className="flex shrink-0 gap-1">
      {sourceImages.map((image) => (
        <li key={image.fileName}>
          <Image
            src={image.thumbnail}
            alt={image.fileName}
            width={THUMBNAIL_SIZE}
            height={THUMBNAIL_SIZE}
            unoptimized
            className="size-14 rounded-lg border border-border object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
