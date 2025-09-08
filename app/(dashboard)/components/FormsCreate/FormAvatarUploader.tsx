"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarUploader } from "@/components/Settings/AvatarUploader";
import { Loader2 } from "lucide-react";

/** Extrae "<path/dentro/del/bucket>" desde una URL pública o firmada de Supabase.
 *  Devuelve undefined si no es URL de Supabase.
 *  Ejemplos soportados:
 *   - https://<proj>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *   - https://<proj>.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
 */
function extractSupabaseStoragePath(avatarUrl?: string): string | undefined {
  if (!avatarUrl) return undefined;
  try {
    const url = new URL(avatarUrl);

    // Solo procesamos URLs de Supabase Storage
    if (!/\/storage\/v1\/object\//.test(url.pathname)) return undefined;

    // /storage/v1/object/public/<bucket>/<path...>
    const publicMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (publicMatch) {
      const [, _bucket, path] = publicMatch;
      return decodeURIComponent(path);
    }

    // /storage/v1/object/sign/<bucket>/<path...>?token=...
    const signMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+)$/);
    if (signMatch) {
      const [, _bucket, rest] = signMatch;
      // quitar query si quedara pegada al path (defensivo)
      const path = rest.split("?")[0];
      return decodeURIComponent(path);
    }

    // Formatos menos comunes:
    // /storage/v1/object/<bucket>/<path...>
    const genericMatch = url.pathname.match(/\/storage\/v1\/object\/([^/]+)\/(.+)$/);
    if (genericMatch) {
      const [, _bucket, path] = genericMatch;
      return decodeURIComponent(path);
    }

    return undefined;
  } catch {
    // Si avatarUrl no es una URL válida, quizá ya sea un "path" (sin http)
    if (!avatarUrl.startsWith("http")) return avatarUrl;
    return undefined;
  }
}

interface Props {
  name: string;
  /** Puede ser URL firmada/pública de Supabase o una URL externa (ui-avatars) */
  avatarUrl?: string;

  onAvatarUploaded: (url: string) => void;
  isUploading?: boolean;
  setIsUploading?: (loading: boolean) => void;

  /** OPCIONAL: si lo tenés a mano para ordenar en /avatars/users/<userId> */
  userId?: string;
}

export function FormAvatarUploader({
  name,
  avatarUrl,
  onAvatarUploaded,
  isUploading = false,
  setIsUploading,
  userId,
}: Props) {
  // Convertimos la URL que ya tenés a "path" para que el server pueda borrar el viejo
  const currentAvatarPath = extractSupabaseStoragePath(avatarUrl);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name
                )}&background=0d9488&color=fff&rounded=true&format=png`
              }
              alt="avatar"
            />
            <AvatarFallback>{name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        <AvatarUploader
          onAvatarUploaded={onAvatarUploaded}
          setIsUploading={setIsUploading}
          // /** 👇 ahora le pasamos el path del avatar anterior para que el server lo elimine */
          // currentAvatarPath={currentAvatarPath}
          // /** 👇 opcional para que agrupe por usuario en el bucket */
          // userId={userId}
          // /** 👇 opcional si querés que además haga PUT /api/profile/avatar para guardar path */
          // savePathInDb
        />
      </div>
    </>
  );
}
