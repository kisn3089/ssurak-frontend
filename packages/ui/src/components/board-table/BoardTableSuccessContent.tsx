import { useBoardTableContext } from "./BoardTableContext";
import SuccessCheck from "../SuccessCheck";

export default function BoardTableSuccessContent({
  successText,
  isSuccess,
}: {
  successText: string;
  isSuccess?: boolean;
}) {
  const { tableNumber, floor, seats, section } = useBoardTableContext(
    "BoardTableSuccessContent"
  );

  if (!isSuccess) return null;

  const summary = [
    [tableNumber, section].filter(Boolean).join(" "),
    seats ? `좌석 ${seats}` : null,
    floor ? `${floor}층` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-y-3 p-4 text-center">
      <SuccessCheck />
      <div className="flex flex-col gap-y-1">
        <p className="text-lg font-extrabold">{successText}</p>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>
    </div>
  );
}
