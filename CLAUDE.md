# CLAUDE.md — Proyecto ReformasB (web reformas)

## Quién soy

Me llamo Slavik. Me dedico a resolver problemas reales a empresas usando tecnología: webs, automatizaciones, IA y lo que haga falta.

- **Servicio propio**: webs, automatizaciones con n8n, IA aplicada a pymes.
- **UX/Band (ux.band)**: soy jefe comercial. Si el proyecto es grande, lo derivo allí.

## Cómo quiero que me hables

- Español de España, directo e informal, sin tecnicismos innecesarios.
- Conciso por defecto. Si necesito profundidad, lo pido.
- Práctico y estratégico a la vez.

---

## Proyecto: ReformasB — web reformas

**Cliente:** ReformasB — Reformas integrales en Lleida
**Web en producción:** https://www.reformasb.com
**Email:** info@reformasb.com
**Notas completas en Obsidian:** `C:\Users\slk\Desktop\brainX\brainX´s\proyectos\ReformasB - Web y SEO.md`

### Tecnología

- Next.js exportado como HTML estático → GitHub Pages
- Dominio propio vía CNAME (migrado de reformasb.es a reformasb.com el 2026-06-17)
- CDN cache: max-age=600 (10 min tras cada push)
- Páginas: Home, Contacto, Más servicios, Aviso legal, Privacidad, Gracias

### Archivos críticos

| Archivo | Función |
|---------|---------|
| `_next/static/chunks/594-b44fecec74642f83.js` | Config maestra: nombre, email, URL, año fundación |
| `mas-servicios/index.html` | Página + script animación ladrillo |
| `contacto/index.html` | Página + script animación ladrillo |
| `aviso-legal/index.html` + `index.txt` | RSC inline + payload |
| `privacidad/index.html` + `index.txt` | RSC inline + payload |

### Reglas técnicas importantes

- Los `.txt` (RSC payload) con entradas `7:Txxxx,` tienen longitud prefijada en hex — **nunca editar sin recalcular el prefijo** o la web queda en blanco silenciosamente.
- Verificar siempre en el sitio live (no local) con Playwright y `--disable-cache`.
- Después de un push, esperar ~10 min por la caché del CDN antes de verificar.
- Si hay pantalla en blanco tras 2 intentos fallidos: revertir al último commit bueno primero, luego diagnosticar.

### Estado actual (2026-07-06)

**Resuelto:**
- Animación ladrillo: `btoa(svg + Date.now())` → URL única por carga, sin freeze
- Branding: "RSB" → "ReformasB" en toda la web y chunk config
- Email: info@reformasb.com en toda la web y chunk config
- Año fundación: 2004 en toda la web
- /gracias/ con noindex

**Pendiente:**
- Reindexación en Google Search Console (lo hace Slavik, no código)
- Google Business Profile al 100% → ver `inbox/GBP ReformasB - checklist.md` en el vault
- Páginas SEO: /reformas-cocinas-lleida/, /reformas-banos-lleida/, /reformas-fachadas-lleida/, /obra-nueva-lleida/

### Plan de pasos en curso (sesión 2026-07-06, retomar aquí)

Slavik pidió ejecutar una serie de auditorías/mejoras paso a paso (documentación,
rendimiento, logs, testing, SEO, evaluación, limpieza, revisión multi-agente).
Estado:

**✅ Paso A — Evaluación en vivo (hecho).** Auditoría Playwright de todas las
páginas de producción. Hallazgos clave:
- Home pesa **9,6 MB / 4,3 s load / 34 requests** (resto de páginas: 0,4–2 MB, bien).
- Error React #418 (hydration mismatch) en Home — no fatal hoy, misma familia
  que ERR-001; diagnosticar en rama antes de tocar HTML de Home.
- H1 de Home lee "construccionesque" (dos `<span>` sin espacio) — solo afecta a
  SEO/lectores; tocarlo implica zona RSC, evaluar en paso SEO.
- `/gracias/` conserva marca vieja: título "Solicitud recibida | RSB" + meta
  "RSB ReformasB" + un CSS con ruta relativa que da 404 silencioso (tanda 2).
- `/contacto/` sin JSON-LD (las demás sí tienen) y sin formulario (el form está
  en la Home; confirmar con Slavik que es diseño).
- El comparador antes/después visible está SOLO en /mas-servicios/ (versión CSS
  de local-fix.js) y funciona. El WebGL de la Home es código muerto que
  local-fix.js elimina, pero precarga texturas igualmente (despues.png 531 KB
  descarga muerta en cada visita → candidato de optimización).
- Carpeta `servicios/` del repo = build viejo sin trackear (marca RSB, mojibake),
  nunca desplegado → borrar en limpieza (Paso D).

**✅ Tanda 1 de arreglos (MERGEADA Y VERIFICADA EN VIVO, PR #2).**
antes.png añadido + 404.html reparado (doble codificación UTF-8, 15×
RSB→ReformasB, rutas absolutas HTML+RSC). Verificado en producción 2026-07-06:
404 con marca nueva, acentos correctos, CSS ok, 0 recursos rotos.

**✅ Paso B — Rendimiento (MERGEADO Y VERIFICADO EN VIVO, PR #1).**
Home **9,4 MB → 2,26 MB en producción (−76 %)**, 0 peticiones rotas. 6 imágenes
recomprimidas in-place + 2 swaps a .webp en local-fix.js. Revisor: APTO.
Notas del revisor para el futuro: (1) el cache-buster `?v=` de local-fix.js en
los HTML debe bumpearse ANTES de borrar los .png viejos sin referencia en la
limpieza del Paso D; (2) las texturas muertas despues.png (194 KB) + antes.png
(177 KB) siguen descargándose en cada visita de Home por el componente WebGL
muerto — quitar su preload requiere tocar HTML/chunk (riesgo RSC), evaluar
con calma; (3) el error React #418 en Home sigue ahí (pre-existente).

**✅ Paso C fase 1 — SEO/GEO (hecho, PENDIENTE DE MERGE, PR aún no abierto).**
Rama `seo/paso-c-fase1` subida, 4 commits:
- Schema JSON-LD: el flight servía a Google (post-hidratación) datos viejos —
  marca RSB, foundingDate 2017, 4 URLs de servicios muertas. Sincronizado byte
  a byte con el schema estático (recálculo del prefijo hex de la fila T:
  a13→473). Verificado con VM real de Node que el flight sigue siendo JS válido.
- H1 de Home: espacio añadido ("construccionesque" → "construcciones que").
- Barrido final de marca RSB→ReformasB (metas, footer, copyright, WhatsApp,
  email, kicker) en las 5 páginas, HTML+flight sincronizados.
- `/gracias/`: doble codificación UTF-8 reparada.
- ContactPage JSON-LD inyectado en `/contacto/` vía local-fix.js (post-load,
  sin riesgo RSC). `llms.txt` nuevo (GEO). sitemap.xml lastmod actualizado.
- **Hallazgo del revisor corregido:** año de fundación inconsistente (2004 vs
  2017 según la página); en mas-servicios y gracias había discrepancia real
  HTML↔flight. Sincronizado a 2004 en las 5 páginas, verificado 0 ocurrencias
  de "2017" restantes.
Revisor: APTO. Verificado con suite local: 21/23 checks (los 2 fallos son
preexistentes y ajenos: error React #418 en Home, carrera cosmética del CSS
en /gracias/ — ambos ya documentados, no introducidos por esta rama).
**MERGEADO Y VERIFICADO EN PRODUCCIÓN (2026-07-06):** año 2004 consistente en
las 5 páginas, schema post-hidratación correcto, H1 y ContactPage ok, llms.txt
publicado (200).

**Incidente de CI resuelto (2026-07-06):** el primer intento de deploy de este
merge falló ("Multiple artifacts named github-pages") porque build+upload+
deploy vivían en un solo job — cada "Re-run failed jobs" repetía el Upload y
acumulaba artefactos duplicados (llegó a 3). Arreglado de raíz en
`.github/workflows/deploy-pages.yml`: dividido en job `build` (checkout, npm,
upload) + job `deploy` (solo deploy-pages, needs: build) — patrón oficial de
GitHub. Pusheado directo a main (no toca páginas, solo CI). Si un futuro
deploy falla, reintentar ahora es seguro: no puede volver a duplicar artefactos.

**Pendiente dentro de Paso C (fase 2, no bloqueante):**
- 8 imágenes sin `alt` en Home (process-1..4, hero-*, logo).
- Páginas SEO locales nuevas: /reformas-cocinas-lleida/, /reformas-banos-lleida/,
  /reformas-fachadas-lleida/, /obra-nueva-lleida/ (contenido nuevo, no un fix).
- robots.txt: confirmar que no bloquea OAI-SearchBot ni otros bots de IA
  (hoy es `Allow: /` genérico, probablemente ya vale — revisar con calma).

**✅ Paso D — Limpieza (hecho, PENDIENTE DE MERGE).** Rama
`chore/paso-d-limpieza` subida, 3 commits:
- Borrados: `servicios/` (build viejo, nunca trackeado ni desplegado) + ~45
  capturas/scripts sueltos de sesiones de debug anteriores (sin trackear).
- Borrados (trackeados): `sate-casa-blanca-hq.png` + `cocina-madera-negra.png`
  (3,7 MB), sin ninguna referencia desde el swap a `.webp` del Paso B.
- Recuperados a git (llevaban tiempo sin trackear, riesgo de perderse en un
  clon nuevo): `CLAUDE.md`, `errores-y-correcciones.md`, `package.json` +
  `package-lock.json` (playwright+sharp, las herramientas usadas para
  verificar/optimizar la web en las últimas tandas).
- `.gitignore`: `node_modules/` + patrones de capturas/scripts ad-hoc.
- Cache-buster de `local-fix.js` actualizado (`fix36-20260626`→`fix37-20260706`).
- **Incidente propio durante esta tanda:** un `;` en vez de `&&` en un comando
  encadenado hizo que un `git reset --soft` se ejecutara sin condición y la
  rama se crease accidentalmente desde un punto anterior al fix de CI del
  Paso B/C — el revisor lo detectó (diff mostraba `deploy-pages.yml` como
  "cambiado" en el PR aunque el contenido era idéntico a main). Corregido con
  `git rebase main`.
- **Hallazgo real del revisor:** trackear `package.json` activa `npm ci` por
  primera vez en el pipeline de deploy — antes era no-op total. Como
  playwright/sharp son solo herramientas de verificación local (0 imports en
  código servido), se añadió `--omit=dev` para que siga siendo no-op y no
  introduzca un nuevo punto de fallo (un blip del registro de npm bloqueando
  el deploy de un cambio de contenido sin relación). `package.json` marcado
  `private: true`.
Nota pendiente (no bloqueante): 1 chunk JS con BOM preexistente
(`_next/static/chunks/app/page-9a3c77278ed89762.js`) — bundle de build, se
deja así por ahora.
**Encontrado al preguntar Slavik "¿cambiará algo visual?":** trackear
CLAUDE.md/errores-y-correcciones.md los habría publicado por primera vez en
www.reformasb.com/CLAUDE.md (GH Pages sirve todo el repo salvo `.git`/`.github`,
confirmado con curl en producción — esto sí está excluido siempre, sin relación
con el contenido). Arreglado: paso nuevo en el workflow que borra ambos
archivos del checkout efímero del runner justo antes de publicar — siguen
versionados en git para el equipo, pero no se sirven públicamente.
**Abrir PR:** https://github.com/slvk420/reformasB/pull/new/chore/paso-d-limpieza
- **Paso E — Testing:** suite Playwright de humo permanente (todas las páginas:
  status, consola limpia, recursos 200, form presente) para correr antes de
  cada merge. No hay código fuente (solo build), tests unitarios no aplican.
- **Paso F — Documentación:** actualizar este archivo + notas del vault al
  cerrar cada tanda (usar agente archivista).
- **Regla activa (paso G):** pasar agente `revisor` antes de cada push. En
  tanda 1 detectó 1 hallazgo importante real. Mantener.

Los pasos "copia de interfaces" y "feedback de usuarios" del plan original de
Slavik se descartaron: no aplican a este proyecto (no hay interfaz objetivo ni
canal de feedback).

### Historial completo

Ver: `C:\Users\slk\Desktop\brainX\brainX´s\proyectos\ReformasB - Historial de cambios.md`

---

## Al empezar cada sesión

Si Slavik dice "lee el contexto antes de empezar", leer:
1. Este archivo (ya cargado automáticamente)
2. `proyectos/ReformasB - Web y SEO.md` en el vault para el estado más reciente

## Al terminar cambios importantes

Actualizar las notas del vault en Obsidian:
- `proyectos/ReformasB - Web y SEO.md` → estado actual y pendientes
- `proyectos/ReformasB - Historial de cambios.md` → añadir entrada con fecha
