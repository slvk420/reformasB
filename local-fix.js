(function () {
  var isFile = window.location.protocol === "file:";
  var isGithubPages =
    window.location.hostname === "slvk420.github.io" &&
    window.location.pathname.indexOf("/reformasB") === 0;

  var isSubpage = /\/(?:contacto|mas-servicios)\//.test(window.location.pathname.replace(/\\/g, "/"));
  var rootUrl = isGithubPages
    ? new URL("/reformasB/", window.location.origin)
    : new URL(isSubpage ? "../" : "./", window.location.href);

  document.documentElement.classList.add("rsb-skip-intro");

  function rootPath(path) {
    return new URL(path, rootUrl).href;
  }

  function normalizeAsset(value) {
    if (!value) return value;
    var clean = value
      .replace(/^file:\/\/\/[A-Z]:\/reformasB\//i, "")
      .replace(/^\/reformasB\//, "")
      .replace(/^\/reformas\//, "reformas/")
      .replace(/^\/_next\//, "_next/");

    if (/^(?:https?:|data:|blob:|mailto:|tel:|#)/i.test(clean)) return value;
    if (/^(?:reformas|_next)\//.test(clean)) return rootPath(clean);
    return value;
  }

  function normalizeInternalHref(href) {
    if (!href) return href;
    try {
      var url = new URL(href, window.location.href);
      if (isGithubPages && url.origin === window.location.origin && url.pathname.indexOf("/reformasB/") === 0) {
        return url.pathname.slice("/reformasB/".length) + url.search + url.hash;
      }
      if (isGithubPages && url.origin === window.location.origin && url.pathname === "/reformasB") {
        return url.search + url.hash || "/";
      }
    } catch (error) {
      return href;
    }
    return href;
  }

  function fixAssets() {
    document.querySelectorAll("img").forEach(function (img) {
      var src = normalizeAsset(img.getAttribute("src"));
      if (src && src !== img.getAttribute("src")) img.setAttribute("src", src);
      if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    });

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = normalizeInternalHref(link.getAttribute("href"));
      if (!href) return;
      if (href === "mas-servicios/" || href === "/mas-servicios" || href === "/mas-servicios/" || href.indexOf("/reformasB/mas-servicios") === 0) {
        link.setAttribute("href", rootPath("mas-servicios/"));
      }
      if (href === "contacto/" || href.indexOf("/reformasB/contacto") === 0 || href === "/contacto" || href === "/contacto/") {
        link.setAttribute("href", rootPath("contacto/"));
      }
      if (href === "/" || href === "/reformasB/" || href === "./?skipIntro=1" || href === "../?skipIntro=1" || href === "?skipIntro=1") {
        link.setAttribute("href", rootPath("?skipIntro=1"));
      }
      if (href === "?skipIntro=1#presupuesto" || href === "/#presupuesto" || href === "/reformasB/#presupuesto") {
        link.setAttribute("href", rootPath("?skipIntro=1#presupuesto"));
      }
      if (href === "?skipIntro=1#proceso" || href === "/#proceso" || href === "/reformasB/#proceso") {
        link.setAttribute("href", rootPath("?skipIntro=1#proceso"));
      }
    });
  }

  function pagePath() {
    return window.location.pathname.replace(/\\/g, "/");
  }

  function hasText(element, text) {
    return element && element.textContent && element.textContent.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }

  function removeTurnkeyHabitability() {
    var turnkey = document.querySelector(".turnkey-strip");
    if (!turnkey) return;

    turnkey.querySelectorAll(".turnkey-list li, .turnkey-accordion-item").forEach(function (item) {
      if (hasText(item, "Cédula de habitabilidad") || hasText(item, "Cedula de habitabilidad")) {
        item.remove();
      }
    });

    turnkey.querySelectorAll(".turnkey-accordion-item").forEach(function (item) {
      if (!hasText(item, "Coordinación de gremios")) return;
      var number = item.querySelector("button span");
      var button = item.querySelector("button");
      var panel = item.querySelector(".turnkey-accordion-panel");
      if (number && number.textContent !== "05") number.textContent = "05";
      if (button) {
        if (button.id !== "turnkey-button-4") button.id = "turnkey-button-4";
        if (button.getAttribute("aria-controls") !== "turnkey-panel-4") button.setAttribute("aria-controls", "turnkey-panel-4");
      }
      if (panel) {
        if (panel.id !== "turnkey-panel-4") panel.id = "turnkey-panel-4";
        if (panel.getAttribute("aria-labelledby") !== "turnkey-button-4") panel.setAttribute("aria-labelledby", "turnkey-button-4");
      }
    });
  }

  function findSectionByEyebrow(text) {
    var match = null;
    document.querySelectorAll("section").forEach(function (section) {
      var eyebrow = section.querySelector(".eyebrow");
      if (!match && hasText(eyebrow, text)) match = section;
    });
    return match;
  }

  function removeHomeOnlySections() {
    var trust = findSectionByEyebrow("Confianza sin rodeos");
    if (trust) trust.remove();

    document.querySelectorAll(".webgl-reveal-section").forEach(function (section) {
      section.remove();
    });
  }

  function trustSectionHtml() {
    return [
      '<section class="section rsb-contact-trust" aria-labelledby="contact-trust-title">',
      '<div class="container">',
      '<div class="section-header">',
      '<p class="eyebrow">Confianza sin rodeos</p>',
      '<h2 id="contact-trust-title">Primero claridad. Después obra.</h2>',
      '<p class="section-lead">Antes de hablar de partidas, miramos el espacio, ordenamos prioridades y definimos si la reforma tiene sentido para ti.</p>',
      '</div>',
      '<div class="grid-4">',
      '<article class="trust-card"><div class="icon-chip">01</div><h3>Lectura visual previa</h3><p>Vemos potencial, límites y prioridades antes de hablar de precios a ciegas.</p></article>',
      '<article class="trust-card"><div class="icon-chip">02</div><h3>Plan claro antes de obra</h3><p>Ordenamos alcance, fases y decisiones importantes antes de empezar a romper.</p></article>',
      '<article class="trust-card"><div class="icon-chip">03</div><h3>Un interlocutor</h3><p>Menos ruido, menos llamadas cruzadas y una persona clara para avanzar.</p></article>',
      '<article class="trust-card"><div class="icon-chip">04</div><h3>Visita sin mareos</h3><p>Si el proyecto encaja, pasamos de fotos e ideas a una visita con criterio.</p></article>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function updateContactPage() {
    var title = document.getElementById("contact-title");
    if (title && title.textContent !== "Llámanos y vemos tu reforma contigo.") {
      title.textContent = "Llámanos y vemos tu reforma contigo.";
    }

    if (!document.querySelector(".rsb-contact-trust")) {
      var steps = document.querySelector(".contact-steps");
      if (steps) steps.insertAdjacentHTML("beforebegin", trustSectionHtml());
    }
  }

  function beforeAfterHtml() {
    return [
      '<section class="rsb-before-after-section" aria-labelledby="rsb-before-after-title">',
      '<div class="container rsb-before-after-grid">',
      '<div class="rsb-before-after-copy">',
      '<p class="eyebrow">Antes / después interactivo</p>',
      '<h2 id="rsb-before-after-title">Del edificio apagado a una visión con valor.</h2>',
      '<p>La diferencia no está solo en pintar bonito. Está en ver el potencial, ordenar la idea y convertir una reforma en una decisión clara antes de gastar dinero.</p>',
      '</div>',
      '<div class="rsb-ba-frame" style="--split: 52%">',
      '<img class="rsb-ba-img rsb-ba-after" src="' + rootPath("reformas/despues.png") + '" alt="Resultado reformado después de la intervención"/>',
      '<div class="rsb-ba-before-wrap"><img class="rsb-ba-img rsb-ba-before" src="' + rootPath("reformas/antes.png") + '" alt="Estado inicial antes de la reforma"/></div>',
      '<input class="rsb-ba-range" type="range" min="0" max="100" value="52" aria-label="Comparar antes y después"/>',
      '<span class="rsb-ba-label rsb-ba-label-before">Antes</span>',
      '<span class="rsb-ba-label rsb-ba-label-after">Después</span>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function sateSectionHtml() {
    return [
      '<section class="rsb-sate-section" aria-labelledby="rsb-sate-title">',
      '<div class="container rsb-sate-grid">',
      '<div class="rsb-sate-copy">',
      '<p class="eyebrow">Instalación de SATE</p>',
      '<h2 id="rsb-sate-title">Aislamiento exterior para casas y edificios.</h2>',
      '<p>El sistema SATE mejora la envolvente del edificio desde el exterior: reduce pérdidas térmicas, protege la fachada y deja un acabado limpio sin perder espacio interior.</p>',
      '<ul>',
      '<li>Estudio previo del soporte y puntos críticos.</li>',
      '<li>Colocación de aislamiento, malla, mortero y acabado final.</li>',
      '<li>Solución pensada para vivienda unifamiliar, comunidades y fachadas expuestas.</li>',
      '</ul>',
      '</div>',
      '<div class="rsb-sate-carousel" aria-label="Ejemplos de fachadas para SATE">',
      '<img class="is-active" src="' + rootPath("reformas/magazine-fachada-ventana.webp") + '" alt="Fachada preparada para mejorar aislamiento exterior"/>',
      '<img src="' + rootPath("reformas/hero-rsb.jpg") + '" alt="Edificio con fachada renovada y volumen exterior definido"/>',
      '<div class="rsb-sate-controls">',
      '<button type="button" class="is-active" aria-label="Ver ejemplo SATE 1"></button>',
      '<button type="button" aria-label="Ver ejemplo SATE 2"></button>',
      '</div>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function initBeforeAfter() {
    document.querySelectorAll(".rsb-ba-frame").forEach(function (frame) {
      if (frame.dataset.rsbReady) return;
      frame.dataset.rsbReady = "1";
      var range = frame.querySelector(".rsb-ba-range");
      if (!range) return;
      var update = function () {
        frame.style.setProperty("--split", range.value + "%");
      };
      range.addEventListener("input", update);
      update();
    });
  }

  function initSateCarousel() {
    document.querySelectorAll(".rsb-sate-carousel").forEach(function (carousel) {
      if (carousel.dataset.rsbReady) return;
      carousel.dataset.rsbReady = "1";
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("img"));
      var buttons = Array.prototype.slice.call(carousel.querySelectorAll("button"));
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        buttons.forEach(function (button, i) {
          button.classList.toggle("is-active", i === index);
        });
      };
      buttons.forEach(function (button, i) {
        button.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 4200);
    });
  }

  function updateMoreServicesPage() {
    var main = document.querySelector("main");
    if (!main) return;

    if (!document.querySelector(".rsb-sate-section")) {
      var returnSection = document.querySelector(".more-services-return");
      if (returnSection) returnSection.insertAdjacentHTML("beforebegin", sateSectionHtml());
    }

    if (!document.querySelector(".rsb-before-after-section")) {
      main.insertAdjacentHTML("beforeend", beforeAfterHtml());
    }

    initBeforeAfter();
    initSateCarousel();
  }

  function applyRequestedChanges() {
    var path = pagePath();
    if (/\/contacto(?:\/|\/index\.html)?$/.test(path) || /\/reformasB\/contacto\/?$/.test(path)) {
      updateContactPage();
      return;
    }
    if (/\/mas-servicios(?:\/|\/index\.html)?$/.test(path) || /\/reformasB\/mas-servicios\/?$/.test(path)) {
      updateMoreServicesPage();
      return;
    }

    removeTurnkeyHabitability();
    removeHomeOnlySections();
  }

  function runFixes() {
    fixAssets();
    applyRequestedChanges();
  }

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;

      var originalHref = link.getAttribute("href");
      var href = normalizeInternalHref(originalHref);
      if (!href || /^(?:tel:|mailto:)/i.test(href)) return;
      if (/^https?:/i.test(href)) return;

      if (href === "/" || href === "/reformasB/" || href === "./?skipIntro=1" || href === "../?skipIntro=1" || href === "?skipIntro=1") {
        event.preventDefault();
        window.location.href = rootPath("?skipIntro=1");
        return;
      }

      if (href === "?skipIntro=1#presupuesto" || href === "/#presupuesto" || href === "#presupuesto") {
        event.preventDefault();
        window.location.href = rootPath("?skipIntro=1#presupuesto");
        return;
      }

      if (href === "?skipIntro=1#proceso" || href === "/#proceso" || href === "#proceso") {
        event.preventDefault();
        window.location.href = rootPath("?skipIntro=1#proceso");
        return;
      }

      if (href === "mas-servicios/" || href === "/mas-servicios" || href === "/mas-servicios/" || href.indexOf("/reformasB/mas-servicios") === 0) {
        event.preventDefault();
        window.location.href = rootPath("mas-servicios/");
        return;
      }

      if (href === "contacto/" || href.indexOf("/reformasB/contacto") === 0 || href === "/contacto" || href === "/contacto/") {
        event.preventDefault();
        window.location.href = rootPath("contacto/");
      }
    },
    true
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runFixes);
  }

  window.setTimeout(runFixes, 0);
  window.setTimeout(runFixes, 600);
  window.setTimeout(runFixes, 1600);

  new MutationObserver(runFixes).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "srcset"]
  });
})();
