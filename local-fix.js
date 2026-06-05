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
      if (img.getAttribute("loading") === "lazy") img.setAttribute("loading", "eager");
      if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
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

  function beforeAfterHtmlV2() {
    return [
      '<section class="rsb-before-after-section" aria-labelledby="rsb-before-after-title">',
      '<div class="container rsb-before-after-grid">',
      '<div class="rsb-before-after-copy">',
      '<p class="eyebrow">Antes / despu&eacute;s interactivo</p>',
      '<h2 id="rsb-before-after-title">Del edificio apagado a una visi&oacute;n con valor.</h2>',
      '<p>La diferencia no est&aacute; solo en pintar bonito. Est&aacute; en ver el potencial, ordenar la idea y convertir una reforma en una decisi&oacute;n clara antes de gastar dinero.</p>',
      '</div>',
      '<div class="rsb-ba-frame" style="--split: 52%">',
      '<img class="rsb-ba-img rsb-ba-after" src="' + rootPath("reformas/despues.png") + '" data-rsb-src="reformas/despues.png" loading="eager" decoding="async" alt="Resultado reformado despu&eacute;s de la intervenci&oacute;n"/>',
      '<div class="rsb-ba-before-wrap"><img class="rsb-ba-img rsb-ba-before" src="' + rootPath("reformas/antes.png") + '" data-rsb-src="reformas/antes.png" loading="eager" decoding="async" alt="Estado inicial antes de la reforma"/></div>',
      '<input class="rsb-ba-range" type="range" min="0" max="100" value="52" aria-label="Comparar antes y despu&eacute;s"/>',
      '<span class="rsb-ba-handle" aria-hidden="true"></span>',
      '<span class="rsb-ba-label rsb-ba-label-before">Antes</span>',
      '<span class="rsb-ba-label rsb-ba-label-after">Despu&eacute;s</span>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function beforeAfterHtmlV3() {
    return [
      '<section class="rsb-before-after-section" aria-labelledby="rsb-before-after-title">',
      '<div class="container rsb-before-after-grid">',
      '<div class="rsb-before-after-copy">',
      '<p class="eyebrow">Antes / despu&eacute;s interactivo</p>',
      '<h2 id="rsb-before-after-title">Del edificio apagado a una visi&oacute;n con valor.</h2>',
      '<p>La diferencia no est&aacute; solo en pintar bonito. Est&aacute; en ver el potencial, ordenar la idea y convertir una reforma en una decisi&oacute;n clara antes de gastar dinero.</p>',
      '</div>',
      '<div class="rsb-ba-frame rsb-ba-frame-v3" style="--split: 52%; --ba-after: url(' + rootPath("reformas/despues-comparador.jpg") + '); --ba-before: url(' + rootPath("reformas/antes-comparador.jpg") + ')">',
      '<div class="rsb-ba-layer rsb-ba-layer-after" aria-label="Resultado reformado despu&eacute;s de la intervenci&oacute;n"></div>',
      '<div class="rsb-ba-before-wrap"><div class="rsb-ba-layer rsb-ba-layer-before" aria-label="Estado inicial antes de la reforma"></div></div>',
      '<input class="rsb-ba-range" type="range" min="0" max="100" value="52" aria-label="Comparar antes y despu&eacute;s"/>',
      '<span class="rsb-ba-handle" aria-hidden="true"></span>',
      '<span class="rsb-ba-label rsb-ba-label-before">Antes</span>',
      '<span class="rsb-ba-label rsb-ba-label-after">Despu&eacute;s</span>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function sateSectionHtmlV2() {
    return [
      '<section class="rsb-sate-section" aria-labelledby="rsb-sate-title">',
      '<div class="container rsb-sate-grid">',
      '<div class="rsb-sate-copy">',
      '<p class="eyebrow">Instalaci&oacute;n de SATE</p>',
      '<h2 id="rsb-sate-title">Aislamiento exterior para casas y edificios.</h2>',
      '<p>El sistema SATE mejora la envolvente desde el exterior: sobre el muro soporte se colocan mortero adhesivo o fijaciones, aislamiento XPS, capa base, malla de armadura y revestimiento final.</p>',
      '<ul>',
      '<li>Estudio previo del soporte: hormig&oacute;n, bloque o ladrillo.</li>',
      '<li>Colocaci&oacute;n de aislamiento, capa base, malla de armadura e imprimaci&oacute;n.</li>',
      '<li>Soluci&oacute;n pensada para vivienda unifamiliar, comunidades y fachadas expuestas.</li>',
      '</ul>',
      '</div>',
      '<div class="rsb-sate-carousel" aria-label="Ejemplos de fachadas para SATE">',
      '<img class="is-active" src="' + rootPath("reformas/sate-casa-blanca.jpg") + '" alt="Casa blanca con fachada exterior renovada mediante SATE"/>',
      '<img src="' + rootPath("reformas/sate-fachada-piedra.jpg") + '" alt="Vivienda moderna con fachada preparada para aislamiento exterior SATE"/>',
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
      frame.querySelectorAll("img[data-rsb-src]").forEach(function (img) {
        img.addEventListener("error", function () {
          var fallback = img.getAttribute("data-rsb-src");
          if (fallback) img.src = rootPath(fallback);
        });
      });
      var setSplit = function (value) {
        var next = Math.max(0, Math.min(100, Number(value) || 0));
        range.value = String(Math.round(next));
        frame.style.setProperty("--split", next + "%");
      };
      var update = function () {
        setSplit(range.value);
      };
      var updateFromPointer = function (event) {
        var rect = frame.getBoundingClientRect();
        if (!rect.width) return;
        setSplit(((event.clientX - rect.left) / rect.width) * 100);
      };
      range.addEventListener("input", update);
      frame.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        frame.dataset.rsbUserControlled = "1";
        if (frame.setPointerCapture) frame.setPointerCapture(event.pointerId);
        updateFromPointer(event);
      });
      frame.addEventListener("pointermove", function (event) {
        if (!event.buttons) return;
        updateFromPointer(event);
      });
      update();
      var direction = 1;
      window.setInterval(function () {
        if (frame.dataset.rsbUserControlled === "1") return;
        var current = Number(range.value) || 52;
        if (current >= 84) direction = -1;
        if (current <= 16) direction = 1;
        setSplit(current + direction);
      }, 90);
    });
  }

  function constructionTextHtml() {
    return [
      '<div class="more-service-editorial-copy rsb-construction-inline" data-rsb-construction-inline="1">',
      '<p class="eyebrow">06 / Construcci&oacute;n</p>',
      '<h2>Obra nueva y rehabilitaci&oacute;n</h2>',
      '<p>Cuando el proyecto pide m&aacute;s alcance, ordenamos fases, documentaci&oacute;n, gremios y decisiones t&eacute;cnicas para avanzar con control.</p>',
      '</div>'
    ].join("");
  }

  function findConstructionCard() {
    var match = null;
    document.querySelectorAll(".more-service-editorial-card").forEach(function (card) {
      if (!match && !card.querySelector("[data-rsb-construction-inline]") && hasText(card.querySelector("h2"), "Obra nueva y rehabilitaci")) match = card;
    });
    return match;
  }

  function styleExteriorConstructionCard(card) {
    if (!card) return;
    card.classList.add("rsb-exterior-construction-card");
    card.style.removeProperty("display");
    card.style.removeProperty("grid-template-columns");
    card.style.removeProperty("gap");
    card.style.removeProperty("align-items");
    var exteriorImage = card.querySelector(":scope > .more-service-editorial-image");
    if (exteriorImage) exteriorImage.style.setProperty("display", "none", "important");
  }

  function moveConstructionNextToExterior() {
    document.querySelectorAll(".rsb-construction-after-sate").forEach(function (section) {
      section.remove();
    });

    var sourceCard = findConstructionCard();
    if (sourceCard) sourceCard.remove();

    var exteriorCard = null;
    document.querySelectorAll(".more-service-editorial-card").forEach(function (card) {
      if (!exteriorCard && hasText(card.querySelector(".eyebrow"), "05 / Exterior")) exteriorCard = card;
    });
    if (!exteriorCard) return;
    styleExteriorConstructionCard(exteriorCard);
    if (exteriorCard.querySelector("[data-rsb-construction-inline]")) return;
    exteriorCard.insertAdjacentHTML("beforeend", constructionTextHtml());
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

  function initHorizontalProcessAutoplay() {
    document.querySelectorAll(".cinematic-process").forEach(function (section) {
      if (section.dataset.rsbAutoplayReady) return;
      section.dataset.rsbAutoplayReady = "1";

      var timer = null;
      var isVisible = false;
      var delay = 10000;

      var stepButtons = function () {
        return Array.prototype.slice
          .call(section.querySelectorAll('button[aria-label^="Ver paso "]'))
          .filter(function (button) {
            return /Ver paso \d+/i.test(button.getAttribute("aria-label") || "");
          });
      };

      var isVisibleElement = function (element) {
        if (!element) return false;
        var style = window.getComputedStyle(element);
        var rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };

      var desktopMode = function () {
        return isVisibleElement(section.querySelector(".cinematic-sticky")) && !isVisibleElement(section.querySelector(".cinematic-mobile-flow"));
      };

      var activeIndex = function (buttons) {
        var index = buttons.findIndex(function (button) {
          return button.classList.contains("is-active") || button.getAttribute("aria-current") === "step";
        });
        return index < 0 ? 0 : index;
      };

      var stop = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      var advance = function () {
        if (desktopMode()) {
          var finalCard = section.querySelector(".cinematic-final-card");
          var finalVisible =
            finalCard &&
            (window.getComputedStyle(finalCard).pointerEvents === "auto" || parseFloat(finalCard.style.opacity || "0") > 0.8);

          if (finalVisible) {
            section.scrollIntoView({ block: "start", behavior: "smooth" });
            return;
          }

          var nextButton = section.querySelector('.cinematic-sticky .cinematic-arrows button[aria-label="Ver paso siguiente"]');
          if (nextButton) {
            nextButton.click();
            return;
          }
        }

        var buttons = stepButtons();
        if (!buttons.length) return;
        var next = (activeIndex(buttons) + 1) % buttons.length;
        buttons[next].click();
      };

      var start = function () {
        if (timer) return;
        timer = window.setInterval(advance, delay);
      };

      var restart = function () {
        stop();
        if (isVisible) start();
      };

      var updateVisibility = function () {
        var rect = section.getBoundingClientRect();
        isVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
        if (isVisible && document.visibilityState !== "hidden") start();
        else stop();
      };

      section.addEventListener(
        "click",
        function (event) {
          if (event.target.closest && event.target.closest("button")) {
            window.setTimeout(restart, 0);
          }
        },
        true
      );

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          function (entries) {
            isVisible = entries.some(function (entry) {
              var rect = entry.boundingClientRect;
              return entry.isIntersecting && rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
            });
            if (isVisible && document.visibilityState !== "hidden") start();
            else stop();
          },
          { threshold: [0] }
        ).observe(section);
      } else {
        updateVisibility();
      }

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") stop();
        else if (isVisible) start();
      });

      window.addEventListener("scroll", updateVisibility, { passive: true });
      window.addEventListener("resize", updateVisibility);
      window.setTimeout(updateVisibility, 250);
    });
  }

  function updateMoreServicesPage() {
    document.documentElement.classList.add("rsb-more-services-page");
    var main = document.querySelector("main");
    if (!main) return;

    if (!document.querySelector(".rsb-sate-section")) {
      var returnSection = document.querySelector(".more-services-return");
      if (returnSection) returnSection.insertAdjacentHTML("beforebegin", sateSectionHtmlV2());
    }
    moveConstructionNextToExterior();

    if (!document.querySelector(".rsb-before-after-section")) {
      main.insertAdjacentHTML("beforeend", beforeAfterHtmlV3());
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
    initHorizontalProcessAutoplay();
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

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(runFixes, 120);
  });

  new MutationObserver(runFixes).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "srcset"]
  });
})();
