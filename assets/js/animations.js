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
  // Starts the looping parts of a visual once it is on screen: SMIL motion
  // (pulses, tracers, staggered one per element) and the typed search query.
  const startVisual = (el) => {
    if (el.dataset.started) return;
    el.dataset.started = "1";
    const groups = el.querySelectorAll(".sys-pulse, .li-pulse, .sea-tracer, .dash-tracer");
    const base = { system: 1800, linkedin: 1600, sea: 4300, laptop: 2200 }[el.dataset.animate] || 1500;
    groups.forEach((g, i) => {
      setTimeout(() => {
        g.querySelectorAll("animateMotion, animate").forEach((a) => a.beginElement && a.beginElement());
      }, base + i * 420);
    });
    el.querySelectorAll("[data-type]").forEach((t) => {
      const text = t.getAttribute("data-type");
      let n = 0;
      setTimeout(function type() {
        t.textContent = text.slice(0, ++n);
        if (n < text.length) setTimeout(type, 55 + Math.random() * 45);
      }, 500);
    });
  };
  const animEls = document.querySelectorAll("[data-animate]");
  if (animEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      animEls.forEach((el) => {
        el.classList.add("is-active");
        el.querySelectorAll("[data-type]").forEach((t) => { t.textContent = t.getAttribute("data-type"); });
      });
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-active");
              io.unobserve(entry.target);
              // About "acquisition system": once the levers are wired in,
              // start the SMIL pulses travelling to the core, one per lever
              startVisual(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      animEls.forEach((el) => io.observe(el));
      window.addEventListener("scroll", () => {
        animEls.forEach((el) => {
          if (!el.classList.contains("is-active") && el.getBoundingClientRect().top < window.innerHeight * 0.85) {
            el.classList.add("is-active");
            startVisual(el);
          }
        });
      }, { passive: true });
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
      setTimeout(() => { location.href = url.href; }, 560);
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

// ==========================================================================
// Signature motion layer — cinematic but controlled.
// Page curtain, masked headline reveals, scroll-lit statements, parallax,
// 3D card entrances (CSS), cursor ring, magnetic CTAs, rolling button
// labels and a header that steps aside while reading. All of it is skipped
// under prefers-reduced-motion; the page is fully readable without JS.
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion) return;
  const root = document.documentElement;
  root.classList.add("motion-on");

  // ---------- Masked word reveal for headlines ----------
  const isClipText = (el) => {
    const cs = window.getComputedStyle(el);
    return (cs.webkitBackgroundClip || cs.backgroundClip || "").indexOf("text") !== -1;
  };
  const mask = (inner) => {
    const outer = document.createElement("span");
    outer.className = "w";
    outer.appendChild(inner);
    return outer;
  };
  const splitWords = (el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = part;
            frag.appendChild(mask(wi));
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          // gradient-clipped text must stay one run: animate it as one word
          if (isClipText(child)) {
            const wi = document.createElement("span");
            wi.className = "wi";
            child.replaceWith(mask(wi));
            wi.appendChild(child);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(el);
    el.querySelectorAll(".wi").forEach((w, i) => w.style.setProperty("--wd", Math.min(i * 0.055, 0.9) + "s"));
    el.classList.add("split-ready");
  };

  const heroTitles = document.querySelectorAll(".hero h1, .page-hero h1");
  heroTitles.forEach(splitWords);
  // let the page curtain lift first, then bring the title up
  setTimeout(() => heroTitles.forEach((h) => h.classList.add("split-in")), 420);

  const sectionTitles = document.querySelectorAll(
    ".section-head h2, .cta-band h2, .grid-2 h2, .feature-row h2, .legal-text h2"
  );
  sectionTitles.forEach(splitWords);
  const titleIo = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("split-in"); titleIo.unobserve(e.target); }
    }),
    { threshold: 0, rootMargin: "0px 0px -6% 0px" }
  );
  sectionTitles.forEach((t) => titleIo.observe(t));

  // ---------- Statements that light up word by word as you scroll ----------
  const litEls = Array.from(document.querySelectorAll("[data-scroll-text]"));
  litEls.forEach((el) => {
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span");
            s.className = "lit";
            s.textContent = part;
            words.push(s);
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    el._words = words;
  });

  // ---------- Parallax (uses the independent `translate` property so it
  // never fights hover/entrance transforms) ----------
  const parallax = [];
  const addParallax = (sel, speed) =>
    document.querySelectorAll(sel).forEach((el) => parallax.push({ el, speed }));
  addParallax(".laptop-mockup", 0.1);
  addParallax(".twin-orb", 0.12);
  addParallax(".system-visual", 0.08);
  addParallax(".case-visual", 0.05);
  addParallax(".featured-visual .article-mock", 0.08);
  const heroCopy = document.querySelector(".hero .hero-grid > div:first-child");

  // ---------- Header steps aside while reading, returns on scroll up ----------
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelector(".nav-links");
  let lastY = window.scrollY;

  let ticking = false;
  const onFrame = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;

    if (header) {
      const menuOpen = navLinks && navLinks.classList.contains("open");
      if (y > 320 && y > lastY + 4 && !menuOpen) header.classList.add("is-tucked");
      else if (y < lastY - 4 || y < 320) header.classList.remove("is-tucked");
    }
    lastY = y;

    // safety net for headline reveals the observer may have missed
    sectionTitles.forEach((t) => {
      if (!t.classList.contains("split-in") && t.getBoundingClientRect().top < vh) t.classList.add("split-in");
    });

    parallax.forEach(({ el, speed }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });

    if (heroCopy) {
      const p = Math.min(Math.max(y / (vh * 0.9), 0), 1);
      heroCopy.style.translate = `0 ${(y * 0.18).toFixed(1)}px`;
      heroCopy.style.opacity = (1 - p * 0.85).toFixed(3);
    }

    litEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      // 0 when the block enters at 88% of the viewport, 1 when it reaches 38%
      const start = vh * 0.88;
      const end = vh * 0.38 - r.height * 0.4;
      const p = Math.min(Math.max((start - r.top) / (start - end), 0), 1);
      const n = Math.round(p * el._words.length);
      el._words.forEach((w, i) => w.classList.toggle("on", i < n));
    });
  };
  const requestFrame = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  };
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  onFrame();

  // ---------- Rolling labels on buttons (text-only buttons) ----------
  document.querySelectorAll(".btn, .link-cta").forEach((btn) => {
    if (btn.children.length || !btn.textContent.trim()) return;
    const label = btn.textContent.trim();
    btn.setAttribute("aria-label", label);
    btn.innerHTML = "";
    const roll = document.createElement("span");
    roll.className = "roll";
    roll.setAttribute("aria-hidden", "true");
    roll.dataset.text = label;
    const inner = document.createElement("span");
    inner.textContent = label;
    roll.appendChild(inner);
    btn.appendChild(roll);
  });

  if (!finePointer) return;

  // ---------- Magnetic primary calls to action ----------
  document.querySelectorAll(".btn-primary, .btn-light, .btn-champagne").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.22;
      const dy = (e.clientY - r.top - r.height / 2) * 0.32;
      btn.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.translate = ""; });
  });

  // ---------- Cursor ring that eases after the pointer ----------
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.setAttribute("aria-hidden", "true");
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.append(ring, dot);
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    root.classList.add("cursor-visible");
  }, { passive: true });
  document.addEventListener("mouseleave", () => root.classList.remove("cursor-visible"));
  const interactive = "a, button, summary, input, textarea, select, label, .card, .sector-card, .work-card, .blog-card, .offer-card, .pack-card";
  document.addEventListener("mouseover", (e) => {
    ring.classList.toggle("is-hover", !!e.target.closest(interactive));
  });
  window.addEventListener("mousedown", () => ring.classList.add("is-press"));
  window.addEventListener("mouseup", () => ring.classList.remove("is-press"));
  const follow = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
});
