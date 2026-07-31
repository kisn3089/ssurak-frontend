import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

type ConditionalLinkProps = {
  children: React.ReactNode;
  condition: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "shallow">;

export default function ConditionalLink({
  children,
  condition,
  ...props
}: ConditionalLinkProps) {
  if (condition) {
    return <Link {...props}>{children}</Link>;
  }

  return children;
}
