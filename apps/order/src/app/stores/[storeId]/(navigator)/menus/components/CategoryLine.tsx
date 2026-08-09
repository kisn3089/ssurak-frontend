import { forwardRef } from "react";

const CategoryLine = forwardRef(
  ({ category }: { category: string }, ref: React.Ref<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className="w-full h-px bg-border my-4 scroll-m-24"
        data-category={category}
      />
    );
  }
);

CategoryLine.displayName = "CategoryLine";

export default CategoryLine;
