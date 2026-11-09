/* v3: GSAP jen na vstupy (řádky textu, ořez fotky, jemný posun).
   Scroll zůstává nativní. Nic se nepřipíná. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupChrome();
    setupAvatar();
    setupFilm();
    setupGlow();
    setupMagnetic();
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupMotion);
    else setupMotion();
  });

  function setupChrome() {
    var header = document.querySelector(".site-header");
    var dock = document.getElementById("dock");
    var hero = document.querySelector(".hero");
    var book = document.getElementById("rezervace");
    var heroGone = false;
    var bookOn = false;
    var bentoOn = false;
    function paint() {
      if (header) header.classList.toggle("is-scrolled", heroGone);
      if (dock) dock.classList.toggle("on", heroGone && !bookOn && !bentoOn);
    }
    if (!("IntersectionObserver" in window)) return;
    if (hero) {
      new IntersectionObserver(function (entries) {
        var box = entries[0].boundingClientRect;
        heroGone = !entries[0].isIntersecting && box.top < 0;
        paint();
      }, { threshold: 0 }).observe(hero);
    }
    if (book) {
      new IntersectionObserver(function (entries) {
        bookOn = entries[0].isIntersecting;
        paint();
      }, { threshold: 0.12 }).observe(book);
    }
    var bento = document.getElementById("pro-koho");
    if (bento) {
      new IntersectionObserver(function (entries) {
        bentoOn = entries[0].isIntersecting && entries[0].intersectionRatio > 0.08;
        paint();
      }, { threshold: [0, 0.08, 0.2, 0.45] }).observe(bento);
    }
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

  function splitLines(el) {
    if (el.querySelector(".line")) return [].slice.call(el.querySelectorAll(".line-in"));
    var label = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", label);
    var words = label.split(" ");
    el.textContent = "";
    var prevWrap = el.style.textWrap;
    el.style.textWrap = "wrap";
    var probes = words.map(function (word, i) {
      var s = document.createElement("span");
      s.textContent = word;
      s.style.display = "inline-block";
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
    var groups = [];
    var line = [];
    var top = null;
    probes.forEach(function (s) {
      var y = s.getBoundingClientRect().top;
      if (top === null || Math.abs(y - top) < 8) {
        line.push(s.textContent);
        top = y;
      } else {
        groups.push(line);
        line = [s.textContent];
        top = y;
      }
    });
    if (line.length) groups.push(line);
    el.style.textWrap = prevWrap;
    el.textContent = "";
    var inners = groups.map(function (group) {
      var mask = document.createElement("span");
      mask.className = "line";
      var inner = document.createElement("span");
      inner.className = "line-in";
      inner.textContent = group.join(" ");
      mask.appendChild(inner);
      el.appendChild(mask);
      return inner;
    });
    return inners;
  }

  function setupFilm() {
    var film = document.querySelector(".brand-film");
    if (!film) return;
    var src = (film.getAttribute("data-src") || "").trim();
    var video = film.querySelector("video");
    if (!src || !video) return;
    video.src = src;
    film.classList.add("is-live");
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }

  function setupMagnetic() {
    if (reduce || !matchMedia("(pointer: fine)").matches) return;
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.4;
        btn.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = "0 0"; });
    });
  }

  function setupGlow() {
    if (reduce) return;
    document.querySelectorAll("[data-glow]").forEach(function (canvas) { mountGlow(canvas); });
  }

  function mountGlow(canvas) {
    var gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    var vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
    var fs = [
      "precision mediump float;",
      "uniform vec2 u_res;uniform float u_time;",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/u_res;vec2 p=(uv-0.5)*2.0;p.x*=u_res.x/max(u_res.y,1.0);",
      "float t=u_time*0.35;",
      "vec2 a=vec2(sin(t)*0.35,-0.15+cos(t*0.8)*0.12);",
      "vec2 b=vec2(0.55+sin(t*0.6)*0.08,0.25);",
      "float da=length(p-a);float db=length(p-b);",
      "float oa=smoothstep(0.85,0.05,da);float ob=smoothstep(0.55,0.0,db);",
      "vec3 mint=vec3(0.08,0.87,0.34);vec3 violet=vec3(0.42,0.28,1.0);",
      "vec3 col=mint*oa+violet*ob*0.65;",
      "float alpha=clamp(oa*0.55+ob*0.28,0.0,0.72);",
      "gl_FragColor=vec4(col,alpha);}"
    ].join("");
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vsh = sh(gl.VERTEX_SHADER, vs);
    var fsh = sh(gl.FRAGMENT_SHADER, fs);
    if (!vsh || !fsh) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.bindAttribLocation(prog, 0, "a");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var locRes = gl.getUniformLocation(prog, "u_res");
    var locTime = gl.getUniformLocation(prog, "u_time");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function size() {
      var r = canvas.getBoundingClientRect();
      var w = Math.max(2, Math.floor(r.width * dpr));
      var h = Math.max(2, Math.floor(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    size();
    addEventListener("resize", size);
    var on = true;
    var seen = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        seen = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { on = !document.hidden; });
    var last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      if (!on || !seen) return;
      if (t - last < 33) return;
      last = t;
      gl.uniform2f(locRes, canvas.width, canvas.height);
      gl.uniform1f(locTime, t * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
  }

  function setupMotion() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    document.querySelectorAll("[data-lines]").forEach(function (el) {
      var inners = splitLines(el);
      if (!inners.length) return;
      if (el.getAttribute("data-lines") === "load") {
        gsap.from(inners, { yPercent: 110, duration: 0.9, ease: "power3.out", stagger: 0.07, delay: 0.05 });
        return;
      }
      gsap.set(inners, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(inners, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 });
        }
      });
    });

    gsap.utils.toArray("[data-clip]").forEach(function (el) {
      if (el.getAttribute("data-clip") === "load") {
        gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power3.out", delay: 0.08 });
        return;
      }
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });

    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (!isFinite(target)) return;
      var suffix = el.getAttribute("data-suffix") || "";
      var spaced = el.getAttribute("data-space") === "1";
      var proxy = { n: 0 };
      function paint() {
        var v = Math.round(proxy.n);
        var text = spaced ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") : String(v);
        el.innerHTML = text + suffix;
      }
      gsap.to(proxy, {
        n: target,
        duration: 1.35,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: paint
      });
    });

    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 6;
      var host = el.closest("section") || el;
      gsap.fromTo(el, { yPercent: -amt, scale: 1.12 }, {
        yPercent: amt,
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  }
})();
