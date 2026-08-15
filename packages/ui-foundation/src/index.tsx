import type { ReactNode } from "react";

export function PageFrame({ children }: Readonly<{ children: ReactNode }>) {
  return <div style={{ margin: "0 auto", maxWidth: "72rem", padding: "0 1.5rem" }}>{children}</div>;
}
