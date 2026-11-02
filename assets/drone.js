// A small quadcopter that wanders around the page, hovers to "scan",
// dodges the cursor, and gets a detection box when you manage to click it.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  var small = matchMedia("(max-width: 720px)").matches;
  var SIZE = small ? 34 : 44;
  var HEADER = 64;          // keep clear of the sticky nav
  var MAX_SPEED = small ? 1.6 : 2.2;   // px per 16 ms frame
  var FLEE_SPEED = MAX_SPEED * 2.4;
  var FLEE_RADIUS = small ? 0 : 90;    // no hover-flee on touch screens

  var el = document.createElement("div");
  el.className = "drone";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Drone");
  el.style.width = el.style.height = SIZE + "px";
  el.innerHTML =
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<g class="drone-arms">' +
        '<line x1="12" y1="12" x2="36" y2="36"/><line x1="36" y1="12" x2="12" y2="36"/>' +
      '</g>' +
      '<g class="drone-rotors">' +
        '<circle cx="11" cy="11" r="8"/><circle cx="37" cy="11" r="8"/>' +
        '<circle cx="11" cy="37" r="8"/><circle cx="37" cy="37" r="8"/>' +
      '</g>' +
      '<g class="drone-blades">' +
        '<g transform="translate(11 11)"><line x1="-6" y1="0" x2="6" y2="0"/></g>' +
        '<g transform="translate(37 11)"><line x1="-6" y1="0" x2="6" y2="0"/></g>' +
        '<g transform="translate(11 37)"><line x1="-6" y1="0" x2="6" y2="0"/></g>' +
        '<g transform="translate(37 37)"><line x1="-6" y1="0" x2="6" y2="0"/></g>' +
      '</g>' +
      '<rect class="drone-body" x="18" y="18" width="12" height="12" rx="3"/>' +
      '<circle class="drone-led" cx="24" cy="21.5" r="1.6"/>' +
    '</svg>' +
    '<span class="drone-scan" aria-hidden="true"></span>' +
    '<span class="drone-label mono" aria-hidden="true"></span>';
  document.body.appendChild(el);

  var svg = el.querySelector("svg");
  var blades = el.querySelectorAll(".drone-blades > g > line");
  var label = el.querySelector(".drone-label");

  var w, h;
  function measure() { w = root.clientWidth; h = innerHeight; }
  measure();

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randomPoint() {
    return { x: rand(SIZE, w - SIZE * 2), y: rand(HEADER + SIZE, h - SIZE * 2) };
  }

  // Enter from a random side, just off-screen
  var p = { x: Math.random() < 0.5 ? -SIZE : w + SIZE, y: rand(HEADER + SIZE, h * 0.6) };
  var v = { x: 0, y: 0 };
  var target = randomPoint();
  var state = "fly";        // fly | hover | flee
  var hoverUntil = 0;
  var mouse = { x: -1e4, y: -1e4 };
  var angle = 0, t0 = performance.now(), last = t0, raf = 0;

  function step(now) {
    var dt = Math.min(3, (now - last) / 16.67);   // frames elapsed, capped after tab switches
    last = now;

    var cx = p.x + SIZE / 2, cy = p.y + SIZE / 2;
    var mdx = cx - mouse.x, mdy = cy - mouse.y;
    var md = Math.hypot(mdx, mdy);

    if (FLEE_RADIUS && md < FLEE_RADIUS && state !== "flee") {
      // Dart away from the cursor
      state = "flee";
      el.classList.remove("scanning");
      target = {
        x: Math.max(SIZE, Math.min(w - SIZE * 2, p.x + (mdx / (md || 1)) * 240)),
        y: Math.max(HEADER + SIZE, Math.min(h - SIZE * 2, p.y + (mdy / (md || 1)) * 240)),
      };
    }

    if (state === "hover") {
      v.x *= Math.pow(0.85, dt); v.y *= Math.pow(0.85, dt);
      if (now > hoverUntil) { state = "fly"; target = randomPoint(); el.classList.remove("scanning"); }
    } else {
      var dx = target.x - p.x, dy = target.y - p.y, d = Math.hypot(dx, dy);
      var top = state === "flee" ? FLEE_SPEED : MAX_SPEED;
      var speed = top * Math.min(1, d / 140);              // slow down on arrival
      var ax = (dx / (d || 1)) * speed - v.x, ay = (dy / (d || 1)) * speed - v.y;
      var k = 1 - Math.pow(1 - (state === "flee" ? 0.12 : 0.035), dt);
      v.x += ax * k; v.y += ay * k;
      if (d < 6) {
        if (state === "flee" || Math.random() < 0.55) {
          state = "hover";
          hoverUntil = now + rand(1200, 3200);
          el.classList.add("scanning");
        } else {
          target = randomPoint();
        }
      }
    }

    p.x += v.x * dt; p.y += v.y * dt;

    var bob = Math.sin((now - t0) / 380) * 2.5;
    var tilt = Math.max(-18, Math.min(18, v.x * 6));
    el.style.transform = "translate3d(" + p.x.toFixed(1) + "px," + (p.y + bob).toFixed(1) + "px,0)";
    svg.style.transform = "rotate(" + tilt.toFixed(1) + "deg)";   // bank the airframe, keep the box upright

    angle = (angle + 38 * dt) % 360;
    for (var i = 0; i < blades.length; i++) {
      blades[i].setAttribute("transform", "rotate(" + (i % 2 ? -angle : angle) + ")");
    }
    raf = requestAnimationFrame(step);
  }

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  addEventListener("resize", function () { measure(); target = randomPoint(); });
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "mouse") { mouse.x = e.clientX; mouse.y = e.clientY; }
  }, { passive: true });
  document.addEventListener("mouseleave", function () { mouse.x = mouse.y = -1e4; });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  // Caught it: show a detection box, then it escapes
  var caught = 0, labelTimer = 0;
  el.addEventListener("click", function () {
    caught++;
    var tr = root.dataset.lang === "tr";
    label.textContent = "drone " + (0.9 + Math.random() * 0.09).toFixed(2) +
      (caught > 1 ? "  ×" + caught : "");
    el.classList.add("caught");
    clearTimeout(labelTimer);
    labelTimer = setTimeout(function () { el.classList.remove("caught"); }, 1600);
    el.setAttribute("aria-label", tr ? "Drone tespit edildi" : "Drone detected");
    state = "flee";
    target = randomPoint();
  });

  start();
})();
