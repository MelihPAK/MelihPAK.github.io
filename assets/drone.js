// A small quadcopter that wanders around the page, hovers to "scan",
// dodges the cursor, and gets a detection box when you manage to click it.
//
// It starts as a flat SVG and, once the page is idle, upgrades itself to a
// real 3D model rendered with three.js. If WebGL or the CDN is unavailable,
// or the visitor has Save-Data on, the SVG version simply keeps flying.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.documentElement.classList.contains("is-mirror")) return;   // the intro's live copy

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";   // minified ES module build

  var root = document.documentElement;
  var small = matchMedia("(max-width: 720px)").matches;
  var SIZE = small ? 34 : 44;
  var SIZE_3D = small ? 46 : 60;       // the 3D model needs a little more room to read
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
  var model = null;         // set once the 3D version is ready

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
  var caughtAt = -1e4;

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
    el.style.transform = "translate3d(" + p.x.toFixed(1) + "px," + (p.y + bob).toFixed(1) + "px,0)";

    if (model) {
      model.update(now, dt, v, state);
    } else {
      var tilt = Math.max(-18, Math.min(18, v.x * 6));
      svg.style.transform = "rotate(" + tilt.toFixed(1) + "deg)";   // bank the airframe, keep the box upright
      angle = (angle + 38 * dt) % 360;
      for (var i = 0; i < blades.length; i++) {
        blades[i].setAttribute("transform", "rotate(" + (i % 2 ? -angle : angle) + ")");
      }
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
    caughtAt = performance.now();
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

  // ---------- 3D upgrade ----------
  var saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return;

  function upgrade() {
    import(THREE_URL).then(function (THREE) {
      try { model = buildModel(THREE); } catch (e) { model = null; }
    }, function () { /* CDN blocked or offline: keep the SVG */ });
  }
  function whenIdle() {
    if ("requestIdleCallback" in window) requestIdleCallback(upgrade, { timeout: 3000 });
    else setTimeout(upgrade, 1200);
  }
  if (document.readyState === "complete") whenIdle();
  else addEventListener("load", whenIdle, { once: true });

  function buildModel(THREE) {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(SIZE_3D, SIZE_3D);
    renderer.setClearColor(0x000000, 0);
    var canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");

    var scene = new THREE.Scene();
    // Three-quarter view from above, so the airframe reads as 3D while still
    // looking like a drone seen over the page.
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 4.4, 3.4);
    camera.lookAt(0, -0.05, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 1.6));
    var sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-2, 5, 3);
    scene.add(sun);

    // Materials pick up the page's colour tokens, so the drone follows the theme
    var matBody = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.15 });
    var matShell = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 });
    var matDark = new THREE.MeshStandardMaterial({ color: 0x1a1a1d, roughness: 0.5, metalness: 0.3 });
    var matProp = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0 });
    var matDisc = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    var matLens = new THREE.MeshStandardMaterial({ color: 0x0b1a2a, roughness: 0.05, metalness: 0.6, emissive: 0x0a2540, emissiveIntensity: 0.6 });
    var matLed = new THREE.MeshBasicMaterial();
    var matTip = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 });

    var colGt = new THREE.Color(), colFire = new THREE.Color();
    function readTheme() {
      var cs = getComputedStyle(root);
      function c(name, fallback) { return (cs.getPropertyValue(name) || "").trim() || fallback; }
      matBody.color.set(c("--text", "#1c1917"));
      matShell.color.set(c("--text", "#1c1917")).lerp(new THREE.Color(c("--bg", "#fafaf9")), 0.12);
      matProp.color.set(c("--muted", "#57534e"));
      matDisc.color.set(c("--muted", "#57534e"));
      matTip.color.set(c("--fire", "#c2410c"));
      colGt.set(c("--gt", "#15803d"));
      colFire.set(c("--fire", "#c2410c"));
    }
    readTheme();
    new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    var darkQuery = matchMedia("(prefers-color-scheme: dark)");
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", readTheme);

    // Hierarchy: yaw (heading) > tilt (pitch/roll from velocity) > airframe.
    // The nose points along -Z.
    var yaw = new THREE.Group();
    var tilt = new THREE.Group();
    yaw.add(tilt);
    scene.add(yaw);

    // Fuselage: a flat box with a domed shell on top
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 0.95), matBody);
    tilt.add(body);
    var shell = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), matShell);
    shell.scale.set(0.78, 0.38, 1.18);
    shell.position.y = 0.1;
    tilt.add(shell);

    // Status LED on the tail
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), matLed);
    led.position.set(0, 0.13, 0.45);
    tilt.add(led);

    // Camera gimbal under the nose
    var gimbal = new THREE.Group();
    gimbal.position.set(0, -0.16, -0.36);
    tilt.add(gimbal);
    var gimbalBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), matDark);
    gimbal.add(gimbalBall);
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16), matLens);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.11;
    gimbal.add(lens);

    // Landing skids
    var skidGeo = new THREE.BoxGeometry(0.04, 0.04, 0.8);
    var legGeo = new THREE.BoxGeometry(0.03, 0.2, 0.03);
    [-1, 1].forEach(function (side) {
      var skid = new THREE.Mesh(skidGeo, matDark);
      skid.position.set(side * 0.3, -0.3, 0);
      tilt.add(skid);
      [-0.22, 0.22].forEach(function (z) {
        var leg = new THREE.Mesh(legGeo, matDark);
        leg.position.set(side * 0.27, -0.2, z);
        leg.rotation.z = side * 0.25;
        tilt.add(leg);
      });
    });

    // Four arms in an X, each with a motor, a two-blade prop and a blur disc
    var ARM = 1.05;
    var armGeo = new THREE.BoxGeometry(0.1, 0.07, ARM);
    var motorGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.14, 16);
    var tipGeo = new THREE.CylinderGeometry(0.135, 0.135, 0.03, 16);
    var bladeGeo = new THREE.BoxGeometry(0.78, 0.015, 0.07);
    var discGeo = new THREE.CircleGeometry(0.42, 32);
    var props = [];
    [[1, -1], [-1, -1], [1, 1], [-1, 1]].forEach(function (s, i) {
      var dir = new THREE.Vector3(s[0], 0, s[1]).normalize();
      var arm = new THREE.Mesh(armGeo, matBody);
      arm.position.copy(dir).multiplyScalar(ARM / 2 + 0.1);
      arm.rotation.y = Math.atan2(dir.x, dir.z);
      tilt.add(arm);

      var hub = dir.clone().multiplyScalar(ARM + 0.08);
      var motor = new THREE.Mesh(motorGeo, matDark);
      motor.position.set(hub.x, 0.06, hub.z);
      tilt.add(motor);
      // Front motors get the accent band, so the heading is easy to read
      if (s[1] < 0) {
        var tip = new THREE.Mesh(tipGeo, matTip);
        tip.position.set(hub.x, 0.02, hub.z);
        tilt.add(tip);
      }

      var prop = new THREE.Group();
      prop.position.set(hub.x, 0.15, hub.z);
      var blade = new THREE.Mesh(bladeGeo, matProp);
      prop.add(blade);
      var disc = new THREE.Mesh(discGeo, matDisc);
      disc.rotation.x = -Math.PI / 2;
      prop.add(disc);
      prop.userData.spin = i === 0 || i === 3 ? 1 : -1;   // diagonal pairs spin the same way
      tilt.add(prop);
      props.push(prop);
    });

    // Fit the camera to the airframe
    yaw.scale.setScalar(0.92);

    // Swap the SVG out for the canvas
    el.style.width = el.style.height = SIZE_3D + "px";
    p.x -= (SIZE_3D - SIZE) / 2; p.y -= (SIZE_3D - SIZE) / 2;
    SIZE = SIZE_3D;
    el.insertBefore(canvas, svg);
    el.classList.add("is-3d");

    var heading = Math.random() * Math.PI * 2, pitch = 0, roll = 0, scanPhase = 0;
    var euler = new THREE.Euler();

    function wrap(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

    return {
      update: function (now, dt, vel, st) {
        var speed = Math.hypot(vel.x, vel.y);

        // Turn to face the direction of travel; sweep slowly while scanning
        var turn = 0;
        if (speed > 0.25) {
          // screen x -> world x, screen y (down) -> world +z (toward the viewer)
          var want = Math.atan2(-vel.x, -vel.y);
          var diff = wrap(want - heading);
          var rate = st === "flee" ? 0.16 : 0.06;
          turn = diff * (1 - Math.pow(1 - rate, dt));
          heading += turn;
        } else if (st === "hover") {
          scanPhase += 0.03 * dt;
          heading += Math.sin(scanPhase) * 0.012 * dt;
        }
        yaw.rotation.y = heading;

        // Lean into the motion, in the drone's own frame
        var sinH = Math.sin(heading), cosH = Math.cos(heading);
        var fwd = -vel.x * sinH - vel.y * cosH;     // along the nose
        var lat = vel.x * cosH - vel.y * sinH;      // to the right
        var kTilt = 1 - Math.pow(0.85, dt);
        pitch += (-fwd * 0.09 - pitch) * kTilt;
        roll += (-lat * 0.09 - turn * 2.5 - roll) * kTilt;

        // A short wobble after being clicked
        var since = now - caughtAt, wobble = 0;
        if (since < 900) wobble = Math.sin(since / 40) * 0.35 * (1 - since / 900);

        euler.set(
          Math.max(-0.5, Math.min(0.5, pitch)),
          0,
          Math.max(-0.5, Math.min(0.5, roll + wobble))
        );
        tilt.rotation.copy(euler);

        // Gimbal stays level-ish and pans down while scanning
        gimbal.rotation.x = -euler.x + (st === "hover" ? -0.5 + Math.sin(now / 600) * 0.15 : -0.15);

        // Props: faster when fleeing; the blur disc thickens with rpm
        var rpm = st === "flee" ? 0.95 : 0.7;
        for (var i = 0; i < props.length; i++) props[i].rotation.y += props[i].userData.spin * rpm * dt;
        matDisc.opacity = st === "flee" ? 0.2 : 0.12;

        // LED: alternates green/orange like the SVG one; solid orange when caught
        var green = since >= 1600 && Math.floor(now / 700) % 2 === 0;
        matLed.color.copy(green ? colGt : colFire);

        renderer.render(scene, camera);
      },
    };
  }
})();
