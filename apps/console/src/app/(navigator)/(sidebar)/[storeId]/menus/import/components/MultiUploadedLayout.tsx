import { cn } from "@ssurak/ui/lib/utils";

type MultiUploadedLayoutProps = {
  invalid: boolean;
  fileLength: number;
  children: React.ReactNode;
};

export default function MultiUploadedLayout({
  children,
  invalid,
  fileLength,
}: MultiUploadedLayoutProps) {
  const title = invalid
    ? `읽을 수 없는 사진 ${fileLength}장`
    : `사용할 사진 ${fileLength}장`;
  return (
    <div
      className={cn(
        "mt-4 border bg-background shadow-lg border-border p-4 rounded-2xl",
        {
          "border-red-500 dark:border-red-900 bg-red-50 dark:bg-red-950 shadow-destructive/10":
            invalid,
        }
      )}
    >
      <p
        className={cn("font-semibold pb-2", {
          "text-destructive dark:text-red-400": invalid,
        })}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
