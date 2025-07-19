"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AvatarUploader } from "@/components/Settings/AvatarUploader";
import { Loader2 } from "lucide-react";

interface Props {
  name: string;
  avatarUrl?: string;
  onAvatarUploaded: (url: string) => void;
  isUploading?: boolean;
  setIsUploading?: (loading: boolean) => void;
}

export function FormAvatarUploader({
  name,
  avatarUrl,
  onAvatarUploaded,
  isUploading = false,
  setIsUploading,
}: Props) {
  return (
    <>
      <Separator className="my-4" />
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name
                )}&background=0d9488&color=fff&rounded=true`
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
        />
      </div>
      <Separator className="my-4" />
    </>
  );
}
