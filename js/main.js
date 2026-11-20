/* Eric Sherwood Construction — interactions */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (RM || !hasGSAP) document.documentElement.classList.add('reduced');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- gallery data ---------------- */
  const P = {
    meehan: { name: 'Meehan Residence', place: 'St. Helena', n: 12 },
    sikora: { name: 'Sikora Project', place: 'Residential', n: 21 },
    magro: { name: 'Magro Residence', place: 'Kitchen & bath', n: 7 },
    haller: { name: 'Haller Residence', place: 'Decks & outdoor living', n: 7 },
    shawley: { name: 'Shawley Residence', place: 'Interior remodel', n: 7 },
    lada: { name: 'Lada Residence', place: 'Custom deck stairs', n: 6 }
  };
  const items = [];
  const featured = [
    ['img/tower.jpg', 'The Tower House', 'Napa Valley'],
    ['img/courtyard.jpg', 'Courtyard & Pool', 'Napa Valley'],
    ['img/living.jpg', 'Open-plan Living', 'Napa Valley'],
    ['img/kitchen.jpg', 'Modern Kitchen', 'Napa Valley'],
    ['img/game.jpg', 'Game Room', 'Napa Valley'],
    ['img/house.jpg', 'Contemporary Residence', 'Napa Valley'],
    ['img/gallery.jpg', 'CAMi Art + Wine Gallery', 'Calistoga · Commercial']
  ];
  featured.forEach(([src, t, s]) => items.push({ src, t, s, g: 'featured' }));
  // interleave projects for a varied "All" grid
  const keys = Object.keys(P);
  const max = Math.max(...keys.map(k => P[k].n));
  for (let i = 1; i <= max; i++) keys.forEach(k => {
    if (i <= P[k].n) items.push({ src: `img/projects/${k}-${String(i).padStart(2, '0')}.jpg`, t: P[k].name, s: P[k].place, g: k });
  });

  const grid = $('#masonry'), moreBtn = $('#moreBtn');
  const PAGE = 18; let shown = PAGE, filter = 'all';
  items.forEach((it, i) => {
    const a = document.createElement('a');
    a.className = 'tile'; a.href = it.src; a.dataset.g = it.g; a.dataset.i = i;
    a.innerHTML = `<img src="${it.src}" alt="${it.t} — ${it.s}" loading="lazy"><span class="zoom"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg></span><span class="cap"><b>${it.t}</b><span>${it.s}</span></span>`;
    grid.appendChild(a);
  });
  const tiles = $$('.tile', grid);
  function applyFilter(animate = true) {
    let count = 0;
    const visible = [];
    tiles.forEach(t => {
      const match = filter === 'all' || t.dataset.g === filter;
      const show = match && (filter !== 'all' || count < shown);
      if (match) count++;
      t.classList.toggle('hide', !show);
      if (show) visible.push(t);
    });
    moreBtn.parentElement.style.display = (filter === 'all' && shown < tiles.length) ? '' : 'none';
    if (animate && hasGSAP && !RM) gsap.fromTo(visible, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .7, stagger: .03, ease: 'power3.out', overwrite: true });
    if (hasGSAP) ScrollTrigger.refresh();
  }
  $$('#filters button').forEach(b => b.addEventListener('click', () => {
    $$('#filters button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    filter = b.dataset.f; applyFilter();
  }));
  moreBtn.addEventListener('click', () => { shown += PAGE; applyFilter(); });
  applyFilter(false);
  $$('[data-filter-go]').forEach(a => a.addEventListener('click', () => {
    const b = $(`#filters button[data-f="${a.dataset.filterGo}"]`); if (b) setTimeout(() => b.click(), 600);
  }));

  /* ---------------- lightbox ---------------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let cur = 0, list = [];
  function openLB(i) {
    list = tiles.filter(t => !t.classList.contains('hide')).map(t => +t.dataset.i);
    cur = list.indexOf(i); show(); lb.classList.add('on'); lenis && lenis.stop();
  }
  function show() { const it = items[list[cur]]; lbImg.src = it.src; lbImg.alt = it.t; lbCap.innerHTML = `${it.t}<span>${it.s.toUpperCase()} · ${cur + 1} / ${list.length}</span>`; }
  function closeLB() { lb.classList.remove('on'); lenis && lenis.start(); }
  grid.addEventListener('click', e => { const t = e.target.closest('.tile'); if (!t) return; e.preventDefault(); openLB(+t.dataset.i); });
  $('#lbX').onclick = closeLB;
  $('#lbN').onclick = () => { cur = (cur + 1) % list.length; show(); };
  $('#lbP').onclick = () => { cur = (cur - 1 + list.length) % list.length; show(); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowRight') $('#lbN').click(); if (e.key === 'ArrowLeft') $('#lbP').click();
  });

  /* ---------------- tabs ---------------- */
  const panels = $$('.why-panel');
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    panels.forEach(p => p.classList.remove('on'));
    const p = panels[+b.dataset.tab]; p.classList.add('on');
    if (hasGSAP && !RM) gsap.fromTo(p.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out' });
  }));

  /* ---------------- nav active link (scroll spy) ---------------- */
  const spy = [['#top', '#hero'], ['#founder', '#founder'], ['#residential', '#services'], ['#projects', '#projects'], ['#contact', '#contact']];
  const navLinks = $$('.nav ul a');
  let spyLock = 0;
  const setActive = href => navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === href));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (Date.now() < spyLock) return;
        const m = spy.find(s => $(s[1]) === e.target); if (!m) return;
        const cur = $('.nav ul a.active');
        if (m[0] === '#residential' && cur && cur.getAttribute('href') === '#commercial') return;
        setActive(m[0]);
      }
    }), { rootMargin: '-45% 0px -50% 0px' });
    spy.forEach(s => { const el = $(s[1]); if (el) io.observe(el); });
  }
  navLinks.forEach(a => a.addEventListener('click', () => { spyLock = Date.now() + 1800; setActive(a.getAttribute('href')); }));

  /* ---------------- mobile menu ---------------- */
  const burger = $('#burger');
  burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  /* ---------------- form → mailto ---------------- */
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, name = f.name.value.trim(), email = f.email.value.trim();
    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      [f.name, f.email].forEach(i => { if (!i.value.trim() || (i === f.email && !/^\S+@\S+\.\S+$/.test(i.value))) { i.style.borderColor = '#c0533a'; i.focus(); } });
      return;
    }
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${f.phone.value}\nProject type: ${f.type.value}\nLocation: ${f.location.value}\n\n${f.message.value}`;
    window.location.href = `mailto:eric@ericsherwoodconstruction.com?subject=${encodeURIComponent('New project enquiry — ' + name)}&body=${encodeURIComponent(body)}`;
    $('#formOk').style.display = 'block';
  });

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!RM && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2 && id !== '#top') return;
    const el = id === '#top' ? document.body : $(id); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: -20, duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------------- nav hide / to-top ---------------- */
  const nav = $('#nav'), totop = $('#totop'), ring = $('.totop .ring circle');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('hide', y > 300 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
    totop.classList.toggle('on', y > 900);
    ring.style.strokeDashoffset = 157 - 157 * Math.min(1, y / h);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- no-animation fallback ---------------- */
  if (RM || !hasGSAP) {
    $('#loader').remove(); $('#curtain').remove(); document.body.classList.remove('is-loading');
    $$('.count-up').forEach(c => c.textContent = c.dataset.to);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- split text ---------------- */
  function splitWords(el) {
    const walk = (node, wrapEm) => {
      const frag = document.createDocumentFragment();
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const m = document.createElement('span'); m.className = 'line-mask'; m.style.display = 'inline-block';
            const s = document.createElement('span'); s.textContent = w; m.appendChild(s); frag.appendChild(m);
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false); clone.appendChild(walk(n)); frag.appendChild(clone);
        }
      });
      return frag;
    };
    const f = walk(el); el.innerHTML = ''; el.appendChild(f);
    return $$('.line-mask > span', el);
  }

  /* ---------------- loader ---------------- */
  const heroWords = splitWords($('.split-hero'));
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set('.hero-in', { opacity: 0, y: 30 });
  gsap.set('#heroWall', { opacity: 0, scale: .94 });
  gsap.set('#curtain', { yPercent: 100, visibility: 'visible' });

  const loader = $('#loader'), count = $('.loader .count'), meterBar = $('.loader .meter i'), fill = $('.loader .logo-fill');
  const prog = { v: 0 };
  let pageLoaded = document.readyState === 'complete';
  window.addEventListener('load', () => { pageLoaded = true; });
  const tl = gsap.timeline();
  tl.from('.loader .logo-wrap', { opacity: 0, y: 20, duration: .8, ease: 'power3.out' })
    .to(prog, {
      v: 100, duration: 2.2, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(prog.v);
        count.textContent = v + '%'; meterBar.style.width = v + '%';
        fill.style.clipPath = `inset(${100 - v}% 0 0 0)`;
      }
    }, '-=.3')
    .add(() => { if (!pageLoaded) { tl.pause(); const go = () => tl.resume(); window.addEventListener('load', go, { once: true }); setTimeout(go, 3500); } })
    .to('.loader .logo-wrap', { scale: 1.06, duration: .5, ease: 'power2.out' })
    .fromTo('#curtain', { yPercent: 100 }, { yPercent: 0, duration: .8, ease: 'power4.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); })
    .to('#curtain', { yPercent: -100, duration: .9, ease: 'power4.inOut' })
    .add(() => { $('#curtain').remove(); ScrollTrigger.refresh(); })
    .to(heroWords, { yPercent: 0, duration: 1.1, stagger: .06, ease: 'power4.out' }, '-=.55')
    .to('.hero-in', { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '-=.9')
    .to('#heroWall', { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, '-=1.2')
    .add(countUps, '-=1');

  function countUps() {
    $$('.count-up').forEach(c => {
      const o = { v: 0 };
      gsap.to(o, { v: +c.dataset.to, duration: 2, ease: 'power2.out', onUpdate: () => c.textContent = Math.round(o.v) });
    });
  }

  /* ---------------- headings word reveal ---------------- */
  $$('.split').forEach(h => {
    const w = splitWords(h);
    gsap.from(w, { yPercent: 110, duration: 1.1, stagger: .05, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  /* ---------------- generic reveals ---------------- */
  ScrollTrigger.batch('.rv', {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out', overwrite: true })
  });

  /* image clip reveals */
  $$('.reveal-img').forEach((el, i) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 32px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 32px)', duration: 1.4, ease: 'power4.inOut', delay: i * .12,
      scrollTrigger: { trigger: '.intro .stack', start: 'top 75%' }
    });
  });
  gsap.fromTo('.reveal-arch', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'power4.inOut', scrollTrigger: { trigger: '.founder', start: 'top 65%' } });
  gsap.from('.founder .portrait', { scale: 0, rotate: -90, duration: 1.3, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.founder .visual', start: 'top 60%' } });
  gsap.from('.founder .badge-yr', { x: -60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.founder .visual', start: 'top 55%' } });
  gsap.fromTo('#journey .prog', { width: '0%' }, { width: '100%', ease: 'none', scrollTrigger: { trigger: '#journey', start: 'top 85%', end: 'top 45%', scrub: true } });

  /* ---------------- parallax ---------------- */
  gsap.matchMedia().add('(min-width: 761px)', () => {
    $$('[data-speed]').forEach(el => {
      const s = parseFloat(el.dataset.speed);
      const trig = el.closest('section, footer, .stack') || el;
      gsap.fromTo(el, { yPercent: -s * 50 }, { yPercent: s * 50, ease: 'none', scrollTrigger: { trigger: trig, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero .copy', { yPercent: 18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.svc-grid .svc:nth-child(2)', { y: 120, ease: 'none', scrollTrigger: { trigger: '.svc-grid', start: 'top bottom', end: 'bottom 60%', scrub: true } });
  });
  gsap.fromTo('.marquee', { xPercent: 0 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------------- process steps ---------------- */
  const steps = $$('#steps .step'), pimgs = $$('.process .pimg img');
  gsap.fromTo('#steps .rail i', { height: '0%' }, { height: '100%', ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  steps.forEach((s, i) => ScrollTrigger.create({
    trigger: s, start: 'top 62%', end: 'bottom 62%',
    onToggle: self => {
      if (!self.isActive) return;
      steps.forEach((x, j) => x.classList.toggle('on', j <= i));
      pimgs.forEach((im, j) => im.classList.toggle('on', j === i));
    }
  }));

  /* ---------------- quote word highlight ---------------- */
  const q = $('#qtext');
  q.innerHTML = q.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
  gsap.to('#qtext .w', { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.qband', start: 'top 70%', end: 'center 45%', scrub: true } });

  /* ---------------- feature thumbs ---------------- */
  gsap.from('.feature .thumbs figure', { y: 80, opacity: 0, rotate: 6, duration: 1.1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.feature', start: 'top 55%' } });

  /* ---------------- area pins ---------------- */
  gsap.from('.map .pin', { y: -40, opacity: 0, duration: .8, stagger: .15, ease: 'bounce.out', scrollTrigger: { trigger: '.map', start: 'top 70%' } });
  const route = $('#route');
  if (route) {
    const L = route.getTotalLength();
    gsap.fromTo(route, { strokeDasharray: `${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.map', start: 'top 65%' }, onComplete: () => route.style.strokeDasharray = '7 9' });
  }

  /* ---------------- cta ---------------- */
  gsap.from('.cta-box .bg', { scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.cta-box', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------------- magnetic buttons ---------------- */
  if (matchMedia('(hover:hover)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' });
      });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
