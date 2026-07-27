import { UploadedMedia } from "@ssurak/api/core/upload/httpUpload";
import formatBytes from "@utils/formatBytes";

export default function UploadInfo({
  uploadedImage,
}: {
  uploadedImage: UploadedMedia["variants"]["hero"] | undefined;
}) {
  if (!uploadedImage) {
    return null;
  }

  return (
    <p className="text-xs text-muted-foreground">
      {`업로드 완료 ${uploadedImage?.width}x${uploadedImage?.height} ${formatBytes(uploadedImage?.bytes)}`}
    </p>
  );
}
