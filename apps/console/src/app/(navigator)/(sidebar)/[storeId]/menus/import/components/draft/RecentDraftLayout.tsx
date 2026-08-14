export default function RecentDraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h3 className="pb-2 text-xl font-bold">이어서 작업하기</h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}
