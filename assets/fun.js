(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Term of the day ----------
  var TERMS = [
    ["IoU (Intersection over Union)", "Overlap between a predicted box and the ground-truth box, divided by their combined area. 0.5 is the classic cut-off for calling a detection correct.", "Tahmin edilen kutu ile gerçek kutunun kesişiminin birleşimlerine oranı. Bir tespitin doğru sayılması için klasik eşik 0.5'tir."],
    ["mAP (mean Average Precision)", "The area under the precision–recall curve, averaged over classes. The headline number of most object detection papers.", "Precision–recall eğrisinin altındaki alanın sınıflar üzerinden ortalaması. Çoğu nesne tespiti makalesinin manşet metriği."],
    ["Non-Maximum Suppression", "When several boxes cover the same object, keep the most confident one and drop the others that overlap it too much.", "Aynı nesneyi birden çok kutu kapsadığında en emin olanı tutup onunla fazla örtüşen diğerlerini silme işlemi."],
    ["Data leakage", "When test data sneaks into training, usually as near-duplicates. The model looks brilliant and then fails in the real world.", "Test verisinin, genellikle neredeyse aynı kopyalar halinde, eğitime sızması. Model harika görünür, sonra gerçek dünyada çuvallar."],
    ["Overfitting", "Memorising the training set instead of learning the pattern. Training scores climb while validation scores stall.", "Kalıbı öğrenmek yerine eğitim setini ezberlemek. Eğitim skorları yükselirken doğrulama skorları yerinde sayar."],
    ["Data augmentation", "Creating new training examples by flipping, cropping, recolouring or mixing images, so the model sees more variety for free.", "Görüntüleri çevirerek, kırparak, renklerini değiştirerek ya da karıştırarak yeni eğitim örnekleri üretmek; model bedavaya daha fazla çeşitlilik görür."],
    ["Transfer learning", "Starting from a model trained on a huge dataset and fine-tuning it for your task, instead of training from zero.", "Sıfırdan eğitmek yerine dev bir veri setinde eğitilmiş bir modelden başlayıp onu kendi görevine göre ince ayarlamak."],
    ["Vision Transformer (ViT)", "Splits an image into patches and treats them like words in a sentence, letting attention relate any patch to any other.", "Görüntüyü yamalara bölüp bunlara cümledeki kelimeler gibi davranır; dikkat mekanizması her yamayı diğer her yamayla ilişkilendirebilir."],
    ["Precision", "Of everything the model flagged, how much was actually right. High precision means few false alarms.", "Modelin işaretlediği her şeyin ne kadarının gerçekten doğru olduğu. Yüksek precision, az yanlış alarm demektir."],
    ["Recall", "Of everything that was really there, how much the model found. High recall means few misses.", "Gerçekte var olan her şeyin ne kadarını modelin bulduğu. Yüksek recall, az kaçırma demektir."],
    ["F1-score", "The harmonic mean of precision and recall. It only gets high when both are high.", "Precision ve recall'un harmonik ortalaması. Ancak ikisi birden yüksekse yükselir."],
    ["Confusion matrix", "A table of what the model predicted versus what was true, showing exactly which classes it mixes up.", "Modelin tahminleri ile gerçek değerleri karşılaştıran tablo; hangi sınıfları birbirine karıştırdığını tam olarak gösterir."],
    ["ONNX", "An open format for trained models. Export once, then run anywhere with ONNX Runtime, without the training framework.", "Eğitilmiş modeller için açık bir format. Bir kez dışa aktar, sonra eğitim kütüphanesine ihtiyaç duymadan ONNX Runtime ile her yerde çalıştır."],
    ["Quantization", "Storing weights in 8-bit integers instead of 32-bit floats: a smaller, faster model for a small accuracy cost.", "Ağırlıkları 32 bit ondalık yerine 8 bit tam sayı olarak saklamak: biraz doğruluk karşılığında daha küçük ve hızlı bir model."],
    ["Early stopping", "Stop training when validation performance stops improving, before the model starts to overfit.", "Doğrulama performansı iyileşmeyi bıraktığında, model aşırı öğrenmeye başlamadan eğitimi durdurmak."],
    ["Learning rate schedule", "Changing the step size during training, usually large at first and smaller later, so the model settles into a good minimum.", "Eğitim boyunca adım büyüklüğünü değiştirmek; genelde önce büyük, sonra küçük. Model böylece iyi bir minimuma oturur."],
    ["Embedding", "A vector that captures what an image or word means, so similar things end up close together in space.", "Bir görüntünün ya da kelimenin anlamını yakalayan vektör; benzer şeyler uzayda birbirine yakın düşer."],
    ["Perceptual hash", "A short fingerprint of how an image looks. Two near-identical frames get nearly identical hashes, which makes duplicates easy to find.", "Bir görüntünün nasıl göründüğünün kısa parmak izi. Neredeyse aynı iki kare neredeyse aynı hash'i alır, böylece kopyalar kolayca bulunur."],
    ["Self-supervised learning", "Learning from unlabelled data by solving made-up tasks, like matching two crops of the same image. DINOv2 is trained this way.", "Etiketsiz veriden, aynı görüntünün iki kırpıntısını eşleştirmek gibi uydurma görevler çözerek öğrenmek. DINOv2 bu şekilde eğitilir."],
    ["Mosaic augmentation", "Stitching four training images into one, so the model sees objects at different scales and in odd contexts.", "Dört eğitim görüntüsünü tek bir görüntüde birleştirmek; model nesneleri farklı ölçeklerde ve alışılmadık bağlamlarda görür."],
    ["Backbone", "The feature-extracting part of a network, often pretrained, that the detection or classification head sits on.", "Ağın öznitelik çıkaran, çoğunlukla önceden eğitilmiş kısmı; tespit ya da sınıflandırma katmanı bunun üzerine oturur."],
    ["Feature map", "The grid of activations a convolutional layer produces: what the network 'sees' at each location.", "Bir evrişim katmanının ürettiği aktivasyon ızgarası: ağın her konumda 'gördüğü' şey."],
    ["Convolution", "Sliding a small learned filter over an image to detect local patterns such as edges, textures and shapes.", "Kenar, doku ve şekil gibi yerel kalıpları bulmak için görüntü üzerinde öğrenilmiş küçük bir filtreyi kaydırmak."],
    ["Attention", "A mechanism that lets each part of the input decide which other parts to focus on. The core of Transformers.", "Girdinin her parçasının hangi diğer parçalara odaklanacağına karar vermesini sağlayan mekanizma. Transformer'ların kalbi."],
    ["Batch normalization", "Normalising layer outputs within each mini-batch, which makes deep networks train faster and more stably.", "Katman çıktılarını her mini-batch içinde normalize etmek; derin ağlar daha hızlı ve kararlı eğitilir."],
    ["Dropout", "Randomly switching off neurons during training so the network cannot rely on any single path.", "Eğitim sırasında nöronları rastgele kapatmak; ağ tek bir yola bel bağlayamaz."],
    ["Ground truth", "The labels you trust as correct, usually drawn by humans. Every metric is only as good as these.", "Doğru kabul edilen, genelde insanların çizdiği etiketler. Her metrik ancak bunlar kadar iyidir."],
    ["Inference latency", "How long one prediction takes. For a drone, 30 ms per frame is real time; 3 seconds is a missed fire.", "Tek bir tahminin ne kadar sürdüğü. Bir drone için kare başına 30 ms gerçek zamanlıdır; 3 saniye kaçırılmış bir yangındır."],
    ["Edge deployment", "Running the model on the device itself, like a Jetson on a drone, instead of sending every frame to the cloud.", "Her kareyi buluta göndermek yerine modeli cihazın kendisinde, örneğin drone üzerindeki bir Jetson'da çalıştırmak."],
    ["Domain shift", "When real-world data differs from training data: new cameras, seasons or regions. The silent killer of deployed models.", "Gerçek dünya verisinin eğitim verisinden farklı olması: yeni kameralar, mevsimler ya da bölgeler. Yayındaki modellerin sessiz katili."],
    ["Letterboxing", "Resizing an image to fit a square input while keeping its aspect ratio, padding the leftover space with grey bars.", "Görüntüyü en-boy oranını koruyarak kare bir girdiye sığdırmak ve kalan boşluğu gri şeritlerle doldurmak."],
    ["Confidence threshold", "The minimum score a detection needs to count. Lower it to catch more, raise it to cry wolf less.", "Bir tespitin sayılması için gereken en düşük skor. Düşürürsen daha çok yakalarsın, yükseltirsen daha az yanlış alarm verirsin."]
  ];

  var card = document.getElementById("term");
  if (card) {
    var nameEl = card.querySelector(".term-name");
    var enEl = card.querySelector(".term-def [lang='en']");
    var trEl = card.querySelector(".term-def [lang='tr']");
    var countEl = card.querySelector(".term-count");
    var now = new Date();
    var dayNumber = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    var index = dayNumber % TERMS.length;

    card.querySelector(".term-date [lang='en']").textContent =
      now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    card.querySelector(".term-date [lang='tr']").textContent =
      now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    var show = function (i) {
      var t = TERMS[i];
      nameEl.textContent = t[0];
      enEl.textContent = t[1];
      trEl.textContent = t[2];
      countEl.textContent = (i + 1) + "/" + TERMS.length;
    };
    show(index);

    card.querySelector(".term-next").addEventListener("click", function () {
      index = (index + 1) % TERMS.length;
      show(index);
    });
  }

  // ---------- Easter egg: fire mode ----------
  var KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  var keys = [];
  var overlay = null;
  var frameTimer = null;
  var raf = null;

  function onKey(e) {
    if (e.key === "Escape" && overlay) { stopFire(); return; }
    if (!e.key || e.key.length > 10) return;
    keys.push(e.key.toLowerCase());
    if (keys.length > KONAMI.length) keys.shift();
    var typed = keys.join("");
    if (keys.join(",") === KONAMI.join(",") || /fire$/.test(typed) || /ateş$/.test(typed) || /ates$/.test(typed)) {
      keys = [];
      overlay ? stopFire() : startFire();
    }
  }
  document.addEventListener("keydown", onKey);

  // Touch devices: tap the name five times
  var hero = document.querySelector("[data-detect-on-load]");
  if (hero) {
    var taps = 0, tapTimer = null;
    hero.addEventListener("click", function () {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { taps = 0; }, 1200);
      if (taps >= 5) { taps = 0; overlay ? stopFire() : startFire(); }
    });
  }

  function startFire() {
    root.classList.add("fire-mode");
    overlay = document.createElement("div");
    overlay.className = "fire-hud";
    overlay.innerHTML =
      '<div class="fire-bar mono"><span class="fire-alarm">' +
      '<span lang="en">ALARM: FIRE</span><span lang="tr">ALARM: ATEŞ</span></span>' +
      '<span class="fire-frame">melihpak_DJI_0001 · frame <b>0</b></span></div>' +
      '<div class="fire-crosshair" aria-hidden="true"></div>' +
      '<canvas class="fire-embers" aria-hidden="true"></canvas>' +
      '<button class="fire-land mono" type="button">' +
      '<span lang="en">ESC · land the drone</span><span lang="tr">ESC · drone\'u indir</span></button>';
    document.body.appendChild(overlay);
    overlay.querySelector(".fire-land").addEventListener("click", stopFire);

    var frame = 0, frameEl = overlay.querySelector(".fire-frame b");
    frameTimer = setInterval(function () {
      frame++;
      frameEl.textContent = frame;
      if (frame % 20 === 0) spawnBox();
    }, 33);

    toast(root.dataset.lang === "tr"
      ? "🔥 Ateş tespit edildi. Panik yok, sadece gizli sürpriz."
      : "🔥 Fire detected. Relax, it's just the easter egg.");

    if (!reduce) embers(overlay.querySelector(".fire-embers"));
  }

  // Random fire/smoke detections that pop up and fade out
  function spawnBox() {
    if (!overlay) return;
    var smoke = Math.random() < 0.45;
    var w = 60 + Math.random() * 140, h = 50 + Math.random() * 110;
    var box = document.createElement("div");
    box.className = "fire-box mono";
    box.style.left = Math.random() * (root.clientWidth - w) + "px";
    box.style.top = 50 + Math.random() * (innerHeight - h - 110) + "px";
    box.style.width = w + "px";
    box.style.height = h + "px";
    if (smoke) box.style.setProperty("--box", "#2f8fd8");
    var label = document.createElement("span");
    label.textContent = (smoke ? "smoke " : "fire ") + (0.55 + Math.random() * 0.44).toFixed(2);
    box.appendChild(label);
    overlay.appendChild(box);
    setTimeout(function () { box.remove(); }, 1700);
  }

  function stopFire() {
    root.classList.remove("fire-mode");
    clearInterval(frameTimer);
    cancelAnimationFrame(raf);
    if (overlay) overlay.remove();
    overlay = null;
  }

  function embers(canvas) {
    var ctx = canvas.getContext("2d");
    var w, h, parts = [];
    function size() {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    }
    size();
    addEventListener("resize", size);
    for (var i = 0; i < 70; i++) parts.push(spawn(true));
    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 1 + Math.random() * 2.5,
        vy: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.6,
        life: 0.4 + Math.random() * 0.6
      };
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.y / 40) * 0.3;
        p.life -= 0.002;
        if (p.y < -10 || p.life <= 0) parts[i] = p = spawn(false);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.r > 2.2 ? "#ffb347" : "#ff6a1a";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
  }

  function toast(text) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add("show"); }, 20);
    setTimeout(function () { el.classList.remove("show"); }, 3200);
    setTimeout(function () { el.remove(); }, 3600);
  }

  // A hint for whoever opens the console
  console.log(
    "%c[detector]%c 1 curious developer detected (0.99). Try typing 'fire' or the Konami code. Source: github.com/MelihPAK/MelihPAK.github.io",
    "color:#ff7a2e;font-weight:bold", "color:inherit"
  );
})();
