// app/(dashboard)/components/common/AvatarLogo.tsx
"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageOff } from "lucide-react";

type Props = {
  src?: string | null;
  alt?: string;
  size?: number; // px
  className?: string;
};

export function AvatarLogo({ src, alt = "Logo", size = 40, className = "" }: Props) {
  return (
    <Avatar
      className={`rounded-full ring-1 ring-border bg-muted/40 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Si carga OK, se ve la imagen; si falla, aparece el fallback automáticamente */}
      <AvatarImage src={src ?? undefined} alt={alt} />
      <AvatarFallback className="bg-muted/40 text-muted-foreground">
        <ImageOff className="h-4 w-4 opacity-60" />
      </AvatarFallback>
    </Avatar>
  );
}
