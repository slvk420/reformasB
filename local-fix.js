(function () {
  var isFile = window.location.protocol === "file:";
  var isGithubPages = window.location.pathname.indexOf("/reformasB") === 0;
  var moreServicesLoadPending = false;

  function dismissBrandIntro() {
    document.documentElement.classList.add("rsb-skip-intro");
    var intro = document.querySelector(".brand-intro");
    if (intro) intro.setAttribute("aria-hidden", "true");
  }

  window.setTimeout(dismissBrandIntro, 1800);

  var isSubpage = /\/(?:contacto|mas-servicios)\//.test(window.location.pathname.replace(/\\/g, "/"));
  var rootUrl = isGithubPages
    ? new URL("/reformasB/", window.location.origin)
    : new URL(isSubpage ? "../" : "./", window.location.href);

  function rootPath(path) {
    return new URL(path, rootUrl).href;
  }

  var _origPushState = window.history.pushState;
  window.history.pushState = function (state, title, url) {
    if (url && /\/mas-servicios(?:\/|$)/.test(String(url))) {
      window.location.href = rootPath("mas-servicios/");
      return;
    }
    return _origPushState.apply(this, arguments);
  };
  var _origReplaceState = window.history.replaceState;
  window.history.replaceState = function (state, title, url) {
    if (url && /\/mas-servicios(?:\/|$)/.test(String(url))) {
      window.location.href = rootPath("mas-servicios/");
      return;
    }
    return _origReplaceState.apply(this, arguments);
  };

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
      if (img.classList.contains("brand-logo")) {
        var logoSrc = rootPath("_next/static/media/logo-rsb-wood-transparent.png");
        if (img.src !== logoSrc) img.setAttribute("src", logoSrc);
        img.setAttribute("width", "420");
        img.setAttribute("height", "420");
      }
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

  function isMoreServicesPath() {
    return /\/mas-servicios\/?$/.test(pagePath()) || /\/reformasB\/mas-servicios\/?$/.test(pagePath());
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
      '<article class="trust-card"><div class="icon-chip">04</div><h3>Lectura visual previa</h3><p>Vemos potencial, límites y prioridades antes de hablar de precios a ciegas.</p></article>',
      '<article class="trust-card"><div class="icon-chip">05</div><h3>Plan claro antes de obra</h3><p>Ordenamos alcance, fases y decisiones importantes antes de empezar a romper.</p></article>',
      '<article class="trust-card"><div class="icon-chip">06</div><h3>Un interlocutor</h3><p>Menos ruido, menos llamadas cruzadas y una persona clara para avanzar.</p></article>',
      '<article class="trust-card"><div class="icon-chip">07</div><h3>Visita sin mareos</h3><p>Si el proyecto encaja, pasamos de fotos e ideas a una visita con criterio.</p></article>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function updateContactPage() {
    var fixedTitle = document.getElementById("contact-title");
    if (fixedTitle) fixedTitle.textContent = "Ll\u00e1manos y vemos tu reforma contigo.";
    if (!document.querySelector(".rsb-contact-trust")) {
      var fixedSteps = document.querySelector(".contact-steps");
      if (fixedSteps) fixedSteps.insertAdjacentHTML("afterend", trustSectionHtml());
    }
    return;

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
      '<img src="' + rootPath("reformas/sate-instalacion-andamios.webp") + '" alt="Instalaci&oacute;n de aislamiento SATE en una fachada de ladrillo con andamios"/>',
      '<div class="rsb-sate-controls">',
      '<button type="button" class="is-active" aria-label="Ver ejemplo SATE 1"></button>',
      '<button type="button" aria-label="Ver ejemplo SATE 2"></button>',
      '<button type="button" aria-label="Ver ejemplo SATE 3"></button>',
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
      '<img class="is-active" src="' + rootPath("reformas/sate-casa-blanca-hq.png") + '" alt="Casa blanca con fachada exterior renovada mediante SATE"/>',
      '<img src="' + rootPath("reformas/sate-fachada-piedra.jpg") + '" alt="Vivienda moderna con fachada preparada para aislamiento exterior SATE"/>',
      '<img src="' + rootPath("reformas/sate-instalacion-andamios.webp") + '" alt="Instalaci&oacute;n de aislamiento SATE en una fachada de ladrillo con andamios"/>',
      '<div class="rsb-sate-controls">',
      '<button type="button" class="is-active" aria-label="Ver ejemplo SATE 1"></button>',
      '<button type="button" aria-label="Ver ejemplo SATE 2"></button>',
      '<button type="button" aria-label="Ver ejemplo SATE 3"></button>',
      '</div>',
      '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function initMoreServicesTextReveal() {
    if (!document.documentElement.classList.contains("rsb-more-services-page")) return;
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(
        [
          ".more-services-hero-copy > p:not(.eyebrow)",
          ".more-service-editorial-copy h2",
          ".more-service-editorial-copy > p:not(.eyebrow)",
          ".more-service-editorial-copy > a",
          ".rsb-construction-inline h2",
          ".rsb-construction-inline > p",
          ".rsb-sate-copy h2",
          ".rsb-sate-copy > p",
          ".rsb-sate-copy li",
          ".rsb-before-after-copy h2",
          ".rsb-before-after-copy > p",
          ".more-services-return h2"
        ].join(", ")
      )
    );
    targets.forEach(function (target, index) {
      if (target.dataset.rsbSlideReady) return;
      target.dataset.rsbSlideReady = "1";
      target.style.setProperty("--rsb-slide-delay", Math.min(index % 4, 3) * 70 + "ms");
      target.classList.add("rsb-slide-text");
    });

    var hiddenTargets = targets.filter(function (target) {
      return !target.classList.contains("is-visible");
    });
    if (!hiddenTargets.length) return;

    if (!("IntersectionObserver" in window)) {
      hiddenTargets.forEach(function (target) {
        target.classList.add("is-visible");
      });
      return;
    }

    if (!window.rsbTextRevealObserver) {
      window.rsbTextRevealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
      );
    }

    hiddenTargets.forEach(function (target) {
      window.rsbTextRevealObserver.observe(target);
    });
  }

  function makeWorkArrow(direction) {
    var path =
      direction === "prev"
        ? "M19 12H5m7 7-7-7 7-7"
        : "M5 12h14m-7-7 7 7-7 7";
    return (
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' +
      path +
      '"></path></svg>'
    );
  }

  function ensureWorkControls(media, labelText, previousLabel, nextLabel) {
    var controls = media.querySelector(".work-image-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "work-image-controls";
      controls.innerHTML =
        '<button type="button" aria-label="' +
        previousLabel +
        '">' +
        makeWorkArrow("prev") +
        "</button><span>" +
        labelText +
        '</span><button type="button" aria-label="' +
        nextLabel +
        '">' +
        makeWorkArrow("next") +
        "</button>";
      media.appendChild(controls);
      return controls;
    }

    var label = controls.querySelector("span");
    if (!label) {
      label = document.createElement("span");
      label.textContent = labelText;
      var nextButton = controls.querySelectorAll("button")[1];
      controls.insertBefore(label, nextButton || null);
    }
    return controls;
  }

  function setupWorkGallery(selector, key, slides, previousLabel, nextLabel) {
    var media = document.querySelector(selector + " .work-example-media");
    if (!media) return;
    var image = media.querySelector("img");
    if (!image) return;

    var realBadge = media.querySelector(".rsb-project-real-badge");
    if (!realBadge) {
      realBadge = document.createElement("span");
      realBadge.className = "rsb-project-real-badge";
      realBadge.textContent = "Obra real";
      media.appendChild(realBadge);
    }

    var controls = ensureWorkControls(media, slides[0].label, previousLabel, nextLabel);
    var label = controls.querySelector("span");
    var buttons = Array.prototype.slice.call(controls.querySelectorAll("button"));
    if (buttons.length < 2) return;

    var indexKey = "rsb" + key + "Index";
    var readyKey = "rsb" + key + "Ready";

    var show = function (nextIndex) {
      var index = (nextIndex + slides.length) % slides.length;
      media.dataset[indexKey] = String(index);
      if (image.getAttribute("src") !== slides[index].src) image.setAttribute("src", slides[index].src);
      if (image.getAttribute("alt") !== slides[index].alt) image.setAttribute("alt", slides[index].alt);
      if (image.hasAttribute("srcset")) image.removeAttribute("srcset");
      if (image.getAttribute("loading") !== "eager") image.setAttribute("loading", "eager");
      if (image.getAttribute("decoding") !== "async") image.setAttribute("decoding", "async");
      if (label && label.textContent !== slides[index].label) label.textContent = slides[index].label;
      realBadge.hidden = !slides[index].isReal;
    };

    if (!media.dataset[readyKey]) {
      media.dataset[readyKey] = "1";
      buttons[0].setAttribute("aria-label", previousLabel);
      buttons[1].setAttribute("aria-label", nextLabel);
      buttons.forEach(function (button, buttonIndex) {
        button.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var current = Number(media.dataset[indexKey] || 0);
            show(current + (buttonIndex === 0 ? -1 : 1));
          },
          true
        );
      });
    }

    var current = Math.max(0, Math.min(slides.length - 1, Number(media.dataset[indexKey] || 0)));
    show(current);
  }

  function updateHomeWorkGalleries() {
    if (isMoreServicesPath() || /\/contacto(?:\/|\/index\.html)?$/.test(pagePath())) return;

    setupWorkGallery(
      ".work-example-kitchen",
      "Kitchen",
      [
        {
          src: rootPath("reformas/cocina-madera-negra.png"),
          label: "Cocina madera y negro",
          alt: "Cocina reformada con madera, frentes negros e iluminacion calida",
          isReal: true
        },
        {
          src: rootPath("reformas/ejemplo-cocina-rsb-real.webp"),
          label: "Cocina blanca",
          alt: "Cocina reformada blanca con encimera clara y electrodomesticos de acero"
        }
      ],
      "Ver cocina anterior",
      "Ver cocina siguiente"
    );

    setupWorkGallery(
      ".work-example-bath",
      "Bath",
      [
        {
          src: rootPath("reformas/bano-blanco-ducha.png"),
          label: "Baño claro",
          alt: "Baño renovado con ducha de cristal, mueble blanco y revestimiento gris",
          isReal: true
        },
        {
          src: rootPath("reformas/ejemplo-bano-real.jpg"),
          label: "Baño gris",
          alt: "Baño reformado con revestimiento gris, lavabo negro y ducha acristalada"
        }
      ],
      "Ver baño anterior",
      "Ver baño siguiente"
    );

    setupWorkGallery(
      ".work-example-living",
      "Living",
      [
        {
          src: rootPath("reformas/salon-blanco-chimenea.jpg"),
          label: "Salón luminoso",
          alt: "Salón luminoso con chimenea lineal, sofás grises y ventanales",
          isReal: true
        },
        {
          src: rootPath("reformas/ejemplo-salon-real.jpg"),
          label: "Salón cálido",
          alt: "Salón reformado con chimenea, estanterías de madera y cortinas claras"
        }
      ],
      "Ver salón anterior",
      "Ver salón siguiente"
    );
  }

  function updateHomeMarketingCopy() {
    if (isSubpage || isMoreServicesPath()) return;

    var content = [
      {
        selector: ".work-example-kitchen",
        title: "Reformas de cocinas funcionales y bien coordinadas.",
        text: "Coordinamos albañilería, fontanería, electricidad, mobiliario y acabados para reformar cocinas prácticas, resistentes y adaptadas al uso diario."
      },
      {
        selector: ".work-example-bath",
        title: "Reformas de baños pensadas para durar.",
        text: "Renovamos distribución, fontanería, impermeabilización, revestimientos y sanitarios para conseguir baños cómodos, seguros y fáciles de mantener."
      },
      {
        selector: ".work-example-living",
        title: "Salones con más luz y mejor distribución.",
        text: "Mejoramos la distribución, iluminación, pavimentos, carpintería y acabados para aprovechar mejor el espacio y crear una estancia cómoda."
      }
    ];

    content.forEach(function (item) {
      var section = document.querySelector(item.selector);
      if (!section) return;
      var title = section.querySelector(".work-example-copy h2");
      var text = section.querySelector(".work-example-copy > p:last-child");
      if (title && title.textContent !== item.title) title.textContent = item.title;
      if (text && text.textContent !== item.text) text.textContent = item.text;
    });
  }

  function updateHomeHeroActions() {
    if (isSubpage || isMoreServicesPath()) return;

    var links = document.querySelectorAll(".editorial-hero .hero-actions a");
    if (links.length < 2) return;
    var isMobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
    var labels = [
      { desktop: "Pedir visita", mobile: "Solicitar visita" },
      { desktop: "Llamar ahora", mobile: "Llamar" }
    ];

    links.forEach(function (link, index) {
      if (!labels[index]) return;
      var label = isMobile ? labels[index].mobile : labels[index].desktop;
      var textNodes = Array.prototype.filter.call(link.childNodes, function (node) {
        return node.nodeType === 3;
      });
      textNodes.forEach(function (node) {
        node.remove();
      });

      var text = link.querySelector(".rsb-responsive-action-label");
      if (!text) {
        text = document.createElement("span");
        text.className = "rsb-responsive-action-label";
        link.insertBefore(text, link.firstChild);
      }
      if (text.textContent !== label) text.textContent = label;
      link.setAttribute("aria-label", label);
    });
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

  function initStableHorizontalProcess() {
    document.querySelectorAll(".cinematic-process").forEach(function (section) {
      if (section.dataset.rsbStableProcessReady) return;
      section.dataset.rsbStableProcessReady = "1";
      section.classList.add("rsb-stable-process");

      var steps = [
        {
          eyebrow: "01 / Punto de partida",
          title: "Vemos el estado real.",
          body: "Fachada, orientación, volumen, zonas deterioradas y oportunidades que no se aprecian en un presupuesto rápido.",
          image: "reformas/process-1.webp"
        },
        {
          eyebrow: "02 / Idea",
          title: "Abrimos la idea.",
          body: "Ordenamos opciones reales antes de invertir tiempo y dinero en una reforma sin dirección clara.",
          image: "reformas/process-4.webp"
        },
        {
          eyebrow: "03 / Potencial",
          title: "Aparece el potencial.",
          body: "La propuesta empieza a tener lectura: imagen, uso, envolvente y prioridades trabajan juntas.",
          image: "reformas/process-2.webp"
        },
        {
          eyebrow: "04 / Envolvente",
          title: "La fachada acompaña.",
          body: "No se trata solo de renovar por dentro: la imagen exterior también comunica valor, orden y calidad.",
          image: "reformas/process-3.webp"
        },
        {
          eyebrow: "05 / Pedir visita",
          title: "Ya se puede pedir visita.",
          body: "Con el alcance entendido, damos el siguiente paso con una visita clara y sin vueltas innecesarias.",
          cta: true
        }
      ];
      var visualSteps = steps.filter(function (step) {
        return !!step.image;
      });

      var carousel = document.createElement("div");
      carousel.className = "rsb-process-carousel";
      carousel.innerHTML =
        '<div class="rsb-process-inner">' +
        '<div class="rsb-process-copy">' +
        '<p class="eyebrow">Proceso horizontal</p>' +
        '<h2>La reforma se cuenta avanzando hacia el resultado.</h2>' +
        '<article class="rsb-process-card" aria-live="polite" aria-atomic="true">' +
        '<span class="rsb-process-eyebrow"></span>' +
        '<h3></h3>' +
        '<p></p>' +
        '<a class="rsb-process-cta" href="#presupuesto">Pedir visita <span aria-hidden="true">→</span></a>' +
        "</article>" +
        '<div class="rsb-process-progress" aria-hidden="true"><span></span></div>' +
        "</div>" +
        '<div class="rsb-process-visual" aria-live="off">' +
        visualSteps
          .map(function (_, imageIndex) {
            return (
              '<figure class="rsb-process-photo rsb-process-photo-' +
              (imageIndex + 1) +
              '"><img alt="" width="1600" height="900" decoding="async" loading="lazy"></figure>'
            );
          })
          .join("") +
        "</div>" +
        '<button class="rsb-process-arrow is-previous" type="button" aria-label="Ver paso anterior">&#8592;</button>' +
        '<button class="rsb-process-arrow is-next" type="button" aria-label="Ver paso siguiente">&#8594;</button>' +
        '<div class="rsb-process-dots" aria-label="Seleccionar paso del proceso"></div>' +
        "</div>";
      section.appendChild(carousel);

      var photos = Array.prototype.slice.call(carousel.querySelectorAll(".rsb-process-photo"));
      var images = photos.map(function (photo) {
        return photo.querySelector("img");
      });
      var eyebrow = carousel.querySelector(".rsb-process-eyebrow");
      var title = carousel.querySelector(".rsb-process-card h3");
      var body = carousel.querySelector(".rsb-process-card > p");
      var cta = carousel.querySelector(".rsb-process-cta");
      var progress = carousel.querySelector(".rsb-process-progress span");
      var dots = carousel.querySelector(".rsb-process-dots");
      var previous = carousel.querySelector(".rsb-process-arrow.is-previous");
      var next = carousel.querySelector(".rsb-process-arrow.is-next");
      var index = 0;
      var timer = null;
      var visible = false;
      var changing = false;
      var transitionToken = 0;
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      dots.innerHTML = steps
        .map(function (_, stepIndex) {
          return (
            '<button type="button" aria-label="Ver paso ' +
            (stepIndex + 1) +
            ' de ' +
            steps.length +
            '"><span></span></button>'
          );
        })
        .join("");
      var dotButtons = Array.prototype.slice.call(dots.querySelectorAll("button"));

      images.forEach(function (image, imageIndex) {
        image.src = rootPath(visualSteps[imageIndex].image);
        image.alt = imageIndex === 0 ? visualSteps[imageIndex].title : "";
        photos[imageIndex].dataset.slot = String(imageIndex);
      });

      var setPhotoSlots = function (activeIndex) {
        photos.forEach(function (photo, photoIndex) {
          photo.dataset.slot = String((photoIndex - activeIndex + visualSteps.length) % visualSteps.length);
          photo.classList.remove("is-exiting-forward", "is-entering-backward", "is-resetting");
        });
      };

      var animatePhotoStack = function (previousIndex, nextIndex, direction, token) {
        var previousFinal = !!steps[previousIndex].cta;
        var nextFinal = !!steps[nextIndex].cta;

        if (nextFinal) {
          carousel.classList.add("is-stack-leaving");
          return;
        }

        carousel.classList.remove("is-stack-leaving");
        if (previousFinal || reduceMotion) {
          setPhotoSlots(nextIndex);
          return;
        }

        var outgoing = photos.find(function (photo) {
          return photo.dataset.slot === "0";
        });
        var incoming = photos.find(function (photo) {
          return photo.dataset.slot === "3";
        });

        photos.forEach(function (photo, photoIndex) {
          var targetSlot = (photoIndex - nextIndex + visualSteps.length) % visualSteps.length;
          if (direction > 0 && photo === outgoing) return;
          photo.dataset.slot = String(targetSlot);
        });

        if (direction > 0 && outgoing) {
          outgoing.classList.add("is-exiting-forward");
          window.setTimeout(function () {
            if (token !== transitionToken) return;
            outgoing.classList.add("is-resetting");
            outgoing.dataset.slot = "3";
            outgoing.classList.remove("is-exiting-forward");
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () {
                outgoing.classList.remove("is-resetting");
              });
            });
          }, 1300);
        } else if (incoming) {
          incoming.classList.add("is-entering-backward");
          window.setTimeout(function () {
            if (token === transitionToken) incoming.classList.remove("is-entering-backward");
          }, 1300);
        }
      };

      var render = function (nextIndex, direction) {
        var normalized = (nextIndex + steps.length) % steps.length;
        if (changing || normalized === index) return;
        changing = true;
        var previousIndex = index;
        index = normalized;
        transitionToken += 1;
        var currentToken = transitionToken;
        var step = steps[index];
        carousel.classList.toggle("is-final", !!step.cta);
        carousel.classList.remove("is-forward", "is-backward");
        carousel.classList.add("is-changing", direction < 0 ? "is-backward" : "is-forward");
        animatePhotoStack(previousIndex, index, direction, currentToken);

        window.setTimeout(
          function () {
            if (currentToken !== transitionToken) return;
            eyebrow.textContent = step.eyebrow;
            title.textContent = step.title;
            body.textContent = step.body;
            cta.hidden = !step.cta;
            progress.style.transform = "scaleX(" + (index + 1) / steps.length + ")";
            dotButtons.forEach(function (button, dotIndex) {
              var active = dotIndex === index;
              button.classList.toggle("is-active", active);
              button.setAttribute("aria-current", active ? "step" : "false");
            });
          },
          reduceMotion ? 0 : 280
        );

        window.setTimeout(
          function () {
            if (currentToken !== transitionToken) return;
            carousel.classList.remove("is-changing", "is-forward", "is-backward");
            changing = false;
          },
          reduceMotion ? 20 : 1420
        );
      };

      var renderInitial = function () {
        index = 0;
        var step = steps[index];
        eyebrow.textContent = step.eyebrow;
        title.textContent = step.title;
        body.textContent = step.body;
        cta.hidden = true;
        progress.style.transform = "scaleX(" + 1 / steps.length + ")";
        setPhotoSlots(0);
        dotButtons.forEach(function (button, dotIndex) {
          var active = dotIndex === 0;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-current", active ? "step" : "false");
        });
      };

      var stop = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      var start = function () {
        stop();
        if (!visible || document.visibilityState === "hidden") return;
        timer = window.setInterval(function () {
          render(index + 1, 1);
        }, 5000);
      };

      var move = function (amount) {
        render(index + amount, amount);
        start();
      };

      previous.addEventListener("click", function () {
        move(-1);
      });
      next.addEventListener("click", function () {
        move(1);
      });
      dotButtons.forEach(function (button, dotIndex) {
        button.addEventListener("click", function () {
          render(dotIndex, dotIndex < index ? -1 : 1);
          start();
        });
      });

      var updateVisibility = function () {
        var rect = section.getBoundingClientRect();
        visible = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
        if (visible) start();
        else stop();
      };

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          function (entries) {
            visible = entries.some(function (entry) {
              return entry.isIntersecting;
            });
            if (visible) start();
            else stop();
          },
          { threshold: 0.15 }
        ).observe(section);
      } else {
        window.addEventListener("scroll", updateVisibility, { passive: true });
      }

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") stop();
        else start();
      });

      renderInitial();
      window.setTimeout(updateVisibility, 100);
    });
  }

  function initHorizontalProcessAutoplay() {
    document.querySelectorAll(".cinematic-process").forEach(function (section) {
      if (section.dataset.rsbAutoplayReady) return;
      section.dataset.rsbAutoplayReady = "1";

      var timer = null;
      var isVisible = false;
      var delay = 4000;
      var forcedSteps = [
        {
          eyebrow: "01 / Punto de partida",
          title: "Vemos el estado real.",
          body: "Fachada, orientacion, volumen, zonas deterioradas y oportunidades que no se aprecian en un presupuesto rapido.",
          image: "reformas/process-1.webp",
        },
        {
          eyebrow: "02 / Idea",
          title: "Abrimos la idea.",
          body: "Ordenamos opciones reales antes de invertir tiempo y dinero en una reforma sin direccion clara.",
          image: "reformas/process-4.webp",
        },
        {
          eyebrow: "03 / Potencial",
          title: "Aparece el potencial.",
          body: "La propuesta empieza a tener lectura: imagen, uso, envolvente y prioridades trabajan juntas.",
          image: "reformas/process-2.webp",
        },
        {
          eyebrow: "04 / Envolvente",
          title: "La fachada acompaña.",
          body: "No se trata solo de renovar por dentro: la imagen exterior tambien comunica valor, orden y calidad.",
          image: "reformas/process-3.webp",
        },
        {
          eyebrow: "05 / Pedir visita",
          title: "Ya se puede pedir visita.",
          body: "Con el alcance entendido, damos el siguiente paso con una visita clara y sin vueltas innecesarias.",
          image: "reformas/process-4.webp",
          cta: true,
        },
      ];

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

      var forcedIndex = function () {
        var index = Number(section.dataset.rsbProcessIndex || "0");
        return Number.isFinite(index) ? index : 0;
      };

      var updateStepCopy = function (step) {
        var copy = section.querySelector(".cinematic-step");
        if (!copy) return;
        var eyebrow = copy.querySelector("span");
        var title = copy.querySelector("h3");
        var body = copy.querySelector("p");
        var existingCta = copy.querySelector(".rsb-process-step-cta");
        if (existingCta) existingCta.remove();
        if (eyebrow) eyebrow.textContent = step.eyebrow;
        if (title) title.textContent = step.title;
        if (body) body.textContent = step.body;
        if (step.cta) {
          copy.insertAdjacentHTML(
            "beforeend",
            '<a class="rsb-process-step-cta" href="#presupuesto" aria-label="Pedir visita desde el proceso">Pedir visita <span aria-hidden="true">→</span></a>'
          );
        }
      };

      var updatePhotoStack = function (index) {
        var cards = Array.prototype.slice.call(section.querySelectorAll(".cinematic-photo-card"));
        var stack = section.querySelector(".cinematic-photo-stack");
        var step = forcedSteps[index];
        if (stack) {
          stack.style.opacity = step.cta ? "0" : "1";
          stack.style.visibility = step.cta ? "hidden" : "visible";
          stack.style.pointerEvents = step.cta ? "none" : "auto";
        }
        var stackStyles = [
          { opacity: "1", transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", zIndex: "14" },
          { opacity: "0.52", transform: "translate3d(34px, -20px, 0) rotate(4deg) scale(0.97)", zIndex: "12" },
          { opacity: "0.28", transform: "translate3d(62px, -38px, 0) rotate(7deg) scale(0.94)", zIndex: "10" },
          { opacity: "0.16", transform: "translate3d(88px, -54px, 0) rotate(10deg) scale(0.91)", zIndex: "8" },
        ];

        cards.forEach(function (card, cardIndex) {
          var step = forcedSteps[(index + cardIndex) % forcedSteps.length];
          var image = card.querySelector("img");
          var style = stackStyles[cardIndex] || stackStyles[stackStyles.length - 1];
          if (image) {
            image.src = rootPath(step.image);
            image.removeAttribute("srcset");
            image.alt = step.title;
          }
          card.style.opacity = style.opacity;
          card.style.transform = style.transform;
          card.style.zIndex = style.zIndex;
          card.style.visibility = forcedSteps[index].cta ? "hidden" : "visible";
          card.style.transition = "opacity 520ms ease, transform 620ms cubic-bezier(.22,.8,.22,1)";
        });
      };

      var updateProgress = function (index) {
        var progress = section.querySelector(".cinematic-progress span");
        if (progress) progress.style.transform = "scaleX(" + (index + 1) / forcedSteps.length + ")";
      };

      var hideNativeFinalCard = function () {
        var finalCard = section.querySelector(".cinematic-final-card");
        if (finalCard) {
          finalCard.style.display = "none";
          finalCard.style.opacity = "0";
          finalCard.style.pointerEvents = "none";
          finalCard.style.visibility = "hidden";
          finalCard.setAttribute("aria-hidden", "true");
        }
        var finalBg = section.querySelector(".cinematic-final-bg");
        if (finalBg) {
          finalBg.style.display = "none";
          finalBg.style.opacity = "0";
          finalBg.style.visibility = "hidden";
        }
      };

      var showForcedStep = function (nextIndex) {
        var index = (nextIndex + forcedSteps.length) % forcedSteps.length;
        var step = forcedSteps[index];
        var layout = section.querySelector(".cinematic-layout");
        section.dataset.rsbProcessIndex = String(index);
        section.classList.toggle("rsb-process-final", !!step.cta);
        if (layout) layout.classList.toggle("rsb-process-final", !!step.cta);
        hideNativeFinalCard();
        updateStepCopy(step);
        updatePhotoStack(index);
        updateProgress(index);
      };

      var forcedMode = function () {
        return isVisibleElement(section.querySelector(".cinematic-sticky"));
      };

      var stop = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      var advance = function () {
        if (forcedMode()) {
          showForcedStep(forcedIndex() + 1);
          return;
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

      section.querySelectorAll(".cinematic-arrows button").forEach(function (button) {
        button.addEventListener(
          "click",
          function (event) {
            if (!forcedMode()) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            var label = button.getAttribute("aria-label") || "";
            showForcedStep(forcedIndex() + (/anterior/i.test(label) ? -1 : 1));
            window.setTimeout(restart, 0);
          },
          true
        );
      });

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
      showForcedStep(forcedIndex());
      window.setTimeout(updateVisibility, 250);
    });
  }

  function updateMoreServicesPage() {
    document.documentElement.classList.add("rsb-more-services-page");
    if (document.readyState !== "complete") {
      if (!moreServicesLoadPending) {
        moreServicesLoadPending = true;
        window.addEventListener(
          "load",
          function () {
            moreServicesLoadPending = false;
            window.requestAnimationFrame(updateMoreServicesPage);
          },
          { once: true }
        );
      }
      return;
    }
    var main = document.querySelector("main");
    if (!main) return;

    var heroTopbar = main.querySelector(".more-services-hero .more-services-topbar");
    var heroActions = main.querySelector(".more-services-hero .more-services-actions");
    if (heroTopbar) heroTopbar.remove();
    if (heroActions) heroActions.remove();

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
    initMoreServicesTextReveal();
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
    updateHomeMarketingCopy();
    updateHomeHeroActions();
  }

  function initHomeHeroCarousel() {
    if (isSubpage || document.documentElement.classList.contains("rsb-more-services-page")) return;

    var hero = document.querySelector(".editorial-hero");
    var heroContent = hero && hero.querySelector(".hero-content");
    if (!hero || !heroContent || hero.dataset.rsbHeroCarouselReady) return;
    hero.dataset.rsbHeroCarouselReady = "1";
    hero.classList.add("rsb-hero-carousel-ready");

    var oldMedia = hero.querySelector(".hero-editorial-media");
    var oldBrandType = hero.querySelector(".hero-brand-type");
    if (oldMedia) oldMedia.remove();
    if (oldBrandType) oldBrandType.remove();

    var slides = [
      {
        image: "reformas/hero-planificacion.webp",
        alt: "Planificación de una reforma integral con selección de materiales y revisión de planos",
        text: "Diseñamos reformas integrales en Lleida con una planificación clara, materiales bien elegidos y decisiones tomadas antes de empezar la obra."
      },
      {
        image: "reformas/hero-reforma-integral.webp",
        alt: "Reforma integral de vivienda con fachada, salón y cocina renovados",
        text: "Realizamos obra nueva, reformas de viviendas, fachadas, tejados y rehabilitación de pisos antiguos. Te acompañamos desde la primera visita hasta la entrega, con presupuesto claro y una gestión cercana."
      },
      {
        image: "reformas/hero-entrega-llaves.webp",
        alt: "Entrega de llaves al finalizar una reforma de vivienda",
        text: "Coordinamos cada oficio y cada detalle hasta la entrega de llaves, para que estrenes tu vivienda reformada con tranquilidad, plazos claros y un único interlocutor."
      }
    ];

    var carousel = document.createElement("div");
    carousel.className = "rsb-home-hero-carousel";
    carousel.setAttribute("aria-hidden", "true");
    carousel.innerHTML = slides
      .map(function (slide, index) {
        return (
          '<img class="rsb-home-hero-slide' +
          (index === 0 ? " is-active" : "") +
          '" src="' +
          rootPath(slide.image) +
          '" alt="" loading="' +
          (index === 0 ? "eager" : "lazy") +
          '" decoding="async">'
        );
      })
      .join("");
    hero.insertBefore(carousel, hero.firstChild);

    var description = hero.querySelector(".hero-description");
    if (description) {
      description.textContent = slides[0].text;
      description.setAttribute("aria-live", "polite");
      description.setAttribute("aria-atomic", "true");
    }

    var actions = hero.querySelector(".hero-actions");
    var controls = document.createElement("div");
    controls.className = "rsb-home-hero-controls";
    controls.setAttribute("aria-label", "Seleccionar imagen del inicio");
    controls.innerHTML = slides
      .map(function (slide, index) {
        return (
          '<button type="button" class="' +
          (index === 0 ? "is-active" : "") +
          '" aria-label="Ver imagen ' +
          (index + 1) +
          ' de ' +
          slides.length +
          '" aria-current="' +
          (index === 0 ? "true" : "false") +
          '"><span></span></button>'
        );
      })
      .join("");
    if (actions) actions.insertAdjacentElement("afterend", controls);
    else heroContent.appendChild(controls);

    var slideElements = Array.prototype.slice.call(carousel.querySelectorAll(".rsb-home-hero-slide"));
    var controlElements = Array.prototype.slice.call(controls.querySelectorAll("button"));
    var activeIndex = 0;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var showSlide = function (nextIndex) {
      var next = (nextIndex + slides.length) % slides.length;
      if (next === activeIndex) return;

      var previous = activeIndex;
      activeIndex = next;
      slideElements[previous].classList.remove("is-active");
      slideElements[previous].classList.add("is-leaving");
      slideElements[next].classList.remove("is-leaving");
      slideElements[next].classList.add("is-active");

      controlElements.forEach(function (button, index) {
        var isActive = index === next;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (description) {
        description.classList.add("is-changing");
        window.setTimeout(
          function () {
            description.textContent = slides[next].text;
            description.classList.remove("is-changing");
          },
          reduceMotion ? 0 : 260
        );
      }

      window.setTimeout(
        function () {
          slideElements[previous].classList.remove("is-leaving");
        },
        reduceMotion ? 20 : 1250
      );
    };

    var stop = function () {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    var start = function () {
      stop();
      if (document.visibilityState === "hidden") return;
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    controlElements.forEach(function (button, index) {
      button.addEventListener("click", function () {
        showSlide(index);
        start();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") stop();
      else start();
    });

    start();
  }

  function runFixes() {
    fixAssets();
    applyRequestedChanges();
    initHomeHeroCarousel();
    initStableHorizontalProcess();
    updateHomeWorkGalleries();
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
        event.stopPropagation();
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

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(runFixes, 120);
  });

  var fixesStarted = false;
  function startFixes() {
    if (fixesStarted) return;
    fixesStarted = true;

    window.requestAnimationFrame(function () {
      runFixes();
      window.setTimeout(runFixes, 600);
      window.setTimeout(runFixes, 1600);

      new MutationObserver(runFixes).observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["src", "srcset"]
      });
    });
  }

  if (document.readyState === "complete") {
    window.setTimeout(startFixes, 0);
  } else {
    window.addEventListener("load", startFixes, { once: true });
  }
})();
