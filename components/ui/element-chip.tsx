"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ENERGY_TYPE_DATA } from "@/lib/constants";

type EnergyType = keyof typeof ENERGY_TYPE_DATA;

const elementChipVariants = cva(
  "inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      selected: {
        true: "ring-2 ring-offset-2 ring-offset-background scale-105 shadow-lg",
        false: "hover:scale-105 opacity-90 hover:opacity-100",
      },
      size: {
        default: "px-3 py-1.5",
        sm: "px-2 py-1",
        lg: "px-4 py-2",
      },
    },
    defaultVariants: {
      selected: false,
      size: "default",
    },
  }
);

interface ElementChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof elementChipVariants> {
  energyType: EnergyType;
}

function ElementChip({
  className,
  energyType,
  selected,
  size,
  ...props
}: ElementChipProps) {
  const typeData = ENERGY_TYPE_DATA[energyType];

  // Generate CSS custom properties for the element color
  const colorStyles: React.CSSProperties = {
    "--element-color": typeData.color,
    "--element-color-muted": `${typeData.color}25`,
    "--element-text": selected ? typeData.textColor || "#000000" : "inherit",
    backgroundColor: selected
      ? "var(--element-color)"
      : "var(--element-color-muted)",
    borderColor: "var(--element-color)",
    color: "var(--element-text)",
    boxShadow: selected
      ? `0 0 16px color-mix(in srgb, var(--element-color) 50%, transparent)`
      : "none",
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={cn(elementChipVariants({ selected, size, className }))}
      style={colorStyles}
      data-selected={selected}
      {...props}
    >
      {typeData.label}
    </button>
  );
}

export { ElementChip, elementChipVariants };
export type { EnergyType };
