(function () {
  const root = document.documentElement;
  function isPlaceholderEmail(address) {
    return !address || /@example\.com$/i.test(address);
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projects = document.querySelectorAll("[data-category]");
  const filterStatus = document.querySelector("[data-filter-status]");
  const form = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const glitchCanvas = document.querySelector("[data-letter-glitch]");

  if (glitchCanvas) {
    const context = glitchCanvas.getContext("2d");
    if (context) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]";
      let cells = [];
      let columns = 0;
      let rows = 0;
      let frame = 0;
      let lastDraw = 0;

      function randomGlyph() {
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }

      function resizeGlitch() {
        const bounds = glitchCanvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        glitchCanvas.width = Math.ceil(bounds.width * ratio);
        glitchCanvas.height = Math.ceil(bounds.height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        columns = Math.ceil(bounds.width / 17);
        rows = Math.ceil(bounds.height / 21);
        cells = Array.from({ length: columns * rows }, () => ({
          glyph: randomGlyph(),
          strength: 0.2 + Math.random() * 0.28,
        }));
        drawGlitch();
      }

      function drawGlitch(time) {
        if (time && time - lastDraw < 90) {
          frame = window.requestAnimationFrame(drawGlitch);
          return;
        }
        lastDraw = time || 0;
        const bounds = glitchCanvas.getBoundingClientRect();
        context.clearRect(0, 0, bounds.width, bounds.height);
        context.font = "12px 'IBM Plex Mono', monospace";
        context.textBaseline = "top";
        context.fillStyle = getComputedStyle(root).getPropertyValue("--accent").trim() || "#0c5c56";

        cells.forEach((cell, index) => {
          if (Math.random() < 0.025) cell.glyph = randomGlyph();
          cell.strength = Math.max(0.18, cell.strength * 0.94);
          if (Math.random() < 0.018) cell.strength = 0.55 + Math.random() * 0.45;
          context.globalAlpha = cell.strength;
          context.fillText(cell.glyph, (index % columns) * 17, Math.floor(index / columns) * 21);
        });

        if (Math.random() < 0.18) {
          context.globalAlpha = 0.18;
          context.fillRect(0, Math.random() * bounds.height, bounds.width, 1);
        }
        context.globalAlpha = 1;

        if (!reducedMotion.matches && !document.hidden) {
          frame = window.requestAnimationFrame(drawGlitch);
        }
      }

      function updateMotion() {
        window.cancelAnimationFrame(frame);
        drawGlitch();
      }

      const resizeObserver = new ResizeObserver(resizeGlitch);
      resizeObserver.observe(glitchCanvas.parentElement);
      reducedMotion.addEventListener("change", updateMotion);
      document.addEventListener("visibilitychange", updateMotion);
      resizeGlitch();
    }
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        /* ignore storage failures */
      }
    });
  }

  setTheme(root.getAttribute("data-theme") || "light");

  const storedTheme = (function () {
    try {
      return localStorage.getItem("theme");
    } catch (error) {
      return null;
    }
  })();

  if (!storedTheme && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
      setTheme(event.matches ? "dark" : "light");
    });
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("[data-nav] a[href^='#']");

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const byId = {};
    navLinks.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const link = byId[entry.target.id];
          if (!link || !entry.isIntersecting) return;
          navLinks.forEach(function (item) {
            item.removeAttribute("aria-current");
          });
          link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  if ("IntersectionObserver" in window) {
    const revealItems = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function applyFilter(category) {
    let visible = 0;
    projects.forEach(function (project) {
      const show = category === "all" || project.getAttribute("data-category") === category;
      project.hidden = !show;
      if (show) visible += 1;
    });
    if (filterStatus) {
      const label = category === "all" ? "" : document.querySelector('[data-filter="' + category + '"]').textContent.trim() + " ";
      filterStatus.textContent = "Showing " + visible + " " + label + (visible === 1 ? "project." : "projects.");
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      applyFilter(button.getAttribute("data-filter"));
    });
  });

  document.querySelectorAll("[data-email-link]").forEach(function (link) {
    const address = (link.getAttribute("href") || "").replace("mailto:", "");
    if (isPlaceholderEmail(address)) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !email || !message) {
        setFormStatus("Please fill in your name, email, and message.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormStatus("Enter a valid email address so I can reply.");
        return;
      }

      const siteEmail = (form.getAttribute("data-site-email") || "").trim();
      if (isPlaceholderEmail(siteEmail)) {
        setFormStatus("Email is not connected yet. Please use LinkedIn or GitHub instead.");
        return;
      }

      const subject = encodeURIComponent("Portfolio inquiry from " + name);
      const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:" + siteEmail + "?subject=" + subject + "&body=" + body;
      setFormStatus("Your email app should open with this message ready to send.");
    });
  }

  function setFormStatus(text) {
    if (!formStatus) return;
    formStatus.textContent = text;
  }
})();
