import { Button } from "@ssurak/ui/components/buttons/button";
import Link from "next/link";

type ControllerFooterProps = {
  uploadFiles: () => void;
  acceptedFileCount: number;
  isExtracting: boolean;
  children: React.ReactNode;
};
export default function ControllerFooter({
  acceptedFileCount,
  uploadFiles,
  isExtracting,
  children,
}: ControllerFooterProps) {
  return (
    <div className="pt-12 pb-4">
      <div className="md:flex gap-x-1 md:gap-x-2 md:justify-end grid grid-cols-4 h-10">
        {children}
        <Link href="bulk">
          <Button
            className="h-full w-full col-span-1 rounded-3xl"
            variant={"outline"}
          >
            돌아가기
          </Button>
        </Link>

        <Button
          className="h-full col-span-2 rounded-3xl"
          onClick={uploadFiles}
          disabled={acceptedFileCount === 0 || isExtracting}
        >
          {isExtracting
            ? "메뉴를 읽는 중..."
            : `사진 ${acceptedFileCount}장에서 메뉴 추출`}
        </Button>
      </div>
    </div>
  );
}
