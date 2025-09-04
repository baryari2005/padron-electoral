// components/common/PartyLogo.tsx
"use client";
import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  size?: number;          // diámetro del círculo
  zoom?: number;          // 1 = normal, 1.1 = 10% más grande

  // Anillo (box-shadow) opcional
  ring?: boolean;         // ← ON/OFF del anillo (default true)
  ringColor?: string;     // color del anillo (si no hay, no se dibuja)
  ringWidth?: number;     // grosor del anillo (px, default 2)

  className?: string;     // estilos extra para el wrapper
  imgClassName?: string;  // estilos extra para la imagen
};

export function PartyLogo({
  src,
  alt,
  size = 40,
  zoom = 1,
  ring = true,
  ringColor,
  ringWidth = 2,
  className = "",
  imgClassName = "",
}: Props) {
  const finalSrc = src && src.trim() !== "" ? src : "/logo-placeholder.png";

  return (
    <div
      className={`relative overflow-hidden rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring && ringColor ? `0 0 0 ${ringWidth}px ${ringColor}` : undefined,
      }}
    >
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className={`object-cover ${imgClassName}`}
        style={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

// EJEMPOS DE USO
// Con anillo (default)
{/* <PartyLogo src={x.logo} alt={x.agrupacion} size={40} ringColor={x.color} />

// Sin anillo
<PartyLogo src={x.logo} alt={x.agrupacion} size={40} ring={false} />

// Anillo más grueso (3px)
<PartyLogo src={x.logo} alt={x.agrupacion} size={40} ringColor={x.color} ringWidth={3} />

// Con zoom y clases extra
<PartyLogo src={x.logo} alt={x.agrupacion} size={40} zoom={1.1} className="shadow-sm" /> */}
