(function () {
  if (window.location.protocol !== "file:") return;

  var isSubpage = /\/(?:contacto|mas-servicios)\//.test(window.location.pathname.replace(/\\/g, "/"));
  var rootUrl = new URL(isSubpage ? "../" : "./", window.location.href);
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

  function fixAssets() {
    document.querySelectorAll("img").forEach(function (img) {
      var src = normalizeAsset(img.getAttribute("src"));
      if (src && src !== img.getAttribute("src")) img.setAttribute("src", src);
      if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    });

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      if (href === "/mas-servicios" || href === "/mas-servicios/" || href.indexOf("/reformasB/mas-servicios") === 0) {
        link.setAttribute("href", rootPath("mas-servicios/index.html"));
      }
      if (href.indexOf("/reformasB/contacto") === 0 || href === "/contacto" || href === "/contacto/") {
        link.setAttribute("href", rootPath("contacto/index.html"));
      }
      if (href === "/" || href === "/reformasB/") {
        link.setAttribute("href", rootPath("index.html?skipIntro=1"));
      }
      if (href === "/#presupuesto" || href === "/reformasB/#presupuesto") {
        link.setAttribute("href", rootPath("index.html?skipIntro=1#presupuesto"));
      }
      if (href === "/#proceso" || href === "/reformasB/#proceso") {
        link.setAttribute("href", rootPath("index.html?skipIntro=1#proceso"));
      }
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || /^(?:tel:|mailto:|https?:)/i.test(href)) return;

      if (href === "/" || href === "/reformasB/" || href === "index.html?skipIntro=1") {
        event.preventDefault();
        window.location.href = rootPath("index.html?skipIntro=1");
        return;
      }

      if (href === "/#presupuesto" || href === "#presupuesto") {
        if (!/\/index\.html(?:\?|$)/.test(window.location.pathname)) {
          event.preventDefault();
          window.location.href = rootPath("index.html?skipIntro=1#presupuesto");
        }
        return;
      }

      if (href === "/#proceso" || href === "#proceso") {
        if (!/\/index\.html(?:\?|$)/.test(window.location.pathname)) {
          event.preventDefault();
          window.location.href = rootPath("index.html?skipIntro=1#proceso");
        }
        return;
      }

      if (href === "/mas-servicios" || href === "/mas-servicios/" || href.indexOf("/reformasB/mas-servicios") === 0) {
        event.preventDefault();
        window.location.href = rootPath("mas-servicios/index.html");
        return;
      }

      if (href.indexOf("/reformasB/contacto") === 0 || href === "/contacto" || href === "/contacto/") {
        event.preventDefault();
        window.location.href = rootPath("contacto/index.html");
      }
    },
    true
  );

  fixAssets();
  new MutationObserver(fixAssets).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "srcset"]
  });
})();
