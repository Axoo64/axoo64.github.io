// Skelvo — comportements partagés entre toutes les pages.
// Un seul fichier, pas de build : chaque bloc se désactive tout seul si la
// page ne contient pas les éléments concernés.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: bascule sombre/claire au premier pixel de scroll ----------
     Précédente version : bascule basée sur la position du bas du hero.
     Ça marchait pour un hero court, mais un hero avec beaucoup de contenu
     (ex. la page Contact : titre + statut + boutons + carte DM) peut être
     plus haut qu'un écran de téléphone — son propre contenu remonte alors
     sous la nav *avant* que le hero soit "fini", pendant que la nav est
     encore transparente : chevauchement illisible. Règle plus simple et
     robuste quelle que soit la hauteur du hero : dès qu'on a scrollé, même
     d'un pixel, la nav devient opaque — du contenu peut glisser sous elle
     à tout moment passé ce point, donc elle ne doit plus jamais être
     transparente après. */
  var navEl = document.querySelector('nav.top');
  var scrollCue = document.querySelector('.scroll-cue');
  if (navEl) {
    var syncNav = function () {
      navEl.classList.toggle('scrolled', window.scrollY > 4);
      // "Faites défiler" a fini son rôle dès qu'on a scrollé : on le sort
      // du chemin plutôt que de risquer qu'il traverse la nav plus tard.
      if (scrollCue) scrollCue.classList.toggle('hide', window.scrollY > 40);
    };
    syncNav();
    window.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Boutons magnétiques ----------
     Nudge léger vers le curseur dans un rayon donné. Ignoré au clavier/tactile
     et avec prefers-reduced-motion : le bouton reste un bouton normal. */
  if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      var radius = 46;
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = e.clientX - (rect.left + rect.width / 2);
        var my = e.clientY - (rect.top + rect.height / 2);
        var dist = Math.min(1, Math.hypot(mx, my) / (rect.width));
        btn.style.setProperty('--mx', (mx * 0.3 * (1 - dist)).toFixed(1) + 'px');
        btn.style.setProperty('--my', (my * 0.3 * (1 - dist)).toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }
})();
