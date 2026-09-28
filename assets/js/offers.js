// Next Value Digital — offers / pricing page motion (tarifs.html, en/pricing.html)
// Staggered curtain reveal for [data-offer-reveal] blocks, price count-up on
// .offer-price .num[data-to], and a soft cursor-following light on plan cards.
// Everything is skipped under prefers-reduced-motion: content stays static.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  // Set before first paint so hidden-start states never flash visible.
  document.documentElement.classList.add("offers-motion");

  const fmt = new Intl.NumberFormat(document.documentElement.lang || "fr");
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);

  const countUp = (el) => {
    const target = parseFloat(el.getAttribute("data-to"));
    if (!target) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // round to tens so digits roll smoothly without jitter at the end
      const v = t < 1 ? Math.round((target * easeOut(t)) / 10) * 10 : target;
      el.textContent = fmt.format(v);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const blocks = document.querySelectorAll("[data-offer-reveal]");

    // Stagger siblings within the same parent; stagger list items per card.
    const groups = new Map();
    blocks.forEach((el) => {
      const i = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, i + 1);
      el.style.setProperty("--d", i * 0.14 + "s");
      el.querySelectorAll(".offer-list li").forEach((li, n) => li.style.setProperty("--i", n));
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-in");
          const delay = parseFloat(el.style.getPropertyValue("--d")) * 1000 || 0;
          el.querySelectorAll(".offer-price .num[data-to]").forEach((n) => {
            setTimeout(() => countUp(n), delay + 250);
          });
          setTimeout(() => el.classList.add("is-settled"), delay + 1300);
          io.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    blocks.forEach((el) => io.observe(el));

    // Cursor-following light on plan cards and the Prestige band.
    if (finePointer) {
      document.querySelectorAll(".offer-card, .prestige-band").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        });
      });
    }
  });
})();
