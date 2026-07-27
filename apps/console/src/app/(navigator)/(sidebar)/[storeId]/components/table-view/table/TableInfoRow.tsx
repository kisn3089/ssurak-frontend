import { cn } from "@ssurak/ui/lib/utils";

interface TableInfoRowProps {
  children: React.ReactNode;
  className?: string;
  overwriteOverflow?: string;
}

export default function TableInfoRow({
  children,
  className = "",
  overwriteOverflow = "",
}: TableInfoRowProps) {
  return (
    <td className="text-left p-4 first:pl-4">
      <div className={cn(className, "text-ellipsis")}>
        <span
          className={cn(
            "max-w-full",
            overwriteOverflow
              ? overwriteOverflow
              : "overflow-hidden whitespace-nowrap"
          )}
        >
          {children}
        </span>
      </div>
    </td>
  );
}
