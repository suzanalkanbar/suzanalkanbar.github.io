/* ==========================================================================
   Suzan Alkanbar — Portfolio v3 — motion & interactions (no libraries)
   ========================================================================== */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Text splitting ------------------------------------------------
     Wraps every word in spans without touching the words themselves, so
     headings can slide in and paragraphs can "fill in" while you scroll.   */
  function wrapWords(el, build) {
    let i = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
        else frag.appendChild(build(part, i++));
      });
      node.parentNode.replaceChild(frag, node);
    });
    return i;
  }

  const slideTargets = [
    ".hero-title", ".ts-hero h1", ".about-intro h1", ".section-head h2", ".sectionhead h2",
    ".about-page .split h2", ".story > .wrap > h2", ".contact-content h2",
    ".case-study > section > h2:not(.intro):not(.ontwerpvraag)"
  ];
  $$(slideTargets.join(",")).forEach(el => {
    wrapWords(el, (word, i) => {
      const outer = document.createElement("span");
      outer.className = "w";
      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.setProperty("--wi", i);
      outer.appendChild(inner);
      return outer;
    });
    el.classList.add("sp");
  });

  const fillEls = $$(".about-copy .lede, .quote p, h2.ontwerpvraag + p, .subtitle");
  fillEls.forEach(el => {
    wrapWords(el, word => {
      const s = document.createElement("span");
      s.className = "fw";
      s.textContent = word;
      return s;
    });
    el.classList.add("wf");
    el._words = $$(".fw", el);
  });

  /* ---------- Scroll reveal -------------------------------------------------- */
  const autoReveal = [
    ".work-card", ".play-card", ".overview-block", ".story-block", ".result-block",
    ".onderzoek-card", ".kans-card", ".section-head > p", ".section-head > .eyebrow", ".tile", ".event",
    ".q", ".polaroid", ".ts-callout", ".booklet-gallery", ".booklet-pdf", ".result-table",
    ".vgz-goal-card", ".vgz-kans-card", ".process-steps .step", ".ps-sketch", ".ps-canvas",
    ".ps-steps li", ".ps-type", ".ts-hero__facts li", ".ts-hero__sub", ".contact-form",
    ".footer-links a", ".about-copy > p", ".about-copy > .btn", ".about-intro p", ".about-intro .btn",
    ".about-intro .eyebrow", ".sectionhead > p", ".lofi-card", ".ibm-loop-layout", ".about-title"
  ];
  $$(autoReveal.join(",")).forEach(el => {
    el.classList.add("reveal");
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains("reveal") || c.matches(autoReveal.join(",")));
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 6));
  });
  $$(".about-photo, .hero-photo .blob").forEach(el => el.classList.add("clip"));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      io.unobserve(el);
      // once it has arrived, hand the element back to its own hover styles
      if (el.classList.contains("reveal")) setTimeout(() => el.classList.remove("reveal"), 2000);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .sp, .clip").forEach(el => io.observe(el));

  /* ---------- Navigation ----------------------------------------------------- */
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  if (toggle) {
    const setOpen = open => {
      html.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(!html.classList.contains("nav-open")));
    $$(".menu a").forEach(a => a.addEventListener("click", () => setOpen(false)));
    addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Hero name: fit to the full width, letters rise in --------------- */
  const heroName = $(".hero-name");
  const heroTxt = $(".hero-name__txt");
  if (heroTxt) {
    const text = heroTxt.textContent;
    heroTxt.textContent = "";
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--ci", i);
      s.textContent = c === " " ? " " : c;
      heroTxt.appendChild(s);
    });
  }
  function fitHero() {
    if (!heroTxt) return;
    heroName.style.fontSize = "100px";
    heroName.style.height = "";
    const size = 100 * heroName.clientWidth / heroTxt.offsetWidth;
    heroName.style.fontSize = size + "px";
    const natural = heroTxt.offsetHeight;
    const wide = innerWidth > 900;
    const sy = clamp((wide ? heroName.parentElement.clientHeight * 0.44 : natural * 1.3) / natural, 1.1, 1.75);
    heroName.style.setProperty("--sy", sy.toFixed(3));
    heroName.style.height = Math.ceil(natural * sy) + "px";
  }
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => {
    fitHero();
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add("loaded")));
  });
  addEventListener("resize", fitHero);
  // refit if the display font arrives late or the layout changes
  fontsReady.then(fitHero);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", fitHero);
  if (heroName && window.ResizeObserver) new ResizeObserver(fitHero).observe(heroName.parentElement);

  /* ---------- Hero: portrait and name drift apart with the mouse -------------- */
  const hero = $(".hero-organic");
  const portrait = $(".hero-portrait");
  if (hero && portrait && finePointer && !reduced) {
    let tx = 0, ty = 0, x = 0, y = 0, running = false;
    const tick = () => {
      x = lerp(x, tx, 0.08); y = lerp(y, ty, 0.08);
      heroName.style.setProperty("--mx", (-x * 22).toFixed(2) + "px");
      heroName.style.setProperty("--my", (-y * 10).toFixed(2) + "px");
      portrait.style.setProperty("--px", (x * 16).toFixed(2) + "px");
      portrait.style.setProperty("--py", (y * 8).toFixed(2) + "px");
      hero.style.setProperty("--hx", x.toFixed(4));
      hero.style.setProperty("--hy", y.toFixed(4));
      if (Math.abs(x - tx) > 0.001 || Math.abs(y - ty) > 0.001) requestAnimationFrame(tick);
      else running = false;
    };
    hero.addEventListener("mousemove", e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!running) { running = true; requestAnimationFrame(tick); }
    });
  }

  /* ---------- Hero: scroll story (desktop) ----------------------------------- */
  // The hero stays pinned for one extra screen of scrolling. In that time the
  // portrait slides left, the name lifts away and the intro text grows.
  const pin = $(".hero-pin");
  const side = $(".hero-side");
  if (pin && hero && portrait && side && !reduced) {
    const wideMq = matchMedia("(min-width: 901px) and (min-height: 560px)");
    let measured = false;
    const measure = () => {
      hero.style.setProperty("--e", 0);
      const W = hero.clientWidth, H = hero.clientHeight;
      const gutter = parseFloat(getComputedStyle(hero).paddingLeft) || 0;
      const pw = portrait.offsetWidth;
      hero.style.setProperty("--dx", (gutter - portrait.offsetLeft) + "px");
      const sw = side.offsetWidth, sh = side.offsetHeight;
      const left = gutter + pw * 1.3;                          // portrait + the tail of the drawn letter
      const room = W - gutter - left;                          // free space right of the moved portrait
      const s = clamp(Math.min(1.7, (room * 0.85) / sw, (H * 0.8) / sh), 1, 1.7);
      const cx = left + room / 2;                              // centre of that space
      const right = side.offsetLeft + sw;
      const sx = Math.min(cx + (sw * s) / 2 - right, W - gutter - right);
      hero.style.setProperty("--s", s.toFixed(3));
      hero.style.setProperty("--sx", sx.toFixed(1) + "px");
      hero.style.setProperty("--sy", (H * 0.52 - (side.offsetTop + sh / 2)).toFixed(1) + "px");
      measured = true;
    };
    const update = () => {
      if (!html.classList.contains("hero-scrolly")) return;
      const total = pin.offsetHeight - innerHeight;
      const p = clamp(-pin.getBoundingClientRect().top / (total || 1));
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in-out
      hero.style.setProperty("--e", e.toFixed(4));
      hero.classList.toggle("hero-end", e > 0.85);
    };
    const setMode = () => {
      const on = wideMq.matches;
      html.classList.toggle("hero-scrolly", on);
      if (on) { measure(); update(); }
      else { hero.style.removeProperty("--e"); hero.classList.remove("hero-end"); }
    };
    setMode();
    wideMq.addEventListener ? wideMq.addEventListener("change", setMode) : wideMq.addListener(setMode);
    addEventListener("resize", () => { if (html.classList.contains("hero-scrolly")) { measure(); update(); } });
    fontsReady.then(() => { if (html.classList.contains("hero-scrolly")) { measure(); update(); } });
    addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  }

  /* ---------- Project covers: layers shift with the mouse --------------------- */
  if (finePointer && !reduced) {
    $$(".work-card").forEach(card => {
      const cover = $(".cover", card);
      if (!cover) return;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        cover.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        cover.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      card.addEventListener("mouseleave", () => { cover.style.setProperty("--mx", 0); cover.style.setProperty("--my", 0); });
    });
  }

  /* ---------- Marquee that reacts to scroll speed ----------------------------- */
  const track = $(".marquee-track");
  let scrollVel = 0;
  if (track && !reduced) {
    let x = 0, dir = -1, visible = true, last = performance.now();
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(track);
    const loop = now => {
      const dt = Math.min(50, now - last); last = now;
      if (visible) {
        const half = track.scrollWidth / 2;
        if (scrollVel > 0.5) dir = -1; else if (scrollVel < -0.5) dir = 1;
        x += dir * (0.06 + Math.min(Math.abs(scrollVel), 60) * 0.02) * dt;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      scrollVel *= 0.9;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Everything that follows the scroll position --------------------- */
  const parallaxEls = $$(".work-media:not(.cover) img, .about-photo img, .ts-hero__media img, .hero-photo .blob img");
  const stacks = $$(".work-grid").map(g => $$(".work-card", g));
  const timeline = $(".timeline");
  let progress = null;
  if ($(".case-study")) {
    progress = document.createElement("div");
    progress.className = "progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);
  }

  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, vh = innerHeight, dy = y - lastY;
    scrollVel = dy; lastY = y;

    if (header && !html.classList.contains("nav-open")) {
      if (y > 320 && dy > 2) header.classList.add("nav-hidden");
      else if (dy < -2 || y <= 320) header.classList.remove("nav-hidden");
    }
    if (progress) progress.style.setProperty("--p", clamp(y / (document.documentElement.scrollHeight - vh)).toFixed(4));

    if (!reduced) {
      parallaxEls.forEach(img => {
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return;
        const rel = clamp(((box.top + box.height / 2) - vh / 2) / vh, -1, 1);
        img.style.setProperty("--py", (-rel * box.height * 0.075).toFixed(1) + "px");
      });
      stacks.forEach(cards => cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const a = card.getBoundingClientRect(), b = next.getBoundingClientRect();
        card.style.setProperty("--p", clamp(1 - (b.top - a.top) / a.height).toFixed(3));
      }));
    }

    fillEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = reduced ? 1 : clamp((vh * 0.88 - r.top) / (vh * 0.45 + r.height * 0.6));
      const n = Math.round(p * el._words.length);
      el._words.forEach((w, i) => w.classList.toggle("lit", i < n));
    });

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tp", clamp((vh * 0.72 - r.top) / r.height).toFixed(3));
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Cursor follower + magnetic buttons ------------------------------ */
  if (finePointer && !reduced) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    let cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cursor.classList.add("on"); }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("on"));
    (function follow() {
      cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener("mouseover", e => {
      const t = e.target;
      const is = sel => t.closest && t.closest(sel);
      cursor.classList.toggle("is-hidden", !!is("input, textarea, iframe, .lightbox"));
      const view = !!is("a.work-card, .next-project");
      const zoom = !view && !!is("img.zoomable");
      cursor.classList.toggle("is-view", view);
      cursor.classList.toggle("is-zoom", zoom);
      cursor.classList.toggle("is-link", !view && !zoom && !!is("a, button, summary, .polaroid, .tile"));
    });

    $$(".btn, .menu a.pill, .nav-toggle").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * 0.25).toFixed(1)}px,${(dy * 0.35).toFixed(1)}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Star pattern (hero + footer) that lights up around the mouse ---- */
  function addPattern(host) {
    if (!host) return;
    const geo = document.createElement("div");
    geo.className = "geo";
    geo.setAttribute("aria-hidden", "true");
    host.prepend(geo);
    if (!finePointer || reduced) return;
    let tx = -999, ty = -999, x = -999, y = -999, running = false;
    const step = () => {
      x = lerp(x, tx, 0.12); y = lerp(y, ty, 0.12);
      geo.style.setProperty("--gx", x.toFixed(1) + "px");
      geo.style.setProperty("--gy", y.toFixed(1) + "px");
      if (Math.abs(x - tx) > 0.5 || Math.abs(y - ty) > 0.5) requestAnimationFrame(step);
      else running = false;
    };
    host.addEventListener("mousemove", e => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (x < -900) { x = tx; y = ty; }
      if (!running) { running = true; requestAnimationFrame(step); }
    });
  }
  addPattern($(".hero-organic"));
  addPattern($(".site-footer"));

  /* ---------- Contact heading: one line, as wide as the section ---------------- */
  const contactTitle = $(".contact-content h2");
  function fitContactTitle() {
    if (!contactTitle) return;
    contactTitle.classList.remove("one-line");
    contactTitle.style.fontSize = "";
    if (innerWidth <= 980) return;
    contactTitle.classList.add("one-line");
    contactTitle.style.fontSize = "100px";
    contactTitle.style.width = "max-content";
    const natural = contactTitle.offsetWidth;
    contactTitle.style.width = "";
    const box = contactTitle.parentElement.closest(".contact-compact").clientWidth;
    const size = Math.min(170, 100 * box / natural);
    contactTitle.style.fontSize = size.toFixed(1) + "px";
  }
  fontsReady.then(fitContactTitle);
  addEventListener("resize", fitContactTitle);

  /* ---------- Case studies: click an image to see it large -------------------- */
  const caseStudy = $(".case-study");
  if (caseStudy) {
    $$(".booklet-gallery").forEach(g => { if (!g.querySelector("img")) g.hidden = true; });
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    const big = document.createElement("img");
    big.alt = "";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    box.append(big, close);
    document.body.appendChild(box);
    const shut = () => box.classList.remove("open");
    box.addEventListener("click", shut);
    addEventListener("keydown", e => { if (e.key === "Escape") shut(); });
    $$("section img", caseStudy).forEach(img => {
      if (img.closest(".process-steps")) return;
      img.classList.add("zoomable");
      img.addEventListener("click", () => {
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        box.classList.add("open");
      });
    });
  }

  /* ---------- Contact form — checks the fields, then sends via Web3Forms ------ */
  $$(".contact-form").forEach(form => {
    form.noValidate = true; // use our own messages instead of the browser pop-ups
    const status = form.querySelector(".form-status");
    const button = form.querySelector("button[type=submit]");
    const email = form.querySelector("[name=email]");
    const message = form.querySelector("[name=message]");
    const label = button.textContent;

    function setError(input, text) {
      const field = input.closest(".field");
      field.classList.toggle("has-error", !!text);
      field.querySelector(".field-error").textContent = text || "";
      input.setAttribute("aria-invalid", text ? "true" : "false");
    }

    function validate() {
      const mail = email.value.trim();
      const msg = message.value.trim();
      let emailErr = "";
      if (!mail) emailErr = form.dataset.emailEmpty;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) emailErr = form.dataset.emailBad;
      const msgErr = msg.length < 10 ? form.dataset.msgEmpty : "";
      setError(email, emailErr);
      setError(message, msgErr);
      if (emailErr) email.focus(); else if (msgErr) message.focus();
      return !emailErr && !msgErr;
    }

    // clear an error as soon as the visitor fixes the field
    [email, message].forEach(input => input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validate();
    }));

    form.addEventListener("submit", async e => {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";
      if (!validate()) return;
      button.disabled = true;
      button.textContent = form.dataset.sending;
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
})();
