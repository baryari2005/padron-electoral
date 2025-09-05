// src/features/users/components/RolePasswordAvatar.tsx
"use client";
import { Control } from "react-hook-form";
import { FormAvatarUploader } from "@/app/(dashboard)/components/FormsCreate";
import { RoleSelect } from "@/app/(dashboard)/users/components/UserForm/fields/RoleSelect";
import { PasswordField } from "@/app/(dashboard)/users/components/UserForm/fields/PasswordField";

type Props<T extends { rolId: number; avatarUrl: string; nombre: string }> = {
  control: Control<T>;
  isEdit: boolean;
  watch: (name: keyof T) => any;
  setValue: (name: keyof T, value: any, opts?: any) => void;
  roles: any[];
};

export function RolePasswordAvatar<T extends { rolId: number; avatarUrl: string; nombre: string }>(
  { control, isEdit, watch, setValue, roles }: Props<T>
) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RoleSelect control={control as any} name={"rolId" as any} roles={roles} />
      <PasswordField control={control as any} name={"password" as any} isEdit={isEdit} />
      <FormAvatarUploader
        name={watch("nombre") as string}
        avatarUrl={watch("avatarUrl") as string}
        onAvatarUploaded={(url) => setValue("avatarUrl" as any, url, { shouldValidate: true })}
        isUploading={false}
        setIsUploading={() => {}}
      />
    </div>
  );
}
