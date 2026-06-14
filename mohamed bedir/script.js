/* ─ Scroll Reveal ─ */
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 80);
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

/* ─ Skill bars ─ */
const skillObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".skill-fill").forEach((bar) => {
          bar.style.width = bar.dataset.pct + "%";
        });
        skillObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 },
);
const sl = document.getElementById("skillsList");
if (sl) skillObs.observe(sl);

/* ─ Counter Animation ─ */
function animCount(el, target) {
  let cur = 0;
  const step = Math.ceil(target / 60);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (target >= 100 ? "+" : "+");
    if (cur >= target) clearInterval(t);
  }, 25);
}
const countObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        document.querySelectorAll("[data-count]").forEach((el) => {
          animCount(el, parseInt(el.dataset.count));
        });
        countObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);
const statsBar = document.querySelector(".stats-bar");
if (statsBar) countObs.observe(statsBar);

/* ─ Send Button ─ */
function handleSend(btn) {
  btn.textContent = "✅ Message Sent!";
  btn.style.background = "var(--blue)";
  setTimeout(() => {
    btn.innerHTML = " Send Message";
    btn.style.background = "";
  }, 3000);
}

/* ─ Nav active on scroll ─ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let cur = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 100) cur = s.id;
  });
  navLinks.forEach((a) => {
    a.style.color =
      a.getAttribute("href") === "#" + cur ? "var(--orange-bright)" : "";
  });
});
