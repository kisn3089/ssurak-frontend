export default function TableBoardLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div
      className={`flex-1 min-w-0 h-full overflow-y-auto grid gap-3 grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] auto-rows-[14rem] content-start`}
    >
      {children}
    </div>
  );
}
