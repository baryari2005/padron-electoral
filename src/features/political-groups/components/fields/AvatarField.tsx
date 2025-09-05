"use client";


import Image from "next/image";
import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormAvatarUploader } from "@/app/(dashboard)/components/FormsCreate";


export function AvatarField<T extends Record<string, any>>({
    control,
    nameWatcher,
    readOnly,
    isUploading,
    setIsUploading,
}: {
    control: Control<T>;
    nameWatcher: string; // form.watch("nombre")
    readOnly?: boolean;
    isUploading: boolean;
    setIsUploading: (v: boolean) => void;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium invisible md:visible">Cambiar avatar</Label>
            <Controller
                control={control}
                name={"profileImage" as any}
                render={({ field }) =>
                    !readOnly ? (
                        <FormAvatarUploader
                            name={nameWatcher}
                            avatarUrl={field.value}
                            onAvatarUploaded={(url) => field.onChange(url)}
                            isUploading={isUploading}
                            setIsUploading={setIsUploading}
                        />
                    ) : (
                        <Image
                            src={field.value || "/placeholder.svg"}
                            alt="Avatar"
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full border object-cover"
                        />
                    )
                }
            />
        </div>
    );
}