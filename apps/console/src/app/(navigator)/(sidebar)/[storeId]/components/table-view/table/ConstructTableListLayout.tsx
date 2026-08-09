interface ConstructTableListLayoutProps {
  body: React.ReactNode;
  children: React.ReactNode;
}

export default function ConstructTableListLayout({
  children,
  body,
}: ConstructTableListLayoutProps) {
  return (
    <div className="border border-border rounded-sm bg-background">
      <table className="w-full table-fixed text-sm">
        <thead>{children}</thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}
