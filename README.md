# Descripción



## Correr en dev


1. Clonar el repositorio.
2. Crear una copia del ```.env.template``` y renombrarlo a ```.env``` y cambiar las variables de entorno.
3. Instalar dependencias ```npm install```
4. Actualizar dependecias next-auth ```npm i next-auth@beta```
5. Instalar regenerar prisma ```npx prisma generate```
6. Levantar la base de datos ```docker compose up -d```
5. Correr las migraciones de Primsa ```npx prisma migrate dev```
6. Ejecutar seed ```npm run seed```
7. Correr el proyecto ```npm run dev```




## Correr en prod


## Arreglar errores en migrations
Regenerar prisma ```npx prisma generate```
Solución: Limpiar migraciones y resetear base de datos
1. Eliminar carpetas de node-modules / migraciones
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


## Correr Migraciones desde cero
 1. Eliminar las migraciones anteriores
 ```Remove-Item -Recurse -Force .\prisma\migrations```

2. (Opcional) Resetear la base de datos
* ```npm install prisma@latest --save-dev```
* ```npx prisma migrate reset```

3. Crear nueva migración init
* ```npx prisma migrate dev --name init```



# 1) Ver que el commit señalado existe y tocó .env (opcional, para ver)
git show --name-only 6ed957ca4a8a57565655f376f7bb80c58666aab2

# 2) Si ese es tu último commit, simplemente amend sin .env:
git rm --cached .env                 # deja .env en disco pero lo saca del commit
echo ".env" >> .gitignore            # asegúrate de ignorarlo
git add .gitignore
git commit --amend --no-edit         # reescribe el último commit sin .env

# 3) Si NO era el último commit (hay commits encima):
#    rebase interactivo y "drop" ese commit
#    (se abrirá un editor; marcá 6ed957… como 'drop' y guardá)
# git rebase -i origin/main

# 4) Antes de pushear, chequeá que no haya claves
git grep -n "sk_live_" || echo "✔️ no Stripe live keys found"
git grep -n "sk_test_" || echo "✔️ no Stripe test keys found"

# 5) Push
git push origin main