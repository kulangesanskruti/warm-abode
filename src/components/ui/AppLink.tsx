import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AppLinkProps {
  to: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  target?: string;
  rel?: string;
  title?: string;
  "aria-label"?: string;
}

/**
 * Thin wrapper around TanStack Router's <Link> that accepts a plain string
 * path (including an optional query string) so feature components can stay
 * simple.
 */
export function AppLink({ to, className, children, ...rest }: AppLinkProps) {
  const [pathname, query] = to.split("?");
  const search = query ? Object.fromEntries(new URLSearchParams(query).entries()) : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <Link to={pathname as any} search={search as any} className={className} {...rest}>
      {children}
    </Link>
  );
}

export default AppLink;
