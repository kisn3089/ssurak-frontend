import MainLayout from "./MainLayout";

type NarrowColumnProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export default function SectionLayout({
  children,
  title,
  description,
}: Readonly<NarrowColumnProps>) {
  return (
    <MainLayout>
      <section className="flex flex-col self-center md:mt-2">
        <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-4">{title}</h1>
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
