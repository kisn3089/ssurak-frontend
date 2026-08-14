import { Spinner } from "@ssurak/ui/components/spinner";

export default function RecentDraftSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="h-[74px] bg-background border border-border rounded-2xl flex items-center justify-between p-3 shadow-lg animate-pulse"
        >
          <div className="size-14 rounded-lg bg-accent" />
          <Spinner />
        </li>
      ))}
    </>
  );
}
