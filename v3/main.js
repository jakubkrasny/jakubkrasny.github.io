(function () {
  var dialog = document.getElementById("player");
  var frame = document.getElementById("player-frame");
  var title = document.getElementById("player-title");

  if (dialog && frame && title) {
    document.querySelectorAll("[data-yt]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var id = el.getAttribute("data-yt") || "";
        if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return;
        title.textContent = el.getAttribute("data-title") || "Videorecenze";
        frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        dialog.showModal();
      });
    });

    var closeBtn = dialog.querySelector("[data-close]");
    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

    dialog.addEventListener("close", function () {
      frame.src = "";
    });

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  var list = document.getElementById("novinky-list");
  if (!list || !window.fetch) return;

  function apply(data) {
    if (!data || !data.items || !data.items.length) return;
    var frag = document.createDocumentFragment();
    data.items.slice(0, 4).forEach(function (n) {
      if (!n || !n.url || !n.title) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = n.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      var time = document.createElement("time");
      time.textContent = n.date || "";
      var strong = document.createElement("strong");
      strong.textContent = n.title;
      var ext = document.createElement("span");
      ext.className = "sr-only";
      ext.textContent = " (otevře se na nové kartě)";
      a.append(time, strong, ext);
      li.append(a);
      frag.append(li);
    });
    if (frag.childNodes.length) list.replaceChildren(frag);
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  fetchJson("../news.json").then(apply).catch(function () {
    fetchJson("news.json").then(apply).catch(function () {});
  });
})();
