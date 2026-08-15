import MainLayout from "./MainLayout";

type NarrowColumnProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  renderRightHeader?: React.ReactNode;
};

export default function SectionLayout({
  children,
  title,
  description,
  renderRightHeader,
}: Readonly<NarrowColumnProps>) {
  return (
    <MainLayout>
      <section className="flex flex-col self-center md:mt-2">
        <div className="flex justify-between items-center pb-1.5">
          <h1 className="text-xl md:text-2xl font-bold w-fit">{title}</h1>
          {renderRightHeader}
        </div>

        {description && (
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-4 md:mb-10">
            {description}
          </p>
        )}
        {children}
      </section>
    </MainLayout>
  );
}
