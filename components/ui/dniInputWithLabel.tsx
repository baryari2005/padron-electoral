import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";

interface DniInputWithLabelProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
  error?: string;
}

export function DniInputWithLabel({
  value,
  onChange,
  label = "DNI",
  className,
  error,
}: DniInputWithLabelProps) {
  return (
    <div className={cn("text-center", className)}>
      <Input
        value={value}
        onChange={onChange}
        placeholder="12345678"
        maxLength={9}
        inputMode="numeric"
        className="text-center tracking-[0.5em] px-4 py-2 border border-input rounded-md shadow-sm caret-transparent"
      />
      <Label className="block text-xs text-center mt-1 uppercase text-black">
        {label}
      </Label>
      {error && (
        <p className="text-destructive text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
