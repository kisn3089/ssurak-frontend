import { Skeleton } from "@ssurak/ui/components/skeleton";
import RecentDraftSkeleton from "../../import/components/draft/RecentDraftSkeleton";

export default function DraftReviewSkeleton({ count }: { count: number }) {
  return (
    <div>
      <RecentDraftSkeleton count={1} />
      <ul className="mt-4 flex flex-col gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <li key={index} className="rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-16 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-3 w-32" />
          </li>
        ))}
      </ul>
    </div>
  );
}
