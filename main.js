(() => {
  const EMAIL = 'steviecain@outlook.com';
  const desktop = window.matchMedia('(min-width: 801px)');

  document.querySelectorAll('[data-year-now]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Sticky offsets follow the real top bar height
  const bar = document.querySelector('.topbar');
  const setBarH = () => document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  setBarH();
  window.addEventListener('resize', setBarH);

  // ---------- Work carousel ----------
  // One tile is active at a time: it fills the row height and the rest sit
  // small beside it. Wheel, swipe, drag, arrow keys and clicks step through.
  const viewport = document.getElementById('stripViewport');
  const strip = document.getElementById('strip');

  if (viewport && strip) {
    const tiles = [...strip.querySelectorAll('.tile')];
    const counter = document.getElementById('counter');
    const meta = document.getElementById('workMeta');
    const pad = n => String(n).padStart(2, '0');
    let index = 0;
    let fadeTimer;

    const sizeRow = () => strip.style.setProperty('--row-h', viewport.clientHeight + 'px');
    sizeRow();
    window.addEventListener('resize', sizeRow);
    window.addEventListener('load', sizeRow);

    const go = i => {
      i = Math.max(0, Math.min(tiles.length - 1, i));
      if (i === index) return false;
      index = i;
      strip.style.setProperty('--i', i);
      tiles.forEach((t, n) => {
        t.classList.toggle('is-active', n === i);
        t.tabIndex = n === i ? 0 : -1;
      });
      counter.textContent = `${pad(i + 1)}/${pad(tiles.length)}`;
      meta.classList.add('fading');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => {
        const d = tiles[index].dataset;
        meta.querySelectorAll('[data-k]').forEach(el => { el.innerHTML = d[el.dataset.k]; });
        meta.classList.remove('fading');
      }, 220);
      return true;
    };
    tiles.forEach((t, n) => { t.tabIndex = n === 0 ? 0 : -1; });

    // Mouse wheel and trackpad, anywhere on the desktop landing page
    let acc = 0, lockUntil = 0, idleTimer;
    window.addEventListener('wheel', e => {
      if (!desktop.matches || document.body.classList.contains('drawer-open')) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { acc = 0; }, 180);
      if (performance.now() < lockUntil) return;
      acc += delta;
      if (Math.abs(acc) >= 60) {
        if (go(index + Math.sign(acc))) lockUntil = performance.now() + 650;
        acc = 0;
      }
    }, { passive: false });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (document.body.classList.contains('drawer-open')) return;
      if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || (desktop.matches && e.key === 'ArrowDown')) { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft' || (desktop.matches && e.key === 'ArrowUp')) { e.preventDefault(); go(index - 1); }
    });

    // Swipe or drag sideways
    let startX = null, startY = 0, swiped = false;
    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX; startY = e.clientY; swiped = false;
    });
    window.addEventListener('pointermove', e => {
      if (startX === null || swiped) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
        swiped = true;
        viewport.classList.add('dragging');
        go(index + (dx < 0 ? 1 : -1));
      }
    });
    const endSwipe = () => {
      startX = null;
      viewport.classList.remove('dragging');
      setTimeout(() => { swiped = false; }, 0);
    };
    window.addEventListener('pointerup', endSwipe);
    window.addEventListener('pointercancel', endSwipe);

    // A click on a small tile brings it forward; a click on the active tile opens it
    strip.addEventListener('click', e => {
      const tile = e.target.closest('.tile');
      if (!tile) return;
      if (swiped) { e.preventDefault(); return; }
      const n = tiles.indexOf(tile);
      if (n !== index) { e.preventDefault(); go(n); }
    }, true);
    strip.addEventListener('dragstart', e => e.preventDefault());
  }

  // ---------- About: stacked chapters ----------
  // The stage pins under the top bar. Closed chapters wait as title bars along
  // the bottom; each screen of scroll slides the next one up over the last,
  // which is left as a thin sliver at the top.
  const chapters = document.querySelector('.chapters');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (chapters) {
    const stage = chapters.querySelector('.chapters-stage');
    const panels = [...chapters.querySelectorAll('.chapter-panel')];
    const n = panels.length;
    const SLIVER = 10;
    let on = false, step = 0, stageH = 0, headH = 0, ticking = false;

    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const sectionTop = () => chapters.getBoundingClientRect().top + window.scrollY;

    const render = () => {
      ticking = false;
      if (!on) return;
      const p = clamp((window.scrollY - sectionTop() + bar.offsetHeight) / step, 0, n - 1);
      panels.forEach((panel, i) => {
        const open = i * SLIVER;
        const rest = stageH - (n - i) * headH;
        const t = i === 0 ? 1 : ease(clamp(p - (i - 1), 0, 1));
        panel.style.transform = `translateY(${rest + (open - rest) * t}px)`;
        panel.style.setProperty('--dim', clamp(p - i, 0, 1).toFixed(3));
      });
    };

    const layout = () => {
      on = desktop.matches && !reduceMotion.matches;
      chapters.classList.toggle('is-stacked', on);
      chapters.style.height = '';
      panels.forEach((panel, i) => {
        panel.style.transform = '';
        panel.style.height = '';
        panel.style.zIndex = '';
      });
      if (!on) return;
      stageH = stage.clientHeight;
      headH = panels[0].querySelector('.chapter-head').offsetHeight;
      step = window.innerHeight;
      chapters.style.height = stageH + (n - 1) * step + 'px';
      panels.forEach((panel, i) => {
        panel.style.height = stageH - i * SLIVER + 'px';
        panel.style.zIndex = i + 1;
      });
      render();
    };

    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } }, { passive: true });
    window.addEventListener('resize', layout);
    desktop.addEventListener('change', layout);
    reduceMotion.addEventListener('change', layout);
    layout();
    if (document.fonts) document.fonts.ready.then(layout);

    // Links to a chapter scroll to the point where that chapter is fully open
    const goToChapter = (id, smooth) => {
      const i = panels.findIndex(panel => panel.id === id);
      if (i < 0 || !on) return false;
      window.scrollTo({ top: sectionTop() - bar.offsetHeight + i * step, behavior: smooth ? 'smooth' : 'instant' });
      return true;
    };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      if (goToChapter(a.getAttribute('href').slice(1), true)) {
        e.preventDefault();
        history.replaceState(null, '', a.getAttribute('href'));
      }
    });
    // The browser's own jump to the hash can land after load, so settle on
    // the chapter position once it has run
    if (location.hash && panels.some(panel => '#' + panel.id === location.hash)) {
      const id = location.hash.slice(1);
      const jump = () => goToChapter(id, false);
      window.addEventListener('load', () => { jump(); requestAnimationFrame(jump); setTimeout(jump, 120); });
    }
  }

  // ---------- About: quotes ----------
  const quotes = document.querySelector('.quotes');
  if (quotes) {
    const slides = [...quotes.querySelector('template[data-quotes]').content.querySelectorAll('figure')];
    const out = {
      text: quotes.querySelector('[data-quote-text]'),
      name: quotes.querySelector('[data-quote-name]'),
      role: quotes.querySelector('[data-quote-role]'),
      count: quotes.querySelector('[data-quote-count]'),
    };
    const pad = n => String(n).padStart(2, '0');
    let q = 0, qTimer;
    const show = i => {
      q = (i + slides.length) % slides.length;
      quotes.classList.add('fading');
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        const f = slides[q];
        out.text.textContent = f.textContent.trim();
        out.name.textContent = f.dataset.name;
        out.role.textContent = f.dataset.role;
        out.count.textContent = `${pad(q + 1)}/${pad(slides.length)}`;
        quotes.classList.remove('fading');
      }, 250);
    };
    out.count.textContent = `01/${pad(slides.length)}`;
    quotes.querySelector('[data-quote-prev]').addEventListener('click', () => show(q - 1));
    quotes.querySelector('[data-quote-next]').addEventListener('click', () => show(q + 1));
    quotes.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(q - 1);
      if (e.key === 'ArrowRight') show(q + 1);
    });
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
  const title = document.getElementById('drawerTitle');
  const businessSet = form.querySelector('[data-business]');
  const msgLabel = form.querySelector('[data-msg-label]');
  let mode = 'business';
  let opener = null;

  const setMode = m => {
    mode = m;
    drawer.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.mode === m)));
    businessSet.hidden = m !== 'business';
    title.textContent = m === 'business' ? 'Send a request' : 'Get in touch';
    msgLabel.textContent = m === 'business' ? 'Tell me about the opportunity' : 'Your message';
  };

  const focusables = () => [...drawer.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.closest('[hidden]'));

  const openDrawer = (trigger, m) => {
    opener = trigger || document.activeElement;
    if (m) setMode(m);
    note.textContent = '';
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
    openDrawer(a, a.dataset.contact || null);
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
    lines.push(data.get('message').trim(), '', name, data.get('email').trim());
    const subject = mode === 'business' ? `Business enquiry from ${name}` : `Message from ${name}`;
    note.textContent = 'Opening your email app...';
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });

  setMode('business');
  if (location.hash === '#contact') openDrawer();
})();
