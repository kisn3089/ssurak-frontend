export default function SummaryTitle({ itemCount }: { itemCount: number }) {
  return (
    <div className="flex items-baseline gap-x-0.5">
      <p className="font-extrabold text-xl">{itemCount}</p>
      <p className="text-sm text-muted-foreground">개 추출</p>
    </div>
  );
}
