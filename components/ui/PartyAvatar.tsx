"use client";
import Image from "next/image";
import { useState } from "react";

function PartyAvatar({
  src,
  alt,
  size = 24,
  className = "",
}: {
  src?: string | null;
  alt?: string | null;
  size?: number;
  className?: string;
}) {
  const FALLBACK = "/public/sinimagen.png"; // poné este archivo en /public/images/default-logo.png
  const [imgSrc, setImgSrc] = useState(src?.trim() || FALLBACK);

  return (
    <Image
      src={imgSrc}
      alt={alt ?? "Logo"}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImgSrc(FALLBACK)}
    />
  );
}

export { PartyAvatar }