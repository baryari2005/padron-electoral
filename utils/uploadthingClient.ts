// utils/uploadthingClient.ts
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ✅ Generar los helpers solo una vez
const helpers = generateReactHelpers<OurFileRouter>();

export const { useUploadThing, uploadFiles } = helpers;