(function () {
  // Safe brand intro dismissal – no DOM node removal
  function dismissBrandIntro() {
    document.documentElement.classList.add("rsb-skip-intro");
    var intro = document.querySelector(".brand-intro");
    if (intro) intro.setAttribute("aria-hidden", "true");
  }
  window.setTimeout(dismissBrandIntro, 1800);

  // Hide sections we don't want via CSS class – never .remove()
  function hideSections() {
    var trust = null;
    document.querySelectorAll("section").forEach(function (s) {
      var eyebrow = s.querySelector(".eyebrow");
      if (!trust && eyebrow && eyebrow.textContent.indexOf("Confianza sin rodeos") !== -1) trust = s;
    });
    if (trust) trust.style.display = "none";
    document.querySelectorAll(".webgl-reveal-section").forEach(function (s) {
      s.style.display = "none";
    });
  }

  // Run after React has fully hydrated (long enough delay)
  window.addEventListener("load", function () {
    window.setTimeout(hideSections, 2500);
  });
})();
