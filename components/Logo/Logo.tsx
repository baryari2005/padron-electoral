// components/Logo.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { capitalizeEachWord } from "@/lib/utils/formatters";

export function Logo() {
  const router = useRouter();
  const { theme } = useTheme();

  const logoSrc =
    theme === "dark" ? "/logo-white.png" : "/logo.png"; // Asegurate de tener ambas imágenes

  return (
    <div
      role="link"
      aria-label="Ir al inicio"
      className="min-h-20 h-20 flex items-center px-6 border-b cursor-pointer gap-2"
      onClick={() => router.push("/")}
    >
      <Image
        src={logoSrc}
        alt="Logo"
        width={45}
        height={45}
        className="h-auto w-[45px] rounded-lg" // si fijás una, poné la otra en auto
        priority={false} // opcional: quitalo si no es hero visible al cargar
        sizes="45px"
      />
      <div className="flex flex-col leading-tight ml-4">
        <h1 className="font-semibold text-sm-plus text-center">
          {capitalizeEachWord("Elecciones")}
        </h1>
        <h1 className="font-semibold text-xl text-center">
          {capitalizeEachWord("Generales")}
        </h1>
        <h2 className="text-xs-plus text-center">{capitalizeEachWord(`San Miguel ${new Date().getFullYear()}`)}</h2>
      </div>
    </div>
  );
}
