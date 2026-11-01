(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Term of the day ----------
  var CATS = {
    ml: ["machine learning", "makine öğrenmesi"],
    algo: ["algorithms", "algoritmalar"],
    sys: ["operating systems", "işletim sistemleri"],
    net: ["networking", "ağlar"],
    db: ["databases", "veritabanları"],
    sw: ["software engineering", "yazılım mühendisliği"],
    sec: ["security", "güvenlik"]
  };

  // [category, term, English definition, Turkish definition]
  var TERMS = [
    ["algo", "Big-O notation", "How an algorithm's cost grows with input size, ignoring constants. O(n log n) sorts a million items; O(n²) makes you wait.", "Bir algoritmanın maliyetinin girdi boyutuyla nasıl büyüdüğü, sabitler göz ardı edilerek. O(n log n) bir milyon öğeyi sıralar; O(n²) seni bekletir."],
    ["ml", "IoU (Intersection over Union)", "Overlap between a predicted box and the ground-truth box, divided by their combined area. 0.5 is the classic cut-off for a correct detection.", "Tahmin edilen kutu ile gerçek kutunun kesişiminin birleşimlerine oranı. Doğru bir tespit için klasik eşik 0.5'tir."],
    ["sys", "Race condition", "When the result depends on which thread gets there first. Works on your machine, fails in production at 3 a.m.", "Sonucun hangi thread'in önce vardığına bağlı olması. Senin bilgisayarında çalışır, canlıda gece 3'te patlar."],
    ["net", "TCP three-way handshake", "SYN, SYN-ACK, ACK: the three messages two machines exchange before a TCP connection carries any data.", "SYN, SYN-ACK, ACK: iki makinenin bir TCP bağlantısı veri taşımadan önce değiştirdiği üç mesaj."],
    ["db", "ACID", "Atomicity, Consistency, Isolation, Durability: the guarantees that keep a bank transfer from losing money halfway.", "Atomiklik, Tutarlılık, Yalıtım, Kalıcılık: bir banka havalesinin yarıda para kaybetmesini önleyen garantiler."],
    ["sw", "Version control (Git)", "A history of every change to the code, so you can branch, experiment, collaborate and undo mistakes.", "Koddaki her değişikliğin geçmişi; dal açabilir, deneyebilir, birlikte çalışabilir ve hataları geri alabilirsin."],
    ["sec", "Hashing vs encryption", "Encryption can be reversed with a key; hashing cannot. Passwords should be hashed, never encrypted.", "Şifreleme bir anahtarla geri çözülebilir, hash'leme çözülemez. Parolalar şifrelenmez, hash'lenir."],
    ["algo", "Binary search", "Find an item in a sorted list by halving the search space each step: a million items in about 20 comparisons.", "Sıralı bir listede her adımda arama alanını yarıya indirerek öğe bulmak: bir milyon öğe yaklaşık 20 karşılaştırmada."],
    ["ml", "Overfitting", "Memorising the training set instead of learning the pattern. Training scores climb while validation scores stall.", "Kalıbı öğrenmek yerine eğitim setini ezberlemek. Eğitim skorları yükselirken doğrulama skorları yerinde sayar."],
    ["sys", "Deadlock", "Two threads each hold a lock the other needs, and both wait forever. Taking locks in a fixed order prevents it.", "İki thread'in her biri diğerinin ihtiyaç duyduğu kilidi tutar ve ikisi de sonsuza kadar bekler. Kilitleri sabit bir sırayla almak bunu önler."],
    ["net", "DNS", "The internet's phone book: it turns a name like melihpak.me into the IP address of a server.", "İnternetin telefon rehberi: melihpak.me gibi bir adı bir sunucunun IP adresine çevirir."],
    ["algo", "Recursion", "A function that solves a problem by calling itself on a smaller version of it, until it hits a base case.", "Bir problemi kendisini o problemin daha küçük bir hâli üzerinde çağırarak, temel duruma ulaşana kadar çözen fonksiyon."],
    ["ml", "Data leakage", "When test data sneaks into training, often as near-duplicates. The model looks brilliant, then fails in the real world.", "Test verisinin, çoğu zaman neredeyse aynı kopyalar halinde eğitime sızması. Model harika görünür, sonra gerçek dünyada çuvallar."],
    ["db", "Index", "A sorted lookup structure on a column, so the database finds rows without scanning the whole table.", "Bir sütun üzerinde sıralı bir arama yapısı; veritabanı tüm tabloyu taramadan satırları bulur."],
    ["sw", "Unit test", "A small automated check that one piece of code does what it should, so you can change things without fear.", "Bir kod parçasının yapması gerekeni yaptığını doğrulayan küçük otomatik kontrol; değişiklikleri korkmadan yapabilirsin."],
    ["sys", "Mutex", "A lock that lets only one thread into a critical section at a time.", "Kritik bölgeye aynı anda yalnızca bir thread'in girmesine izin veren kilit."],
    ["algo", "Dynamic programming", "Solve each overlapping subproblem once and store the answer, instead of recomputing it again and again.", "Örtüşen her alt problemi bir kez çözüp cevabı saklamak; aynı şeyi tekrar tekrar hesaplamamak."],
    ["ml", "Transfer learning", "Start from a model trained on a huge dataset and fine-tune it for your task, instead of training from zero.", "Sıfırdan eğitmek yerine dev bir veri setinde eğitilmiş bir modelden başlayıp onu kendi görevine göre ince ayarlamak."],
    ["net", "REST API", "A way to expose resources over HTTP with standard verbs: GET reads, POST creates, PUT updates, DELETE removes.", "Kaynakları standart HTTP fiilleriyle sunmanın yolu: GET okur, POST oluşturur, PUT günceller, DELETE siler."],
    ["sec", "SQL injection", "Smuggling SQL into user input so the database runs it. Parameterised queries shut the door.", "Kullanıcı girdisine SQL kaçırarak veritabanına çalıştırtmak. Parametreli sorgular bu kapıyı kapatır."],
    ["algo", "Hash table", "Maps keys to slots with a hash function, giving near-constant-time lookups. Python's dict is one.", "Anahtarları bir hash fonksiyonuyla yuvalara eşler ve neredeyse sabit sürede arama sağlar. Python'daki dict bir hash tablosudur."],
    ["sys", "Semaphore", "A counter that limits how many threads may use a resource at once, like seats at a table.", "Bir kaynağı aynı anda kaç thread'in kullanabileceğini sınırlayan sayaç; bir masadaki sandalyeler gibi."],
    ["ml", "Data augmentation", "Creating new training examples by flipping, cropping, recolouring or mixing images, so the model sees more variety for free.", "Görüntüleri çevirerek, kırparak, renklerini değiştirerek ya da karıştırarak yeni eğitim örnekleri üretmek; model bedavaya daha çok çeşitlilik görür."],
    ["db", "Normalization", "Splitting data into related tables so every fact is stored once, avoiding contradictions when it changes.", "Veriyi ilişkili tablolara bölerek her bilginin tek bir yerde tutulması; değiştiğinde çelişki oluşmaz."],
    ["sw", "Technical debt", "The future cost of a quick fix today. Like real debt, the interest grows if you never pay it back.", "Bugünkü hızlı bir çözümün gelecekteki maliyeti. Gerçek borç gibi, hiç ödemezsen faizi büyür."],
    ["algo", "BFS vs DFS", "Breadth-first explores a graph level by level and finds shortest paths; depth-first dives down one branch before backtracking.", "Genişlik öncelikli arama grafı seviye seviye gezer ve en kısa yolu bulur; derinlik öncelikli arama geri dönmeden önce bir dalın sonuna iner."],
    ["net", "WebSocket", "A connection that stays open so server and client can push messages both ways in real time, as in multiplayer games.", "Açık kalan bir bağlantı; sunucu ve istemci gerçek zamanlı olarak iki yönde de mesaj gönderebilir, çok oyunculu oyunlardaki gibi."],
    ["ml", "Vision Transformer (ViT)", "Splits an image into patches and treats them like words in a sentence, letting attention relate any patch to any other.", "Görüntüyü yamalara bölüp bunlara cümledeki kelimeler gibi davranır; dikkat mekanizması her yamayı diğer her yamayla ilişkilendirebilir."],
    ["sys", "Context switch", "The CPU saving one thread's state and loading another's. Cheap, but not free when it happens thousands of times a second.", "İşlemcinin bir thread'in durumunu kaydedip diğerininkini yüklemesi. Ucuzdur ama saniyede binlerce kez olunca bedava değildir."],
    ["algo", "Dijkstra's algorithm", "Finds the shortest path in a graph with non-negative edge weights by always expanding the closest unvisited node.", "Negatif olmayan ağırlıklı bir grafta en kısa yolu, her seferinde en yakın ziyaret edilmemiş düğümü genişleterek bulur."],
    ["ml", "Precision", "Of everything the model flagged, how much was actually right. High precision means few false alarms.", "Modelin işaretlediği her şeyin ne kadarının gerçekten doğru olduğu. Yüksek precision, az yanlış alarm demektir."],
    ["sec", "RBAC", "Role-Based Access Control: permissions belong to roles like admin or trainer, and users get roles, not individual permissions.", "Rol Tabanlı Erişim Kontrolü: yetkiler yönetici ya da antrenör gibi rollere aittir; kullanıcılara tek tek yetki değil, rol verilir."],
    ["db", "SQL JOIN", "Combining rows from two tables by a related column, like students with the courses they registered for.", "İki tablodaki satırları ilişkili bir sütun üzerinden birleştirmek; öğrencileri kayıt oldukları derslerle eşleştirmek gibi."],
    ["sw", "Agile sprint", "A short, fixed time box, often two weeks, in which a team plans, builds and reviews a slice of working software.", "Bir ekibin çalışan yazılımın bir parçasını planlayıp geliştirdiği ve gözden geçirdiği, genelde iki haftalık sabit süre."],
    ["ml", "Recall", "Of everything that was really there, how much the model found. High recall means few misses.", "Gerçekte var olan her şeyin ne kadarını modelin bulduğu. Yüksek recall, az kaçırma demektir."],
    ["algo", "Greedy algorithm", "Takes the best-looking choice at every step and never looks back. Fast, and sometimes provably optimal.", "Her adımda en iyi görünen seçimi yapar ve asla geri dönmez. Hızlıdır, bazen de en iyi sonucu verdiği kanıtlanabilir."],
    ["sys", "Virtual memory", "Each process gets its own address space; the OS maps it onto real RAM and disk behind the scenes.", "Her süreç kendi adres alanını alır; işletim sistemi bunu arka planda gerçek RAM'e ve diske eşler."],
    ["net", "Latency vs bandwidth", "Latency is how long one message takes to arrive; bandwidth is how much data fits through per second. A truck full of hard drives has huge bandwidth and terrible latency.", "Gecikme bir mesajın ne kadar sürede ulaştığı, bant genişliği saniyede ne kadar verinin geçebildiğidir. Sabit disk dolu bir kamyonun bant genişliği muazzam, gecikmesi berbattır."],
    ["ml", "Non-Maximum Suppression", "When several boxes cover the same object, keep the most confident one and drop the others that overlap it too much.", "Aynı nesneyi birden çok kutu kapsadığında en emin olanı tutup onunla fazla örtüşen diğerlerini silme işlemi."],
    ["algo", "Divide and conquer", "Split the problem, solve the halves, merge the answers. Merge sort and quicksort both work this way.", "Problemi böl, parçaları çöz, cevapları birleştir. Merge sort ve quicksort bu şekilde çalışır."],
    ["sys", "Process vs thread", "A process has its own memory; threads inside it share that memory, which makes them fast to talk and easy to break.", "Bir sürecin kendi belleği vardır; içindeki thread'ler bu belleği paylaşır, bu da iletişimi hızlı, hata yapmayı kolay kılar."],
    ["ml", "Embedding", "A vector that captures what an image or word means, so similar things end up close together in space.", "Bir görüntünün ya da kelimenin anlamını yakalayan vektör; benzer şeyler uzayda birbirine yakın düşer."],
    ["net", "HTTP status codes", "Three-digit answers from a server: 2xx it worked, 3xx look elsewhere, 4xx you made a mistake, 5xx the server did.", "Sunucunun üç haneli cevapları: 2xx oldu, 3xx başka yere bak, 4xx sen hata yaptın, 5xx sunucu hata yaptı."],
    ["algo", "Heap", "A tree that always keeps the smallest (or largest) item on top: the engine behind priority queues.", "En küçük (ya da en büyük) öğeyi her zaman tepede tutan ağaç: öncelik kuyruklarının motoru."],
    ["ml", "ONNX", "An open format for trained models. Export once, then run anywhere with ONNX Runtime, without the training framework.", "Eğitilmiş modeller için açık bir format. Bir kez dışa aktar, eğitim kütüphanesine gerek duymadan ONNX Runtime ile her yerde çalıştır."],
    ["sys", "Cache", "A small, fast copy of data you are likely to need again. A hit takes nanoseconds; a miss can be a hundred times slower.", "Tekrar ihtiyaç duyman muhtemel verinin küçük ve hızlı bir kopyası. İsabet nanosaniyeler sürer, ıskalama yüz kat yavaş olabilir."],
    ["ml", "Quantization", "Storing weights in 8-bit integers instead of 32-bit floats: a smaller, faster model for a small accuracy cost.", "Ağırlıkları 32 bit ondalık yerine 8 bit tam sayı olarak saklamak: biraz doğruluk karşılığında daha küçük ve hızlı bir model."],
    ["ml", "Attention", "A mechanism that lets each part of the input decide which other parts to focus on. The core of Transformers.", "Girdinin her parçasının hangi diğer parçalara odaklanacağına karar vermesini sağlayan mekanizma. Transformer'ların kalbi."],
    ["ml", "Dropout", "Randomly switching off neurons during training so the network cannot rely on any single path.", "Eğitim sırasında nöronları rastgele kapatmak; ağ tek bir yola bel bağlayamaz."],
    ["ml", "Domain shift", "When real-world data differs from training data: new cameras, seasons or regions. The silent killer of deployed models.", "Gerçek dünya verisinin eğitim verisinden farklı olması: yeni kameralar, mevsimler ya da bölgeler. Yayındaki modellerin sessiz katili."]
  ];

  var card = document.getElementById("term");
  if (card) {
    var catEl = card.querySelector(".term-cat");
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
      catEl.querySelector("[lang='en']").textContent = CATS[t[0]][0];
      catEl.querySelector("[lang='tr']").textContent = CATS[t[0]][1];
      nameEl.textContent = t[1];
      enEl.textContent = t[2];
      trEl.textContent = t[3];
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
