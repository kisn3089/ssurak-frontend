import { cn } from "@ssurak/ui/lib/utils";

type DivideLineProps = {
  label?: string;
  labelPosition?: "left" | "center" | "right";
  labelClassName?: string;
};

export default function DivideLine({
  label,
  labelPosition = "left",
  labelClassName,
}: DivideLineProps) {
  return (
    <div className="flex items-center gap-x-2 py-3 px-2">
      {labelPosition !== "left" && <Line />}
      {label && (
        <span className={cn("text-xs text-muted-foreground", labelClassName)}>
          {label}
        </span>
      )}
      {labelPosition !== "right" && <Line />}
    </div>
  );
}

function Line() {
  return <div className="flex-1 h-px bg-border" />;
}
