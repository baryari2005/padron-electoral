"use client";

import { useRef, useState } from "react";
import { useUploadThing } from "@/utils/uploadthingClient";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface AvatarUploaderProps {
  onAvatarUploaded: (url: string) => void;
  setIsUploading?: (value: boolean) => void;
}

export const AvatarUploader = ({ onAvatarUploaded, setIsUploading }: AvatarUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("profileImage");
  const [localUploading, setLocalUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 200 * 1024;

    if (file.size > maxSize) {
      toast.error("La imagen es demasiado grande (máx. 200KB)");
      return;
    }

    try {
      setLocalUploading(true);
      setIsUploading?.(true);

      const res = await startUpload([file]);
      if (res && res.length > 0) {
        const url = res[0].ufsUrl;
        onAvatarUploaded(url);
        toast.success("¡Avatar subido con éxito!");
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setLocalUploading(false);
      setIsUploading?.(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium text-muted-foreground">
        Cambiar avatar
      </Label>

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

      <p className="text-xs text-muted-foreground">
        JPG, PNG (máx. 200KB)
      </p>
    </div>
  );
};
