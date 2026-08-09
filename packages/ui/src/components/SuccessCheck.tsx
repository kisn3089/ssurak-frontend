import { Check } from "lucide-react";

type SizeMap = { container: string; icon: string };
const SIZE_CLASSNAME: Record<
  NonNullable<SuccessCheckProps["size"]>,
  SizeMap
> = {
  sm: { container: "size-4", icon: "size-2" },
  md: { container: "size-16", icon: "size-9" },
};

type SuccessCheckProps = {
  size?: "sm" | "md";
};
export default function SuccessCheck({ size = "md" }: SuccessCheckProps) {
  return (
    <span
      className={`relative flex ${SIZE_CLASSNAME[size].container} items-center justify-center`}
    >
      <span className="absolute inset-0 rounded-full bg-green-500 animate-tzRing" />
      <span
        className={`relative flex ${SIZE_CLASSNAME[size].container} items-center justify-center rounded-full bg-green-600 text-white animate-tzPop`}
      >
        <Check
          className={`${SIZE_CLASSNAME[size].icon} animate-tzDraw`}
          strokeWidth={3}
          style={{ strokeDasharray: 24, strokeDashoffset: 24 }}
        />
      </span>
    </span>
  );
}
