import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AppLinkProps {
  to: string;
  params?: Record<string, string>;
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
export function AppLink({ to, params, className, children, ...rest }: AppLinkProps) {
  const [pathname, query] = to.split("?");
  const search = query ? Object.fromEntries(new URLSearchParams(query).entries()) : undefined;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <Link
      to={pathname as any}
      search={search as any}
      params={params as any}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default AppLink;
