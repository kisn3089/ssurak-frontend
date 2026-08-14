import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@ssurak/ui/components/item";
import { RejectedFile } from "../../../components/form/utils/fileValidators";
import MenuImage from "../../add/components/MenuImage";
import formatBytes from "@utils/formatBytes";
import { Button } from "@ssurak/ui/components/buttons/button";
import UploadTrigger from "../../../components/form/image-uploader/UploadTrigger";

type FailedImageListProps = {
  rejectedFiles: RejectedFile[];
  removeRejectedFile: (file: File) => void;
};
export default function FailedImageList({
  rejectedFiles,
  removeRejectedFile,
}: FailedImageListProps) {
  return (
    <ul className="rounded-2xl bg-background border">
      {rejectedFiles.map(({ file, message }, index) => (
        <Item key={`${file.name}-${index}`}>
          <MenuImage
            src={URL.createObjectURL(file)}
            alt={file.name}
            size="thumbnail"
            className="rounded-2xl shadow-md"
          />
          <ItemContent>
            <ItemTitle className="font-bold">{file.name}</ItemTitle>
            <ItemFooter className="text-muted-foreground">
              {formatBytes(file.size)}
            </ItemFooter>
            <ItemDescription className="text-destructive font-semibold">
              {message}
            </ItemDescription>
          </ItemContent>
          <div className="flex gap-2">
            <Button asChild>
              <UploadTrigger>다시 올리기</UploadTrigger>
            </Button>
            <Button
              onClick={() => removeRejectedFile(file)}
              variant={"outline"}
            >
              빼기
            </Button>
          </div>
        </Item>
      ))}
    </ul>
  );
}
