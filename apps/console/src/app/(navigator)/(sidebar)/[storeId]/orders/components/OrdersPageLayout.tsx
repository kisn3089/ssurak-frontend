export default function OrdersPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden rounded-3xl border flex flex-col justify-between shadow-sm w-xl min-w-xs bg-background">
      {children}
    </div>
  );
}
