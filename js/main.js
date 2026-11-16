/* Autoservis Jan Sup – ukázka TEST-001. Vanilla JS, bez závislostí. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* Mobilní menu */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  var nav = document.querySelector('.main-nav');
  function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!isOpen()); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    /* Klik mimo otevřené menu menu jen zavře a neaktivuje prvek pod ním. */
    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        setMenu(false);
      }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* Ukázková validace formuláře – nic se neodesílá.
     Chybové řádky mají v CSS rezervovanou výšku, takže změna textu neposouvá layout. */
  var form = document.getElementById('poptavka-form');
  if (form) {
    var status = document.getElementById('form-status');
    var rules = {
      jmeno: function (v) { return v.trim().length >= 2 ? '' : 'Vyplňte jméno a příjmení.'; },
      telefon: function (v) {
        var n = v.replace(/[\s().\/-]/g, '');
        return /^(?:(?:\+|00)42[01])?[1-9]\d{8}$/.test(n) ? '' : 'Zadejte platné telefonní číslo.';
      },
      email: function (v) {
        return /^[^\s@]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(v.trim()) ? '' : 'Zadejte platný e-mail.';
      },
      sluzba: function (v) { return v ? '' : 'Vyberte službu.'; },
      zprava: function (v) { return v.trim().length >= 10 ? '' : 'Napište zprávu (alespoň 10 znaků).'; },
      gdpr: function (v, el) { return el.checked ? '' : 'Potvrďte prosím souhlas.'; }
    };
    function check(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var msg = rule(el.value, el);
      var err = document.getElementById('e-' + el.name);
      if (err) err.textContent = msg;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      return !msg;
    }
    form.addEventListener('blur', function (e) {
      if (e.target.name && e.target.value) check(e.target);
    }, true);
    form.addEventListener('change', function (e) {
      if (e.target.getAttribute('aria-invalid')) check(e.target);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var el = form.elements[name];
        if (!check(el) && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        status.className = 'form-status is-err';
        status.textContent = 'Zkontrolujte prosím zvýrazněná pole.';
        firstInvalid.focus();
        return;
      }
      status.className = 'form-status is-ok';
      status.textContent = 'Ukázka – formulář zatím nic neodesílá. Pro objednání volejte 603 955 423.';
      form.reset();
    });
  }

  /* Mapa Google – načte se až po kliknutí (souhlas návštěvníka) */
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var box = document.getElementById('map-box');
      var iframe = document.createElement('iframe');
      iframe.src = mapBtn.getAttribute('data-src');
      iframe.title = 'Mapa – Autoservis Jan Sup, Velká nad Veličkou 241';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      box.innerHTML = '';
      box.classList.add('is-loaded');
      box.appendChild(iframe);
      iframe.setAttribute('tabindex', '0');
      iframe.focus();
    });
  }

  /* Lightbox galerie (nativní <dialog>) */
  var dialog = document.getElementById('lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    var caption = document.getElementById('lightbox-caption');
    document.querySelectorAll('.gallery .ph').forEach(function (btn) {
      btn.addEventListener('click', function () {
        caption.textContent = btn.getAttribute('data-caption') || '';
        dialog.showModal();
      });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }
})();
