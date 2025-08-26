1. Ver en qué branch estás ahora mismo
git branch


👉 Te va a listar las ramas locales y marcar con * la rama actual.
Ejemplo:

* feature/nuevos-cambios
  backup-branch
  main

2. Ver ramas locales y remotas al mismo tiempo
git branch -a


Ejemplo de salida:

  backup-branch
* feature/nuevos-cambios
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/backup-branch
  remotes/origin/feature/nuevos-cambios
  remotes/origin/main

3. Ver estado de commits (qué subiste y qué no)
git status