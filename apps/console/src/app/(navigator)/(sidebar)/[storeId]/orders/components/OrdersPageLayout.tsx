export default function OrdersPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border h-full flex flex-col justify-between shadow-sm w-xl min-w-xs bg-background">
      {children}
    </div>
  );
}
