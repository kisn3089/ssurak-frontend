import { TriangleAlert } from "lucide-react";

export default function OptionSaveFailedNotice() {
  return (
    <div
      role="status"
      style={{ animationDelay: "0.2s" }}
      className="flex gap-x-2 rounded-xl bg-amber-50 px-3 py-2.5 text-amber-900 animate-tzRiseFast dark:bg-amber-950/40 dark:text-amber-200"
    >
      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed">
        {`메뉴는 등록됐지만 옵션은 다 저장하지 못했어요.`}
        <br />
        메뉴 수정 화면에서 옵션을 확인해 주세요.
      </p>
    </div>
  );
}
