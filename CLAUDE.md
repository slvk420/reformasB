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

- Los `.txt` (RSC payload) con entradas `7:Txxxx,` tienen longitud prefijada en hex — **nunca editar sin recalcular el prefijo** o la web queda en blanco silenciosamente. El schema JSON-LD vive en una fila de este tipo tanto en `index.html` como en `index.txt` — si se edita el schema estático, hay que sincronizar también el flight con el mismo recálculo (pasó desincronizado meses sin que nadie lo notara, porque solo se ve post-hidratación).
- Verificar siempre en el sitio live (no local) con Playwright y `--disable-cache`. Para un chequeo rápido y repetible: `npm test` desde la raíz del repo (suite de humo en `tests/smoke.js`, corre contra producción por defecto).
- Después de un push, esperar ~10 min por la caché del CDN antes de verificar. Si un archivo ELIMINADO del despliegue sigue accesible tras ese margen, no asumir un patrón de "necesita N despliegues" — es un comportamiento de la plataforma sin causa raíz identificada (ver incidente 2026-07-06 en el historial del vault); confirmar primero que el job de build no falla (hay un `assert` en el workflow que lo garantiza) antes de sospechar del código.
- Si hay pantalla en blanco tras 2 intentos fallidos: revertir al último commit bueno primero, luego diagnosticar.
- El pipeline de despliegue (`.github/workflows/deploy-pages.yml`) tiene el job dividido en `build` + `deploy`: si un despliegue falla y se reintenta, nunca vuelve a duplicar artefactos (bug real que costó 3 reintentos fallidos antes de arreglarlo). El paso "Prepare publish directory" excluye `CLAUDE.md`, `errores-y-correcciones.md` y `tests/` del contenido público — cualquier archivo nuevo de solo-trabajo-interno que se añada a la raíz del repo debe añadirse también a esa exclusión, o quedará público en producción.

### Estado actual (2026-07-06)

**Resuelto:**
- Animación ladrillo: `btoa(svg + Date.now())` → URL única por carga, sin freeze
- Branding "RSB" → "ReformasB": en el HTML visible **y** en el schema JSON-LD que indexa Google tras hidratar (antes solo en el HTML)
- Email: info@reformasb.com en toda la web y chunk config
- Año fundación: 2004 en las 5 páginas, sin inconsistencias
- /gracias/ con noindex
- Rendimiento: Home 9,4 MB → 2,26 MB en producción (−76%)
- Repo limpio: sin `servicios/` (build viejo descartado), sin capturas/scripts de debug sueltos
- Suite de tests de humo permanente (`npm test`)
- Logo definitivo (monograma RSB + rótulo "REFORMASB" en madera) integrado en cabecera y favicon (rama `branding/logo-definitivo`, pendiente de merge por Slavik)

**Pendiente:**
- Reindexación en Google Search Console (lo hace Slavik, no código)
- Google Business Profile al 100% → ver `GBP ReformasB - checklist.md` en el vault
- Páginas SEO: /reformas-cocinas-lleida/, /reformas-banos-lleida/, /reformas-fachadas-lleida/, /obra-nueva-lleida/
- Error React #418 (hydration mismatch) en Home — no fatal, tolerado explícitamente por la suite de tests, sin diagnosticar a fondo

Historial completo de todas las tandas de esta sesión (rendimiento, SEO/GEO,
limpieza, logo, testing, incidentes de CI) en el vault: ver más abajo.

<details>
<summary>Plan de pasos de la sesión 2026-07-06 (histórico, ya cerrado — ver Historial de cambios en el vault para el detalle completo)</summary>

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
**MERGEADO (2026-07-06) — incidente de plataforma SIN causa raíz confirmada,
documentado con precisión para no repetir el mismo rato de investigación:**
tras mergear, `/CLAUDE.md` seguía dando 200 en producción pese a que el
workflow excluía el archivo correctamente (verificado con `git archive HEAD`
a un directorio limpio + un `assert` que hace fallar el job si el archivo
sigue presente antes de subir el artefacto). Secuencia real de lo observado:

1. Deploy con exclusión + assert (PASA, archivo ausente del artefacto) → live
   sigue en 200.
2. Deploy siguiente (commit vacío, sin cambios) → live pasa a 404. En su momento
   esto se documentó (incorrectamente) como "GitHub Pages necesita 2 despliegues
   para purgar un archivo". **Esa conclusión era errónea.**
3. Deploy siguiente que SÍ cambiaba contenido de CLAUDE.md (misma lógica de
   exclusión, assert vuelve a PASAR) → live vuelve a dar 200, y se mantiene así
   más de 13 minutos — muy por encima de los ~10 min de caché documentados.

Es decir: ni "una vez basta", ni "hacen falta 2 despliegues concretos", ni
"es solo caché CDN" explican los 3 resultados juntos. La causa raíz real
está en la capa de despliegue/CDN de GitHub Pages, fuera de lo que se puede
diagnosticar desde este repositorio (no hay acceso a logs internos de
GitHub ni a su infraestructura). El workflow está demostrado correcto por
un assert que falla el job si algo va mal — el problema, si reaparece, no es
nuestro código.
**Lección real para el futuro:** si un archivo excluido del deploy sigue
sirviéndose, comprobar primero que el propio job de build no falla (el
assert ya lo garantiza). Si el job pasa pero el archivo sigue en producción,
es un problema de la plataforma, no del workflow — no perder tiempo
rediagnosticando esto mismo; considerar abrir un ticket a GitHub Support si
llega a importar, o simplemente esperar más tiempo sin sacar conclusiones
sobre "cuántos despliegues hacen falta" (no hay patrón fiable observado).
**Riesgo real mientras tanto:** bajo — CLAUDE.md no contiene secretos, solo
notas de trabajo; no está enlazado desde ninguna página ni en el sitemap.
**Estado al cierre de esta tanda (2026-07-06, ~14:44 UTC):**
`/CLAUDE.md` seguía en 200 pasados 13 min del último deploy — pendiente de
que se resuelva solo o de una futura revisión si Slavik quiere insistir.
Las 2 imágenes borradas en Paso D
(`sate-casa-blanca-hq.png`, `cocina-madera-negra.png`) también confirmadas
en 404 — no sufrieron el mismo problema porque tuvieron de sobra 5+ deploys
de margen desde su borrado.

**✅ Logo y favicon (MERGEADO Y VERIFICADO EN PRODUCCIÓN).** Rama
`fix/logo-favicon-branding` mergeada. Slavik preguntó por qué Google no
mostraba el favicon en resultados de búsqueda — al investigar salió algo
mucho más gordo: **el logo de cabecera de las 7 páginas**
(`_next/static/media/logo-rsb-wood-transparent.png`) seguía mostrando la
marca vieja completa ("RSB" en grande + "REFORMA SB" debajo) pese a todo el
barrido de texto de tandas anteriores — ningún cambio previo tocaba esta
imagen PNG. El favicon.svg heredaba la misma marca vieja (texto "RSB"
dibujado en el SVG).
- Causa técnica del favicon en Google: `favicon.ico` solo tenía una imagen de
  32×32 — Google exige múltiplo de 48px para mostrarlo en resultados de
  búsqueda.
- Sin logo definitivo disponible, Slavik pidió un placeholder provisional:
  logo PNG reemplazado IN-PLACE (mismo nombre/dimensiones 420×420/alpha) con
  icono de tejado simple + "ReformasB" (colores de marca ya establecidos:
  #18201d carbón, #c9842f cobre). favicon.svg: mismo icono sin texto
  (ilegible a tamaño real). favicon.ico: regenerado multi-resolución
  (16/32/48px) construido a mano, verificado byte a byte por el revisor
  (cabecera, offsets, firmas PNG, CRC32 — sin un solo byte fuera de sitio).
- Revisor: APTO. Cero archivos HTML/RSC tocados (reemplazo in-place puro) →
  cero riesgo de pantalla en blanco.
- Nota: Google puede tardar días/semanas en reflejar el favicon nuevo en
  resultados de búsqueda tras el merge (ciclo de rastreo propio, ajeno al
  código); el navegador del usuario también cachea favicons de forma agresiva.

**✅ Logo DEFINITIVO (hecho, PENDIENTE DE MERGE).** Slavik proporcionó el
logo real (`logo madera.png` en su Escritorio): monograma "RSB" + rótulo
"REFORMASB" en textura de madera/metal, sustituyendo el placeholder
provisional anterior. Rama `branding/logo-definitivo`.
- El archivo proporcionado NO tenía transparencia real: el patrón de cuadros
  "transparente" estaba pintado en los píxeles (imagen aplanada, `hasAlpha:
  false`). Se reconstruyó el canal alfa con flood-fill (BFS) desde el borde
  sobre píxeles acromáticos casi-blancos, más una segunda pasada para huecos
  interiores encerrados (la contracara de la "B"). Verificado componiendo
  sobre fondo de color antes de integrar — sin halos ni fugas.
- `logo-rsb-wood-transparent.png` reemplazado IN-PLACE (mismo nombre/420×420
  RGBA) con la imagen real ya recortada con alfa.
- `favicon.svg`: mismo icono simplificado (tejado, sin texto — ilegible a
  tamaño real), colores actualizados a los tonos reales muestreados del logo
  (`#4d4d4d` gris carbón, `#a97b4a` madera; antes `#fffdf8`/`#c9842f`).
- `favicon.ico`: regenerado desde el SVG actualizado, multi-resolución
  (16/32/48px), construido a mano igual que antes.
- Revisor: APTO. Diff quirúrgico (solo esos 3 binarios), sin archivos de
  debug colados, ICO y PNG verificados byte a byte.
- Verificado visualmente en local (Home y Contacto, servidor estático +
  Playwright) — logo nítido en cabecera oscura, sin recursos rotos nuevos.
**Abrir PR:** https://github.com/slvk420/reformasB/pull/new/branding/logo-definitivo

**✅ Paso E — Testing (hecho, PENDIENTE DE MERGE).** Rama
`test/paso-e-smoke-suite` subida: suite de humo permanente en
`tests/smoke.js` (Playwright puro, sin runner adicional). Corre con
`npm test` (contra producción) o `npm run test:local -- --base=http://...`.
Para cada una de las 7 páginas + un 404 real: status HTTP, contenido visible
(no pantalla en blanco), sin errores de consola/recursos rotos **nuevos**
(los 2 problemas conocidos y aceptados — React #418 en Home, carrera del CSS
en /gracias/ — están catalogados explícitamente para no hacer fallar la
suite por algo ya asumido), sin marca "RSB" suelta (guarda contra regresión
de marca), formulario/schema/logo presentes según corresponda. Verificado:
0 fallos contra producción real, y confirmado que el filtro de "error
conocido" hace trabajo real (el error #418 sí ocurre y sí se captura, solo
que se tolera a propósito). No añade tests unitarios: no hay código fuente,
solo el export estático.
**Revisor: NO APTO → corregido → re-verificado.** 2 hallazgos importantes:
(1) `tests/` no estaba excluido del deploy (se habría publicado en
producción, igual que le pasó a CLAUDE.md) — añadido a la exclusión y al
assert, que ahora itera una lista en vez de comprobar un solo archivo;
(2) el filtro del error #418 se aplicaba a las 7 páginas en vez de solo a
Home, pudiendo enmascarar una regresión real de hidratación en otra página
— movido a una propiedad por entrada en `PAGES` (`erroresConocidos` /
`recursosRotosConocidos`). También 2 hallazgos menores corregidos
(try/catch en el test 404, parseo de `--base=` usa la última coincidencia).
Re-verificado tras las correcciones: 0 fallos, simulación local de la
exclusión confirma `tests/`/`CLAUDE.md`/`errores-y-correcciones.md`
ausentes del staging.
**Abrir PR:** https://github.com/slvk420/reformasB/pull/new/test/paso-e-smoke-suite

**Paso F (documentación) y todos los PRs de esta sesión: cerrados.** Las 7
ramas (tanda 1, rendimiento, SEO, limpieza, logo/favicon, tests, más los
fixes de CI directos a main) están mergeadas y verificadas en producción.

Los pasos "copia de interfaces" y "feedback de usuarios" del plan original de
Slavik se descartaron: no aplican a este proyecto (no hay interfaz objetivo ni
canal de feedback).

</details>

### Regla activa: revisor antes de cada push

Pasar el agente `revisor` antes de subir cualquier rama con cambios de
código o de CI (no hace falta para cambios de solo documentación/notas). En
esta sesión detectó hallazgos reales y no triviales en 4 de las 7 tandas
(año de fundación desincronizado, favicons con ruta relativa en el payload
RSC, un `npm ci` que activaba una dependencia nueva de red en el pipeline
de deploy, y `tests/` sin excluir de la publicación). Mantener esta
práctica para cualquier cambio futuro.

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
