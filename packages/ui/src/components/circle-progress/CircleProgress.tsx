import CircleItem from "./CircleProgressItem";

type CircleProgressProps = {
  max: number;
  value: number;
  className?: string;
};

export default function CircleProgress({
  max,
  value,
  className = "",
}: CircleProgressProps) {
  return (
    <div className="flex items-center gap-x-1">
      {Array.from({ length: max }).map((_, index) => (
        <CircleItem
          key={index}
          isFilled={index < value}
          className={className}
        />
      ))}
    </div>
  );
}
