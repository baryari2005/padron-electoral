"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FormTagsProps {
  label?: string;
  placeholder?: string;
  values: number[];
  onChange: (values: number[]) => void;
  type?: "text" | "number";
  modo?: "ver" | "editar";
}

export function FormTags({
  label = "Tags",
  placeholder = "Agregar...",
  values,
  onChange,
  type = "text",
  modo = "editar",
}: FormTagsProps) {
  const isReadOnly = modo === "ver";
  const [input, setInput] = useState("");

  const handleAddTag = () => {
    const trimmed = input.trim();

    // Soporte para rango tipo 1...9
    const rangeMatch = trimmed.match(/^(\d+)\.\.\.(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (start <= end) {
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const nuevos = range.filter((num) => !values.includes(num));
        onChange([...values, ...nuevos]);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && !values.includes(num)) {
        onChange([...values, num]);
      }
    }

    setInput("");
  };

  const handleRemove = (value: number) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          type={type}
          disabled={isReadOnly}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        {!isReadOnly && (
        <Button type="button" variant="outline" onClick={handleAddTag}>
          Agregar
        </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {values.map((val, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
          >
            Mesa {val}
            {!isReadOnly && (
            <button type="button" onClick={() => handleRemove(val)}>
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
            </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
