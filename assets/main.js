(function () {
  var root = document.documentElement;

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // Theme: follows the system until the visitor picks one
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      save("theme", next);
    });
  }

  // Language: content is written in both languages, CSS hides the inactive one
  var langBtn = document.getElementById("lang-toggle");
  function applyLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    if (langBtn) {
      langBtn.textContent = lang === "en" ? "TR" : "EN";
      langBtn.setAttribute("aria-label", lang === "en" ? "Türkçeye geç" : "Switch to English");
    }
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
  }
  applyLang(root.dataset.lang || "en");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      var next = root.dataset.lang === "en" ? "tr" : "en";
      applyLang(next);
      save("lang", next);
    });
  }

  // Hero: detection box locks on and the confidence counts up
  var target = document.querySelector("[data-detect-on-load]");
  if (target) {
    var finalScore = parseFloat(target.dataset.score || "0.97");
    var name = target.dataset.cls || "object";
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var status = document.querySelector("[data-hero-status]");

    function lock() {
      target.dataset.label = name + " " + finalScore.toFixed(2);
      if (status) status.classList.add("done");
    }

    if (reduce) {
      target.classList.add("is-on");
      lock();
    } else {
      setTimeout(function () {
        target.classList.add("is-on");
        var start = null;
        var duration = 900;
        function step(t) {
          if (start === null) start = t;
          var p = Math.min((t - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          target.dataset.label = name + " " + (eased * finalScore).toFixed(2);
          if (p < 1) requestAnimationFrame(step); else lock();
        }
        requestAnimationFrame(step);
      }, 500);
    }
  }
})();
