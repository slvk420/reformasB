(function () {
  var STORAGE_KEY = "rsbCookieConsent";
  var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var POLICY_PATH = "/politica-cookies/";
  var bannerEl = null;

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
      '<p class="rsb-cookie-text">No utilizamos cookies de analítica ni publicidad. Guardamos tu elección sobre este aviso únicamente en tu navegador. <a href="' +
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
    });
    el.querySelector("[data-rsb-cookie-reject]").addEventListener("click", function () {
      writeConsent("rejected");
      hideBanner();
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
    if (!readConsent()) showBanner();
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

  window.rsbCookies = { get: readConsent, open: showBanner };
})();
