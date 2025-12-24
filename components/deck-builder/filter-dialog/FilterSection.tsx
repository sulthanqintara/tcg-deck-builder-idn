import * as React from "react";
import { cn } from "@/lib/utils";

interface FilterSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
}

function FilterSection({
  title,
  children,
  className,
  ...props
}: FilterSectionProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {children}
    </section>
  );
}

export { FilterSection };
