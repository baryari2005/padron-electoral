// src/features/users/components/UserBasicsFields.tsx
"use client";
import { FormTextField } from "@/app/(dashboard)/components/FormsCreate";
import { Control, FieldPath, FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  isEdit: boolean;
};

export function UserBasicsFields<T extends FieldValues>({ control, isEdit }: Props<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {!isEdit && (
        <FormTextField control={control} name={"userId" as FieldPath<T>} label="User Id" placeholder="id..."/>
      )}
      <FormTextField control={control} name={"email" as FieldPath<T>} label="Email" placeholder="Email..." type="email"/>
      <FormTextField control={control} name={"nombre" as FieldPath<T>} label="Nombre" placeholder="Nombre..." uppercase/>
      <FormTextField control={control} name={"apellido" as FieldPath<T>} label="Apellido" placeholder="Apellido..." uppercase/>
    </div>
  );
}
