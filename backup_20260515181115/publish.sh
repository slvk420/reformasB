#!/usr/bin/env bash
set -e
REPO="reformasB"
USER="slvk420"

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Demo: publicar sitio reformasB"
fi

if command -v gh >/dev/null 2>&1; then
  gh repo create $USER/$REPO --public --source=. --push || (git remote add origin https://github.com/$USER/$REPO.git && git push -u origin main)
  echo "Repositorio creado y push realizado."
  echo "La Pages URL será: https://$USER.github.io/$REPO/"
else
  echo "gh CLI no encontrado. Usa los comandos en push_instructions.txt"
fi
