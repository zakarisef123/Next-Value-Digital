// Next Value Digital — shared motion layer (loaded on every page)
// Generic fade-in/slide-up ([data-reveal]) and count-up ([data-count])
// already run from assets/js/main.js. This file adds everything else:
// the illustrative page visuals ([data-animate]) plus restrained site-wide
// polish: a soft light that follows the cursor on cards, fade transitions
// between pages, a scroll-to-top button and the contact timeline draw-in.
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // ---------- Illustrative visuals: laptop / SEA / Meta / LinkedIn ----------
  const animEls = document.querySelectorAll("[data-animate]");
  if (animEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      animEls.forEach((el) => el.classList.add("is-active"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-active");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      animEls.forEach((el) => io.observe(el));
    }
  }

  // ---------- Soft light that follows the cursor on cards ----------
  if (!reduceMotion && finePointer) {
    document
      .querySelectorAll(".card, .work-card, .blog-card, .featured-article, .founder-card, .sector-card, .method-item, .case-card")
      .forEach((card) => {
        card.classList.add("light-follow");
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        });
      });
  }

  // ---------- Fade transition between internal pages ----------
  // The fade-in is pure CSS (body animation), so pages stay visible if JS
  // fails; here we only fade out before following a same-site link.
  if (!reduceMotion) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      document.documentElement.classList.add("is-leaving");
      setTimeout(() => { location.href = url.href; }, 260);
    });
    // restore when coming back through the back/forward cache
    window.addEventListener("pageshow", () => document.documentElement.classList.remove("is-leaving"));
  }

  // ---------- Scroll-to-top button ----------
  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "scroll-top-btn";
  topBtn.setAttribute("aria-label", "Retour en haut de la page");
  topBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  document.body.appendChild(topBtn);
  const toggleTopBtn = () => topBtn.classList.toggle("is-visible", window.scrollY > 480);
  window.addEventListener("scroll", toggleTopBtn, { passive: true });
  toggleTopBtn();
  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  // ---------- Timeline draw-in (contact "what happens next") ----------
  const timelines = document.querySelectorAll(".steps-vertical");
  if (timelines.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      timelines.forEach((t) => t.classList.add("is-active"));
    } else {
      const tio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-active");
              tio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      timelines.forEach((t) => tio.observe(t));
    }
  }

  // ---------- SVG icon stroke draw-in (services, values, features) ----------
  if (!reduceMotion && "IntersectionObserver" in window) {
    const iconSvgs = document.querySelectorAll(".icon-wrap svg");
    iconSvgs.forEach((svg) => {
      const shapes = svg.querySelectorAll("path, circle, polyline, line, rect, polygon, ellipse");
      shapes.forEach((shape) => {
        if (typeof shape.getTotalLength !== "function") return;
        let len;
        try {
          len = shape.getTotalLength();
        } catch (e) {
          return;
        }
        if (!len) return;
        shape.setAttribute("data-draw", "");
        shape.style.strokeDasharray = len;
        shape.style.strokeDashoffset = len;
      });
    });
    const iconIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const shapes = entry.target.querySelectorAll("[data-draw]");
            shapes.forEach((shape, i) => {
              shape.style.transitionDelay = Math.min(i * 0.12, 0.4) + "s";
              shape.style.strokeDashoffset = "0";
            });
            iconIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    iconSvgs.forEach((svg) => iconIo.observe(svg));
  }
});
