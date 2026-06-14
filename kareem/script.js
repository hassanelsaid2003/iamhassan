"use strict";

/* ════════════════════════════════════════════════════════════════
   CYBER + ROBOT ANIMATED BACKGROUND CANVAS
   Draws: circuit nodes, robot icons (SVG path), scan lines,
   binary rain, shield icons, lock symbols, hex grid
════════════════════════════════════════════════════════════════ */
(function initCyberCanvas() {
  const canvas = document.getElementById("cyberCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles, nodes, binaryDrops, scanY;
  const isDark = () =>
    document.documentElement.getAttribute("data-theme") !== "light";

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Palette ── */
  function palette() {
    return isDark()
      ? {
          node: "#2f2fe4",
          line: "rgba(47,47,228,0.35)",
          mint: "rgba(93,248,216,0.6)",
          cyan: "rgba(111,209,215,0.4)",
          red: "rgba(255,0,60,0.5)",
          binary: "rgba(0,255,65,0.5)",
          scan: "rgba(47,47,228,0.04)",
        }
      : {
          node: "#b0413e",
          line: "rgba(176,65,62,0.2)",
          mint: "rgba(176,65,62,0.5)",
          cyan: "rgba(84,134,135,0.35)",
          red: "rgba(176,65,62,0.4)",
          binary: "rgba(84,134,135,0.4)",
          scan: "rgba(176,65,62,0.025)",
        };
  }

  /* ── Circuit nodes ── */
  function makeNodes(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 3 + 1.5,
      type:
        Math.random() < 0.15
          ? "robot"
          : Math.random() < 0.25
            ? "shield"
            : Math.random() < 0.35
              ? "lock"
              : Math.random() < 0.45
                ? "hex"
                : "dot",
      pulse: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.02,
    }));
  }

  /* ── Binary rain drops ── */
  function makeBinaryDrops() {
    const cols = Math.floor(W / 22);
    return Array.from({ length: Math.floor(cols * 0.25) }, () => ({
      x: Math.floor(Math.random() * cols) * 22 + 6,
      y: Math.random() * H,
      speed: 0.8 + Math.random() * 1.5,
      chars: Array.from({ length: 8 }, () => (Math.random() < 0.5 ? "0" : "1")),
      opacity: 0.08 + Math.random() * 0.18,
      len: 5 + Math.floor(Math.random() * 8),
    }));
  }

  function init() {
    resize();
    nodes = makeNodes(Math.min(70, Math.floor((W * H) / 18000)));
    binaryDrops = makeBinaryDrops();
    scanY = 0;
  }

  /* ── Draw robot head ── */
  function drawRobot(x, y, sz, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    // Head
    ctx.beginPath();
    ctx.roundRect(-sz * 0.45, -sz * 0.5, sz * 0.9, sz * 0.7, sz * 0.15);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(-sz * 0.18, -sz * 0.15, sz * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sz * 0.18, -sz * 0.15, sz * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Antenna
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.5);
    ctx.lineTo(0, -sz * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -sz * 0.8, sz * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.beginPath();
    ctx.moveTo(-sz * 0.25, sz * 0.1);
    ctx.lineTo(-sz * 0.1, sz * 0.1);
    ctx.moveTo(sz * 0.1, sz * 0.1);
    ctx.lineTo(sz * 0.25, sz * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Draw shield ── */
  function drawShield(x, y, sz, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz * 0.7, -sz * 0.4);
    ctx.lineTo(sz * 0.7, sz * 0.1);
    ctx.quadraticCurveTo(0, sz, 0, sz);
    ctx.quadraticCurveTo(0, sz, -sz * 0.7, sz * 0.1);
    ctx.lineTo(-sz * 0.7, -sz * 0.4);
    ctx.closePath();
    ctx.stroke();
    // Check
    ctx.beginPath();
    ctx.moveTo(-sz * 0.25, 0);
    ctx.lineTo(-sz * 0.05, sz * 0.3);
    ctx.lineTo(sz * 0.35, -sz * 0.3);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Draw lock ── */
  function drawLock(x, y, sz, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    // Body
    ctx.beginPath();
    ctx.roundRect(-sz * 0.45, -sz * 0.1, sz * 0.9, sz * 0.7, sz * 0.1);
    ctx.stroke();
    // Shackle
    ctx.beginPath();
    ctx.arc(0, -sz * 0.1, sz * 0.35, Math.PI, 0, false);
    ctx.stroke();
    // Keyhole
    ctx.beginPath();
    ctx.arc(0, sz * 0.2, sz * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Draw hex ── */
  function drawHex(x, y, sz, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      i === 0
        ? ctx.moveTo(Math.cos(a) * sz, Math.sin(a) * sz)
        : ctx.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const P = palette();

    /* Scan line sweep */
    scanY = (scanY + 0.7) % H;
    const sg = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    sg.addColorStop(0, "transparent");
    sg.addColorStop(0.5, P.scan);
    sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 40, W, 80);

    /* Binary rain */
    ctx.font = "11px 'Space Mono', monospace";
    binaryDrops.forEach((d) => {
      d.chars.forEach((ch, i) => {
        const fade = 1 - i / d.len;
        ctx.globalAlpha = d.opacity * fade;
        ctx.fillStyle = P.binary;
        ctx.fillText(ch, d.x, d.y - i * 16);
      });
      d.y += d.speed;
      if (d.y > H + d.len * 16) d.y = -d.len * 16;
    });
    ctx.globalAlpha = 1;

    /* Connection lines between nearby nodes */
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j <= i) return;
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          // Circuit-style: horizontal then vertical
          if (Math.random() < 0.3 && dist < 100) {
            ctx.lineTo(b.x, a.y);
          }
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = P.line;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = (1 - dist / 160) * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    });

    /* Draw nodes */
    nodes.forEach((n) => {
      n.pulse += n.speed;
      const px = n.x + Math.sin(n.pulse) * 0.5;
      const py = n.y + Math.cos(n.pulse * 0.7) * 0.5;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      const glow = 0.6 + 0.4 * Math.sin(n.pulse * 2);
      const col =
        n.type === "robot"
          ? P.mint
          : n.type === "shield"
            ? P.cyan
            : n.type === "lock"
              ? P.red
              : n.type === "hex"
                ? P.cyan
                : P.node;
      const sz = 12 + 6 * Math.sin(n.pulse);

      if (n.type === "robot") {
        drawRobot(px, py, sz * 0.9, col);
      } else if (n.type === "shield") {
        drawShield(px, py, sz * 0.7, col);
      } else if (n.type === "lock") {
        drawLock(px, py, sz * 0.7, col);
      } else if (n.type === "hex") {
        drawHex(px, py, sz * 0.6, col);
      } else {
        // Circuit dot with glow ring
        ctx.beginPath();
        ctx.arc(px, py, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, n.r * glow * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    binaryDrops = makeBinaryDrops();
  });
  // Re-theme on toggle
  document.getElementById("themeToggle")?.addEventListener("click", () => {});
  init();
  draw();
})();

/* ── 0. THEME ── */
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const THEME_KEY = "kareemPortfolioTheme";
function updateThemeIcon() {
  themeIcon.className =
    htmlEl.getAttribute("data-theme") === "dark"
      ? "fa-solid fa-moon"
      : "fa-solid fa-sun";
}
(function () {
  const s = localStorage.getItem(THEME_KEY) || "dark";
  htmlEl.setAttribute("data-theme", s);
  updateThemeIcon();
})();
themeToggle.addEventListener("click", () => {
  const n = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
  htmlEl.setAttribute("data-theme", n);
  localStorage.setItem(THEME_KEY, n);
  updateThemeIcon();
});

/* ── 1. TYPING ── */
const roles = [
  "Cybersecurity Learner",
  "Web Developer",
  "Robot Designer",
  "Problem Solver",
  "Ethical Hacker",
  "Engineering Student",
];
const typedEl = document.getElementById("typedText");
let ri = 0,
  ci = 0,
  del = false;
function type() {
  const cur = roles[ri];
  typedEl.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
  del ? ci-- : ci++;
  if (!del && ci === cur.length) {
    setTimeout(() => {
      del = true;
      type();
    }, 1800);
    return;
  }
  if (del && ci === 0) {
    del = false;
    ri = (ri + 1) % roles.length;
  }
  setTimeout(type, del ? 55 : 95);
}
setTimeout(type, 800);

/* ── 2. NAVBAR ── */
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const scrollTopBtn = document.getElementById("scrollTop");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
  scrollTopBtn.classList.toggle("visible", window.scrollY > 200);
  let cur = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) cur = s.id;
  });
  navLinks.forEach((l) =>
    l.classList.toggle("active", l.getAttribute("href") === "#" + cur),
  );
});

/* ── 3. HAMBURGER ── */
const hamburger = document.getElementById("hamburger");
const navLinksList = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  const o = navLinksList.classList.toggle("open");
  hamburger.classList.toggle("active", o);
});
navLinksList.querySelectorAll(".nav-link").forEach((l) =>
  l.addEventListener("click", () => {
    navLinksList.classList.remove("open");
    hamburger.classList.remove("active");
  }),
);
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navLinksList.contains(e.target)) {
    navLinksList.classList.remove("open");
    hamburger.classList.remove("active");
  }
});

/* ── 4. SCROLL TOP ── */
scrollTopBtn.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* ── 5. ENTRANCE ANIMATION ENGINE ── */

/* ───────────────────────────────────────────────────────────
   HERO: run immediately on page load
─────────────────────────────────────────────────────────── */
(function runHeroAnimations() {
  // Two rAF frames = after first paint, smooth entrance
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const heroSection = document.querySelector(".hero");
      if (!heroSection) return;

      // Collect all animated elements inside hero, sorted by delay
      const els = Array.from(heroSection.querySelectorAll("[data-anim]"));
      els.sort((a, b) => {
        const da = parseInt(a.dataset.animDelay || 0, 10);
        const db = parseInt(b.dataset.animDelay || 0, 10);
        return da - db;
      });

      els.forEach((el) => {
        const delay = parseInt(el.dataset.animDelay || 0, 10);
        setTimeout(() => {
          el.classList.add("anim-in");
        }, delay);
      });
    });
  });
})();

/* ───────────────────────────────────────────────────────────
   SCROLL-TRIGGERED: all other [data-anim] elements
─────────────────────────────────────────────────────────── */
const animEls = document.querySelectorAll(
  "section:not(.hero) [data-anim], footer [data-anim], nav [data-anim]",
);

const animObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(
        el.dataset.animDelay || el.dataset.anim_delay || 0,
        10,
      );
      setTimeout(() => el.classList.add("anim-in"), delay);
      animObs.unobserve(el);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

animEls.forEach((el) => animObs.observe(el));

/* ───────────────────────────────────────────────────────────
   CARDS: staggered fade-up on scroll (about, service, project, cert…)
─────────────────────────────────────────────────────────── */
const cardEls = document.querySelectorAll(
  ".about-card,.service-card,.project-card,.skill-bar-item,.cert-card,.contact-info-card,.contact-status-card,.stat-item",
);
cardEls.forEach((el) => el.classList.add("fade-up"));

const cardObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const idx = siblings.indexOf(entry.target);
      const delay = (idx % 4) * 90;
      setTimeout(() => entry.target.classList.add("visible"), delay);
      cardObs.unobserve(entry.target);
    });
  },
  { threshold: 0.1 },
);

cardEls.forEach((el) => cardObs.observe(el));

/* ───────────────────────────────────────────────────────────
   SECTION HEADERS: animate on scroll
─────────────────────────────────────────────────────────── */
const headerObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      headerObs.unobserve(entry.target);
    });
  },
  { threshold: 0.15 },
);

document
  .querySelectorAll(".section-header")
  .forEach((el) => headerObs.observe(el));

/* ── 6. SKILL BARS ── */
const skillObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width + "%";
        skillObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 },
);
document.querySelectorAll(".skill-fill").forEach((el) => skillObs.observe(el));

/* ── 7. COUNTERS ── */
function animateCount(el, target) {
  let s = 0;
  const step = target / 112;
  const t = setInterval(() => {
    s += step;
    el.textContent = Math.min(Math.floor(s), target);
    if (s >= target) {
      el.textContent = target;
      clearInterval(t);
    }
  }, 16);
}
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target, parseInt(e.target.dataset.target, 10));
        counterObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);
document
  .querySelectorAll(".stat-number")
  .forEach((el) => counterObs.observe(el));

/* ── 8. HERO PARALLAX (orbs only — card floats independently) ── */
const hero = document.querySelector(".hero");
if (hero) {
  hero.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5,
      y = (e.clientY - top) / height - 0.5;
    hero.querySelectorAll(".bg-orb").forEach((orb, i) => {
      const f = (i + 1) * 20;
      orb.style.transform = `translate(${x * f}px,${y * f}px)`;
    });
  });
}

/* ── 9. NAV ACTIVE ── */
navLinks.forEach((l) =>
  l.addEventListener("click", () => {
    navLinks.forEach((x) => x.classList.remove("active"));
    l.classList.add("active");
  }),
);

/* ── 10. MODAL ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("active");
  document.body.style.overflow = "";
  const w = document.getElementById("certModalWrapper");
  if (w) {
    w.style.transform = "";
  }
}
window.closeModal = closeModal;
document.querySelectorAll(".modal-overlay").forEach((o) =>
  o.addEventListener("click", (e) => {
    if (e.target === o) closeModal(o.id);
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document
      .querySelectorAll(".modal-overlay.active")
      .forEach((el) => closeModal(el.id));
});

/* ── 11. CV MODAL ── */
document
  .getElementById("cvBtn")
  .addEventListener("click", () => openModal("cvModal"));

/* ── 12. PROJECT MODAL ── */
const pvColorMap = {
  "pv-security": "linear-gradient(135deg,#0d1b3e,#1a2a6c,#0d3b6e)",
  "pv-robotics": "linear-gradient(135deg,#0a3d2b,#1a6b4a,#0d5c3a)",
  "pv-ctf": "linear-gradient(135deg,#3d0a0a,#6b1a1a,#8b2222)",
  "pv-password": "linear-gradient(135deg,#2d0a5c,#4a1a8c,#3d1475)",
  "pv-obstacle": "linear-gradient(135deg,#3d2800,#6b4a00,#7a5500)",
  "pv-portfolio": "linear-gradient(135deg,#001a3d,#002b6b,#0a1a5c)",
  "pv-design": "linear-gradient(135deg,#1a0040,#5c0080,#8b00cc)",
  "pv-ux": "linear-gradient(135deg,#003040,#006080,#008899)",
};
const projImgMap = {}; // Real project screenshots go here

document.querySelectorAll(".project-card").forEach((card) => {
  card
    .querySelector(".project-overlay-hover")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      const title = card.dataset.title,
        desc = card.dataset.desc;
      const live = card.dataset.live,
        github = card.dataset.github;
      const iconCls = card.dataset.icon,
        colorKey = card.dataset.color;
      const imgKey = card.dataset.imgkey;
      document.getElementById("projModalTitle").textContent = title;
      document.getElementById("projModalDesc").textContent = desc;
      document.getElementById("projModalLive").href = live;
      document.getElementById("projModalGithub").href = github;
      const visual = document.getElementById("projModalVisual");
      visual.style.background =
        pvColorMap[colorKey] || "linear-gradient(135deg,#0d1b3e,#1a2a6c)";
      // No screenshot injection — show icon only (real photos added later)
      const oldImg = visual.querySelector(".proj-modal-real-img");
      if (oldImg) oldImg.remove();
      document.getElementById("projModalIcon").className = iconCls + " pv-icon";
      const note = visual.querySelector(".proj-modal-overlay-text");
      if (note) note.style.display = "none";
      openModal("projectModal");
    });
});

/* ── 13. CERTIFICATE MODAL — 3D ── */
const certImgMap = {
  "cert-cat-reloaded": "./images/Certificate1.jpeg",
  "cert-hardware": "./images/Certificate2.jpeg",
  "cert-techwave": "./images/Certificate3.jpeg",
  "cert-webdesign": "./images/Certificate4.jpeg",
  "cert-cprog": "./images/Certificate5.jpeg",
  "cert-saber": "./images/Certificate6.jpeg",
  "cert-buildai": "./images/Certificate7.jpeg",
};

document.querySelectorAll(".cert-card").forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.dataset.certTitle,
      issuer = card.dataset.certIssuer;
    const date = card.dataset.certDate,
      desc = card.dataset.certDesc;
    const color = card.dataset.certColor,
      iconCls = card.dataset.certIcon;
    const visualDiv = card.querySelector(".cert-visual");
    let imgKey = "";
    visualDiv.classList.forEach((cls) => {
      if (cls.startsWith("cert-") && cls !== "cert-visual") imgKey = cls;
    });

    /* Photo */
    const inner = document.getElementById("certModalInner");
    inner.innerHTML = "";
    if (certImgMap[imgKey]) {
      const img = document.createElement("img");
      img.src = certImgMap[imgKey];
      img.alt = title;
      img.className = "cert-modal-photo";
      inner.appendChild(img);
    }

    /* Title */
    const nameEl = document.getElementById("certModalTitle");
    nameEl.textContent = title;

    /* Meta */
    document.getElementById("certModalIssuer").innerHTML =
      `<i class="fa-solid fa-building"></i> ${issuer}`;
    document.getElementById("certModalDate").innerHTML =
      `<i class="fa-regular fa-calendar"></i> ${date}`;

    /* Badge */
    const badge = document.getElementById("certModalBadge");
    badge.innerHTML = `<i class="${iconCls}"></i>`;
    badge.style.background = `linear-gradient(145deg,${color}dd,${color}88)`;
    badge.style.boxShadow = `0 6px 20px ${color}55,0 2px 6px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.25),inset 0 -2px 0 rgba(0,0,0,0.2)`;

    /* Description */
    document.getElementById("certModalDesc").textContent = desc;

    /* Apply color CSS var */
    const wrapper = document.getElementById("certModalWrapper");
    wrapper.style.setProperty("--cert-color", color);
    wrapper.style.borderColor = color + "33";
    wrapper.style.boxShadow = `0 0 0 1px ${color}18,0 20px 60px rgba(0,0,0,0.85),0 40px 100px ${color}18,inset 0 1px 0 rgba(255,255,255,0.05)`;

    openModal("certModal");

    /* 3D mouse-track tilt */
    wrapper.onmousemove = (e) => {
      const r = wrapper.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      wrapper.style.transform = `perspective(1200px) rotateY(${dx * 5}deg) rotateX(${-dy * 3}deg)`;
    };
    wrapper.onmouseleave = () => {
      wrapper.style.transition = "transform 0.6s ease";
      wrapper.style.transform =
        "perspective(1200px) rotateY(0deg) rotateX(0deg)";
    };
    wrapper.onmouseenter = () => {
      wrapper.style.transition = "transform 0.1s ease";
    };
  });
});

/* ── 14. FAB ── */
const fabMain = document.getElementById("fabMain");
const fabItemsEl = document.getElementById("fabItems");
fabMain.addEventListener("click", () => {
  const o = fabMain.classList.toggle("active");
  fabItemsEl.classList.toggle("open", o);
});
document.addEventListener("click", (e) => {
  if (!fabMain.contains(e.target) && !fabItemsEl.contains(e.target)) {
    fabMain.classList.remove("active");
    fabItemsEl.classList.remove("open");
  }
});

/* ── 16. PROJECT FILTER ── */
const filterBtns = document.querySelectorAll(".filter-btn");
const allCards = document.querySelectorAll(".project-card");
const projMoreWrap = document.getElementById("projectsShowMoreWrap");
const projMoreBtn = document.getElementById("projectsShowMoreBtn");
const projMoreText = document.getElementById("projectsShowMoreText");
const PROJ_LIMIT = 6;
let projExpanded = false,
  projFilter = "all";
function updateProj() {
  const cards = Array.from(allCards);
  const match = cards.filter(
    (c) => projFilter === "all" || c.dataset.category === projFilter,
  );
  const hide = cards.filter(
    (c) => projFilter !== "all" && c.dataset.category !== projFilter,
  );
  hide.forEach((c) => {
    c.style.opacity = "0";
    c.style.transform = "scale(0.88) translateY(16px)";
    setTimeout(() => (c.style.display = "none"), 330);
  });
  match.forEach((c, i) => {
    if (projExpanded || i < PROJ_LIMIT) {
      c.style.display = "";
      requestAnimationFrame(() => {
        c.style.opacity = "1";
        c.style.transform = "";
      });
    } else c.style.display = "none";
  });
  if (match.length > PROJ_LIMIT) {
    projMoreWrap.style.display = "flex";
    projMoreText.textContent = projExpanded
      ? `Show Less`
      : `Show More (${match.length - PROJ_LIMIT} more)`;
    projMoreBtn.classList.toggle("expanded", projExpanded);
  } else projMoreWrap.style.display = "none";
}
filterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    filterBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    projFilter = b.dataset.filter;
    projExpanded = false;
    updateProj();
  }),
);
projMoreBtn.addEventListener("click", () => {
  projExpanded = !projExpanded;
  updateProj();
  if (!projExpanded)
    document
      .getElementById("projects")
      .scrollIntoView({ behavior: "smooth", block: "start" });
});
updateProj();

/* ── 17. CERT FILTER ── */
const certFilterBtns = document.querySelectorAll(".cert-filter-btn");
const allCertCards = document.querySelectorAll(".cert-card");
const certMoreWrap = document.getElementById("certsShowMoreWrap");
const certMoreBtn = document.getElementById("certsShowMoreBtn");
const certMoreText = document.getElementById("certsShowMoreText");
const CERT_LIMIT = 6;
let certExpanded = false,
  certFilter = "all";
function updateCerts() {
  const cards = Array.from(allCertCards);
  const match = cards.filter(
    (c) => certFilter === "all" || c.dataset.category === certFilter,
  );
  const hide = cards.filter(
    (c) => certFilter !== "all" && c.dataset.category !== certFilter,
  );
  hide.forEach((c) => {
    c.style.opacity = "0";
    c.style.transform = "scale(0.88) translateY(16px)";
    setTimeout(() => (c.style.display = "none"), 330);
  });
  match.forEach((c, i) => {
    if (certExpanded || i < CERT_LIMIT) {
      c.style.display = "";
      requestAnimationFrame(() => {
        c.style.opacity = "1";
        c.style.transform = "";
      });
    } else c.style.display = "none";
  });
  if (match.length > CERT_LIMIT) {
    certMoreWrap.style.display = "flex";
    certMoreText.textContent = certExpanded
      ? `Show Less`
      : `Show More (${match.length - CERT_LIMIT} more)`;
    certMoreBtn.classList.toggle("expanded", certExpanded);
  } else certMoreWrap.style.display = "none";
}
certFilterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    certFilterBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    certFilter = b.dataset.filter;
    certExpanded = false;
    updateCerts();
  }),
);
certMoreBtn.addEventListener("click", () => {
  certExpanded = !certExpanded;
  updateCerts();
  if (!certExpanded)
    document
      .getElementById("certificates")
      .scrollIntoView({ behavior: "smooth", block: "start" });
});
updateCerts();

/* ── 18. EMAILJS ── */
(function () {
  const SID = "service_l53p8tk",
    TID = "template_bpqk3rp",
    PK = "B6O65rL3tEVzEUE2Y";
  emailjs.init(PK);
  const form = document.getElementById("contactForm");
  const btn = document.getElementById("submitBtn");
  const ok = document.getElementById("successMsg");
  const err = document.getElementById("errorMsg");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("from_name").value.trim();
    const email = document.getElementById("from_email").value.trim();
    const msg = document.getElementById("message").value.trim();
    const sub = document.getElementById("subject").value.trim();
    if (!name || !email || !msg || !sub) {
      err.textContent = "⚠️ Please fill in all required fields.";
      err.style.display = "block";
      ok.style.display = "none";
      return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    ok.style.display = "none";
    err.style.display = "none";
    emailjs
      .send(SID, TID, {
        from_name: name,
        from_email: email,
        subject: sub,
        message: msg,
      })
      .then(() => {
        ok.style.display = "block";
        form.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        setTimeout(() => (ok.style.display = "none"), 5000);
      })
      .catch(() => {
        err.textContent = "❌ Something went wrong. Please try again.";
        err.style.display = "block";
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      });
  });
})();
