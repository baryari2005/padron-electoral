"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { formatMessage } from "@/lib/utils/formatters";

interface AvatarUploaderProps {
  onAvatarUploaded: (url: string) => void;
  setIsUploading?: (value: boolean) => void;

  /** NUEVO: path actual guardado en tu DB (ej: "avatars/users/123/abc.jpg") */
  currentAvatarPath?: string;

  /** OPCIONAL: para guardar ordenado por usuario (si no lo pasás, usa "avatars") */
  userId?: string;

  /** OPCIONAL: si querés además guardar el path en la DB desde el cliente */
  savePathInDb?: boolean;
}

export const AvatarUploader = ({
  onAvatarUploaded,
  setIsUploading,
  currentAvatarPath,
  userId,
  savePathInDb,
}: AvatarUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUploading, setLocalUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 200 * 1024;
    if (file.size > maxSize) {
      toast.error(formatMessage("La imagen es demasiado grande (máx. 200KB)"));
      return;
    }

    try {
      setLocalUploading(true);
      setIsUploading?.(true);

      const form = new FormData();
      form.append("file", file);

      // >>> NUEVO: carpeta destino prolija (evita "avatars/avatars/..."):
      const folder = userId ? `avatars/users/${userId}` : "avatars";
      form.append("folder", folder);

      // >>> NUEVO: path anterior para que el server lo elimine si corresponde
      if (currentAvatarPath) form.append("prevPath", currentAvatarPath);

      const res = await fetch("/api/uploads/avatar", { method: "POST", body: form });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? await res.json() : { error: await res.text() };

      if (!res.ok || (payload as any)?.error) {
        throw new Error((payload as any)?.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      // El server devuelve { ok, path, publicUrl, signedUrl, deletedOld }
      const { signedUrl, publicUrl, path } = payload as {
        signedUrl?: string;
        publicUrl?: string;
        path: string;
      };

      const finalUrl = signedUrl || publicUrl;
      if (!finalUrl) throw new Error("No se pudo obtener la URL del avatar");

      // (Opcional) Guardar el path en tu DB si querés hacerlo desde acá:
      // if (savePathInDb) {
      //   const saveRes = await fetch("/api/profile/avatar", {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ path }),
      //   });
      //   const saveJson = await (saveRes.headers.get("content-type")?.includes("json")
      //     ? saveRes.json()
      //     : saveRes.text());
      //   if (!saveRes.ok || (saveJson as any)?.error) {
      //     console.warn("[AVATAR_SAVE_WARN]", saveJson);
      //     // no cortamos, el upload ya se hizo y tenemos la URL
      //   }
      // }

      onAvatarUploaded(finalUrl);
      toast.success("¡Avatar subido con éxito!");
    } catch (error: any) {
      console.error(error);
      toast.error(formatMessage(error?.message || "Error al subir la imagen"));
    } finally {
      setLocalUploading(false);
      setIsUploading?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium text-muted-foreground">Cambiar avatar</Label>

      <div className="flex items-center gap-2">
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={localUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={localUploading}
        >
          {localUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              Seleccionar imagen
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">JPG, PNG (máx. 200KB)</p>
    </div>
  );
};
