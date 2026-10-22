const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const conceptLoader = document.querySelector('#concept-loader');

document.querySelectorAll('.button .button-label').forEach(label => {
  const text = label.textContent.trim();
  label.setAttribute('data-button-label', text);
  label.parentElement?.setAttribute('aria-label', text);
  label.textContent = '';
});

// Branded loading reveal for the concept page.
(() => {
  if (!conceptLoader) return;
  const progress = conceptLoader.querySelector('.concept-loader__track span');
  const percent = conceptLoader.querySelector('.concept-loader__percent');
  const loaderInner = conceptLoader.querySelector('.concept-loader__inner');
  const particles = conceptLoader.querySelector('.concept-loader__particles');
  const waveCanvas = conceptLoader.querySelector('.concept-loader__wave-canvas');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waveContext = waveCanvas?.getContext('2d');
  let waveRunning = Boolean(waveContext);
  let waveFrame = 0;
  let waveWidth = 0;
  let waveHeight = 0;
  const waveDpr = Math.min(window.devicePixelRatio || 1, 2);
  const resizeWave = () => {
    if (!waveCanvas || !waveContext) return;
    const bounds = waveCanvas.getBoundingClientRect();
    waveWidth = Math.max(1, bounds.width);
    waveHeight = Math.max(1, bounds.height);
    waveCanvas.width = Math.round(waveWidth * waveDpr);
    waveCanvas.height = Math.round(waveHeight * waveDpr);
    waveContext.setTransform(waveDpr, 0, 0, waveDpr, 0, 0);
  };
  const drawWave = now => {
    if (!waveContext) return;
    const time = now * .001;
    waveContext.clearRect(0, 0, waveWidth, waveHeight);
    const centerY = waveHeight * .52;
    const strands = 34;
    for (let strand = 0; strand < strands; strand += 1) {
      const offset = strand - (strands - 1) / 2;
      waveContext.beginPath();
      for (let step = -24; step <= waveWidth + 24; step += 12) {
        const progress = step / waveWidth;
        const envelope = .35 + progress * .75;
        const wave = Math.sin(progress * 8.4 + time * .75 + strand * .17) * waveHeight * .12 * envelope;
        const cross = Math.sin(progress * 3.2 - time * .38 + strand * .29) * waveHeight * .065;
        const y = centerY + offset * waveHeight * .009 + wave + cross;
        if (step === -24) waveContext.moveTo(step, y);
        else waveContext.lineTo(step, y);
      }
      const intensity = .12 + (1 - Math.abs(offset) / (strands / 2)) * .42;
      waveContext.strokeStyle = `rgba(${offset % 3 === 0 ? '73,200,242' : '74,152,174'},${intensity})`;
      waveContext.lineWidth = offset % 5 === 0 ? 2.2 : .8;
      waveContext.shadowColor = 'rgba(73,200,242,.55)';
      waveContext.shadowBlur = offset % 5 === 0 ? 15 : 5;
      waveContext.stroke();
    }
    waveContext.shadowBlur = 0;
    const glow = waveContext.createRadialGradient(waveWidth * .16, centerY, 0, waveWidth * .16, centerY, waveWidth * .42);
    glow.addColorStop(0, 'rgba(73,200,242,.42)');
    glow.addColorStop(1, 'rgba(73,200,242,0)');
    waveContext.fillStyle = glow;
    waveContext.fillRect(0, 0, waveWidth, waveHeight);
    if (waveRunning && !reduced) waveFrame = requestAnimationFrame(drawWave);
  };
  resizeWave();
  window.addEventListener('resize', resizeWave, { passive: true });
  if (waveContext) {
    drawWave(0);
    if (!reduced) waveFrame = requestAnimationFrame(drawWave);
  }
  let value = 0;
  const duration = reduced ? 180 : 4200;
  const start = performance.now();
  document.body.classList.add('intro-active');
  if (particles && !reduced) {
    for (let i = 0; i < 34; i += 1) {
      const particle = document.createElement('i');
      particle.style.setProperty('--px', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--py', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--pr', `${Math.round(Math.random() * 360)}deg`);
      particle.style.setProperty('--pd', `${(1.8 + Math.random() * 3).toFixed(2)}s`);
      particle.style.setProperty('--pi', `${(Math.random() * 2).toFixed(2)}s`);
      particles.append(particle);
    }
  }
  const tick = now => {
    const ratio = Math.min((now - start) / duration, 1);
    value = Math.round((1 - Math.pow(1 - ratio, 3)) * 100);
    if (progress) progress.style.width = `${value}%`;
    if (percent) percent.textContent = `${value}%`;
    if (ratio < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (!reduced) {
    conceptLoader.addEventListener('pointermove', event => {
      const x = (event.clientX / window.innerWidth - .5) * 2;
      const y = (event.clientY / window.innerHeight - .5) * 2;
      loaderInner?.style.setProperty('--loader-x', `${x * 10}px`);
      loaderInner?.style.setProperty('--loader-y', `${y * 8}px`);
      conceptLoader.style.setProperty('--light-x', `${event.clientX}px`);
      conceptLoader.style.setProperty('--light-y', `${event.clientY}px`);
    }, { passive: true });
  }
  const playTitleReveal = () => {
    const titleLines = [...document.querySelectorAll('.hero-copy h1 .hero-title-line > span')].slice(0, 2);
    const started = performance.now();
    const duration = 2200;
    const tickTitle = now => {
      let finished = true;
      titleLines.forEach((line, index) => {
        const delay = index === 0 ? 80 : 420;
        const local = Math.max(0, Math.min(1, (now - started - delay) / duration));
        const eased = 1 - Math.pow(1 - local, 3);
        const direction = index === 0 ? -1 : 1;
        const offset = direction * (1 - eased) * 110;
        line.style.setProperty('transform', `translate3d(${offset.toFixed(2)}%,0,0) scale(${(.985 + eased * .015).toFixed(4)})`, 'important');
        line.style.setProperty('opacity', eased.toFixed(3), 'important');
        if (local < 1) finished = false;
      });
      if (finished) {
        document.body.classList.remove('title-reveal-play');
        titleLines.forEach(line => {
          line.style.setProperty('transform', 'translate3d(0,0,0) scale(1)', 'important');
          line.style.setProperty('opacity', '1', 'important');
        });
        return;
      }
      requestAnimationFrame(tickTitle);
    };
    requestAnimationFrame(tickTitle);
  };
  const finishIntro = () => {
    if (conceptLoader.classList.contains('is-complete')) return;
    waveRunning = false;
    if (waveFrame) cancelAnimationFrame(waveFrame);
    conceptLoader.classList.add('is-complete');
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-entered');
    // Let the logo intro fade fully away before the banner title begins.
    window.setTimeout(() => {
      document.body.classList.add('title-reveal-play');
      playTitleReveal();
    }, 160);
    if (progress) progress.style.width = '100%';
    if (percent) percent.textContent = '100%';
  };
  const revealIntro = () => {
    if (conceptLoader.classList.contains('is-revealing')) return;
    conceptLoader.classList.add('is-revealing');
    if (progress) progress.style.width = '100%';
    if (percent) percent.textContent = '100%';
  };
  conceptLoader.querySelector('.concept-loader__skip')?.addEventListener('click', finishIntro);
  // Complete the intro automatically so the title reveal is always shown on load.
  window.setTimeout(finishIntro, duration + 180);
  window.addEventListener('wheel', event => {
    if (!conceptLoader.classList.contains('is-complete')) {
      if (conceptLoader.classList.contains('is-revealing')) {
        finishIntro();
        return;
      }
      event.preventDefault();
      revealIntro();
    }
  }, { passive: false });
  window.addEventListener('touchmove', () => {
    if (conceptLoader.classList.contains('is-revealing')) finishIntro();
    else revealIntro();
  }, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown','PageDown',' ','Enter'].includes(event.key)) finishIntro();
  });
})();

// Small ambient plus markers echo the reference banner without competing with
// the title or the brighter wave canvas in the loader.
const heroPlusField = document.querySelector('.hero-plus-field');
if (heroPlusField) {
  const pluses = 30;
  for (let index = 0; index < pluses; index += 1) {
    const plus = document.createElement('i');
    plus.style.setProperty('--plus-x', `${8 + ((index * 37) % 84)}%`);
    plus.style.setProperty('--plus-y', `${10 + ((index * 53) % 78)}%`);
    plus.style.setProperty('--plus-delay', `${((index * 0.37) % 4.8).toFixed(2)}s`);
    plus.style.setProperty('--plus-duration', `${(5.6 + ((index * 0.61) % 3.8)).toFixed(2)}s`);
    plus.style.setProperty('--plus-drift', `${-18 + ((index * 17) % 37)}px`);
    plus.style.setProperty('--plus-scale', `${(0.7 + ((index * 0.13) % 0.5)).toFixed(2)}`);
    heroPlusField.append(plus);
  }
}

document.querySelectorAll('.section-index').forEach(label => {
  label.textContent = label.textContent.replace(/^\s*\d+\s*\/\s*/,'');
});
document.querySelectorAll('.placeholder-image, .project-request-panel').forEach((imageSlot, index) => {
  imageSlot.setAttribute('role', 'img');
  imageSlot.setAttribute('aria-label', imageSlot.getAttribute('aria-label') || `Project image ${index + 1}`);
  imageSlot.querySelectorAll('span, b').forEach(label => label.remove());
});
document.querySelectorAll('.footer-bottom').forEach(footer => {
  const removeVersionLabel = node => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent = child.textContent.replace(/\s*Wireframe\s*\/\s*v1\.0\s*/gi, '');
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        removeVersionLabel(child);
      }
    });
  };
  removeVersionLabel(footer);
  footer.querySelectorAll('span').forEach(span => {
    if (!span.textContent.trim()) span.remove();
  });
});
const proofTitle = document.querySelector('.proof h2');
if (proofTitle) proofTitle.textContent = 'What you receive.';
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
  const linkPage = link.getAttribute('href')?.split('#')[0];
  if (linkPage === currentPage || (currentPage === 'index.html' && linkPage === '')) {
    link.setAttribute('aria-current', 'page');
    link.classList.add('is-current');
  }
});
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileNav.classList.toggle('is-open', !open);
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('is-open');
}));

const services = {
  story: { number: '01', kicker: 'CLOSER · 2025', title: 'Give the moment a reason.', copy: 'We begin with the story, the place and the audience, then shape a creative direction that answers what the occasion needs to say.', items: ['Creative strategy & storytelling', 'Audience and occasion insight', 'Story architecture and show narrative'], image: 'assets/eventoria-hero-event.png', mediaLabel: 'Story and event concept preview', caption: 'STORY & STRATEGY' },
  design: { number: '02', kicker: 'DESIGN STUDY · 2025', title: 'Make the idea tangible.', copy: 'We translate the story into the experience: spatial, scenic and sculptural design with a clear role in the whole.', items: ['Experience, spatial & scenic design', 'Art sculpture design and build', 'Visual language and guest journey'], image: 'assets/concept-stage.svg', mediaLabel: 'Spatial and scenic design preview', caption: 'SPATIAL DESIGN' },
  show: { number: '03', kicker: 'SHOW DIRECTION · 2025', title: 'Bring the story to life.', copy: 'The show is where the idea moves. We cast, choreograph, rehearse and direct the human and cultural details that make it live.', items: ['Show content, entertainment & costume', 'Artist, cast & performer management', 'Choreography, rehearsals & show direction'], image: 'assets/eventoria-hero-fireworks.png', mediaLabel: 'Live show direction preview', caption: 'LIVE SHOW' },
  delivery: { number: '04', kicker: 'LIVE DELIVERY · 2025', title: 'Carry it through.', copy: 'Production and live operations turn a strong idea into a reliable night, with event operations, protocol and live delivery held in one view.', items: ['Production and live shows', 'Event operations and protocol', 'On-site delivery and show calling'], image: 'assets/eventoria-hero-premium.png', mediaLabel: 'Event production preview', caption: 'EVENT PRODUCTION' }
};
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  const panel = document.querySelector('#service-panel');
  panel?.classList.add('is-changing');
  document.querySelectorAll('.tab').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
  const service = services[tab.dataset.service];
  window.setTimeout(() => {
    const servicePanel = document.querySelector('#service-panel');
    if (!servicePanel) return;
    const setText = (selector, value) => { const node = servicePanel.querySelector(selector); if (node) node.textContent = value; };
    setText('.service-number', service.number);
    setText('.service-kicker span:last-child', service.kicker);
    setText('.service-copy h3', service.title);
    setText('.service-description', service.copy);
    const list = servicePanel.querySelector('.service-list');
    if (list) list.replaceChildren(...service.items.map(item => { const li = document.createElement('li'); li.innerHTML = `<span aria-hidden="true">✓</span><span>${item}</span>`; return li; }));
    const image = servicePanel.querySelector('.service-image');
    if (image) { image.style.setProperty('--service-image', `url('${service.image}')`); image.setAttribute('aria-label', service.mediaLabel); }
    setText('.service-image-caption', service.caption);
    panel?.classList.remove('is-changing');
  }, prefersReducedMotion ? 0 : 180);
}));

document.querySelector('#enquiry-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.textContent = 'Thanks — your brief is on its way. We’ll be in touch within two working days.';
  event.currentTarget.reset();
});

// GSAP is loaded progressively so the static pages remain usable without JavaScript.
const loadGsap = () => new Promise(resolve => {
  const finish = () => resolve(window.gsap && window.ScrollTrigger ? window.gsap : null);
  const load = (src, done) => { const script = document.createElement('script'); script.src = src; script.onload = done; script.onerror = () => resolve(null); document.head.appendChild(script); };
  if (window.gsap && window.ScrollTrigger) return finish();
  if (window.gsap) return load('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', finish);
  load('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', () => load('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', finish));
});

loadGsap().then(gsap => {
  // Match the reference: one pinned viewport stage with layered panels. Use
  // native sticky only when the animation library cannot be loaded.
  // The local page must work without depending on the remote GSAP CDN.
  // The fallback below is the authoritative pinned-stack controller.
  setupSelectedWorkFallback();
  if (!gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  gsap.from('.site-header', { y: -24, opacity: 0, duration: .7, ease: 'power2.out' });
  gsap.from('.hero-copy > *:not(h1)', { y: 24, opacity: 0, duration: 1, stagger: .12, delay: .62, ease: 'power3.out' });
  gsap.from('.hero-board', { x: 48, opacity: 0, duration: 1.2, delay: .74, ease: 'power3.out' });
  document.querySelectorAll('.section-pad').forEach(section => {
    gsap.from(section.querySelectorAll('.section-index, h2, h3, .body-copy, .project-card, .process-list article, .expertise-grid article'), {
      y: 22, opacity: 0, duration: .65, stagger: .05, ease: 'power2.out', immediateRender: false,
      scrollTrigger: { trigger: section, start: 'top 84%', once: true }
    });
  });
});

function setupSelectedWorkGsap(gsap) {
  const work = document.querySelector('.work');
  const stage = work?.querySelector('.work-reference-stage');
  const panels = stage ? [...stage.querySelectorAll('.work-gsap-panel')] : [];
  if (!work || !stage || panels.length < 2 || !window.ScrollTrigger) return;

  work.classList.add('work-gsap-ready');
  stage.style.setProperty('height', '100svh', 'important');
  panels.forEach(panel => panel.style.removeProperty('transform'));
  panels.forEach((panel, index) => panel.style.setProperty('z-index', String(index + 1), 'important'));
  gsap.set(panels, { '--panel-y': '0%' });
  gsap.set(panels.slice(1), { '--panel-y': '100%' });

  const sequence = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      // Leave an extra viewport of scroll after the final panel arrives so
      // the last image has the same reading time as the earlier panels.
      end: () => `+=${Math.max(1, panels.length - 1) * window.innerHeight + window.innerHeight * .65}`,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  panels.slice(1).forEach(panel => {
    sequence.to(panel, { '--panel-y': '0%', duration: 1 }, '+=0.45');
  });
  window.ScrollTrigger.refresh();
}

// Local fallback for file:// previews or browsers that block the CDN. It keeps
// the same reference behavior: one viewport is pinned, then each next image
// rises from the bottom and covers the previous one.
function setupSelectedWorkFallback() {
  const work = document.querySelector('.work');
  const stage = work?.querySelector('.work-reference-stage');
  const panels = stage ? [...stage.querySelectorAll('.work-gsap-panel')] : [];
  if (!work || !stage || panels.length < 2) return;

  work.classList.remove('work-gsap-ready');
  work.classList.add('work-scroll-fallback');
  work.style.setProperty('overflow', 'visible', 'important');
  stage.style.setProperty('position', 'relative', 'important');
  const sizeStage = () => stage.style.setProperty('height', `${window.innerHeight * (1 + Math.max(1, panels.length - 1) * .95 + .25)}px`, 'important');
  sizeStage();
  stage.style.setProperty('overflow', 'visible', 'important');

  // Deterministic fallback for browsers where the reference animation bundle
  // is unavailable: pin the stage with fixed layers and drive the cover stack
  // from scroll progress (panel 2, then panel 3).
  panels.forEach((panel, index) => {
    panel.style.setProperty('position', 'absolute', 'important');
    panel.style.setProperty('top', '0', 'important');
    panel.style.setProperty('left', '0', 'important');
    panel.style.setProperty('width', '100%', 'important');
    panel.style.setProperty('height', '100svh', 'important');
    panel.style.setProperty('margin', '0', 'important');
    panel.style.setProperty('display', 'block', 'important');
    panel.style.setProperty('z-index', String(index + 1), 'important');
    panel.style.setProperty('visibility', 'visible', 'important');
    panel.style.setProperty('transform', `translate3d(0,${index ? 100 : 0}%,0)`, 'important');
  });

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const start = stage.getBoundingClientRect().top + window.scrollY;
    const transitionTravel = Math.max(1, panels.length - 1) * vh * .95;
    const finalHold = vh * .25;
    const totalTravel = transitionTravel + finalHold;
    // Reserve the final reading interval inside the stage, then anchor the
    // panels at its bottom so releasing the pin never jumps back to the top.
    const progress = Math.max(0, Math.min(1, (window.scrollY - start) / transitionTravel));
    const active = window.scrollY >= start && window.scrollY <= start + totalTravel;
    panels.forEach((panel, index) => {
      const local = Math.max(0, Math.min(1, (progress * (panels.length - 1) - (index - 1))));
      const y = index === 0 ? 0 : (1 - local) * 100;
      panel.style.setProperty('position', active ? 'fixed' : 'absolute', 'important');
      panel.style.setProperty('top', active || window.scrollY < start ? '0' : `${totalTravel}px`, 'important');
      panel.style.setProperty('transform', `translate3d(0,${y}%,0)`, 'important');
    });
  };
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => { sizeStage(); requestUpdate(); }, { passive: true });
  requestUpdate();

}

function setupProofReferenceScroll() {
  const track = document.querySelector('.proof-reference-scroll');
  const sticky = track?.querySelector('.proof-reference-sticky');
  const orbit = track?.querySelector('.proof-reference-orbit');
  const list = track?.querySelector('.proof-reference-list');
  const images = track ? [...track.querySelectorAll('.proof-reference-orbit img')] : [];
  const steps = track ? [...track.querySelectorAll('.proof-reference-list .proof-reference-step')] : [];
  if (!track || !sticky || !orbit || !list || !images.length || !steps.length) return;


  // Replace the single hero frame with a curved event-card wall inside the lens.
  const wallSources = Array.from({ length: 11 }, (_, index) =>
    `assets/unsplash-event-${String(index + 1).padStart(2, '0')}.jpg`
  );
  // The orbit must contain only the event-card wall. Removing every legacy
  // child prevents the old single-image frame from winning the cascade.
  orbit.replaceChildren();
  const wall = document.createElement('div');
  wall.className = 'proof-event-wall';
  wall.style.cssText = 'position:absolute;inset:-18%;z-index:100!important;opacity:1!important;visibility:visible!important;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:14px;background:linear-gradient(135deg,#0b1e2d 0%,#1e5969 35%,#050b12 58%,#153b49 100%);transform:perspective(900px) scale(1.08);';
  const columnSources = [0, 1, 2, 3, 4];
  columnSources.forEach((column, columnIndex) => {
    const rail = document.createElement('div');
    rail.className = 'proof-event-wall__column';
    rail.style.setProperty('--event-column-index', columnIndex);
    for (let row = 0; row < 7; row += 1) {
      const card = document.createElement('img');
      const index = (row * 2 + columnIndex) % wallSources.length;
      card.src = wallSources[index];
      card.alt = 'Event production card';
      card.className = 'is-active';
      card.style.cssText = 'position:relative!important;inset:auto!important;width:100%!important;height:180px!important;display:block!important;opacity:1!important;visibility:visible!important;object-fit:cover!important;border-radius:10px;filter:saturate(1.08) contrast(1.08);';
      card.style.setProperty('--event-card-index', index);
      rail.append(card);
    }
    wall.append(rail);
  });
  orbit.append(wall);

  // Move the lens out of the sticky/overflow layer. This makes its viewport
  // position independent of the rail and of any transformed scroll wrapper.
  const orbitPlaceholder = document.createComment('proof-reference-orbit');
  orbit.parentNode.insertBefore(orbitPlaceholder, orbit);
  document.body.appendChild(orbit);
  orbit.classList.add('proof-reference-orbit--viewport');

  /* GSAP/Lenis portal experiment reverted; use the local sticky fallback below. */
  if (false) {
    gsap.registerPlugin(ScrollTrigger);
    track.classList.add('proof-portal');
    const assets = images.map(image => image.getAttribute('src')).filter(Boolean);
    const cylinder = document.createElement('div');
    cylinder.className = 'proof-portal-cylinder';
    const cards = Array.from({ length: 15 }, (_, index) => {
      const card = document.createElement('div');
      card.className = 'proof-portal-card';
      card.style.setProperty('--portal-card-index', index);
      card.style.setProperty('--portal-card-image', `url("${assets[index % assets.length]}")`);
      cylinder.append(card);
      return card;
    });
    orbit.querySelectorAll('img').forEach(image => image.remove());
    orbit.append(cylinder);
    sticky.style.position = 'relative';
    list.style.removeProperty('transform');
    const stepDistance = 150;
    const state = { progress: 0 };
    const render = progress => {
      const sequence = Math.min(steps.length - 1, progress * steps.length);
      const activeIndex = Math.min(steps.length - 1, Math.floor(sequence));
      list.style.setProperty('transform', `translateY(${-sequence * stepDistance}px)`, 'important');
      steps.forEach((step, index) => {
        const active = index === activeIndex;
        step.classList.toggle('is-active', active);
        gsap.to(step, { opacity: active ? 1 : .25, y: active ? 0 : 24, duration: .2, overwrite: true });
      });
      gsap.set(cylinder, { rotateX: progress * 360 });
      gsap.set(orbit, { scale: 1 + Math.sin(progress * Math.PI * steps.length) * .04 });
    };
    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: sticky,
      scrub: 1,
      anticipatePin: 1,
      snap: { snapTo: 1 / (steps.length - 1), duration: .5, ease: 'power2.inOut' },
      onUpdate: trigger => { state.progress = trigger.progress; render(trigger.progress); }
    });
    render(0);
    const lenis = window.Lenis ? new window.Lenis({ lerp: .085, smoothWheel: true }) : null;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    return;
  }

  let frame = 0;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const render = () => {
    frame = 0;
    // On narrow screens, let the complete text and gallery flow vertically.
    // The desktop lens stays portaled so its fixed position remains stable.
    if (window.innerWidth <= 700) {
      if (orbit.parentNode === document.body) orbitPlaceholder.after(orbit);
      orbit.style.removeProperty('display');
      orbit.style.removeProperty('visibility');
      track.classList.remove('is-proof-complete');
      steps.forEach(step => step.classList.add('is-active'));
      return;
    }
    if (orbit.parentNode !== document.body) document.body.appendChild(orbit);
    const range = Math.max(1, track.offsetHeight - window.innerHeight);
    const progress = clamp(-track.getBoundingClientRect().top / range);
    const bounds = track.getBoundingClientRect();
    // The orbit is portaled to body for stable positioning, so explicitly
    // hide it at the end of the proof track before the next section begins.
    const pinned = progress > 0.005 && progress < 0.995 && bounds.top <= 0 && bounds.bottom >= window.innerHeight;
    orbit.style.setProperty('position', 'fixed', 'important');
    orbit.style.setProperty('left', '50%', 'important');
    const compactViewport = window.matchMedia('(max-width: 600px)').matches;
    // Match the supplied reference: a compact ~576px lens sits between the
    // upper and lower content rows and remains fixed in the viewport.
    orbit.style.setProperty('width', compactViewport ? '78vw' : 'min(31vw, 576px)', 'important');
    orbit.style.setProperty('height', compactViewport ? '78vw' : 'min(31vw, 576px)', 'important');
    const finalTop = compactViewport ? 18 : 41;
    orbit.style.setProperty('top', `${finalTop}%`, 'important');
    orbit.style.setProperty('visibility', pinned ? 'visible' : 'hidden', 'important');
    orbit.style.setProperty('display', pinned ? 'block' : 'none', 'important');
    orbit.style.setProperty('z-index', '8', 'important');
    // Match the reference rhythm: finish the lens reveal first, then move
    // exactly one row spacing per step across the remaining pin distance.
    const revealEnd = 0.18;
    // Finish the content rail before the end of the pin, leaving a dedicated
    // hold phase for the final circle expansion.
    const railProgress = clamp((progress - revealEnd) / 0.58);
    const sequence = railProgress * (steps.length - 1);
    const activeIndex = Math.min(steps.length - 1, Math.floor(sequence + .6));
    const stepDistance = steps.length > 1 ? steps[1].offsetTop - steps[0].offsetTop : 310;
    list.style.setProperty('--proof-list-shift', `${(-sequence * stepDistance).toFixed(2)}px`);
    // Change each gallery set exactly when its matching horizontal line
    // crosses the center of the gallery, including the third line.
    const gallery = orbit.querySelector('.proof-event-wall');
    if (gallery) {
      const galleryCenter = orbit.getBoundingClientRect().top + orbit.getBoundingClientRect().height / 2;
      let galleryIndex = 0;
      steps.forEach((step, index) => {
        // Keep the opening circle artwork through the first line. The image
        // sequence advances from the second, third, and fourth lines.
        if (index === 0) return;
        const line = step.querySelector('.proof-reference-line');
        const lineCenter = line ? line.getBoundingClientRect().top + line.getBoundingClientRect().height / 2 : Number.POSITIVE_INFINITY;
        const crossingPoint = galleryCenter;
        if (line && lineCenter <= crossingPoint) galleryIndex = index;
      });
      const nextSet = String(Math.min(3, galleryIndex));
      if (gallery.getAttribute('data-active-set') !== nextSet) {
        gallery.setAttribute('data-active-set', nextSet);
        gallery.querySelectorAll('.proof-event-wall__column img').forEach((image, index) => {
          image.src = wallSources[(index + Number(nextSet) * 3) % wallSources.length];
        });
      }
    }
    // Begin the emerge immediately and scrub it across the opening quarter of the pin.
    // Let the portal finish emerging before the annotation rail has travelled
    // far enough for the first content to leave the viewport.
    const reveal = clamp(progress / 0.18);
    const easedReveal = reveal * reveal * (3 - 2 * reveal);
    // The circle expands from the upper rail without changing its center.
    const startTop = finalTop;
    orbit.style.setProperty('top', `${startTop}%`, 'important');
    // Keep the gallery full-sized through row 04, then shrink it back
    // toward the same small scale used at the beginning of the reveal.
    const orbitRect = orbit.getBoundingClientRect();
    const fourthLine = steps[3]?.querySelector('.proof-reference-line');
    const fourthLineCenter = fourthLine
      ? fourthLine.getBoundingClientRect().top + fourthLine.getBoundingClientRect().height / 2
      : Number.POSITIVE_INFINITY;
    const circleCenter = orbitRect.top + orbitRect.height / 2;
    const portalShrink = fourthLineCenter <= circleCenter ? 1 : 0;
    track.classList.toggle('is-proof-complete', Boolean(portalShrink));
    if (portalShrink) {
      orbit.style.setProperty('visibility', 'hidden', 'important');
      orbit.style.setProperty('display', 'none', 'important');
    }
    const gradientOpacity = 0;
    const baseScale = 0.015 + easedReveal * 0.985;
    const orbitScale = (baseScale * (1 - portalShrink) + .02 * portalShrink).toFixed(3);
    orbit.style.setProperty('--proof-orbit-scale', orbitScale);
    orbit.style.setProperty('--proof-gradient-opacity', gradientOpacity.toFixed(3));
    orbit.style.setProperty('transform', `translate(-50%,-50%) scale(${orbitScale})`, 'important');
    const imageIndex = activeIndex % images.length;
    images.forEach((image, index) => {
      const distance = Math.abs(index - imageIndex);
      image.style.opacity = clamp(1 - distance * 2.4).toFixed(3);
      image.classList.toggle('is-active', index === activeIndex);
    });
    const wall = orbit.querySelector('.proof-event-wall');
    wall?.style.setProperty('opacity', (1 - gradientOpacity).toFixed(3), 'important');
    steps.forEach((step, index) => step.classList.toggle('is-active', index === activeIndex));
  };
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  schedule();
}

setupProofReferenceScroll();

// Reference-style inline image cards for the Eventoria Approach title.
document.querySelectorAll('.approach-title__line').forEach(line => {
  const image = line.getAttribute('data-approach-image');
  if (!image) return;
  line.style.setProperty('--approach-image', `url("${image}")`);
  line.setAttribute('tabindex', '0');
});
const approachCards = [...document.querySelectorAll('.approach-title__card img')];
const approachImageSequence = [
  'assets/eventoria-approach-sign.png', 'assets/what-builds-conference.png',
  'assets/eventoria-hero-event.png', 'assets/what-you-receive-live.png'
];
let approachImageIndex = 0;
const rotateApproachCards = () => {
  approachImageIndex = (approachImageIndex + 1) % approachImageSequence.length;
  approachCards.forEach((image, index) => {
    image.style.opacity = '0';
    window.setTimeout(() => {
      image.src = approachImageSequence[(approachImageIndex + index) % approachImageSequence.length];
      image.style.opacity = '1';
    }, 120);
  });
};
// Keep the middle card stable. The outer cards are controlled by section
// visibility below instead of rotating continuously.

// Reveal the outer inline cards from section scroll position instead of
// requiring a hover, so the sentence assembles naturally as it enters view.
const approachTitle = document.querySelector('.approach-title');
if (approachTitle) {
  const updateApproachReveal = () => {
    const bounds = approachTitle.getBoundingClientRect();
    const reveal = bounds.top < window.innerHeight * .62 && bounds.bottom > window.innerHeight * .04;
    const titleTop = bounds.top;
    // Leave a clear collapsed interval between the first and third card.
    const firstStage = reveal && titleTop > 70;
    const thirdStage = reveal && titleTop <= 20 && titleTop > -260;
    approachTitle.classList.toggle('is-scroll-revealed', reveal);
    approachTitle.classList.toggle('is-approach-first-stage', firstStage);
    approachTitle.classList.toggle('is-approach-third-stage', thirdStage);
    const setCardState = (card, open) => {
      if (!card) return;
      card.style.setProperty('width', open ? 'clamp(72px,7vw,132px)' : '0px', 'important');
      card.style.setProperty('margin', open ? '0 .22em' : '0 .18em', 'important');
      card.style.setProperty('opacity', open ? '1' : '0', 'important');
      card.style.setProperty('transform', open ? 'scale(1)' : 'scale(.8)', 'important');
    };
    setCardState(approachCards[0]?.closest('.approach-title__card'), firstStage);
    setCardState(approachCards[2]?.closest('.approach-title__card'), thirdStage);
  };
  window.addEventListener('scroll', updateApproachReveal, { passive: true });
  updateApproachReveal();
}

// Pinned portal: one ScrollTrigger drives the circle emerge, row rail and Three.js wall.
function setupProofThreePortal() {
  const section = document.querySelector('#proof');
  const track = section?.querySelector('.proof-reference-scroll');
  const sticky = section?.querySelector('.proof-reference-sticky');
  const orbit = section?.querySelector('.proof-reference-orbit');
  const canvas = section?.querySelector('.proof-portal-canvas');
  const list = section?.querySelector('.proof-reference-list');
  const rows = list ? [...list.children] : [];
  if (!section || !track || !sticky || !orbit || !canvas || rows.length < 4 || !window.THREE) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.classList.add('proof-portal-ready');
  if (reduced || !window.gsap || !window.ScrollTrigger) return;

  const CONFIG = { pinLength: '+=500%', circleSize: .75, columnSpeeds: [.8, 1, 1.25], bendStrength: .34, rowSpacing: .75, easing: 'power3.out' };
  const THREE = window.THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, .1, 100);
  camera.position.z = 8;
  const wall = new THREE.Group();
  scene.add(wall);
  const sources = ['assets/eventoria-circle-01.png','assets/eventoria-circle-02.png','assets/eventoria-circle-03.png','assets/eventoria-circle-04.png','assets/eventoria-circle-05.png'];
  const loader = new THREE.TextureLoader();
  const textures = sources.map(src => loader.load(src));
  const materials = textures.map(texture => new THREE.ShaderMaterial({ transparent: true, uniforms: { map: { value: texture }, bend: { value: CONFIG.bendStrength }, scroll: { value: 0 } }, vertexShader: 'uniform float bend; uniform float scroll; varying vec2 vUv; void main(){ vUv=uv; vec3 p=position; float bx=sin(p.x*1.2)*bend; float by=sin(p.y*1.1)*bend; p.z += bx*abs(p.x)+by*abs(p.y); p.x += sin(p.y*0.7)*bend*0.18; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }', fragmentShader: 'uniform sampler2D map; varying vec2 vUv; void main(){ vec4 c=texture2D(map,vUv); gl_FragColor=c; }' }));
  const planes = [];
  for (let row = 0; row < 5; row += 1) for (let col = 0; col < 3; col += 1) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(col === 1 ? 1.65 : 1.08, 1.05), materials[(row * 3 + col) % materials.length]);
    mesh.position.set((col - 1) * 1.52, (2 - row) * 1.18, 0);
    mesh.userData.speed = CONFIG.columnSpeeds[col];
    wall.add(mesh); planes.push(mesh);
  }
  let width = 0; let height = 0; let visible = true; let targetOffset = 0; let currentOffset = 0; let scrollVelocity = 0; let lastProgress = 0;
  const resize = () => { const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); renderer.setSize(width, height, false); camera.left=-3; camera.right=3; camera.top=3; camera.bottom=-3; camera.updateProjectionMatrix(); };
  const render = () => { if (!visible) return; currentOffset += (targetOffset-currentOffset)*.08; wall.position.y = currentOffset; materials.forEach(material => { material.uniforms.scroll.value = currentOffset; material.uniforms.bend.value = CONFIG.bendStrength + Math.abs(scrollVelocity)*.3; }); renderer.render(scene,camera); requestAnimationFrame(render); };
  const setProgress = progress => { const emerge = Math.min(1, progress/.2); const rail = Math.max(0, Math.min(1, (progress-.2)/.8)); const active = Math.min(rows.length-1, Math.round(rail*(rows.length-1))); const size = .02 + (1-Math.pow(1-emerge,3))*.98; orbit.style.setProperty('--portal-emerge', size.toFixed(3)); list.style.setProperty('--portal-rail-y', `${(-rail*(rows.length-1)*CONFIG.rowSpacing*height*.75).toFixed(2)}px`); rows.forEach((row,index)=>row.classList.toggle('is-active',index===active)); targetOffset = -rail*3.2; scrollVelocity = (progress-lastProgress)*60; lastProgress=progress; };
  const trigger = window.ScrollTrigger.create({ trigger: track, start:'top top', end: CONFIG.pinLength, pin: sticky, scrub:1, anticipatePin:1, snap:{ snapTo:1/(rows.length-1), duration:.6, ease:'power2.inOut' }, onUpdate:self=>setProgress(self.progress) });
  const quickX = window.gsap.quickTo(wall.rotation,'y',{duration:.45,ease:'power2.out'}); const quickY = window.gsap.quickTo(wall.rotation,'x',{duration:.45,ease:'power2.out'});
  sticky.addEventListener('pointermove', event => { const rect=sticky.getBoundingClientRect(); quickY(((event.clientX-rect.left)/rect.width-.5)*.07); quickX(((event.clientY-rect.top)/rect.height-.5)*-.07); }, { passive:true });
  const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; if(visible) render(); }, { threshold:0 }); observer.observe(sticky);
  window.addEventListener('resize', resize, { passive:true }); resize(); setProgress(0); render();
}

const conceptHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');
const heroStage = document.querySelector('.hero-stage');
const heroTitle = heroSection?.querySelector('.hero-copy h1');
const heroTitleSpans = heroSection ? [...heroSection.querySelectorAll('.hero-copy h1 .hero-title-line > span')] : [];
const heroMediaSequence = heroSection?.querySelector('.hero-media-sequence');
const heroMainMedia = heroSection?.querySelector('.hero-media-sequence__main');
const heroMediaCards = heroSection ? [...heroSection.querySelectorAll('.hero-media-sequence__card')] : [];
const heroSupportingContent = heroSection ? [...heroSection.querySelectorAll('.hero-copy .hero-lede, .hero-copy .hero-actions')] : [];
const heroReferenceMessage = heroSection?.querySelector('.hero-reference-message');
const heroOrbitLayout = [
  { x: .273, y: .2, size: .13, rotation: -5 },
  { x: .437, y: .12, size: .095, rotation: 0 },
  { x: .615, y: .14, size: .15, rotation: 2 },
  { x: .772, y: .254, size: .14, rotation: 4 },
  { x: .164, y: .37, size: .115, rotation: -2 },
  { x: .15, y: .566, size: .125, rotation: -1 },
  { x: .225, y: .751, size: .13, rotation: 2 },
  { x: .376, y: .856, size: .14, rotation: -1 },
  { x: .561, y: .856, size: .14, rotation: 1 },
  { x: .84, y: .424, size: .13, rotation: -2 },
  { x: .73, y: .735, size: .14, rotation: 2 },
  { x: .83, y: .636, size: .13, rotation: -4 }
];
const heroOrbitMobileLayout = [
  { x: .16, y: .16, size: .23, rotation: -5 }, { x: .82, y: .16, size: .22, rotation: 4 },
  { x: .11, y: .39, size: .22, rotation: -2 }, { x: .89, y: .39, size: .21, rotation: 2 },
  { x: .13, y: .67, size: .22, rotation: 2 }, { x: .87, y: .67, size: .22, rotation: -3 },
  { x: .27, y: .86, size: .21, rotation: 1 }, { x: .73, y: .86, size: .21, rotation: -1 },
  { x: .5, y: .12, size: .18, rotation: 0 }, { x: .5, y: .89, size: .18, rotation: 0 },
  { x: .05, y: .55, size: .18, rotation: -4 }, { x: .95, y: .55, size: .18, rotation: 4 }
];
const heroTitleScrollReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroScrollFrame = 0;
let heroOrbitFrame = 0;
const updateHeroScrollMotion = (now = performance.now()) => {
  heroScrollFrame = 0;
  if (!heroSection) return;
  const stageBounds = heroStage?.getBoundingClientRect();
  const distance = Math.max(1, (heroStage?.offsetHeight || heroSection.offsetHeight) - window.innerHeight);
  const targetProgress = Math.max(0, Math.min(1, stageBounds ? -stageBounds.top / distance : window.scrollY / distance));
  // Scroll controls the scene directly; extra smoothing made it keep moving
  // after the user stopped and delayed the pinned section's release.
  const progress = targetProgress;
  const independentOrbitAngle = progress > .7 ? (now * .00012) : 0;
  heroSection.style.setProperty('--hero-scroll-progress', progress.toFixed(4));
  const handoffProgress = Math.max(0, Math.min(1, (progress - .76) / .24));
  heroSection.style.setProperty('--hero-handoff-progress', handoffProgress.toFixed(3));
  heroSection.style.setProperty('opacity', '1', 'important');
  heroSection.classList.toggle('is-scroll-revealed', progress > .79);
  const isPinned = Boolean(stageBounds && stageBounds.top <= 0 && progress < 1);
  heroSection.classList.toggle('is-scroll-pinned', isPinned);
  if (document.body.classList.contains('intro-active')) return;
  const rawExit = heroTitleScrollReduced ? 0 : Math.max(0, Math.min(1, (progress - .02) / .62));
  const exit = rawExit * rawExit * (3 - (2 * rawExit));
  const focalRaw = heroTitleScrollReduced ? 1 : Math.max(0, Math.min(1, (progress - .60) / .16));
  const focalProgress = focalRaw * focalRaw * (3 - (2 * focalRaw));
  const focalGate = heroTitleScrollReduced ? 1 : Math.max(0, Math.min(1, (exit - .92) / .08));
  heroSection.style.setProperty('--hero-title-exit', exit.toFixed(3));
  heroSection.style.setProperty('--hero-focal-progress', focalProgress.toFixed(3));
  heroSection.style.setProperty('--hero-focal-gate', focalGate.toFixed(3));
  if (!document.body.classList.contains('title-reveal-play')) {
    heroTitle?.style.setProperty('transform', 'none', 'important');
    heroTitleSpans.forEach((span, index) => {
      const direction = index === 0 ? -1 : 1;
      const offset = direction * exit * 118;
      span.style.setProperty('transform', `translate3d(${offset.toFixed(2)}%,0,0)`, 'important');
      span.style.setProperty('opacity', (1 - exit).toFixed(3), 'important');
    });
  }
  if (heroMediaSequence) {
    const orbitProgress = heroTitleScrollReduced ? 1 : Math.max(0, Math.min(1, (progress - .26) / .52));
    const messageProgress = heroTitleScrollReduced ? 1 : Math.max(0, Math.min(1, (progress - .76) / .10));
    const orbitEase = orbitProgress * orbitProgress * (3 - (2 * orbitProgress));
    const messageEase = messageProgress * messageProgress * (3 - (2 * messageProgress));
    heroMediaSequence.style.setProperty('--hero-media-progress', orbitEase.toFixed(3));
    heroMediaSequence.style.setProperty('--hero-third-progress', messageEase.toFixed(3));
    heroSupportingContent.forEach((element, index) => {
      element.style.setProperty('visibility', messageEase > .01 ? 'visible' : 'hidden', 'important');
      element.style.setProperty('opacity', (messageEase * (index ? 1 : .92)).toFixed(3), 'important');
      element.style.setProperty('transform', `translate3d(-50%,${((1 - messageEase) * 28).toFixed(2)}px,0)`, 'important');
    });
    heroReferenceMessage?.style.setProperty('opacity', messageEase.toFixed(3), 'important');
    if (heroMainMedia) {
      const mainOrbitProgress = Math.max(0, Math.min(1, (orbitProgress - .35) / .65));
      const mainOrbitEase = mainOrbitProgress * mainOrbitProgress * (3 - (2 * mainOrbitProgress));
      const mainHandoffEase = handoffProgress * handoffProgress * (3 - (2 * handoffProgress));
      const mainFinalProgress = Math.max(0, Math.min(1, (progress - .9) / .09));
      const mainFinalEase = mainFinalProgress * mainFinalProgress * (3 - (2 * mainFinalProgress));
      const mainAngle = (mainOrbitEase * Math.PI * .78) + (mainHandoffEase * Math.PI * .35) + (mainFinalEase * Math.PI * .55) + (orbitEase * .18) + independentOrbitAngle;
      const mainRadiusX = window.innerWidth <= 700 ? window.innerWidth * .43 : window.innerWidth * .36;
      const mainRadiusY = window.innerWidth <= 700 ? window.innerHeight * .3 : window.innerHeight * .34;
      const mainDrift = 1 + (handoffProgress * .14);
      const mainX = Math.cos(mainAngle) * mainRadiusX * focalProgress * mainDrift;
      const mainY = Math.sin(mainAngle) * mainRadiusY * focalProgress * mainDrift;
      const mainScale = 1 - (.82 * focalProgress);
      heroMainMedia.style.setProperty('opacity', (focalGate * (1 - (focalProgress * .35))).toFixed(3), 'important');
      heroMainMedia.style.setProperty('transform', `translate3d(calc(-50% + ${mainX.toFixed(2)}px),calc(-50% + ${mainY.toFixed(2)}px),0) scale(${mainScale.toFixed(3)})`, 'important');
    }
    heroMediaCards.forEach((card, index) => {
      const orbitReveal = Math.max(0, Math.min(1, (progress - .7) / .2));
      const orbitAngleProgress = Math.max(0, Math.min(1, (orbitProgress - .35) / .65));
      const orbitAngleEase = orbitAngleProgress * orbitAngleProgress * (3 - (2 * orbitAngleProgress));
      const handoffAngleEase = handoffProgress * handoffProgress * (3 - (2 * handoffProgress));
      const finalViewProgress = Math.max(0, Math.min(1, (progress - .9) / .09));
      const finalViewEase = finalViewProgress * finalViewProgress * (3 - (2 * finalViewProgress));
      const scrollOrbitAngle = orbitAngleEase * Math.PI * .78;
      const postOrbitAngle = handoffAngleEase * Math.PI * .35;
      const finalViewAngle = finalViewEase * Math.PI * .55;
      const angle = ((Math.PI * 2) / Math.max(1, heroMediaCards.length)) * index + scrollOrbitAngle + postOrbitAngle + finalViewAngle + (orbitEase * .18) + independentOrbitAngle;
      const radiusX = window.innerWidth <= 700 ? window.innerWidth * .43 : window.innerWidth * .36;
      const radiusY = window.innerWidth <= 700 ? window.innerHeight * .3 : window.innerHeight * .34;
      const drift = 1 + (handoffProgress * .14);
      const x = Math.cos(angle) * radiusX * drift;
      const y = Math.sin(angle) * radiusY * drift;
      const depth = (Math.sin(angle) + 1) / 2;
      const scale = (.7 + (depth * .3)) * (.82 + (orbitReveal * .18));
      // The focal image and the first orbit card share the same asset. Keep
      // that card suppressed until the focal image has nearly completed its
      // travel so the handoff reads as one object becoming a card.
      const cardReveal = index === 0
        ? orbitReveal * Math.max(0, Math.min(1, focalProgress * 1.35))
        : orbitReveal;
      const opacity = cardReveal * (.55 + (depth * .45));
      // Keep each card face straight while its center travels around the
      // shared oval, matching the reference composition.
      const rotation = 0;
      card.style.setProperty('left', '50%', 'important');
      card.style.setProperty('top', '53%', 'important');
      card.style.setProperty('width', `clamp(${window.innerWidth <= 700 ? 92 : 130}px,12.3vw,236px)`, 'important');
      card.style.setProperty('opacity', opacity.toFixed(3), 'important');
      card.style.setProperty('z-index', String(Math.round(depth * 100)), 'important');
      card.style.setProperty('transform', `translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`, 'important');
    });
  }
};
const animateHeroOrbit = now => {
  updateHeroScrollMotion(now);
  heroOrbitFrame = requestAnimationFrame(animateHeroOrbit);
};
const requestHeroScrollMotion = () => {
  if (!heroScrollFrame) heroScrollFrame = requestAnimationFrame(updateHeroScrollMotion);
};
window.addEventListener('scroll', () => {
  conceptHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
  requestHeroScrollMotion();
}, {passive: true});
updateHeroScrollMotion();
window.addEventListener('resize', requestHeroScrollMotion, {passive: true});
if (heroSection && !heroTitleScrollReduced) heroOrbitFrame = requestAnimationFrame(animateHeroOrbit);

// Centered organic light field inspired by the reference's metamorphosis
// animation. It stays behind the title and uses no external media asset.
const heroCenterAnimation = document.querySelector('.hero-center-animation');
if (heroCenterAnimation) {
  const context = heroCenterAnimation.getContext('2d', { alpha: true });
  const heroCanvasHost = heroCenterAnimation.closest('.hero');
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
  let width = 1;
  let height = 1;
  let frame = 0;
  let paused = document.hidden;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize = () => {
    const bounds = heroCenterAnimation.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    heroCenterAnimation.width = Math.round(width * ratio);
    heroCenterAnimation.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = now => {
    frame = 0;
    const time = reduced ? 0 : now * .001;
    pointer.x += (pointer.targetX - pointer.x) * .045;
    pointer.y += (pointer.targetY - pointer.y) * .045;
    const progress = Number(heroSection?.style.getPropertyValue('--hero-scroll-progress') || 0);
    const centerX = width * (.58 + (pointer.x - width * .5) / Math.max(1, width) * .035);
    const centerY = height * .49 - progress * 16;
    const influence = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - centerX, pointer.y - centerY) / Math.max(180, width * .28)) : 0;
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = 'screen';
    const atmosphere = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * .48);
    atmosphere.addColorStop(0, 'rgba(62,146,172,.18)');
    atmosphere.addColorStop(.3, 'rgba(74,152,174,.08)');
    atmosphere.addColorStop(.72, 'rgba(23,45,61,.025)');
    atmosphere.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = atmosphere;
    context.fillRect(0, 0, width, height);
    const drawOrganicLoop = (index, color, alpha) => {
      const radiusX = Math.min(width * .42, 680) * (1 - index * .055);
      const radiusY = Math.min(height * .42, 390) * (1 - index * .045);
      const rotation = -.18 + index * .035 + Math.sin(time * .18 + index) * .035;
      context.beginPath();
      for (let step = 0; step <= 120; step += 1) {
        const angle = step / 120 * Math.PI * 2;
        const wave = Math.sin(angle * 3 + time * (.32 + index * .025) + index) * (16 + influence * 18);
        const ripple = Math.cos(angle * 5 - time * .22 + index * .8) * 10;
        const rawX = Math.cos(angle) * (radiusX + wave) + ripple;
        const rawY = Math.sin(angle) * (radiusY + wave * .46);
        const x = centerX + rawX * Math.cos(rotation) - rawY * Math.sin(rotation);
        const y = centerY + rawX * Math.sin(rotation) + rawY * Math.cos(rotation);
        if (step === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.closePath();
      context.strokeStyle = `${color}${Math.round((alpha + influence * .11) * 255).toString(16).padStart(2, '0')}`;
      context.lineWidth = index === 0 ? 1.5 : .7;
      context.stroke();
    };
    drawOrganicLoop(0, '#4a98ae', .34);
    drawOrganicLoop(1, '#a9dce9', .2);
    drawOrganicLoop(2, '#3e92ac', .16);
    for (let lane = 0; lane < 5; lane += 1) {
      context.beginPath();
      for (let step = 0; step <= 90; step += 1) {
        const ratio = step / 90;
        const x = centerX - width * .38 + ratio * width * .76;
        const y = centerY + (lane - 2) * 26 + Math.sin(ratio * 9 + time * .42 + lane) * (22 + influence * 14);
        if (step === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = `rgba(169,220,233,${(.055 + lane * .008 + influence * .05).toFixed(3)})`;
      context.lineWidth = .8;
      context.stroke();
    }
    context.globalCompositeOperation = 'lighter';
    const spacing = width < 700 ? 14 : 11;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const distance = Math.hypot(x - centerX, y - centerY);
        const field = Math.max(0, 1 - distance / Math.max(width * .62, 1));
        const shimmer = .02 + field * .045 + Math.max(0, Math.sin(time * .6 + x * .02 + y * .014)) * .012;
        context.fillStyle = `rgba(169,220,233,${shimmer.toFixed(3)})`;
        context.fillRect(x, y, 1, 1);
      }
    }
    context.restore();
    if (!reduced && !paused) frame = window.requestAnimationFrame(draw);
  };
  const schedule = () => {
    if (!frame && !paused) frame = window.requestAnimationFrame(draw);
  };
  heroCanvasHost?.addEventListener('pointermove', event => {
    const bounds = heroCenterAnimation.getBoundingClientRect();
    pointer.targetX = event.clientX - bounds.left;
    pointer.targetY = event.clientY - bounds.top;
    pointer.active = true;
    schedule();
  }, { passive: true });
  heroCanvasHost?.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (paused && frame) { window.cancelAnimationFrame(frame); frame = 0; }
    if (!paused) schedule();
  });
  window.addEventListener('resize', () => { resize(); schedule(); }, { passive: true });
  resize();
  pointer.x = pointer.targetX = width * .58;
  pointer.y = pointer.targetY = height * .49;
  draw(0);
}


// Concept-page interaction layer: lightweight and dependency-free.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const processSection = document.querySelector('.process');
const processItems = [...document.querySelectorAll('.process-list article')];
const updateProcessProgress = () => {
  if (!processSection || !processItems.length) return;
  const horizontal = window.innerWidth >= 701;
  const marker = horizontal ? window.innerWidth * .52 : window.innerHeight * .55;
  let active = 0;
  let sectionProgress = 0;
  if (horizontal) {
    const sectionBounds = processSection.getBoundingClientRect();
    processSection.classList.toggle('is-timeline-pinned', sectionBounds.top <= 0 && sectionBounds.bottom > window.innerHeight);
    processSection.classList.toggle('is-timeline-complete', sectionBounds.bottom <= window.innerHeight);
    // Hold the first step until the section reaches the sticky viewport edge,
    // then advance the rail and active nodes across the section's scroll range.
    const stickyRange = Math.max(1, sectionBounds.height - window.innerHeight);
    sectionProgress = Math.max(0, Math.min(1, -sectionBounds.top / stickyRange));
    active = Math.min(processItems.length - 1, Math.floor(sectionProgress * processItems.length));
  } else {
    processSection.classList.remove('is-timeline-pinned', 'is-timeline-complete');
    processItems.forEach((item, index) => {
      if (item.getBoundingClientRect().top < marker) active = index;
    });
  }
  processItems.forEach((item, index) => item.classList.toggle('is-active', index === active));
  const timeline = processSection.querySelector('.process-list');
  if (timeline) {
    const timelineRect = timeline.getBoundingClientRect();
    const progress = horizontal
      ? sectionProgress
      : Math.max(0, Math.min(1, (marker - timelineRect.top) / Math.max(1, timelineRect.height)));
    processSection.style.setProperty('--process-progress', progress.toFixed(3));
  }
};
window.addEventListener('scroll', updateProcessProgress, { passive: true });
updateProcessProgress();

// Match the reference's "What we build" viewer: the reading list stays in
// place while the visual panel changes with the page scroll position.
const expertiseBuild = document.querySelector('.expertise-build');
const expertiseBuildScroll = expertiseBuild?.querySelector('.expertise-build__scroll');
const expertiseBuildItems = expertiseBuild ? [...expertiseBuild.querySelectorAll('.expertise-build__item')] : [];
const expertiseBuildCards = expertiseBuild ? [...expertiseBuild.querySelectorAll('.expertise-build__card')] : [];
const expertiseBuildAmbient = expertiseBuild?.querySelector('.expertise-build__ambient');
const expertiseBuildCanvas = expertiseBuild?.querySelector('.expertise-build__canvas');
if (expertiseBuildAmbient && expertiseBuildCanvas) {
  const context = expertiseBuildCanvas.getContext('2d', { alpha: false });
  const blobs = [
    { x:.08, y:.2, r:.48, color:[8,104,138], speed:.18, phase:.2 },
    { x:.86, y:.76, r:.5, color:[4,112,124], speed:.15, phase:2.4 },
    { x:.52, y:.08, r:.38, color:[22,62,94], speed:.12, phase:4.2 },
    { x:.52, y:.68, r:.42, color:[3,35,58], speed:.1, phase:1.7 }
  ];
  const pointer = { x:0, y:0, targetX:0, targetY:0 };
  let canvasWidth = 1;
  let canvasHeight = 1;
  let ambientScroll = 0;
  const resizeAmbient = () => {
    const bounds = expertiseBuildAmbient.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = Math.max(1, bounds.width);
    canvasHeight = Math.max(1, bounds.height);
    expertiseBuildCanvas.width = Math.round(canvasWidth * ratio);
    expertiseBuildCanvas.height = Math.round(canvasHeight * ratio);
    expertiseBuildCanvas.style.width = `${canvasWidth}px`;
    expertiseBuildCanvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const drawAmbient = now => {
    const time = now * .001;
    if (expertiseBuildScroll) {
      const scrollRect = expertiseBuildScroll.getBoundingClientRect();
      ambientScroll = Math.max(0, Math.min(1, -scrollRect.top / Math.max(1, scrollRect.height - window.innerHeight)));
    }
    pointer.x += (pointer.targetX - pointer.x) * .06;
    pointer.y += (pointer.targetY - pointer.y) * .06;
    context.fillStyle = '#010101';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    blobs.forEach(blob => {
      const driftX = Math.sin(time * blob.speed + blob.phase + ambientScroll * 2.8) * canvasWidth * .12;
      const driftY = Math.cos(time * blob.speed * .83 + blob.phase + ambientScroll * 2.2) * canvasHeight * .1;
      const x = blob.x * canvasWidth + driftX + pointer.x * canvasWidth * .07;
      const y = blob.y * canvasHeight + driftY + pointer.y * canvasHeight * .07;
      const radius = Math.max(canvasWidth, canvasHeight) * blob.r;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      const [red, green, blue] = blob.color;
      gradient.addColorStop(0, `rgba(${red},${green},${blue},.2)`);
      gradient.addColorStop(.46, `rgba(${red},${green},${blue},.07)`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    });
    if (!prefersReducedMotion) window.requestAnimationFrame(drawAmbient);
  };
  resizeAmbient();
  if ('ResizeObserver' in window) new ResizeObserver(resizeAmbient).observe(expertiseBuildAmbient);
  window.addEventListener('resize', resizeAmbient, { passive:true });
  window.addEventListener('pointermove', event => {
    pointer.targetX = (event.clientX / window.innerWidth - .5) * 2;
    pointer.targetY = (event.clientY / window.innerHeight - .5) * 2;
  }, { passive:true });
  if (prefersReducedMotion) drawAmbient(0);
  else window.requestAnimationFrame(drawAmbient);
}
let expertiseBuildFrame = 0;
let expertiseBuildTargetProgress = 0;
let expertiseBuildRenderedProgress = 0;
const expertiseBuildPreview = expertiseBuild?.querySelector('.expertise-build__preview');
const syncExpertiseBuildPreview = () => {
  if (!expertiseBuild || !expertiseBuildPreview) return;
  const resetPreviewPin = () => {
    expertiseBuildPreview.style.removeProperty('position');
    expertiseBuildPreview.style.removeProperty('top');
    expertiseBuildPreview.style.removeProperty('left');
    expertiseBuildPreview.style.removeProperty('right');
    expertiseBuildPreview.style.removeProperty('width');
    expertiseBuildPreview.style.removeProperty('height');
    expertiseBuildPreview.style.removeProperty('z-index');
  };
  if (window.innerWidth <= 700) {
    resetPreviewPin();
    return;
  }
  const viewer = expertiseBuild.querySelector('.expertise-build__viewer');
  if (!viewer) return;
  const viewerRect = viewer.getBoundingClientRect();
  const previewRect = expertiseBuildPreview.getBoundingClientRect();
  const pinTop = Math.max(88, Math.min(window.innerHeight * .12, 132));
  const isWithinReadingRail = viewerRect.top <= pinTop && viewerRect.bottom >= pinTop + previewRect.height;
  if (isWithinReadingRail) {
    expertiseBuildPreview.style.setProperty('position', 'fixed', 'important');
    expertiseBuildPreview.style.setProperty('top', `${pinTop}px`, 'important');
    expertiseBuildPreview.style.setProperty('left', `${viewerRect.right - previewRect.width}px`, 'important');
    expertiseBuildPreview.style.setProperty('width', `${previewRect.width}px`, 'important');
    expertiseBuildPreview.style.setProperty('height', `${previewRect.height}px`, 'important');
    expertiseBuildPreview.style.setProperty('z-index', '20', 'important');
  } else if (viewerRect.top > pinTop) {
    resetPreviewPin();
  } else {
    expertiseBuildPreview.style.removeProperty('left');
    expertiseBuildPreview.style.setProperty('position', 'absolute', 'important');
    expertiseBuildPreview.style.setProperty('top', `${Math.max(0, viewer.offsetHeight - previewRect.height)}px`, 'important');
    expertiseBuildPreview.style.setProperty('right', '0', 'important');
    expertiseBuildPreview.style.setProperty('width', `${previewRect.width}px`, 'important');
    expertiseBuildPreview.style.setProperty('height', `${previewRect.height}px`, 'important');
    expertiseBuildPreview.style.setProperty('z-index', '2', 'important');
  }
};
const setExpertiseBuildIndex = index => {
  expertiseBuildItems.forEach((item, itemIndex) => {
    const selected = itemIndex === index;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  expertiseBuildCards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === index));
};
const renderExpertiseBuildMotion = rawProgress => {
  if (!expertiseBuildScroll || !expertiseBuildItems.length || !expertiseBuildCards.length) return;
  const focusY = window.innerHeight * .5;
  const activeIndex = expertiseBuildItems.reduce((best, item, index) => {
    const rect = item.getBoundingClientRect();
    const distance = Math.abs((rect.top + rect.height * .5) - focusY);
    return distance < best.distance ? { index, distance } : best;
  }, { index:0, distance:Infinity }).index;
  expertiseBuild.style.setProperty('--expertise-progress', rawProgress.toFixed(3));
  expertiseBuild.style.setProperty('--expertise-drift', `${(rawProgress * 18 - 9).toFixed(2)}%`);
  setExpertiseBuildIndex(activeIndex);
};
const updateExpertiseBuildMotion = () => {
  if (!expertiseBuildScroll || !expertiseBuildItems.length || !expertiseBuildCards.length) return;
  syncExpertiseBuildPreview();
  const rect = expertiseBuildScroll.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  expertiseBuildTargetProgress = prefersReducedMotion
    ? 0
    : Math.max(0, Math.min(1, -rect.top / travel));
  if (prefersReducedMotion) {
    expertiseBuildRenderedProgress = expertiseBuildTargetProgress;
  } else {
    expertiseBuildRenderedProgress += (expertiseBuildTargetProgress - expertiseBuildRenderedProgress) * .16;
    if (Math.abs(expertiseBuildTargetProgress - expertiseBuildRenderedProgress) < .001) {
      expertiseBuildRenderedProgress = expertiseBuildTargetProgress;
    }
  }
  renderExpertiseBuildMotion(expertiseBuildRenderedProgress);
  if (Math.abs(expertiseBuildTargetProgress - expertiseBuildRenderedProgress) >= .001) {
    expertiseBuildFrame = window.requestAnimationFrame(() => {
      expertiseBuildFrame = 0;
      updateExpertiseBuildMotion();
    });
  }
};
const scheduleExpertiseBuildMotion = () => {
  if (expertiseBuildFrame) return;
  expertiseBuildFrame = window.requestAnimationFrame(() => {
    expertiseBuildFrame = 0;
    updateExpertiseBuildMotion();
  });
};
if (expertiseBuildItems.length) {
  window.addEventListener('scroll', scheduleExpertiseBuildMotion, { passive: true });
  window.addEventListener('resize', scheduleExpertiseBuildMotion, { passive: true });
  expertiseBuildItems.forEach((item, index) => item.addEventListener('click', () => {
    item.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center'
    });
  }));
  scheduleExpertiseBuildMotion();
}

// Restore the first lower card as the first logo position. The source layout
// leaves that slot empty, but the client-card treatment expects the logos to
// begin at the left edge.
const clientCards = [...document.querySelectorAll('.client-logo-grid .client-card')];
if (clientCards.length === 4 && clientCards[0].classList.contains('client-card-empty')) {
  const clientLogos = clientCards.slice(1).map(card => card.querySelector('.client-logo'));
  clientCards.forEach(card => { card.innerHTML = ''; });
  clientCards.forEach(card => card.classList.remove('client-card-empty'));
  clientCards.forEach(card => card.removeAttribute('aria-hidden'));
  clientCards[0].append(clientLogos[0]);
  clientCards[1].append(clientLogos[1]);
  clientCards[2].append(clientLogos[2]);
  const eventoriaLogo = document.createElement('div');
  eventoriaLogo.className = 'client-logo client-reference-eventoria-lower';
  eventoriaLogo.setAttribute('aria-label', 'Eventoria');
  eventoriaLogo.textContent = 'EVENTORIA';
  clientCards[3].append(eventoriaLogo);
}

// Give each client card a dedicated hover surface so the panel cannot be
// overridden by the card frame pseudo-elements.
document.querySelectorAll('.client-logo-grid .client-card:not(.client-card-empty)').forEach(card => {
  if (card.querySelector('.client-hover-panel')) return;
  const panel = document.createElement('span');
  panel.className = 'client-hover-panel';
  panel.setAttribute('aria-hidden', 'true');
  card.prepend(panel);
});

// Keep client-card hover reliable when layered grid pseudo-elements are present.
document.querySelectorAll('.client-logo-grid .client-card:not(.client-card-empty)').forEach(card => {
  card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
  card.addEventListener('pointerleave', () => card.classList.remove('is-hovered'));
  card.addEventListener('focus', () => card.classList.add('is-hovered'));
  card.addEventListener('blur', () => card.classList.remove('is-hovered'));
});

// Keep the fourth upper partner as a real card so its right guide and
// corner crosshair use the same frame as the other partner cards.
const upperPartnerRow = document.querySelector('.client-reference-top');
if (upperPartnerRow && !upperPartnerRow.querySelector('.client-reference-eventoria-fourth')) {
  const fourthPartnerCard = document.createElement('div');
  fourthPartnerCard.className = 'client-reference-card client-reference-eventoria-fourth';
  fourthPartnerCard.innerHTML = '<div class="client-reference-hostinger-logo" aria-label="Hostinger"><span class="hostinger-mark" aria-hidden="true"><i></i><i></i><i></i></span><span class="hostinger-name">HOSTINGER</span></div>';
  upperPartnerRow.appendChild(fourthPartnerCard);
}

// Apply the same hover state to the upper partner cards.
document.querySelectorAll('.client-reference-top > .client-reference-card, .client-reference-top > .client-reference-thanks').forEach(card => {
  if (!card.querySelector('.client-hover-panel')) {
    const panel = document.createElement('span');
    panel.className = 'client-hover-panel';
    panel.setAttribute('aria-hidden', 'true');
    card.prepend(panel);
  }
  card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
  card.addEventListener('pointerleave', () => card.classList.remove('is-hovered'));
  card.addEventListener('focus', () => card.classList.add('is-hovered'));
  card.addEventListener('blur', () => card.classList.remove('is-hovered'));
});

// Mirror the reference partner-card frame: each card owns its rules and
// crosshair markers rather than inheriting one stretched row decoration.
document.querySelectorAll('.client-logo-grid .client-card, .client-reference-top > .client-reference-card, .client-reference-top > .client-reference-thanks').forEach(card => {
  if (card.querySelector('.client-card-frame')) return;
  card.insertAdjacentHTML('afterbegin', `
    <span class="client-card-frame" aria-hidden="true">
      <i class="client-card-rule client-card-rule-top"></i>
      <i class="client-card-rule client-card-rule-bottom"></i>
      <i class="client-card-rule client-card-rule-left"></i>
      <i class="client-card-rule client-card-rule-right"></i>
      <i class="client-card-cross client-card-cross-tl"></i>
      <i class="client-card-cross client-card-cross-tr"></i>
      <i class="client-card-cross client-card-cross-bl"></i>
      <i class="client-card-cross client-card-cross-br"></i>
    </span>`);
});

const introMedia = document.querySelector('.intro-media');
if (introMedia) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    introMedia.classList.add('is-visible');
  } else {
    const introObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          introMedia.classList.add('is-visible');
          introObserver.disconnect();
        }
      });
    }, { threshold: .18 });
    introObserver.observe(introMedia);
  }
}

const socialSection = document.querySelector('.social');
const socialCards = socialSection ? [...socialSection.querySelectorAll('.social-grid .project-image')] : [];
const socialCardTargets = [[-1276,1383,-97],[-1256,1031,-79],[-1140,698,-63],[-938,409,-47],[-665,186,-31],[-341,46,-15],[0,0,0],[357,51,16],[679,195,32],[949,421,48],[1147,713,64]];
const updateSocialCardMotion = () => {
  if (!socialSection || !socialCards.length) return;
  const progress = Math.max(0, Math.min(1, (window.scrollY - socialSection.offsetTop) / Math.max(1, socialSection.offsetHeight - window.innerHeight)));
  const eased = 1 - Math.pow(1 - progress, 3);
  socialCards.forEach((card, index) => {
    const [xTarget, yTarget, rotationTarget] = socialCardTargets[index] || [0,0,0];
    const x = xTarget * eased;
    const y = 170 + (yTarget - 170) * eased;
    card.style.setProperty('transform', `translate3d(${x}px,${y}px,0) rotate(${rotationTarget * eased}deg)`, 'important');
    card.style.setProperty('--social-opacity', '1');
  });
};
if (socialCards.length) {
  window.addEventListener('scroll', updateSocialCardMotion, { passive:true });
  window.addEventListener('resize', updateSocialCardMotion, { passive:true });
  updateSocialCardMotion();
}

// Reference-style reading animation: words begin muted and become bright in
// sequence as the core-idea paragraph passes through the viewport.
const coreIdea = document.querySelector('#core-idea');
const coreIdeaCopy = coreIdea?.querySelector('.core-idea-copy');
if (coreIdea && coreIdeaCopy) {
  const source = coreIdeaCopy.textContent.trim();
  coreIdeaCopy.setAttribute('aria-label', source);
  let coreIdeaWordIndex = 0;
  coreIdeaCopy.innerHTML = source.split(/(\s+)/).map(part => {
    if (/^\s+$/.test(part)) return part;
    const index = coreIdeaWordIndex;
    coreIdeaWordIndex += 1;
    return `<span class="core-idea-word" style="--word-index:${index}">${part}</span>`;
  }).join('');

  let coreIdeaFrame = 0;
  const updateCoreIdea = () => {
    coreIdeaFrame = 0;
    const rect = coreIdea.getBoundingClientRect();
    // Complete the word reveal before the section's extra breathing room,
    // so the final words reliably reach full white while scrolling through it.
    const revealDistance = Math.max(1, rect.height * 0.9);
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / revealDistance));
    const words = [...coreIdeaCopy.querySelectorAll('.core-idea-word')];
    words.forEach((word, index) => {
      const wordProgress = Math.max(0, Math.min(1, (progress - index / Math.max(1, words.length - 1) * .78) / .28));
      word.style.setProperty('--word-progress', wordProgress.toFixed(3));
    });
  };
  const scheduleCoreIdea = () => {
    if (!coreIdeaFrame) coreIdeaFrame = window.requestAnimationFrame(updateCoreIdea);
  };
  window.addEventListener('scroll', scheduleCoreIdea, { passive: true });
  window.addEventListener('resize', scheduleCoreIdea, { passive: true });
  scheduleCoreIdea();
}

// Match the reference's pinned selected-work viewer: page scroll advances one
// full-screen project at a time while the next panel rises into the viewport.
const workScrollSlides = [...document.querySelectorAll('.work-reference-panel')];
const selectedWorkOverlayCopy = [
  { counter:'01 / Selected work', title:'One completed project, told in full', subtitle:'Client objective, insight, idea, making, production challenge, live moment and outcome.', location:'', stats:[] },
  { counter:'02 / Work in progress', title:'Coming soon / Approval pending', subtitle:'A considered project story will be added here once the work is ready to share.', location:'', stats:[] },
  { counter:'03 / Stage and environment', title:'Designed for the live moment', subtitle:'Spatial identity, scenic direction and production details brought together as one complete experience.', location:'', stats:[] }
];
workScrollSlides.forEach((slide, index) => {
  if (slide.querySelector('.work-scroll-slide__content')) return;
  const copy = selectedWorkOverlayCopy[index];
  if (!copy) return;
  slide.insertAdjacentHTML('beforeend', `<div class="work-scroll-slide__content"><p class="work-scroll-counter">${copy.counter}</p><div class="work-scroll-copy"><h3>${copy.title}</h3><span>${copy.subtitle}</span></div><div class="work-scroll-stats"><p>${copy.subtitle}</p><span class="work-scroll-location">${copy.location}</span>${copy.stats.map(([value,label]) => `<div><strong>${value}</strong><small>${label}</small></div>`).join('')}<a href="contact.html">Read the case study <span>→</span></a></div></div>`);
});
if (workScrollSlides.length) {
  // Match the reference site's native sticky stack: the panels stay in flow,
  // each owns one viewport, and the following panel naturally covers it.
  workScrollSlides.forEach((slide, index) => {
    slide.style.setProperty('--panel-y', index === 0 ? '0%' : '100%');
    slide.style.setProperty('opacity', '1', 'important');
    if (!slide.classList.contains('work-gsap-panel')) {
      slide.style.setProperty('transform', 'none', 'important');
    } else {
      slide.style.removeProperty('transform');
    }
    slide.style.setProperty('z-index', String(index + 1), 'important');
    slide.classList.toggle('is-active', index === 0);
  });
}

// Add accessible hover/focus states to project and social cards.
document.querySelectorAll('.project-card, .social-grid .project-image').forEach(card => {
  card.setAttribute('tabindex', '0');
});

// A restrained custom cursor for desktop pointer devices.
if (!prefersReducedMotion && matchMedia('(pointer:fine)').matches) {
  const cursor = document.createElement('span');
  cursor.className = 'concept-cursor';
  document.body.append(cursor);
  window.addEventListener('pointermove', event => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  }, { passive: true });
  document.querySelectorAll('a, button, .project-card, .social-grid .project-image').forEach(target => {
    target.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    target.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}
