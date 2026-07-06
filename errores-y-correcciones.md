---
tags: [reformasb, errores, correcciones, devlog]
created: 2026-06-23
project: reformasb.com
---

# Errores y Correcciones — reformasb.com

Registro de errores reales ocurridos en producción, su causa raíz y cómo se corrigieron. Para no repetirlos.

---

## ERR-001 — Pantalla en blanco tras commit `b3814db` (22 jun 2026)

**Síntoma:** `www.reformasb.com` mostraba pantalla blanca completa tras un push.

**Commits implicados:**
- `b3814db` — "SEO + perf: defer JS, fix schema URLs, WebP images" → **causante**
- `47d7be7` — intento de fix BOM → falló (reintrodujo `defer`)
- `52facec` — intento de fix hidratación → falló (análisis incompleto)
- `85e65c7` — **fix real**: revert completo a `ba6c574`

**Causa raíz:** El commit `b3814db` añadió texto plano a `<p class="hero-description">` sin los elementos `<br>` que el RSC payload de React esperaba. Esa discrepancia estructural rompió la hidratación de React en producción → pantalla en blanco.

**Agravante:** El commit de "fix" (`47d7be7`) corrigió el BOM pero devolvió el atributo `defer` a `local-fix.js`, manteniendo el error.

**Lección aprendida:**
> Cuando la web muestra pantalla en blanco y hay 2+ intentos de parche fallidos: **revert completo** a `git checkout <sha-bueno> -- file1 file2 ...`, verificar identidad byte a byte, commit y push. **No parchear encima de un estado roto.**

**Comando correcto:**
```bash
git checkout ba6c574 -- index.html contacto/index.html mas-servicios/index.html rsb-fixes.css sitemap.xml .gitignore
git commit -m "Revert: restore exact <sha> state"
git push origin main
```

---

## ERR-002 — Franja blanca derecha en sección "Confianza sin rodeos" (contacto)

**Síntoma:** La sección oscura `rsb-contact-trust` (fondo `#101714`) dejaba una franja blanca de ~17px en el lado derecho de la pantalla.

**Causa raíz:** El `body` tiene `overflow-x: hidden` y su ancho es `viewport - scrollbar`. La sección oscura llenaba el `body` correctamente, pero el área del scrollbar (~17px) mostraba el fondo del elemento `html` que era `#fffdf8` (crema/blanco).

**Fix aplicado en `rsb-fixes.css`:**
```css
/* html background visible en el área del scrollbar — ponerlo oscuro */
html:has(body.contact-page) {
  background-color: #101714;
}
```

**Lección aprendida:**
> Cuando una sección full-width tiene una franja del color del fondo general en el borde derecho, el culpable suele ser el área del scrollbar. El `body` es más estrecho que `html` por el ancho del scrollbar. La solución es poner el `background-color` en `html` igual al color de esa sección.

---

## Reglas generales de este proyecto

- **No usar `defer` en `local-fix.js`** — es render-blocking por diseño. Con `defer` cambia el orden de ejecución respecto a la hidratación de React y puede provocar comportamientos inesperados.
- **No añadir texto a `hero-description` en el HTML estático** — el RSC payload de React define la estructura interna de ese elemento. El JS (`local-fix.js`) lo rellena en runtime.
- **Antes de cualquier push con cambios en HTML** — verificar que no hay BOM (`first bytes !== efbbbf`) y que los elementos que React hidrata mantienen la estructura del RSC payload.
- **Fix primero, análisis después** — si la web está en blanco, restaurar el último estado bueno. El análisis de causa raíz se hace en rama separada.
- **El sitio es un export estático de Next.js App Router** — cualquier discrepancia entre el HTML estático y el RSC payload puede causar fallo de hidratación en producción (modo silencioso, sin error visible).

---

## Commits clave de referencia

| SHA | Descripción | Estado |
|-----|-------------|--------|
| `ba6c574` | Keep 2-col grid on slide 5 (ux49) | ✅ Último bueno antes del 22 jun |
| `ff075e1` | Fix contact page trust full width | ✅ Solo CSS, inocuo |
| `b3814db` | SEO + perf changes | ❌ Rompió la web |
| `47d7be7` | Fix BOM (pero reintrodujo defer) | ❌ No resolvió |
| `85e65c7` | Revert completo a ba6c574 | ✅ Fix real |
