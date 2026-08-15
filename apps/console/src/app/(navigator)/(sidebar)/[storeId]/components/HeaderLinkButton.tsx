import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import Link from "next/link";
import { ComponentProps } from "react";

type HeaderLinkButtonProps = {
  linkTo: string;
  icon?: React.ReactNode;
} & ComponentProps<typeof Button>;

export default function HeaderLinkButton({
  children,
  icon,
  linkTo,
  className,
  ...props
}: HeaderLinkButtonProps) {
  const iconElement = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  return (
    <Button
      asChild
      className={cn("font-semibold h-11 rounded-3xl px-6", className)}
      {...props}
    >
      <Link href={linkTo}>{iconElement}</Link>
    </Button>
  );
}
