import { Check } from "lucide-react";

export default function SuccessCheck() {
  return (
    <span className="relative flex size-16 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-green-500 animate-tzRing" />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-green-600 text-white animate-tzPop">
        <Check
          className="size-9 animate-tzDraw"
          strokeWidth={3}
          style={{ strokeDasharray: 24, strokeDashoffset: 24 }}
        />
      </span>
    </span>
  );
}
