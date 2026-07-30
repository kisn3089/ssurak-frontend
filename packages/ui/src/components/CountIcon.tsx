import { cn } from "../lib/utils";

type CountIconProps = {
  count: number;
  className?: string;
  color?: "white" | "black";
  size?: "xs" | "sm";
};

const colorStyle = {
  white: "bg-background text-foreground",
  black: "bg-foreground text-background",
};

const sizeStyle = {
  xs: "w-4 h-4 text-[0.5rem]",
  sm: "w-5 h-5 text-[0.7rem]",
};

export default function CountIcon({
  count,
  className = "",
  color = "black",
  size = "xs",
}: CountIconProps) {
  return (
    <div
      className={cn(
        "absolute",
        "rounded-full",
        "font-semibold",
        "grid place-content-center",
        "text-[0.5rem]",
        sizeStyle[size],
        colorStyle[color],
        className
      )}
    >
      {count}
    </div>
  );
}
