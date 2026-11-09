(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  // 0 when the element's top reaches `start` of the viewport, 1 when its bottom reaches `end`
  function progress(el, start, end) {
    var r = el.getBoundingClientRect();
    var vh = innerHeight;
    return clamp((vh * start - r.top) / (r.height + vh * (start - end)));
  }

  // ---------- Intro: dive into a live miniature of this page ----------
  var root = document.documentElement;
  var isMirror = root.classList.contains("is-mirror");
  var dive = root.classList.contains("has-dive") ? document.querySelector("[data-dive]") : null;
  var monitor = dive ? dive.querySelector("[data-dive-monitor]") : null;
  var caption = dive ? dive.querySelector(".dive-caption") : null;
  var skip = dive ? dive.querySelector("[data-dive-skip]") : null;

  // The copy inside the monitor only needs to look right: no videos playing
  if (isMirror) {
    var vids = document.querySelectorAll("video");
    for (var vi = 0; vi < vids.length; vi++) {
      vids[vi].removeAttribute("autoplay");
      vids[vi].preload = "none";
      vids[vi].pause();
    }
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function diveTravel() { return dive.offsetHeight - innerHeight; }

  function updateDive() {
    if (!dive) return;
    var phone = root.clientWidth < 720;
    dive.classList.toggle("is-phone", phone);

    var travel = diveTravel();
    var p = clamp(travel > 0 ? -dive.getBoundingClientRect().top / travel : 1);
    var e = ease(p);

    // Start small, end at exactly 1:1 so the live copy lines up with the real page.
    // Interpolating the scale geometrically makes the zoom feel even all the way in.
    var s0 = phone ? 0.6 : 0.52;
    var s = p >= 1 ? 1 : s0 * Math.pow(1 / s0, e);
    var lift = (1 - e) * (phone ? -2 : -4);              // vh; leaves room for the stand
    var tiltX = 9 * (1 - clamp(p / 0.55));               // monitor leans back, then faces you
    monitor.style.transform =
      "translateY(" + lift.toFixed(2) + "vh) perspective(1800px) rotateX(" + tiltX.toFixed(2) + "deg) scale(" + s.toFixed(4) + ")";
    monitor.style.setProperty("--glare", (1 - e).toFixed(3));

    var fade = (1 - clamp(p * 5)).toFixed(3);
    caption.style.opacity = fade;
    skip.style.opacity = fade;
    skip.style.visibility = p > 0.2 ? "hidden" : "";

    dive.classList.toggle("is-done", p >= 1);
  }

  if (skip) {
    skip.addEventListener("click", function () {
      scrollTo({ top: dive.offsetTop + diveTravel(), behavior: "smooth" });
    });
  }

  // ---------- About: code "compiles" line by line ----------
  var codeBox = document.querySelector("[data-scroll-code]");
  var codeLines = codeBox ? codeBox.querySelectorAll(".ln") : [];

  function updateCode() {
    if (!codeBox) return;
    var p = reduce ? 1 : clamp(progress(codeBox, 0.9, 0.55) * 1.3);
    var shown = Math.round(p * codeLines.length);
    for (var i = 0; i < codeLines.length; i++) {
      codeLines[i].classList.toggle("on", i < shown);
      codeLines[i].classList.toggle("cursor", i === shown - 1 && shown < codeLines.length);
    }
    codeBox.classList.toggle("done", shown === codeLines.length);
  }

  // ---------- Journey: line fills, stops light up ----------
  var journey = document.querySelector("[data-journey]");
  var stops = journey ? journey.querySelectorAll(".stop") : [];

  function updateJourney() {
    if (!journey) return;
    var r = journey.getBoundingClientRect();
    var fillTo = reduce ? r.height : Math.max(0, Math.min(r.height, innerHeight * 0.6 - r.top));
    journey.style.setProperty("--fill", fillTo + "px");
    for (var i = 0; i < stops.length; i++) {
      stops[i].classList.toggle("reached", stops[i].offsetTop + 12 <= fillTo);
    }
  }

  // ---------- Scroll to sort ----------
  var sorter = document.querySelector("[data-sorter]");
  var N = 28;
  var frames = [];
  var barEls = [];
  var algo = "bubble";
  var BIG_O = { bubble: "O(n²)", insertion: "O(n²)", quick: "O(n log n)" };

  // Same shuffled input for every visitor and every algorithm
  function startArray() {
    var a = [], seed = 7;
    for (var i = 1; i <= N; i++) a.push(i);
    for (var j = N - 1; j > 0; j--) {
      seed = (seed * 9301 + 49297) % 233280;
      var k = Math.floor((seed / 233280) * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }

  function record(name) {
    var a = startArray(), out = [], cmp = 0, swp = 0;
    function snap(hi) { out.push({ a: a.slice(), hi: hi || [], cmp: cmp, swp: swp }); }
    function swap(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; swp++; }
    snap();
    if (name === "bubble") {
      for (var i = 0; i < N - 1; i++) {
        for (var j = 0; j < N - 1 - i; j++) {
          cmp++;
          if (a[j] > a[j + 1]) swap(j, j + 1);
          snap([j, j + 1]);
        }
      }
    } else if (name === "insertion") {
      for (var x = 1; x < N; x++) {
        for (var y = x; y > 0; y--) {
          cmp++;
          if (a[y - 1] > a[y]) { swap(y - 1, y); snap([y - 1, y]); } else { snap([y - 1, y]); break; }
        }
      }
    } else {
      (function quick(lo, hi) {
        if (lo >= hi) return;
        var pivot = a[hi], p = lo;
        for (var q = lo; q < hi; q++) {
          cmp++;
          if (a[q] < pivot) { swap(p, q); p++; }
          snap([q, hi]);
        }
        swap(p, hi);
        snap([p]);
        quick(lo, p - 1);
        quick(p + 1, hi);
      })(0, N - 1);
    }
    snap();
    return out;
  }

  function buildBars() {
    var box = sorter.querySelector(".bars");
    for (var i = 0; i < N; i++) {
      var b = document.createElement("span");
      box.appendChild(b);
      barEls.push(b);
    }
  }

  function draw(f, done) {
    var hi = {};
    for (var h = 0; h < f.hi.length; h++) hi[f.hi[h]] = true;
    for (var i = 0; i < N; i++) {
      barEls[i].style.height = (f.a[i] / N) * 100 + "%";
      barEls[i].className = done ? "done" : (hi[i] ? "hi" : "");
    }
    sorter.querySelector("[data-cmp]").textContent = f.cmp;
    sorter.querySelector("[data-swp]").textContent = f.swp;
  }

  function updateSorter() {
    if (!sorter) return;
    var r = sorter.getBoundingClientRect();
    var travel = r.height - innerHeight;
    var p = reduce ? 1 : clamp(travel > 0 ? -r.top / travel : 1);
    var idx = Math.round(p * (frames.length - 1));
    draw(frames[idx], idx === frames.length - 1);
  }

  function setAlgo(name) {
    algo = name;
    frames = record(name);
    sorter.querySelector("[data-bigo]").textContent = BIG_O[name];
    var tabs = sorter.querySelectorAll("[data-algo]");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute("aria-selected", tabs[i].dataset.algo === name ? "true" : "false");
    }
    updateSorter();
  }

  if (sorter) {
    buildBars();
    sorter.querySelector(".sorter-tabs").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-algo]");
      if (btn) setAlgo(btn.dataset.algo);
    });
    setAlgo(algo);
  }

  // ---------- One scroll loop for everything ----------
  var ticking = false;
  function update() {
    ticking = false;
    updateDive();
    updateCode();
    updateJourney();
    updateSorter();
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  update();
})();
