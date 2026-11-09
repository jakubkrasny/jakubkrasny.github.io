/* v3: odhalení textu a fotek při nativním scrollu.
   Žádné připínání, žádný vodorovný posun podle scrollu. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupMasks();
    setupReveal();
    setupChrome();
    setupAvatar();
  });

  function setupMasks() {
    if (reduce) return;
    document.querySelectorAll(".hero .eyebrow, .hero h1, .hero .lead").forEach(function (el) {
      if (el.querySelector(".ln")) return;
      var span = document.createElement("span");
      span.className = "ln";
      while (el.firstChild) span.appendChild(el.firstChild);
      el.appendChild(span);
      el.classList.add("mask");
    });
  }

  function setupReveal() {
    var nodes = document.querySelectorAll(".rise");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function setupChrome() {
    var header = document.querySelector(".site-header");
    var dock = document.getElementById("dock");
    var hero = document.querySelector(".hero");
    var book = document.getElementById("rezervace");
    var heroGone = false;
    var bookOn = false;
    function paint() {
      if (header) header.classList.toggle("is-scrolled", heroGone);
      if (dock) dock.classList.toggle("on", heroGone && !bookOn);
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
})();
