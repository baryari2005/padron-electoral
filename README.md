This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



## Check
 npm run typecheck
 
## Shadcn

https://ui.shadcn.com/

## Video
https://www.youtube.com/watch?v=pA4hvzs_IeI


## Arreglar errores en migrations
Regenerar prisma ```npx prisma generate```
Solución: Limpiar migraciones y resetear base de datos
1. Eliminar carpetas de node-modules / migracioness
    * Powershell: ```Remove-Item -Recurse -Force .\node_modules```
    * Powershell: ```Remove-Item .\package-lock.json```
    * Powershell: ```Remove-Item -Recurse -Force prisma\migrations```

2. Resetear la base de datos manualmente, conectar a PostgreSQL y ejecutar:

    * ```DROP SCHEMA public CASCADE;```
    * ```CREATE SCHEMA public;```

3. Recrear la migración inicial limpia
    * bash: ```npx prisma migrate dev --name init```

Esto va a:

    * Aplicar tu schema.prisma desde cero
    * Crear una migración inicial limpia
    * Evitar errores por objetos ya existentes (type, table, etc.)