import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // si usás clsx o alguna util para clases opcionales
import React from "react";

interface UnderlinedInputWithLabelProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function UnderlinedInputWithLabel({
  value,
  onChange,
  placeholder,
  label,
  className,
  inputProps,
}: UnderlinedInputWithLabelProps) {
  return (
    <div className={cn("text-center", className)}>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border-0 border-b border-dashed border-black rounded-none text-center"
        {...inputProps}
      />
      <Label className="block text-xs text-center mt-1 uppercase text-black">
        {label}
      </Label>
    </div>
  );
}
