(function () {
  // v2: bumped when se introdujo Analytics, para forzar a repreguntar a
  // quien ya había aceptado/rechazado cuando el aviso todavía no ofrecía
  // nada que aceptar (consentimiento previo no informado, no válido para
  // esta nueva finalidad).
  var STORAGE_KEY = "rsbCookieConsent_v2";
  var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var POLICY_PATH = "/politica-cookies/";
  var GA_MEASUREMENT_ID = "G-6PPX848GC5";
  var bannerEl = null;
  var analyticsLoaded = false;

  function readConsent() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      if (!data || !data.value || !data.ts) return null;
      if (Date.now() - data.ts > CONSENT_MAX_AGE_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: value, ts: Date.now() }));
    } catch (e) {}
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  function revokeAnalytics() {
    var hadAnalytics = analyticsLoaded;
    // Flag de opt-out oficial de Google: para el "Enhanced Measurement"
    // automático (scroll, engagement...) ANTES de borrar cookies, o un
    // evento en curso puede reescribir _ga_<ID> justo después del borrado.
    window["ga-disable-" + GA_MEASUREMENT_ID] = true;
    try {
      // gtag.js (cookie_domain: "auto") escala _ga/_ga_* al dominio
      // registrable superior (domain=.reformasb.com), no al host exacto —
      // hay que borrar probando esas variantes o la cookie sobrevive.
      var host = location.hostname;
      var parent = host.replace(/^www\./, "");
      var domainVariants = ["", "; domain=" + host, "; domain=" + parent, "; domain=." + parent];
      document.cookie.split(";").forEach(function (part) {
        var name = part.split("=")[0].trim();
        if (name === "_ga" || name.indexOf("_ga_") === 0) {
          domainVariants.forEach(function (d) {
            document.cookie = name + "=; Max-Age=0; path=/" + d;
          });
        }
      });
    } catch (e) {}
    if (hadAnalytics) window.location.reload();
  }

  function injectStyles() {
    if (document.getElementById("rsb-cookie-style")) return;
    var style = document.createElement("style");
    style.id = "rsb-cookie-style";
    style.textContent = [
      ".rsb-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:linear-gradient(135deg,#101714,#18201d 58%,#070a09);color:#f4efe6;padding:18px 20px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.35);font-family:inherit;transition:bottom .2s ease}",
      ".rsb-cookie-banner[hidden]{display:none!important}",
      ".rsb-cookie-inner{max-width:1040px;margin:0 auto;display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;justify-content:space-between}",
      ".rsb-cookie-text{flex:1 1 380px;font-size:.92rem;line-height:1.5;margin:0}",
      ".rsb-cookie-text a{color:#c9842f;text-decoration:underline}",
      ".rsb-cookie-actions{display:flex;gap:10px;flex-wrap:wrap;flex:0 0 auto}",
      ".rsb-cookie-btn{border-radius:999px;padding:10px 20px;font-size:.9rem;font-weight:600;cursor:pointer;background:transparent;border:1.5px solid transparent;white-space:nowrap;font-family:inherit}",
      ".rsb-cookie-btn-accept{border-color:#c9842f;color:#e0a85e}",
      ".rsb-cookie-btn-accept:hover{background:rgba(201,132,47,.16)}",
      ".rsb-cookie-btn-reject{border-color:rgba(244,239,230,.55);color:#f4efe6}",
      ".rsb-cookie-btn-reject:hover{background:rgba(244,239,230,.14)}",
      "@media (max-width:640px){.rsb-cookie-inner{flex-direction:column;align-items:stretch}.rsb-cookie-text{flex:1 1 auto}.rsb-cookie-actions{justify-content:stretch}.rsb-cookie-btn{flex:1 1 auto;text-align:center}}"
    ].join("");
    document.head.appendChild(style);
  }

  function hideBanner() {
    if (bannerEl) bannerEl.hidden = true;
  }

  function buildBanner() {
    if (bannerEl) return bannerEl;
    var el = document.createElement("div");
    el.className = "rsb-cookie-banner";
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Aviso de cookies");
    el.setAttribute("aria-live", "polite");
    el.hidden = true;
    el.innerHTML =
      '<div class="rsb-cookie-inner">' +
      '<p class="rsb-cookie-text">Usamos Google Analytics para saber cuántas visitas tiene la web, solo si nos das tu permiso. No utilizamos cookies de publicidad. <a href="' +
      POLICY_PATH +
      '">Más información</a></p>' +
      '<div class="rsb-cookie-actions">' +
      '<button type="button" class="rsb-cookie-btn rsb-cookie-btn-reject" data-rsb-cookie-reject>Rechazar</button>' +
      '<button type="button" class="rsb-cookie-btn rsb-cookie-btn-accept" data-rsb-cookie-accept>Aceptar</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(el);
    el.querySelector("[data-rsb-cookie-accept]").addEventListener("click", function () {
      writeConsent("accepted");
      hideBanner();
      loadAnalytics();
    });
    el.querySelector("[data-rsb-cookie-reject]").addEventListener("click", function () {
      writeConsent("rejected");
      hideBanner();
      revokeAnalytics();
    });
    bannerEl = el;
    return el;
  }

  function updateBannerOffset() {
    if (!bannerEl || bannerEl.hidden) return;
    var cta = document.querySelector(".sticky-cta");
    var offset = 0;
    if (cta) {
      var style = window.getComputedStyle(cta);
      if (style.position === "fixed" && style.display !== "none" && style.visibility !== "hidden") {
        var rect = cta.getBoundingClientRect();
        if (rect.height > 0 && rect.top < window.innerHeight) {
          offset = Math.round(window.innerHeight - rect.top);
        }
      }
    }
    bannerEl.style.bottom = offset ? offset + "px" : "0";
  }

  function showBanner() {
    injectStyles();
    var el = buildBanner();
    el.hidden = false;
    updateBannerOffset();
  }

  window.addEventListener("resize", updateBannerOffset);
  window.addEventListener("orientationchange", updateBannerOffset);

  function addFooterLink() {
    var container = document.querySelector(".footer-legal-links");
    if (!container || container.querySelector("[data-rsb-cookie-link]")) return;
    var link = document.createElement("a");
    link.href = POLICY_PATH;
    link.setAttribute("data-rsb-cookie-link", "1");
    link.textContent = "Cookies";
    container.appendChild(link);
  }

  function init() {
    addFooterLink();
    var consent = readConsent();
    if (!consent) {
      showBanner();
    } else if (consent.value === "accepted") {
      loadAnalytics();
    }
  }

  function scheduleInit() {
    var MAX_WAIT_MS = 3000;
    var SETTLE_MS = 250;
    var settleTimer = null;
    var maxTimer = null;
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(settleTimer);
      clearTimeout(maxTimer);
      observer.disconnect();
      init();
    }

    var observer = new MutationObserver(function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finish, SETTLE_MS);
    });

    if (window.MutationObserver) {
      // Solo childList: los carruseles/animaciones de local-fix.js mutan
      // atributos (style, class) de forma continua y nunca "asientan"; una
      // recuperación de hidratación de React sí inserta/quita nodos.
      observer.observe(document.body, { childList: true, subtree: true });
      settleTimer = setTimeout(finish, SETTLE_MS);
      maxTimer = setTimeout(finish, MAX_WAIT_MS);
    } else {
      setTimeout(finish, 1200);
    }
  }

  if (document.readyState === "complete") {
    scheduleInit();
  } else {
    window.addEventListener("load", scheduleInit);
  }

  window.rsbCookies = { get: readConsent, open: showBanner, analyticsLoaded: function () { return analyticsLoaded; } };
})();
