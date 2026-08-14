export default function GridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="antialiased flex gap-2 pl-3 pr-6 pb-4 flex-1 min-h-0">
      {children}
    </section>
  );
}
