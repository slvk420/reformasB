// Suite de humo permanente — reformasb.com
//
// Uso:
//   node tests/smoke.js                  (contra producción, por defecto)
//   node tests/smoke.js --base=http://localhost:8080
//
// Comprueba, para cada página: status HTTP, ausencia de errores de consola
// y recursos rotos NO catalogados como conocidos, marca correcta (sin "RSB"
// suelto) y elementos clave presentes. Pensada para correr tras cada deploy,
// no como sustituto de la verificación manual en casos delicados (RSC/flight).

const { chromium } = require('playwright');

// Última coincidencia (no la primera): permite sobreescribir el --base= fijo
// de "npm run test:local" pasando otro con "-- --base=...".
const baseArgs = process.argv.filter(a => a.startsWith('--base='));
const BASE = (baseArgs[baseArgs.length - 1] || '--base=https://www.reformasb.com').split('=')[1];

// Problemas conocidos y ya aceptados (ver CLAUDE.md), catalogados POR PÁGINA
// para no enmascarar la misma regresión si empezara a ocurrir en otra página
// donde hoy no pasa. Si aparece algo NUEVO fuera de esta lista, debe fallar.
const PAGES = [
  { path: '/', nombre: 'Home', esperaFormulario: true, jsonLd: true, erroresConocidos: [/Minified React error #418/] },
  { path: '/contacto/', nombre: 'Contacto', esperaFormulario: false, jsonLd: true },
  { path: '/mas-servicios/', nombre: 'Más servicios', esperaFormulario: false, jsonLd: true },
  { path: '/aviso-legal/', nombre: 'Aviso legal', esperaFormulario: false, jsonLd: true },
  { path: '/privacidad/', nombre: 'Privacidad', esperaFormulario: false, jsonLd: true },
  { path: '/gracias/', nombre: 'Gracias', esperaFormulario: false, jsonLd: false, noindex: true, recursosRotosConocidos: [/\/gracias\/_next\/static\/css\/[a-f0-9]+\.css/] },
  { path: '/blog/', nombre: 'Blog (índice)', esperaFormulario: false, jsonLd: true },
  { path: '/blog/aislamiento-termico-sate-ahorro-ayudas/', nombre: 'Blog: SATE', esperaFormulario: false, jsonLd: true },
  { path: '/blog/cuanto-cuesta-reformar-piso-2026/', nombre: 'Blog: precios 2026', esperaFormulario: false, jsonLd: true },
  { path: '/blog/reformas-que-revalorizan-tu-vivienda/', nombre: 'Blog: revalorización', esperaFormulario: false, jsonLd: true },
  { path: '/blog/reformar-en-verano-ventajas/', nombre: 'Blog: reformar en verano', esperaFormulario: false, jsonLd: true },
  { path: '/blog/aerotermia-suelo-radiante-reforma/', nombre: 'Blog: aerotermia', esperaFormulario: false, jsonLd: true },
];

let fallos = 0;
const chk = (etiqueta, ok, detalle) => {
  console.log((ok ? '  OK  ' : '  FALLO') + '  ' + etiqueta + (detalle ? ' — ' + detalle : ''));
  if (!ok) fallos++;
};

function esConocido(lista, texto) {
  return lista.some(re => re.test(texto));
}

async function testPagina(browser, { path, nombre, esperaFormulario, jsonLd, noindex, erroresConocidos = [], recursosRotosConocidos = [] }) {
  console.log('\n== ' + nombre + ' (' + path + ') ==');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [], brokenRes = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) brokenRes.push(r.status() + ' ' + r.url()); });

  let status = null;
  try {
    const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
    status = resp ? resp.status() : null;
    await page.waitForTimeout(2500);
  } catch (e) {
    chk('página carga', false, String(e).slice(0, 100));
    await page.close();
    return;
  }

  chk('status 200', status === 200, 'recibido ' + status);

  const bodyVisible = await page.evaluate(() => document.body && document.body.innerText.trim().length > 50);
  chk('contenido visible (no pantalla en blanco)', bodyVisible);

  const nuevosErrores = pageErrors.filter(e => !esConocido(erroresConocidos, e));
  chk('sin errores de página nuevos', nuevosErrores.length === 0, nuevosErrores.join(' | '));

  const nuevosRotos = brokenRes.filter(u => !esConocido(recursosRotosConocidos, u));
  chk('sin recursos rotos nuevos', nuevosRotos.length === 0, nuevosRotos.join(' | '));

  const marcaVieja = await page.evaluate(() => {
    const texto = document.body.innerText;
    // "RSB" aislado (no dentro de "ReformasB"); permite el monograma decorativo del hero
    return (texto.match(/\bRSB\b/g) || []).filter(() => true).length;
  });
  chk('sin marca vieja "RSB" suelta en el texto visible', marcaVieja === 0, marcaVieja + ' ocurrencias');

  if (esperaFormulario) {
    const hayForm = await page.locator('form').count() > 0;
    chk('formulario presente', hayForm);
  }

  if (jsonLd) {
    const hayJsonLd = await page.evaluate(() => !!document.querySelector('script[type="application/ld+json"]'))
      || await page.evaluate(() => !!document.getElementById('rsb-contact-schema'));
    chk('schema JSON-LD presente', hayJsonLd);
  }

  if (noindex) {
    const robotsNoindex = await page.evaluate(() => {
      const m = document.querySelector('meta[name="robots"]');
      return m && /noindex/.test(m.content);
    });
    chk('meta robots noindex presente', robotsNoindex);
  }

  const logoVisible = await page.locator('img[src*="logo"]').first().isVisible().catch(() => false);
  chk('logo de cabecera visible', logoVisible);

  await page.close();
}

async function test404(browser) {
  console.log('\n== 404 (ruta inexistente) ==');
  const page = await browser.newPage();
  const brokenRes = [];
  page.on('response', r => { if (r.status() >= 400) brokenRes.push(r.status() + ' ' + r.url()); });
  const ruta = '/smoke-test-ruta-inexistente-' + Date.now() + '/';
  try {
    const resp = await page.goto(BASE + ruta, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(2000);
    chk('status 404', resp.status() === 404, 'recibido ' + resp.status());
    const nuevosRotos = brokenRes.filter(u => !u.includes(ruta));
    chk('página 404 sin recursos rotos propios', nuevosRotos.length === 0, nuevosRotos.join(' | '));
    const marcaCorrecta = await page.evaluate(() => document.title.includes('ReformasB') && !document.title.includes('| RSB'));
    chk('marca correcta en página 404', marcaCorrecta, await page.title());
  } catch (e) {
    chk('página 404 carga', false, String(e).slice(0, 100));
  }
  await page.close();
}

(async () => {
  console.log('Suite de humo — base: ' + BASE);
  const browser = await chromium.launch({ headless: true });
  for (const p of PAGES) await testPagina(browser, p);
  await test404(browser);
  await browser.close();

  console.log('\n' + '='.repeat(40));
  if (fallos === 0) {
    console.log('TODO VERDE — 0 fallos');
    process.exit(0);
  } else {
    console.log('HAY ' + fallos + ' FALLO(S)');
    process.exit(1);
  }
})();
