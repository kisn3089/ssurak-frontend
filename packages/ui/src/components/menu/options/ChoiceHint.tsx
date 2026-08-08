import { DetailOptionChoice } from "../menu-detail/menu-detail.type";

export default function ChoiceHint({
  choice,
  soldOut,
}: {
  choice: DetailOptionChoice;
  soldOut: boolean;
}) {
  if (soldOut) {
    return <span className="text-xs">품절</span>;
  }
  if (choice.priceDelta === 0) return null;

  const sign = choice.priceDelta > 0 ? "+" : "-";
  const amount = Math.abs(choice.priceDelta).toLocaleString("ko-KR");

  return <span>{`${sign}${amount}원`}</span>;
}
