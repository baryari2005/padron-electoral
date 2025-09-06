# 📌 Sistema de Padrón Electoral
Este repositorio contiene el sistema de padrón electoral.  
Aquí se documenta el flujo de trabajo con **Git**, convenciones y comandos más usados.

## 🚀 Flujo de trabajo con ramas
1. **Actualizar la rama principal (`main`):**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Crear una nueva rama a partir de (`main`):**
   ```bash
   git checkout -b feature/nombre-del-cambio
   ```
   
3. **Realizar cambios en el código:**
  Editar, agregar o eliminar archivos según sea necesario.

4. **Revisar cambios pendientes:**
    ```bash
   git status
   ```
   
5. **Agregar y commitear cambios:**
    ```bash
    git add .
    git commit -m "feat: descripción breve de los cambios"
    ```
6. **Subir la nueva rama al remoto:**
   ```bash
    git push -u origin feature/nombre-del-cambio    
   ```

## 🔄 Trabajar sobre una rama existente
**Cuando la rama ya existe en remoto:**
    
   ```bash
       git add -A
       git commit -m "fix: detalle del cambio"
       git push    
   ```

## ✅ Fusionar cambios en main
**Cuando los cambios estén listos:**
  ```bash
    # Cambiar a main y actualizar
    git checkout main
    git pull origin main

    # Fusionar la rama
    git merge feature/nombre-del-cambio

    # Subir cambios a remoto
    git push origin main
   ```


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


## Crear una nueva migracion
npx prisma migrate dev --name add-userNumber

npx prisma generate

npx prisma migrate deploy

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
git add -A
git commit -m "chore: add const route.ts auth register"

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



# Parate en la raíz del repo
cd C:\Users\Gejol\Desktop\Next\dashboard-pp

# 1) Definimos el header
$header = @'
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

'@

# 2) Recorremos todas las route.ts / route.js bajo app/api
Get-ChildItem -Path .\app\api -Recurse -File -Include route.ts,route.js | ForEach-Object {
  $p = $_.FullName
  try {
    # Usamos .NET para leer el archivo completo (evita -Raw y problemas con [ ])
    $content = [System.IO.File]::ReadAllText($p)

    if ($content -notmatch 'runtime\s*=\s*"nodejs"') {
      [System.IO.File]::WriteAllText($p, $header + $content)
      Write-Host "Patcheado: $p"
    } else {
      Write-Host "Ya tiene header: $p"
    }
  } catch {
    Write-Warning "No pude procesar: $p - $($_.Exception.Message)"
  }
}



-- Para MesaStats (join 1:1)
CREATE INDEX IF NOT EXISTS idx_padron_est_num
  ON "PadronElectoral" ("establecimientoId", "numeroMesa");

-- Para EstablecimientoStats
CREATE INDEX IF NOT EXISTS idx_padron_est ON "PadronElectoral" ("establecimientoId");
CREATE INDEX IF NOT EXISTS idx_mesas_est   ON "MesasPorEstablecimiento" ("establecimientoId");

-- Para CircuitoStats
CREATE INDEX IF NOT EXISTS idx_padron_circ ON "PadronElectoral" ("circuitoId");
CREATE INDEX IF NOT EXISTS idx_estab_circ  ON "Establecimiento" ("circuitoId");