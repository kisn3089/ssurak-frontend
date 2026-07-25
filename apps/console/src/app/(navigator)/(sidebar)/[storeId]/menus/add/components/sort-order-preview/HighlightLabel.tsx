export default function HighlightLabel({ isNew }: { isNew: boolean }) {
  if (!isNew) return null;

  return (
    <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-tiny font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
      이 메뉴
    </span>
  );
}
