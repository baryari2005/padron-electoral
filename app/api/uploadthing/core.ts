import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {
      // Podés agregar logs o lógica extra acá si querés
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
