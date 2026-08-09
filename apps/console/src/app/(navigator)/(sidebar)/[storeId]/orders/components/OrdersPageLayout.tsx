export default function OrdersPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sticky top-14 overflow-hidden rounded-3xl border flex flex-col justify-between shadow-sm w-xl min-w-xs bg-background max-h-[calc(100vh-72px)]">
      {children}
    </div>
  );
}
