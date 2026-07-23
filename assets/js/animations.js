// Next Value Digital — page-specific animated visuals
// Triggers the illustrative components (laptop mockup, SEA graph, Meta
// mockup, LinkedIn network). Generic fade-in/slide-up ([data-reveal]) and
// count-up ([data-count]) already run from assets/js/main.js — this file
// only handles the extra visuals declared with [data-animate].
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll("[data-animate]");
  if (!els.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-active"));
    return;
  }

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
  els.forEach((el) => io.observe(el));
});
