(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobilní menu */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".site-header")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Reveal při scrollu – jen transform/opacity, bez CLS */
  if (!reduce) {
    var items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add("is-in"); });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Filtr katalogu */
  var filters = document.querySelector(".filters");
  var cards = document.querySelectorAll(".card[data-cat], .price-row[data-cat]");
  var live = document.getElementById("katalog-stav");
  var priceList = document.querySelector(".price-list");
  if (filters && cards.length) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filters.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      var cat = btn.getAttribute("data-filter");
      var shown = 0;
      var rowsShown = 0;
      cards.forEach(function (card) {
        var ok = cat === "all" || card.getAttribute("data-cat") === cat;
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          shown += 1;
          if (card.classList.contains("price-row")) rowsShown += 1;
        }
      });
      if (priceList) priceList.hidden = rowsShown === 0;
      if (live) {
        live.textContent = cat === "all"
          ? "Zobrazeno všech " + shown + " položek."
          : "Zobrazeno " + shown + " položek ve zvolené kategorii.";
      }
    });
  }

  /* Mapa až po kliknutí */
  var mapBox = document.querySelector(".map");
  var mapBtn = document.querySelector("[data-map-load]");
  if (mapBox && mapBtn) {
    mapBtn.addEventListener("click", function () {
      var iframe = mapBox.querySelector("iframe");
      var src = mapBtn.getAttribute("data-map-src");
      if (iframe && src) {
        iframe.src = src;
        mapBox.classList.add("is-loaded");
      }
    });
  }

  /* Formulář – validace, mailto, žádný backend */
  var form = document.getElementById("poptavka-form");
  if (form) {
    var fields = {
      jmeno: { el: form.querySelector("#jmeno"), msg: "Vyplňte prosím jméno." },
      email: { el: form.querySelector("#email"), msg: "Zadejte platný e-mail." },
      telefon: { el: form.querySelector("#telefon"), msg: "Zadejte telefon (alespoň 9 číslic)." },
      datum: { el: form.querySelector("#datum"), msg: "Vyberte datum akce." },
      misto: { el: form.querySelector("#misto"), msg: "Uveďte místo konání." }
    };
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var phoneRe = /^(?:\+?420)?\s*(?:\d\s*){9,}$/;

    function setError(field, text) {
      var err = form.querySelector('[data-error-for="' + field + '"]');
      if (err) err.textContent = text || "";
      if (fields[field] && fields[field].el) {
        fields[field].el.setAttribute("aria-invalid", text ? "true" : "false");
      }
    }

    function todayISO() {
      var d = new Date();
      var m = String(d.getMonth() + 1);
      var day = String(d.getDate());
      if (m.length < 2) m = "0" + m;
      if (day.length < 2) day = "0" + day;
      return d.getFullYear() + "-" + m + "-" + day;
    }
    if (fields.datum.el) {
      fields.datum.el.setAttribute("min", todayISO());
    }

    function validate() {
      var ok = true;
      var jmeno = fields.jmeno.el.value.trim();
      var email = fields.email.el.value.trim();
      var telefon = fields.telefon.el.value.trim();
      var datum = fields.datum.el.value.trim();
      var misto = fields.misto.el.value.trim();
      var dnes = todayISO();
      setError("jmeno", jmeno ? "" : fields.jmeno.msg);
      if (!jmeno) ok = false;
      setError("email", emailRe.test(email) ? "" : fields.email.msg);
      if (!emailRe.test(email)) ok = false;
      setError("telefon", phoneRe.test(telefon) ? "" : fields.telefon.msg);
      if (!phoneRe.test(telefon)) ok = false;
      if (!datum) {
        setError("datum", fields.datum.msg);
        ok = false;
      } else if (datum < dnes) {
        setError("datum", "Datum akce musí být v budoucnu.");
        ok = false;
      } else {
        setError("datum", "");
      }
      setError("misto", misto ? "" : fields.misto.msg);
      if (!misto) ok = false;
      return ok;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener("input", function () { setError(key, ""); });
      fields[key].el.addEventListener("blur", validate);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var first = form.querySelector("[aria-invalid='true']");
        if (first) first.focus();
        return;
      }
      var chosen = Array.prototype.slice.call(form.querySelectorAll('input[name^="atrakce-"]:checked'))
        .map(function (c) { return c.value; });
      var jine = (form.querySelector("#jine") || {}).value || "";
      var zprava = (form.querySelector("#zprava") || {}).value || "";
      var lines = [
        "Poptávka termínu – Atrakce Pohoda",
        "",
        "Jméno: " + fields.jmeno.el.value.trim(),
        "E-mail: " + fields.email.el.value.trim(),
        "Telefon: " + fields.telefon.el.value.trim(),
        "Datum akce: " + fields.datum.el.value.trim(),
        "Místo: " + fields.misto.el.value.trim(),
        "Atrakce: " + (chosen.length ? chosen.join(", ") : "neuvedeno"),
        jine ? "Další požadavky: " + jine.trim() : "",
        zprava ? "Zpráva: " + zprava.trim() : ""
      ].filter(Boolean);
      var mailto = "mailto:janahed@seznam.cz?subject=" +
        encodeURIComponent("Poptávka termínu – " + fields.datum.el.value) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      var success = document.getElementById("form-success");
      if (success) {
        success.classList.add("is-visible");
        success.focus();
      }
      window.location.href = mailto;
    });
  }

  /* Lightbox galerie */
  var dialog = document.getElementById("lightbox");
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".gallery a"));
  if (dialog && galleryLinks.length && typeof dialog.showModal === "function") {
    var img = dialog.querySelector("img");
    var cap = dialog.querySelector("p");
    var idx = 0;
    function show(i) {
      idx = (i + galleryLinks.length) % galleryLinks.length;
      var a = galleryLinks[idx];
      img.src = a.getAttribute("data-full") || a.getAttribute("href");
      img.alt = a.getAttribute("data-alt") || "";
      cap.textContent = a.getAttribute("data-caption") || "";
    }
    galleryLinks.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
        dialog.showModal();
      });
    });
    var closeBtn = dialog.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
    var prev = dialog.querySelector(".lightbox-prev");
    var next = dialog.querySelector(".lightbox-next");
    if (prev) prev.addEventListener("click", function () { show(idx - 1); });
    if (next) next.addEventListener("click", function () { show(idx + 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }
})();
