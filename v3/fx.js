/* v3: úvodní efekt 4, karusely, světlo kurzoru, podpisový WebGL „Mátový proud“.
   Scroll zůstává nativní. Při omezení pohybu se efekty nespouští. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  var root = document.documentElement;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupField();
    setupRails();
    setupMarquee();
    setupHeader();
    setupDock();
    setupReveal();
    setupGlow();
    setupAvatar();
    if (!reduce && root.classList.contains("fx")) setupIntro();
    else root.classList.add("fx-done");
  });

  /* ---------- podpisový efekt: Mátový proud ---------- */
  function setupField() {
    var canvas = document.createElement("canvas");
    canvas.className = "field";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    var gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) {
      root.classList.add("no-gl");
      return;
    }
    var vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
    var fs = [
      "precision mediump float;",
      "uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform float u_scroll;uniform float u_dim;uniform float u_oct;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}",
      "float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){if(float(i)>=u_oct) break;v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return v;}",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/u_res;vec2 p=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
      "vec2 m=vec2(u_mouse.x*2.0-1.0,(1.0-u_mouse.y)*2.0-1.0);m.x*=u_res.x/u_res.y;",
      "float md=length(p-m*0.55);",
      "vec2 w=p+m*0.28*exp(-md*md*2.4);w.y+=u_scroll*1.15;w.x+=u_scroll*0.35;",
      "float t=u_time*0.065;",
      "float n1=fbm(w*1.45+vec2(t,-t*0.55));",
      "float n2=fbm(w*2.15+vec2(-t*0.7,t*0.4)+n1*1.4);",
      "vec3 deep=mix(vec3(0.0,0.02,0.14),vec3(0.0,0.06,0.12),smoothstep(0.0,1.0,uv.y));",
      "vec3 mint=vec3(0.082,0.867,0.345);vec3 violet=vec3(0.22,0.12,0.55);vec3 foam=vec3(0.55,0.95,0.75);",
      "float sheet=smoothstep(0.42,0.86,n2);float vein=smoothstep(0.48,0.52,n1);",
      "vec3 col=deep;col=mix(col,violet,sheet*0.45);col=mix(col,mint,smoothstep(0.58,0.95,n1)*0.5);col+=foam*vein*0.22;",
      "float bloom=exp(-md*md*2.4);col+=mint*bloom*0.28;col+=violet*exp(-md*4.0)*0.12;",
      "float vig=smoothstep(1.25,0.2,length(p));col*=mix(0.78,1.0,vig);",
      "col=mix(col,vec3(0.07,0.09,0.08),u_dim*0.82);",
      "gl_FragColor=vec4(col,1.0);}"
    ].join("");
    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        root.classList.add("no-gl");
        return null;
      }
      return s;
    }
    var vsh = shader(gl.VERTEX_SHADER, vs);
    var fsh = shader(gl.FRAGMENT_SHADER, fs);
    if (!vsh || !fsh) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.bindAttribLocation(prog, 0, "a");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      root.classList.add("no-gl");
      return;
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var loc = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      scroll: gl.getUniformLocation(prog, "u_scroll"),
      dim: gl.getUniformLocation(prog, "u_dim"),
      oct: gl.getUniformLocation(prog, "u_oct")
    };
    var mouse = { x: 0.72, y: 0.38 };
    var target = { x: 0.72, y: 0.38 };
    var dim = 0;
    var oct = Math.min(innerWidth, 900) < 700 ? 3 : 5;
    var dpr = Math.min(innerWidth < 700 ? 0.65 : 1, devicePixelRatio || 1);
    if (innerWidth < 700) dpr = Math.min(dpr, 0.7);
    function size() {
      var w = Math.max(2, Math.floor(innerWidth * dpr));
      var h = Math.max(2, Math.floor(innerHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, w, h);
    }
    size();
    addEventListener("resize", size);
    if (fine) {
      addEventListener("pointermove", function (e) {
        target.x = e.clientX / innerWidth;
        target.y = e.clientY / innerHeight;
      }, { passive: true });
    }
    var book = document.getElementById("rezervace");
    var dimTarget = 0;
    if (book && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        dimTarget = en[0].intersectionRatio > 0.28 ? 1 : 0;
      }, { threshold: [0, 0.28, 0.6] }).observe(book);
    }
    var on = true;
    document.addEventListener("visibilitychange", function () { on = !document.hidden; if (on) requestAnimationFrame(frame); });
    var last = 0;
    function frame(t) {
      if (!on) return;
      requestAnimationFrame(frame);
      var fps = dimTarget > 0.5 || reduce ? 12 : 30;
      if (t - last < 1000 / fps) return;
      last = t;
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      dim += (dimTarget - dim) * 0.08;
      var max = document.documentElement.scrollHeight - innerHeight;
      var sc = max > 0 ? Math.min(1, scrollY / max) : 0;
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, reduce ? 2.4 : t * 0.001);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
      gl.uniform1f(loc.scroll, sc);
      gl.uniform1f(loc.dim, dim);
      gl.uniform1f(loc.oct, oct);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
  }

  /* Ukázky jedou jen podle pozice scrollu. Žádné šipky, žádný vlastní posun stránky. */
  function setupRails() {
    var views = [];
    document.querySelectorAll("[data-rail]").forEach(function (track) {
      var view = document.createElement("div");
      view.className = "rail-view";
      track.parentNode.insertBefore(view, track);
      view.appendChild(track);
      track.classList.add("rail-track");
      if (!reduce) view.classList.add("is-pan");
      views.push(view);
    });
    if (reduce || !views.length) return;
    var ticking = false;
    function place() {
      ticking = false;
      var vh = window.innerHeight || 800;
      views.forEach(function (view) {
        var track = view.firstElementChild;
        if (!track) return;
        var max = track.scrollWidth - view.clientWidth;
        if (max <= 8) {
          track.style.transform = "none";
          return;
        }
        var top = view.getBoundingClientRect().top;
        var start = vh * 0.9;
        var end = vh * 0.18;
        var span = start - end;
        var p = span > 0 ? (start - top) / span : 0;
        if (p < 0) p = 0;
        if (p > 1) p = 1;
        var e = p * p * (3 - 2 * p);
        track.style.transform = "translate3d(" + (-max * e).toFixed(1) + "px,0,0)";
      });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(place);
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    place();
  }

  function setupMarquee() {
    document.querySelectorAll("[data-marquee]").forEach(function (list) {
      if (reduce) return;
      var kids = [].slice.call(list.children);
      kids.forEach(function (node) {
        var c = node.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        list.appendChild(c);
      });
      list.classList.add("marquee");
    });
  }

  function setupHeader() {
    var header = document.querySelector(".site-header");
    var hero = document.querySelector(".hero");
    if (!header || !hero) return;
    function upd() {
      var past = hero.getBoundingClientRect().bottom < 70;
      header.classList.toggle("is-light", past);
    }
    addEventListener("scroll", upd, { passive: true });
    upd();
  }

  function setupDock() {
    var dock = document.getElementById("dock");
    var book = document.getElementById("rezervace");
    var hero = document.querySelector(".hero");
    if (!dock || !hero) return;
    var bookOn = false;
    if (book && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { bookOn = en[0].isIntersecting; }, { threshold: 0.2 }).observe(book);
    }
    function upd() {
      var show = hero.getBoundingClientRect().bottom < 40 && !bookOn;
      dock.classList.toggle("on", show);
      document.body.classList.toggle("dock-on", show);
    }
    addEventListener("scroll", upd, { passive: true });
    setInterval(upd, 400);
    upd();
  }

  function setupReveal() {
    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".rise").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rise").forEach(function (el) { io.observe(el); });
  }

  function setupAvatar() {
    var slot = document.getElementById("avatar-jakub");
    if (!slot) return;
    var src = (slot.getAttribute("data-src") || "").trim();
    var yt = (slot.getAttribute("data-yt") || "").trim();
    if (!src && !yt) return;
    var img = slot.querySelector("img");
    if (src) {
      var video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      if (img) video.poster = img.currentSrc || img.src;
      video.src = src;
      slot.appendChild(video);
      slot.classList.add("has-media");
      return;
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-play";
    btn.setAttribute("data-yt", yt);
    btn.setAttribute("data-title", "Jakub Krásný");
    btn.innerHTML = '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="sr-only">Přehrát video Jakuba Krásného</span>';
    slot.appendChild(btn);
    slot.classList.add("has-media");
  }

  function setupGlow() {
    if (!fine || reduce) return;
    document.querySelectorAll(".panel,.usecase,.group,.reason,.quote,.case,.vcard,.media a").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--sx", (e.clientX - r.left) + "px");
        card.style.setProperty("--sy", (e.clientY - r.top) + "px");
      });
    });
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.translate = (dx * 0.12) + "px " + (dy * 0.2) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = "0 0"; });
    });
    var hero = document.querySelector(".hero");
    var photo = document.querySelector(".portrait");
    if (hero && photo) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        photo.style.transform = "rotateY(" + (px * -6) + "deg) rotateX(" + (py * 4) + "deg)";
      });
      hero.addEventListener("pointerleave", function () { photo.style.transform = ""; });
    }
  }

  /* ---------- úvodní efekt 4: prompt, přepínání modelů, fotka ze šumu ---------- */
  function setupIntro() {
    var hero = document.querySelector(".hero");
    var copy = document.querySelector(".hero-copy");
    var h1 = copy && copy.querySelector("h1");
    var lead = copy && copy.querySelector(".lead");
    var photo = document.querySelector(".portrait");
    var img = photo && photo.querySelector("img");
    if (!hero || !h1 || !photo) {
      root.classList.add("fx-done");
      return;
    }
    var aborted = false;
    function finish() {
      if (aborted) return;
      aborted = true;
      root.classList.add("fx-done");
    }
    addEventListener("scroll", function () { if (scrollY > 80) finish(); }, { passive: true });
    try {
      var box = document.createElement("div");
      box.className = "fxprompt";
      box.innerHTML = '<div class="fxp-top"><span class="fxp-dot"></span><b>Everbot</b><em></em></div><div class="fxp-in"><span class="fxp-txt"></span><i class="fxtc"></i></div><div class="fxp-models"><span>GPT</span><span>Claude</span><span>Gemini</span><span>Nano Banana</span></div>';
      copy.appendChild(box);
      var txt = box.querySelector(".fxp-txt");
      var st = box.querySelector("em");
      var models = [].slice.call(box.querySelectorAll(".fxp-models span"));
      var prompt = innerWidth < 640 ? "Ukaž, jak AI ve firmě ušetří čas" : "Vytvoř úvod pro Jakuba Krásného, AI konzultanta Everbotu";
      var pi = 0;
      function type() {
        if (aborted) return;
        if (pi <= prompt.length) {
          txt.textContent = prompt.slice(0, pi++);
          setTimeout(type, 22 + Math.random() * 28);
        } else send();
      }
      setTimeout(type, 360);
      function send() {
        if (aborted) return;
        st.textContent = "Vybírám model…";
        var i = 0;
        var iv = setInterval(function () {
          if (aborted) { clearInterval(iv); return; }
          models.forEach(function (m) { m.classList.remove("on"); });
          models[i % models.length].classList.add("on");
          i++;
          if (i > 8) {
            clearInterval(iv);
            models.forEach(function (m) { m.classList.remove("on"); });
            models[3].classList.add("on");
            st.textContent = "Nano Banana · generuji…";
            setTimeout(stream, 380);
          }
        }, 110);
      }
      function stream() {
        if (aborted) return;
        box.classList.add("out");
        setTimeout(function () { box.remove(); }, 480);
        denoise(photo, img, function () { revealText(h1, lead, finish); });
      }
    } catch (e) { finish(); }
  }

  function denoise(photo, img, done) {
    var rect = photo.getBoundingClientRect();
    var w = Math.max(32, Math.round(rect.width));
    var h = Math.max(32, Math.round(rect.height));
    var pc = document.createElement("canvas");
    pc.className = "fxpix";
    pc.width = w;
    pc.height = h;
    photo.appendChild(pc);
    var ctx = pc.getContext("2d");
    var hud = document.createElement("div");
    hud.className = "fxprog";
    hud.innerHTML = "<span></span><i><u></u></i>";
    photo.appendChild(hud);
    var label = hud.firstChild;
    var bar = hud.querySelector("u");
    var start = performance.now();
    var dur = innerWidth < 700 ? 1600 : 2600;
    var off = document.createElement("canvas");
    function draw(p) {
      ctx.clearRect(0, 0, w, h);
      if (img && img.naturalWidth) {
        var sc = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        var dw = img.naturalWidth * sc;
        var dh = img.naturalHeight * sc;
        var s = Math.min(1, 0.04 + Math.pow(p, 2) * 0.96);
        var sw = Math.max(3, Math.round(w * s));
        var sh = Math.max(3, Math.round(h * s));
        off.width = sw;
        off.height = sh;
        off.getContext("2d").drawImage(img, (w - dw) / 2 * s, (h - dh) / 2 * s, dw * s, dh * s);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, sw, sh, 0, 0, w, h);
      } else {
        ctx.fillStyle = "#143028";
        ctx.fillRect(0, 0, w, h);
      }
      var a = Math.pow(1 - p, 1.35) * 0.9;
      if (a > 0.02) {
        ctx.fillStyle = "rgba(46,243,121," + (a * 0.25) + ")";
        for (var i = 0; i < 80; i++) {
          ctx.globalAlpha = a;
          ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1);
        }
        ctx.globalAlpha = 1;
      }
    }
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      draw(p);
      label.textContent = "Nano Banana generuje obrázek… " + Math.round(p * 100) + " %";
      bar.style.width = (p * 100) + "%";
      if (p < 1) requestAnimationFrame(step);
      else {
        pc.style.transition = "opacity .45s";
        hud.style.transition = "opacity .45s";
        pc.style.opacity = "0";
        hud.style.opacity = "0";
        setTimeout(function () { pc.remove(); hud.remove(); }, 480);
        done();
      }
    }
    requestAnimationFrame(step);
  }

  function revealText(h1, lead, done) {
    var label = h1.textContent.replace(/\s+/g, " ").trim();
    h1.setAttribute("aria-label", label);
    var words = label.split(" ");
    h1.textContent = "";
    var spans = words.map(function (w, i) {
      var s = document.createElement("span");
      s.className = "fxword";
      s.textContent = (i ? " " : "") + w;
      h1.appendChild(s);
      return s;
    });
    var i = 0;
    function next() {
      if (i >= spans.length) {
        if (lead) lead.classList.add("fx-show");
        setTimeout(done, 240);
        return;
      }
      spans[i++].classList.add("on");
      setTimeout(next, 42);
    }
    next();
  }
})();
