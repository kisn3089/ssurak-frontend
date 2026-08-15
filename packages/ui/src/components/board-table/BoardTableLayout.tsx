import { cn } from "@ssurak/ui/lib/utils";
import { Card } from "../layouts/card";

type BoardTableLayoutProps = {
  children: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
};

export default function BoardTableLayout({
  children,
  className = "",
}: BoardTableLayoutProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer rounded-2xl h-full flex flex-col transition-shadow duration-300 bg-accent",
        className
      )}
    >
      {children}
    </Card>
  );
}
