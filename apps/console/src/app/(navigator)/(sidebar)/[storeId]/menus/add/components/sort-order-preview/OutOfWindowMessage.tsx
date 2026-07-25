import { cn } from "@ssurak/ui/lib/utils";

type OutOfWindowMessageProps = {
  hiddenBefore?: number;
  hiddenAfter?: number;
};

export default function OutOfWindowMessage({
  hiddenBefore,
  hiddenAfter,
}: OutOfWindowMessageProps) {
  const OutOfWindow = ({ children }: { children: React.ReactNode }) => (
    <p
      className={cn(
        `px-3 text-xs text-muted-foreground`,
        hiddenBefore ? "pt-2" : "pb-2"
      )}
    >
      {children}
    </p>
  );

  if (hiddenBefore) {
    return <OutOfWindow>이전 {hiddenBefore}개 메뉴...</OutOfWindow>;
  }

  if (hiddenAfter) {
    return <OutOfWindow>이후 {hiddenAfter}개 메뉴...</OutOfWindow>;
  }

  return null;
}
