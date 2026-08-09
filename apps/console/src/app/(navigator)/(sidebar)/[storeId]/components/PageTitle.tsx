type PageTitleProps = {
  title: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: React.ReactNode;
};

export default function PageTitle({ title, Icon, children }: PageTitleProps) {
  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center gap-x-2">
        <Icon className="h-5 w-5 md:h-fit md:w-fit" />
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      </div>
      {children}
    </header>
  );
}
