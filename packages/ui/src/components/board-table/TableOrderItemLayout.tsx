import { CardContent } from "../layouts/card";

export default function TableOrderItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardContent
      className={`rounded-lg bg-background border p-2 font-semibold flex flex-col justify-center shadow-md`}
    >
      {children}
    </CardContent>
  );
}
