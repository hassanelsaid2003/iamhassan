/* ═══════════════════════════════════════════
   HASSAN ELSAID — Portfolio v2 Scripts
   ═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── 1. CUSTOM CURSOR ── */
  const cursor = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");
  let mouseX = 0,
    mouseY = 0;
  let curX = 0,
    curY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.1;
    curY += (mouseY - curY) * 0.1;
    cursor.style.left = curX + "px";
    cursor.style.top = curY + "px";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ── 2. NAVBAR SCROLL ── */
  const navbar = document.getElementById("navbar");
  const scrollTopBtn = document.getElementById("scrollTop");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
  });

  scrollTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  /* ── 3. HAMBURGER ── */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  mobileMenu.querySelectorAll(".mob-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* ── 4. SMOOTH SCROLL (fix for modal links) ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ── 5. TYPEWRITER ── */
  const roles = [
    "Backend Developer",
    "CS Student @ HICIT",
    "API Builder",
    "Problem Solver",
    "Node.js Enthusiast",
  ];
  const roleEl = document.getElementById("heroRole");
  let rIdx = 0,
    cIdx = 0,
    deleting = false;

  function typeRole() {
    const cur = roles[rIdx];
    roleEl.textContent = deleting
      ? cur.substring(0, cIdx--)
      : cur.substring(0, cIdx++);

    if (!deleting && cIdx > cur.length) {
      deleting = true;
      setTimeout(typeRole, 2200);
      return;
    }
    if (deleting && cIdx < 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
      setTimeout(typeRole, 400);
      return;
    }
    setTimeout(typeRole, deleting ? 45 : 80);
  }
  typeRole();

  /* ── 6. SCROLL REVEAL ── */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add("visible"), delay);
        revealObs.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ── 7. PROGRESS BARS ── */
  const barObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.width = entry.target.dataset.w;
        barObs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 },
  );
  document.querySelectorAll(".bar-fill").forEach((b) => barObs.observe(b));

  /* ── 8. COUNTERS ── */
  const cntObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        let cur = 0;
        const timer = setInterval(() => {
          cur += Math.ceil(target / 50);
          if (cur >= target) {
            cur = target;
            clearInterval(timer);
          }
          el.textContent = cur + suffix;
        }, 25);
        cntObs.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll("[data-count]").forEach((el) => cntObs.observe(el));

  /* ── 9. CONTACT FORM ── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".form-submit");
      const orig = btn.innerHTML;
      btn.innerHTML =
        '<i class="fa-solid fa-check"></i> <span>Message Sent!</span>';
      btn.style.background = "#28ca41";
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = "";
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  /* ── 10. SKILL PILLS STAGGER ── */
  const pills = document.querySelectorAll(".skill-pill");
  pills.forEach((pill, i) => {
    pill.style.transitionDelay = `${i * 30}ms`;
  });

  /* ── 11. TERMINAL TYPING ANIMATION ── */
  const termLines = document.querySelectorAll(".t-cmd");
  termLines.forEach((line, i) => {
    const text = line.textContent;
    line.textContent = "";
    line.style.opacity = "0";
    setTimeout(
      () => {
        line.style.opacity = "1";
        let j = 0;
        const t = setInterval(() => {
          line.textContent = text.substring(0, ++j);
          if (j >= text.length) clearInterval(t);
        }, 60);
      },
      800 + i * 600,
    );
  });

  /* ── 12. CURSOR SCALE ON HOVER ── */
  document
    .querySelectorAll("a, button, .skill-pill, .proj-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1.6)";
        cursor.style.borderColor = "var(--accent2)";
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursor.style.borderColor = "var(--accent)";
      });
    });
});
