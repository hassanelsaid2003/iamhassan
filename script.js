/* ══════════════════════════════════════════════════════════════
   HASSAN ELSAID — Portfolio Script
   3D Scene + All Interactions in ONE file
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   THREE.JS 3D SCENE — خرافية
   particles + DNA helix + floating rings
   + mouse parallax + scroll reaction
══════════════════════════════════════ */
(function initThreeScene() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1000);
  camera.position.set(0, 0, 90);
  const clock  = new THREE.Clock();

  /* ════════════════════════════════════════
     1. GEODESIC SPHERE WIREFRAME
     نفس شكل الصورة — icosahedron بـ wireframe
  ════════════════════════════════════════ */
  const sphereGeo = new THREE.IcosahedronGeometry(28, 2);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xff5f00,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(0, 0, -10);
  scene.add(sphere);

  /* Inner glow sphere */
  const innerGeo = new THREE.IcosahedronGeometry(26, 2);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xff8533,
    wireframe: false,
    transparent: true,
    opacity: 0.03,
    blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Mesh(innerGeo, innerMat));

  /* ════════════════════════════════════════
     2. FLOATING PARTICLES — قليلة وهادية
     80 نقطة بس حوالين الـ sphere
  ════════════════════════════════════════ */
  const COUNT  = 80;
  const pts    = [];
  const vel    = [];
  const posArr = new Float32Array(COUNT * 3);
  const colArr = new Float32Array(COUNT * 3);
  const szArr  = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    /* توزيع عشوائي في الفضاء */
    const x = (Math.random() - .5) * 260;
    const y = (Math.random() - .5) * 180;
    const z = (Math.random() - .5) * 60 - 10;

    pts.push(new THREE.Vector3(x, y, z));
    vel.push(new THREE.Vector3(
      (Math.random() - .5) * 0.025,
      (Math.random() - .5) * 0.025,
      0
    ));

    posArr[i*3]   = x;
    posArr[i*3+1] = y;
    posArr[i*3+2] = z;

    const t = Math.random();
    colArr[i*3]   = 1;
    colArr[i*3+1] = 0.37 + t * 0.4;
    colArr[i*3+2] = 0;

    szArr[i] = Math.random() * 1.2 + 0.4;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  pGeo.setAttribute("color",    new THREE.BufferAttribute(colArr, 3));
  pGeo.setAttribute("size",     new THREE.BufferAttribute(szArr,  1));

  const pMat = new THREE.PointsMaterial({
    size: 1.0, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(pGeo, pMat));

  /* ════════════════════════════════════════
     3. CONNECTIONS — خطوط خفيفة بين النقاط
  ════════════════════════════════════════ */
  const THRESH  = 55;
  const MAX_SEG = 120;
  const lPos = new Float32Array(MAX_SEG * 6);
  const lCol = new Float32Array(MAX_SEG * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute("color",    new THREE.BufferAttribute(lCol, 3));
  const linesMesh = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(linesMesh);

  /* ════════════════════════════════════════
     MOUSE + SCROLL + RESIZE
  ════════════════════════════════════════ */
  let mX = 0, mY = 0, tX = 0, tY = 0, scrollY = 0;
  document.addEventListener("mousemove", e => {
    mX = (e.clientX / W() - .5) * 2;
    mY = (e.clientY / H() - .5) * 2;
  });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener("resize", () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });

  /* ════════════════════════════════════════
     ANIMATE
  ════════════════════════════════════════ */
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Camera — حركة بطيئة جداً */
    tX += (mX - tX) * 0.02;
    tY += (mY - tY) * 0.02;
    camera.position.x = tX * 6 + Math.sin(t * 0.04) * 2;
    camera.position.y = -tY * 5 + Math.cos(t * 0.03) * 1.5 - scrollY * 0.005;
    camera.lookAt(0, -scrollY * 0.003, 0);

    /* Sphere — يدور ببطء جداً */
    sphere.rotation.x = t * 0.08;
    sphere.rotation.y = t * 0.12;
    sphere.material.opacity = 0.28 + 0.07 * Math.sin(t * 0.4);

    /* Particles move */
    for (let i = 0; i < COUNT; i++) {
      pts[i].add(vel[i]);
      if (Math.abs(pts[i].x) > 130) vel[i].x *= -1;
      if (Math.abs(pts[i].y) > 90)  vel[i].y *= -1;
      pts[i].y += Math.sin(t * 0.2 + i * 0.5) * 0.003;
      posArr[i*3]   = pts[i].x;
      posArr[i*3+1] = pts[i].y;
      posArr[i*3+2] = pts[i].z;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* Connections */
    let seg = 0;
    for (let i = 0; i < COUNT && seg < MAX_SEG; i++) {
      for (let j = i + 1; j < COUNT && seg < MAX_SEG; j++) {
        const d = pts[i].distanceTo(pts[j]);
        if (d < THRESH) {
          const b   = seg * 6;
          const a   = (1 - d / THRESH) * 0.5;
          lPos[b]   = pts[i].x; lPos[b+1] = pts[i].y; lPos[b+2] = pts[i].z;
          lPos[b+3] = pts[j].x; lPos[b+4] = pts[j].y; lPos[b+5] = pts[j].z;
          lCol[b]   = lCol[b+3] = 1;
          lCol[b+1] = lCol[b+4] = 0.37 * a;
          lCol[b+2] = lCol[b+5] = 0;
          seg++;
        }
      }
    }
    lGeo.setDrawRange(0, seg * 2);
    lGeo.attributes.position.needsUpdate = true;
    lGeo.attributes.color.needsUpdate    = true;

    renderer.render(scene, camera);
  }

  animate();
})();


/* ══════════════════════════════════════════════════════════════
   DOM READY
══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* ══════════════════════════════════════
     1. THEME TOGGLE
  ══════════════════════════════════════ */
  const html = document.documentElement;
  function applyTheme(next) {
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const floatIcon = document.getElementById("floatThemeIcon");
    if (floatIcon) floatIcon.className = next === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
  applyTheme(localStorage.getItem("theme") || "dark");
  const floatThemeToggle = document.getElementById("floatThemeToggle");
  if (floatThemeToggle) floatThemeToggle.addEventListener("click", () => applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ══════════════════════════════════════
     HERO ENTRANCE
  ══════════════════════════════════════ */
  setTimeout(() => document.body.classList.add("hero-loaded"), 80);

  /* ══════════════════════════════════════
     ABOUT scroll trigger
  ══════════════════════════════════════ */
  const aboutSection = document.getElementById("about");
  if (aboutSection) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) aboutSection.classList.add("about-active"); });
    }, { threshold: 0.08 }).observe(aboutSection);
  }

  /* ══════════════════════════════════════
     2. NAVBAR SCROLL
  ══════════════════════════════════════ */
  const navbar       = document.getElementById("navbar");
  const scrollTopBtn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
    updateActiveNav();
  });
  scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ══════════════════════════════════════
     3. ACTIVE NAV
  ══════════════════════════════════════ */
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav-links a, .nav-mobile a");
  function updateActiveNav() {
    const scrollY = window.scrollY + 140;
    sections.forEach(sec => {
      const id = sec.getAttribute("id");
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => {
          l.classList.remove("active");
          if (l.getAttribute("href") === "#" + id) l.classList.add("active");
        });
      }
    });
  }

  /* ══════════════════════════════════════
     4. SMOOTH SCROLL
  ══════════════════════════════════════ */
  /* smooth scroll — nav + footer only, لا يمس الـ hero social links */
  const hashSelectors = [
    '.nav-links a[href^="#"]',
    '.nav-mobile a[href^="#"]',
    'a.nav-cta[href^="#"]',
    '.hero-actions a[href^="#"]',
    'footer a[href^="#"]',
    '.show-more-wrap a[href^="#"]',
  ].join(",");
  document.querySelectorAll(hashSelectors).forEach(anchor => {
    anchor.addEventListener("click", e => {
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      navMobile.classList.remove("open");
      hamburger.classList.remove("open");
    });
  });

  /* ══════════════════════════════════════
     5. HAMBURGER
  ══════════════════════════════════════ */
  const hamburger = document.getElementById("hamburger");
  const navMobile = document.getElementById("navMobile");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMobile.classList.toggle("open");
  });

  /* ══════════════════════════════════════
     6. TYPEWRITER
  ══════════════════════════════════════ */
  const roles = ["Frontend Developer","Problem Solver","Tech Enthusiast","Engineer & Builder"];
  let rIdx = 0, cIdx = 0, deleting = false;
  const roleEl = document.getElementById("heroRole");
  function typeRole() {
    const cur = roles[rIdx];
    roleEl.textContent = deleting ? cur.substring(0, cIdx--) : cur.substring(0, cIdx++);
    if (!deleting && cIdx > cur.length) { deleting = true; setTimeout(typeRole, 2400); return; }
    if (deleting && cIdx < 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(typeRole, 500); return; }
    setTimeout(typeRole, deleting ? 50 : 85);
  }
  typeRole();

  /* ══════════════════════════════════════
     7. PROGRESS BARS
  ══════════════════════════════════════ */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.width = entry.target.dataset.width;
      barObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".tech-fill").forEach(b => barObs.observe(b));

  /* ══════════════════════════════════════
     8. COUNTER
  ══════════════════════════════════════ */
  const cntObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = parseInt(el.dataset.count), suffix = el.dataset.suffix || "";
      let cur = 0;
      const t = setInterval(() => {
        cur += Math.ceil(target / 60);
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur + suffix;
      }, 20);
      cntObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(el => cntObs.observe(el));

  /* ══════════════════════════════════════
     9. 3D REVEAL — elem-3d system
  ══════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in3d");
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".elem-3d").forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════════
     10. PROJECT MODAL
  ══════════════════════════════════════ */
  const projModal    = document.getElementById("projectModal");
  const projBackdrop = document.getElementById("projModalBackdrop");
  const modalClose   = document.getElementById("modalClose");
  const modalTitle   = document.getElementById("modalTitle");
  const modalDesc    = document.getElementById("modalDesc");
  const modalTags    = document.getElementById("modalTags");
  const modalImgWrap = document.getElementById("modalImgWrap");
  const modalDemo    = document.getElementById("modalDemo");
  const modalGithub  = document.getElementById("modalGithub");

  function openProjModal(card) {
    modalTitle.textContent = card.dataset.title || "";
    modalDesc.textContent  = card.dataset.desc  || "";
    modalDemo.href         = card.dataset.demo   || "#";
    modalGithub.href       = card.dataset.github || "#";
    modalTags.innerHTML    = "";
    (card.dataset.tags || "").split(",").forEach(tag => {
      const s = document.createElement("span");
      s.className = "proj-modal-tag"; s.textContent = tag.trim();
      modalTags.appendChild(s);
    });
    const img  = card.querySelector(".proj-thumb img");
    const icon = card.querySelector(".proj-thumb-icon");
    if (img) {
      modalImgWrap.innerHTML = `<img src="${img.src}" alt="${card.dataset.title||""}" />`;
    } else if (icon) {
      const cls = Array.from(icon.classList).filter(c => c !== "proj-thumb-icon").join(" ");
      modalImgWrap.innerHTML = `<i class="${cls} proj-modal-icon"></i>`;
    } else {
      modalImgWrap.innerHTML = `<i class="fa-solid fa-layer-group proj-modal-icon"></i>`;
    }
    projModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => projModal.classList.add("open-anim")));
  }

  function closeProjModal() {
    projModal.classList.remove("open-anim");
    document.body.style.overflow = "";
    setTimeout(() => { if (!projModal.classList.contains("open-anim")) projModal.style.display = "none"; }, 380);
  }

  /* ══════════════════════════════════════
     11. CERTIFICATE MODAL
  ══════════════════════════════════════ */
  const certModal         = document.getElementById("certModal");
  const certModalBackdrop = document.getElementById("certModalBackdrop");
  const certModalClose    = document.getElementById("certModalClose");
  const certModalImgWrap  = document.getElementById("certModalImgWrap");
  const certModalTitle    = document.getElementById("certModalTitle");
  const certModalIssuer   = document.getElementById("certModalIssuer");
  const certModalTags     = document.getElementById("certModalTags");
  const certModalMeta     = document.getElementById("certModalMeta");

  function openCertModal(card) {
    const img    = card.querySelector(".proj-thumb img");
    const icon   = card.querySelector(".proj-thumb-icon");
    const title  = card.dataset.certTitle    || "";
    const issuer = card.dataset.certIssuer   || "";
    const date   = card.dataset.certDate     || "";
    const dur    = card.dataset.certDuration || "";
    if (img && img.src && !img.src.endsWith("/")) {
      certModalImgWrap.innerHTML = `<img src="${img.src}" alt="${title}" style="width:100%;height:auto;display:block;object-fit:contain;background:#080a0d;" />`;
    } else if (icon) {
      const cls = Array.from(icon.classList).filter(c => c !== "proj-thumb-icon").join(" ");
      certModalImgWrap.innerHTML = `<i class="${cls} proj-modal-icon" style="display:flex;align-items:center;justify-content:center;min-height:160px;font-size:4rem;color:rgba(255,95,0,.3);"></i>`;
    } else {
      certModalImgWrap.innerHTML = `<i class="fa-solid fa-certificate proj-modal-icon" style="display:flex;align-items:center;justify-content:center;min-height:160px;font-size:4rem;color:rgba(255,95,0,.3);"></i>`;
    }
    certModalTags.innerHTML     = `<span class="proj-modal-tag"><i class="fa-solid fa-certificate"></i> Certificate</span>`;
    certModalTitle.textContent  = title;
    certModalIssuer.textContent = issuer;
    const parts = [];
    if (date) parts.push(`<span class="proj-modal-tag"><i class="fa-solid fa-calendar"></i> ${date}</span>`);
    if (dur && dur !== "—") parts.push(`<span class="proj-modal-tag"><i class="fa-solid fa-clock"></i> ${dur}</span>`);
    certModalMeta.innerHTML = parts.join("");
    certModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => certModal.classList.add("open-anim")));
  }

  function closeCertModal() {
    certModal && certModal.classList.remove("open-anim");
    document.body.style.overflow = "";
    setTimeout(() => { if (certModal && !certModal.classList.contains("open-anim")) certModal.style.display = "none"; }, 380);
  }

  /* ══════════════════════════════════════
     CLICK — event delegation على الـ grids
     بيشتغل مع الكروت الجديدة بعد Show More
  ══════════════════════════════════════ */
  const projectsGrid     = document.getElementById("projectsGrid");
  const certsGrid        = document.getElementById("certsGrid");

  /* Projects delegation */
  projectsGrid && projectsGrid.addEventListener("click", e => {
    if (e.target.closest("a[href]")) return;
    const card = e.target.closest(".proj-card:not(.cert-card-new)");
    if (card) openProjModal(card);
  });

  /* Certs delegation */
  certsGrid && certsGrid.addEventListener("click", e => {
    if (e.target.closest("a[href]")) return;
    const card = e.target.closest(".cert-card-new");
    if (card) openCertModal(card);
  });

  projBackdrop      && projBackdrop.addEventListener("click",      () => closeProjModal());
  certModalBackdrop && certModalBackdrop.addEventListener("click", () => closeCertModal());
  modalClose        && modalClose.addEventListener("click",        e => { e.stopPropagation(); closeProjModal(); });
  certModalClose    && certModalClose.addEventListener("click",    e => { e.stopPropagation(); closeCertModal(); });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeProjModal(); closeCertModal(); closeCvModal(); }
  });

  /* ══════════════════════════════════════
     12. SHOW MORE — PROJECTS
  ══════════════════════════════════════ */
  const projectsMoreWrap = document.getElementById("projectsMoreWrap");
  const projectsMoreBtn  = document.getElementById("projectsMoreBtn");
  const projectsMoreText = document.getElementById("projectsMoreText");
  const PROJECTS_LIMIT   = 6;

  function initProjectsShowMore() {
    if (!projectsGrid) return;
    const wrappers = Array.from(projectsGrid.querySelectorAll(".elem-3d"));
    if (wrappers.length <= PROJECTS_LIMIT) { if (projectsMoreWrap) projectsMoreWrap.style.display = "none"; return; }
    wrappers.forEach((w, i) => { if (i >= PROJECTS_LIMIT) w.classList.add("hidden-card"); });
    if (projectsMoreWrap) projectsMoreWrap.style.display = "flex";
  }

  let projectsExpanded = false;
  if (projectsMoreBtn) {
    projectsMoreBtn.addEventListener("click", () => {
      const wrappers = Array.from(projectsGrid.querySelectorAll(".elem-3d"));
      projectsExpanded = !projectsExpanded;
      wrappers.forEach((w, i) => {
        if (i >= PROJECTS_LIMIT) {
          if (projectsExpanded) {
            w.classList.remove("hidden-card");
            setTimeout(() => w.classList.add("in3d"), (i - PROJECTS_LIMIT) * 80);
          } else {
            w.classList.add("hidden-card");
            w.classList.remove("in3d");
          }
        }
      });
      projectsMoreText.textContent = projectsExpanded ? "Show Less" : "Show More";
      projectsMoreBtn.classList.toggle("expanded", projectsExpanded);
      if (!projectsExpanded) document.getElementById("projects")?.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  }
  initProjectsShowMore();

  /* ══════════════════════════════════════
     13. SHOW MORE — CERTIFICATES
  ══════════════════════════════════════ */
  const certsMoreWrap = document.getElementById("certsMoreWrap");
  const certsMoreBtn  = document.getElementById("certsMoreBtn");
  const certsMoreText = document.getElementById("certsMoreText");
  const CERTS_LIMIT   = 6;

  function initCertsShowMore() {
    if (!certsGrid) return;
    const wrappers  = Array.from(certsGrid.querySelectorAll(".elem-3d"));
    const hasHidden = wrappers.some(w => w.classList.contains("hidden-card"));
    if (certsMoreWrap) certsMoreWrap.style.display = hasHidden ? "flex" : "none";
  }

  let certsExpanded = false;
  if (certsMoreBtn) {
    certsMoreBtn.addEventListener("click", () => {
      const wrappers = Array.from(certsGrid.querySelectorAll(".elem-3d"));
      certsExpanded  = !certsExpanded;
      wrappers.forEach((w, i) => {
        if (i >= CERTS_LIMIT) {
          if (certsExpanded) {
            w.classList.remove("hidden-card");
            setTimeout(() => w.classList.add("in3d"), (i - CERTS_LIMIT) * 80);
          } else {
            w.classList.add("hidden-card");
            w.classList.remove("in3d");
          }
        }
      });
      certsMoreText.textContent = certsExpanded ? "Show Less" : "Show More";
      certsMoreBtn.classList.toggle("expanded", certsExpanded);
      if (!certsExpanded) document.getElementById("certificates")?.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  }
  initCertsShowMore();

  /* ══════════════════════════════════════
     14. CV MODAL
  ══════════════════════════════════════ */
  const cvModal      = document.getElementById("cvModal");
  const cvModalClose = document.getElementById("cvModalClose");
  const cvBtn        = document.getElementById("cvBtn");
  function openCvModal()  { cvModal.classList.add("open");    document.body.style.overflow = "hidden"; }
  function closeCvModal() { cvModal.classList.remove("open"); document.body.style.overflow = ""; }
  cvBtn.addEventListener("click", openCvModal);
  cvModalClose.addEventListener("click", closeCvModal);
  cvModal.addEventListener("click", e => { if (e.target === cvModal) closeCvModal(); });

  /* ══════════════════════════════════════
     15. SOCIAL TOGGLE
  ══════════════════════════════════════ */
  const socialToggle = document.getElementById("socialToggle");
  const socialPopup  = document.getElementById("socialPopup");
  const socialIcon   = document.getElementById("socialIcon");
  socialToggle.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = socialPopup.classList.toggle("open");
    socialToggle.classList.toggle("active", isOpen);
    socialIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-share-nodes";
  });
  document.addEventListener("click", e => {
    if (!socialToggle.contains(e.target) && !socialPopup.contains(e.target)) {
      socialPopup.classList.remove("open");
      socialToggle.classList.remove("active");
      socialIcon.className = "fa-solid fa-share-nodes";
    }
  });

  /* ══════════════════════════════════════
     16. PARALLAX ORBS
  ══════════════════════════════════════ */
  window.addEventListener("scroll", () => {
    document.querySelectorAll("section").forEach(sec => {
      const orbs = sec.querySelectorAll(".sec-orb");
      if (!orbs.length) return;
      const r = sec.getBoundingClientRect();
      const p = Math.max(-.5, Math.min(1.5, -r.top / r.height));
      orbs.forEach((o, i) => { o.style.transform = `translateY(${p * (i+1) * 30}px)`; });
    });
  }, { passive: true });

  /* ══════════════════════════════════════
     17. CURSOR GLOW
  ══════════════════════════════════════ */
  const glow = document.createElement("div");
  glow.style.cssText = "position:fixed;pointer-events:none;z-index:9998;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(255,95,0,0.045) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .15s,top .15s;";
  document.body.appendChild(glow);
  document.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  });

});

/* ══════════════════════════════════════
   EmailJS Contact Form
══════════════════════════════════════ */
(function () {
  const SERVICE_ID  = "service_4o2ksyf";
  const TEMPLATE_ID = "template_5oe7rci";
  const PUBLIC_KEY  = "2GKkjMFzNRix6mADx";
  emailjs.init(PUBLIC_KEY);

  const form       = document.getElementById("contactForm");
  const submitBtn  = document.getElementById("submitBtn");
  const successMsg = document.getElementById("successMsg");
  const errorMsg   = document.getElementById("errorMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const firstName = document.getElementById("from_first_name").value.trim();
    const lastName  = document.getElementById("from_last_name").value.trim();
    const email     = document.getElementById("from_email").value.trim();
    const message   = document.getElementById("message").value.trim();
    const subject   = document.getElementById("subject").value.trim();
    if (!firstName || !lastName || !email || !message || !subject) {
      errorMsg.textContent = "⚠️ Please fill in all required fields.";
      errorMsg.style.display = "block"; successMsg.style.display = "none"; return;
    }
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    successMsg.style.display = "none"; errorMsg.style.display = "none";
    emailjs.send(SERVICE_ID, TEMPLATE_ID, { from_name:`${firstName} ${lastName}`, from_email:email, subject, message })
      .then(() => {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        successMsg.style.display = "block"; form.reset();
        setTimeout(() => (successMsg.style.display = "none"), 5000);
      })
      .catch(err => {
        console.error("EmailJS Error:", err);
        submitBtn.disabled  = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        errorMsg.textContent = "❌ Something went wrong. Please try again.";
        errorMsg.style.display = "block";
      });
  });
})();
