import type { ReactNode } from "react";

export function PageFrame({ children }: Readonly<{ children: ReactNode }>) {
  return <div style={{ margin: "0 auto", maxWidth: "72rem", padding: "0 1.5rem" }}>{children}</div>;
}

export { Badge } from "./Badge";
export { Button, type ButtonProps } from "./Button";
export { ButtonLink } from "./ButtonLink";
export { Card } from "./Card";
export { Container } from "./Container";
export { EmptyState } from "./EmptyState";
export { FormField } from "./FormField";
export { Icon, type IconName } from "./Icon";
export { Section } from "./Section";
export { SectionIntro } from "./SectionIntro";
