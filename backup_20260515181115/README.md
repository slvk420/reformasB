reformasB — Demo para publicar

Este repositorio contiene los archivos y el workflow para desplegar una demo de tu sitio en GitHub Pages.

Pasos rápidos:

1. Copia los archivos de tu proyecto (la carpeta que sirve en http://localhost:3001) dentro de este directorio.
2. Abre terminal aquí y ejecuta los comandos del script `publish.sh` o sigue las instrucciones en `push_instructions.txt`.

La Actions de GitHub detecta si existe `package.json` y ejecuta `npm run build` (si existe). Publicará la carpeta `dist`, `build`, `public` o la raíz del repo según corresponda.

Demo URL esperada: https://slvk420.github.io/reformasB/ (tardará unos minutos en activarse después del primer push)

Si quieres que haga el push por ti desde aquí, necesito un token o que ejecutes el script `publish.sh` en tu máquina (se requiere `gh` autenticado para crear el repo automáticamente).
