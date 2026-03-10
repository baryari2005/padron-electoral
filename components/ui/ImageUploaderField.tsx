"use client";

import { Label } from "@/components/ui/label";
import { FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
  name: string;
  label: string;
  form: UseFormReturn<any>;
  maxSizeKB?: number;
  onImageUploaded?: (url: string) => void;
};

export const ImageUploaderField = ({
  name,
  label,
  form,
  maxSizeKB = 200,
  onImageUploaded,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = maxSizeKB * 1024;

    if (file.size > maxSize) {
      toast.error(`La imagen supera los ${maxSizeKB}KB permitidos`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error("Invalid response");
      }

      form.setValue(name, data.url, {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success("¡Imagen subida correctamente!");

      if (onImageUploaded) {
        onImageUploaded(data.url);
      }
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={name}>{label}</Label>

      <label
        htmlFor={`${name}-input`}
        className="underline text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
      >
        {uploading ? "Subiendo..." : "Seleccionar imagen"}
      </label>

      <input
        ref={inputRef}
        id={`${name}-input`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <FormControl>
        <Input
          value={form.watch(name) ?? ""}
          readOnly
          className="bg-slate-100 text-muted-foreground"
        />
      </FormControl>

      <p className="text-xs text-muted-foreground">
        JPG, PNG (máx. {maxSizeKB}KB)
      </p>

      <FormMessage />
    </div>
  );
};