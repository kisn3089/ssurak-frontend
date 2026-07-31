export default function OptionLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-x-2 py-3">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-accent" />
    </div>
  );
}
