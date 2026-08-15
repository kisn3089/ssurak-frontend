import { cn } from "@ssurak/ui/lib/utils";

type CircleItemProps = {
  className?: string;
  isFilled?: boolean;
};

export default function CircleItem({
  className = "",
  isFilled = false,
}: CircleItemProps) {
  return (
    <div
      {...(isFilled ? { "data-filled": isFilled } : {})}
      className={cn(
        "rounded-full w-1.5 h-1.5 bg-muted-foreground/20",
        { "bg-primary": isFilled },
        className
      )}
    />
  );
}
