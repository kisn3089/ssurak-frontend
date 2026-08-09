import { Card, CardHeader } from "@ssurak/ui/components/layouts/card";

type AddMenuDetailLayoutProps = {
  children: React.ReactNode;
  button: React.ReactNode;
  title: React.ReactNode;
};

export default function AddMenuDetailLayout({
  children,
  button,
  title,
}: AddMenuDetailLayoutProps) {
  return (
    <Card className="min-w-[360px] h-full flex flex-col justify-between bg-background rounded-3xl shadow-md  overflow-hidden">
      <div className="overflow-y-scroll scrollbar-hide">
        <CardHeader className="py-3 px-1">{title}</CardHeader>
        {children}
      </div>
      {button}
    </Card>
  );
}
