// Next Value Digital - shared site behaviour
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("open") ? "true" : "false"
      );
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // Header shrink + scrolled state, and scroll progress bar
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.style.padding = y > 20 ? "10px 0" : "18px 0";
      header.classList.toggle("scrolled", y > 20);
    }
    if (progress) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll with automatic stagger for grouped siblings
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window && revealEls.length) {
    // assign a small incremental delay to siblings sharing a parent
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const idx = groups.get(parent) || 0;
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.09, 0.6) + "s";
      groups.set(parent, idx + 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Count-up animation for elements with data-count
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const runCount = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
      if (reduceMotion) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(runCount);
    }
  }

  // FAQ accordion
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      const list = item.closest(".faq-list");
      if (list) {
        list.querySelectorAll(".faq-item.open").forEach((o) => {
          o.classList.remove("open");
          const b = o.querySelector(".faq-q");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
      if (!wasOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Blog category filter + search
  const catPills = document.querySelectorAll(".cat-pill");
  const searchInput = document.querySelector("[data-blog-search]");
  const posts = document.querySelectorAll("[data-post]");
  const applyFilter = () => {
    const active = document.querySelector(".cat-pill.active");
    const cat = active ? active.getAttribute("data-cat") : "all";
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    posts.forEach((post) => {
      const pc = post.getAttribute("data-cat") || "";
      const text = post.textContent.toLowerCase();
      const matchCat = cat === "all" || pc === cat;
      const matchTerm = !term || text.includes(term);
      post.style.display = matchCat && matchTerm ? "" : "none";
    });
  };
  if (catPills.length) {
    catPills.forEach((pill) =>
      pill.addEventListener("click", () => {
        catPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        applyFilter();
      })
    );
  }
  if (searchInput) searchInput.addEventListener("input", applyFilter);

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Static-site friendly submit: sends via FormSubmit when an action is set,
  // then shows the same inline confirmation without leaving the page.
  document.querySelectorAll("form[data-fake-submit]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const successId = form.getAttribute("data-fake-submit");
      const success = successId ? document.querySelector(successId) : null;
      const errorEl = form.querySelector("[data-form-error]");
      const submitBtn = form.querySelector('button[type="submit"]');
      const showSuccess = () => {
        if (success) {
          success.classList.add("show");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
      };
      const showError = () => {
        if (errorEl) errorEl.classList.add("show");
        if (submitBtn) submitBtn.disabled = false;
      };
      const endpoint = form.getAttribute("action");
      if (endpoint) {
        if (submitBtn) submitBtn.disabled = true;
        if (errorEl) errorEl.classList.remove("show");
        fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        })
          .then((res) => (res.ok ? showSuccess() : showError()))
          .catch(showError);
      } else {
        showSuccess();
      }
    });
  });
});
