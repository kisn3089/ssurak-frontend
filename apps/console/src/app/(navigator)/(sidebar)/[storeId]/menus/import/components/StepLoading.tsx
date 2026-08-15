import { cn } from "@ssurak/ui/lib/utils";
import { Sparkle } from "lucide-react";

const STEP_LOADING_TEXTS = [
  "사진 올리는 중...",
  "메뉴판 읽는 중...",
  "정리하는 중...",
  "완료!",
];

export default function StepLoading({ step }: { step: number | null }) {
  const visibleCondition = step !== null && step < 3;
  return (
    <div
      className={cn(
        "h-0 grid place-content-center transition-all duration-350",
        { "h-20": visibleCondition }
      )}
    >
      <div
        className={cn(
          "flex items-center gap-x-2 font-bold text-lg opacity-0 delay-75 duration-500",
          {
            "opacity-100": visibleCondition,
          }
        )}
      >
        <div className="p-4 rounded-xl bg-linear-to-br from-blue-500 to-fuchsia-400">
          <Sparkle
            width={18}
            height={18}
            className={"text-background animate-spin"}
            fill="currentColor"
          />
        </div>
        <span className="bg-linear-to-br from-blue-500 to-fuchsia-400 bg-clip-text text-transparent">
          {`${STEP_LOADING_TEXTS[step ?? 0]}`}
        </span>
      </div>
    </div>
  );
}
