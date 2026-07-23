// Next Value Digital — shared motion layer (loaded on every page)
// Generic fade-in/slide-up ([data-reveal]) and count-up ([data-count])
// already run from assets/js/main.js. This file adds everything else:
// the illustrative page visuals ([data-animate]) plus site-wide polish
// (magnetic buttons, 3D tilt cards, cursor spotlight, word-by-word
// heading reveals, a scroll-to-top button and the contact timeline draw-in).
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

  // ---------- Word-by-word heading reveal ----------
  const wrapWords = (el) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (part === "") return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const outer = document.createElement("span");
            outer.className = "word-split";
            const inner = document.createElement("span");
            inner.className = "word";
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          // background-clip:text gradients only paint through the element's
          // own inline text run — nesting inline-block word spans inside
          // breaks the clip and makes the text invisible, so leave it as-is.
          const cs = window.getComputedStyle(child);
          const clip = cs.webkitBackgroundClip || cs.backgroundClip || "";
          if (clip.indexOf("text") !== -1) return;
          walk(child);
        }
      });
    };
    walk(el);
    el.querySelectorAll(".word").forEach((w, i) => {
      w.style.transitionDelay = Math.min(i * 0.05, 0.6) + "s";
    });
  };

  if (!reduceMotion) {
    document.querySelectorAll(".section-head h1, .section-head h2").forEach(wrapWords);
  }

  // ---------- Dramatic curtain-wipe reveal for hero titles ----------
  if (!reduceMotion) {
    document.querySelectorAll(".hero h1, .page-hero h1").forEach((h) => {
      const curtain = document.createElement("span");
      curtain.className = "title-curtain";
      curtain.setAttribute("aria-hidden", "true");
      h.appendChild(curtain);
      requestAnimationFrame(() => {
        setTimeout(() => h.classList.add("curtain-active"), 120);
      });
    });
  }

  // ---------- Magnetic buttons ----------
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.add("magnetic-btn");
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = `translate(${nx * 8}px, ${ny * 8 - 2}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // ---------- 3D tilt on cards ----------
  if (!reduceMotion && finePointer) {
    const tiltEls = document.querySelectorAll(
      ".card, .price-card, .work-card, .blog-card, .featured-article, .founder-card, .sector-card, .method-item"
    );
    tiltEls.forEach((card) => {
      card.classList.add("tilt-target");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -9;
        const ry = (px - 0.5) * 9;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ---------- Cursor spotlight in hero sections ----------
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".hero, .page-hero").forEach((section) => {
      const spot = document.createElement("div");
      spot.className = "cursor-spotlight";
      spot.setAttribute("aria-hidden", "true");
      section.insertBefore(spot, section.firstChild);
      section.addEventListener("mousemove", (e) => {
        const r = section.getBoundingClientRect();
        spot.style.setProperty("--sx", ((e.clientX - r.left) / r.width) * 100 + "%");
        spot.style.setProperty("--sy", ((e.clientY - r.top) / r.height) * 100 + "%");
        spot.classList.add("is-on");
      });
      section.addEventListener("mouseleave", () => spot.classList.remove("is-on"));
    });
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

  // ---------- Twinkling starfield in dark sections ----------
  if (!reduceMotion) {
    document.querySelectorAll(".hero, .page-hero, .section-dark").forEach((section) => {
      const stars = document.createElement("div");
      stars.className = "starfield-layer";
      stars.setAttribute("aria-hidden", "true");
      section.insertBefore(stars, section.firstChild);
    });
  }

  // ---------- Cinematic sweeping spotlight beams (hero sections only) ----------
  if (!reduceMotion) {
    document.querySelectorAll(".hero, .page-hero").forEach((section) => {
      const beams = document.createElement("div");
      beams.className = "spotlight-beams";
      beams.setAttribute("aria-hidden", "true");
      beams.innerHTML = '<span class="beam"></span><span class="beam"></span><span class="beam"></span>';
      section.insertBefore(beams, section.firstChild);
    });
  }

  // ---------- Rotating glow ring on device panels & featured pricing ----------
  document
    .querySelectorAll(".laptop-screen, .device-mock, .inbox-mock, .price-card.featured, .price-card.prestige")
    .forEach((el) => el.classList.add("glow-ring"));
});
