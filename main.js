(() => {
  const EMAIL = 'steviecain@outlook.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 801px)');

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Keep the sticky offset in step with the real top bar height
  const bar = document.querySelector('.topbar');
  const setBarH = () => document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  setBarH();
  window.addEventListener('resize', setBarH);

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- Work carousel ----------
  const pin = document.getElementById('workPin');
  const strip = document.getElementById('strip');

  if (pin && strip) {
    const tiles = [...strip.querySelectorAll('.tile')];
    const counter = document.getElementById('counter');
    const meta = document.getElementById('workMeta');
    const pad = n => String(n).padStart(2, '0');
    let current = 0;
    let pinned = false;

    const setActive = i => {
      if (i === current) return;
      current = i;
      counter.textContent = `${pad(i + 1)}/${pad(tiles.length)}`;
      meta.classList.add('fading');
      setTimeout(() => {
        const d = tiles[current].dataset;
        meta.querySelectorAll('[data-k]').forEach(el => { el.innerHTML = d[el.dataset.k]; });
        meta.classList.remove('fading');
      }, 200);
    };

    const syncActive = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      if (max > 0 && strip.scrollLeft >= max - 4) return setActive(tiles.length - 1);
      const left = strip.getBoundingClientRect().left;
      let best = 0, bestDist = Infinity;
      tiles.forEach((t, i) => {
        const dist = Math.abs(t.getBoundingClientRect().left - left);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      setActive(best);
    };

    // Pinned mode: the section is as tall as the sideways distance, so
    // 1px of page scroll moves the strip 1px to the left.
    const maxShift = () => strip.scrollWidth - strip.clientWidth;

    const layout = () => {
      pinned = wide.matches && !reduceMotion.matches;
      pin.classList.toggle('is-pinned', pinned);
      pin.style.height = '';
      if (pinned) {
        const stage = pin.firstElementChild.offsetHeight;
        pin.style.height = stage + maxShift() + 'px';
      }
      onScroll();
    };

    const onScroll = () => {
      if (!pinned) return;
      const start = pin.offsetTop - bar.offsetHeight;
      const y = Math.min(Math.max(window.scrollY - start, 0), maxShift());
      strip.scrollLeft = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    reduceMotion.addEventListener('change', layout);
    wide.addEventListener('change', layout);
    window.addEventListener('load', layout);
    layout();

    strip.addEventListener('scroll', syncActive, { passive: true });
    tiles.forEach((t, i) => t.addEventListener('mouseenter', () => { if (!dragging) setActive(i); }));

    // Drag with the mouse. In pinned mode dragging moves the page so the
    // scroll position and the strip stay in sync.
    let down = false, dragging = false, startX = 0, startStrip = 0, startPage = 0;
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; dragging = false;
      startX = e.clientX; startStrip = strip.scrollLeft; startPage = window.scrollY;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 4) { dragging = true; strip.classList.add('dragging'); }
      if (!dragging) return;
      if (pinned) {
        const shift = Math.min(Math.max(startStrip - dx, 0), maxShift());
        window.scrollTo({ top: startPage + (shift - startStrip), behavior: 'instant' });
      } else {
        strip.scrollLeft = startStrip - dx;
      }
    });
    window.addEventListener('pointerup', () => {
      down = false;
      strip.classList.remove('dragging');
      // Let the click that follows a drag see `dragging`, then reset
      setTimeout(() => { dragging = false; }, 0);
    });
    // A drag should never open a project
    strip.addEventListener('click', e => { if (dragging) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('dragstart', e => e.preventDefault());
  }

  // ---------- Contact drawer ----------
  const drawerHTML = `
    <div class="drawer-backdrop" data-close></div>
    <aside class="drawer" id="contactDrawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true">
      <div class="drawer-head">
        <div class="tabs" role="group" aria-label="Enquiry type">
          <button type="button" class="tab" data-mode="business" aria-pressed="true">Business</button>
          <button type="button" class="tab" data-mode="message" aria-pressed="false">Message</button>
        </div>
        <button type="button" class="drawer-close" data-close>Close</button>
      </div>
      <h2 class="drawer-title" id="drawerTitle">Send a request</h2>
      <form class="form" id="contactForm" novalidate>
        <fieldset data-business>
          <legend>What can I help with?<span class="hint">You can select multiple</span></legend>
          <div class="checks">
            <label><input type="checkbox" name="topic" value="Leadership role"><span>Leadership role</span></label>
            <label><input type="checkbox" name="topic" value="Consulting"><span>Consulting</span></label>
            <label><input type="checkbox" name="topic" value="Atomic Web software"><span>Atomic Web software</span></label>
            <label><input type="checkbox" name="topic" value="Speaking"><span>Speaking</span></label>
          </div>
        </fieldset>
        <div>
          <label class="q" for="cf-name">What's your name?</label>
          <input type="text" id="cf-name" name="name" autocomplete="name" required>
        </div>
        <div>
          <label class="q" for="cf-email">What's your email?</label>
          <input type="email" id="cf-email" name="email" autocomplete="email" required>
        </div>
        <div>
          <label class="q" for="cf-msg" data-msg-label>Tell me about the opportunity</label>
          <textarea id="cf-msg" name="message" rows="3" required></textarea>
        </div>
        <button type="submit" class="send">Send <span class="arr" aria-hidden="true">→</span></button>
        <p class="form-note" id="formNote" role="status" aria-live="polite"></p>
      </form>
    </aside>`;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);

  const drawer = document.getElementById('contactDrawer');
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const businessSet = form.querySelector('[data-business]');
  const msgLabel = form.querySelector('[data-msg-label]');
  let mode = 'business';
  let opener = null;

  const setMode = m => {
    mode = m;
    drawer.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.mode === m)));
    businessSet.hidden = m !== 'business';
    msgLabel.textContent = m === 'business' ? 'Tell me about the opportunity' : 'Your message';
  };

  const focusables = () => [...drawer.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.closest('[hidden]'));

  const openDrawer = trigger => {
    opener = trigger || document.activeElement;
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(() => form.querySelector('#cf-name').focus({ preventScroll: true }), 300);
  };
  const closeDrawer = () => {
    document.body.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (location.hash === '#contact') history.replaceState(null, '', location.pathname + location.search);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  };

  document.querySelectorAll('[data-contact]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    openDrawer(a);
  }));
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeDrawer));
  drawer.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));

  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('drawer-open')) return;
    if (e.key === 'Escape') return closeDrawer();
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = data.get('name').trim();
    const topics = data.getAll('topic');
    const lines = [];
    if (mode === 'business' && topics.length) lines.push(`Interested in: ${topics.join(', ')}`, '');
    lines.push(data.get('message').trim(), '', `${name}`, data.get('email').trim());
    const subject = mode === 'business' ? `Business enquiry from ${name}` : `Message from ${name}`;
    note.textContent = 'Opening your email app...';
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });

  setMode('business');
  if (location.hash === '#contact') openDrawer();
})();
