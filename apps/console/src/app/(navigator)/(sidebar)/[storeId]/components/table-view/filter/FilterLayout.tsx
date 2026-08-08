export default function FilterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-x-2 mt-3 md:mt-8 mb-3">
      {children}
    </div>
  );
}
