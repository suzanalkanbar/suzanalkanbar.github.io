/* ==========================================================================
   Suzan Alkanbar — Portfolio v2 — interactions
   ========================================================================== */

// Sticky nav shrink on scroll
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav.mainnav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    });
  }
});

// Dropdown menu (click + keyboard)
document.querySelectorAll('.dropdown > .dropdown-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const parent = btn.closest('.dropdown');
    parent.classList.toggle('open');
    const expanded = parent.classList.contains('open');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
});

// Scroll-reveal for any element with class "reveal", plus auto-tag common blocks
document.addEventListener("DOMContentLoaded", () => {
  const autoSelectors = [
    ".work-card", ".play-card", ".skill-block", ".overview-block",
    ".story-block", ".result-block", ".onderzoek-card", ".kans-card",
    ".goal-card", ".section-head", ".about-hero", ".stat",
    ".sectionhead", ".tile", ".event"
  ];
  document.querySelectorAll(autoSelectors.join(",")).forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
});

// Active nav link highlighting on case-study sidebars (kept for compatibility)
const sections = document.querySelectorAll(".case-section, .cover");
const navLinks = document.querySelectorAll(".sidebar-timeline a");
if (sections.length && navLinks.length) {
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) current = section.getAttribute("id");
    });
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current)) link.classList.add("active");
    });
  });
}

// Simple image slider (kept for compatibility with older case-study markup)
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelector(".slides");
  if (!slides) return;
  const images = document.querySelectorAll(".slides img");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  let index = 0;
  function showSlide(i) {
    if (i >= images.length) index = 0;
    if (i < 0) index = images.length - 1;
    slides.style.transform = `translateX(${-index * 100}%)`;
  }
  if (next) next.addEventListener("click", () => { index++; showSlide(index); });
  if (prev) prev.addEventListener("click", () => { index--; showSlide(index); });
});

// Booklet gallery — click to scroll to next image
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".booklet-gallery");
  if (!gallery) return;
  gallery.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => {
      img.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });
});

// Animated hexagon background canvas
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const bgColor = "#FBF3E8";

  function drawHexagon(x, y, size, color) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

//   function drawMashrabiya(x, y, size, color) {
//     ctx.beginPath();
//     ctx.moveTo(x, y - size);
//     ctx.lineTo(x + size, y);
//     ctx.lineTo(x, y + size);
//     ctx.lineTo(x - size, y);
//     ctx.closePath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 1;
//     ctx.stroke();

//     const s = size * 0.48;
//     ctx.strokeRect(x - s / 2, y - s / 2, s, s);
// }


  

  function drawPattern(offsetX, offsetY, scale, color) {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.fillStyle = bgColor;
    ctx.fillRect(-5, -5, w + 10, h + 10);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    const size = 42 * scale;
    const dx = size * Math.sqrt(3);
    const dy = size * 1.5;
    for (let row = -1; row < h / dy + 2; row++) {
      for (let col = -1; col < w / dx + 2; col++) {
        const x = col * dx + ((row % 2) * dx) / 2 + offsetX;
        const y = row * dy + offsetY;
        drawHexagon(x, y, size, color);
      }
    }
    ctx.restore();
  }

//   const size = 30 * scale;
// const step = size * 1.5;

// for (let row = -1; row < canvas.height / step + 2; row++) {
//     for (let col = -1; col < canvas.width / step + 2; col++) {
//         let x = col * step + offsetX;
//         let y = row * step + offsetY;
//         drawMashrabiya(x, y, size, color);
//     }
// }
  let t = 0;
  function animate() {
    const offsetX = Math.sin(t * 0.001) * 20;
    const offsetY = Math.cos(t * 0.001) * 20;
    const scale = 1 + Math.sin(t * 0.002) * 0.05;
    drawPattern(offsetX, offsetY, scale, "rgba(185,124,94,0.22)");
    t++;
    requestAnimationFrame(animate);
  }
  animate();
});

// Contact form — sends via Web3Forms without leaving the page
document.querySelectorAll(".contact-form").forEach(form => {
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");
  const label = button.textContent;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.textContent = form.dataset.sending;
    status.className = "form-status";
    status.textContent = "";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || res.status);
      form.reset();
      status.textContent = form.dataset.ok;
      status.classList.add("ok");
    } catch (err) {
      status.textContent = form.dataset.err;
      status.classList.add("err");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
});
