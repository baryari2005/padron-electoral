// components/ui/uppercase-input.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

export const UppercaseInput = React.forwardRef<
  HTMLInputElement,
  ComponentProps<"input">
>(({ onChange, value, ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      value={value ?? ""} // <- evita que sea undefined
      onChange={(e) => {
        const upper = e.target.value.toUpperCase();
        onChange?.({
          ...e,
          target: { ...e.target, value: upper },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
    />
  );
});
UppercaseInput.displayName = "UppercaseInput";
