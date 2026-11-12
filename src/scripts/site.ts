/* All interactivity on the site. Kept small and dependency-free. */

// Mobile navigation --------------------------------------------------------
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const nav = document.getElementById('site-nav');
menuBtn?.addEventListener('click', () => {
  const open = nav?.classList.toggle('is-open') ?? false;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
});
const menus = [...document.querySelectorAll<HTMLDetailsElement>('[data-nav-menu]')];
menus.forEach((d) => d.addEventListener('toggle', () => { if (d.open) menus.forEach((o) => { if (o !== d) o.open = false; }); }));
document.addEventListener('click', (e) => { menus.forEach((d) => { if (d.open && !d.contains(e.target as Node)) d.open = false; }); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  menus.forEach((d) => { if (d.open) { d.open = false; d.querySelector('summary')?.focus(); } });
  if (nav?.classList.contains('is-open')) { nav.classList.remove('is-open'); menuBtn?.setAttribute('aria-expanded', 'false'); if (menuBtn) { menuBtn.textContent = 'Menu'; menuBtn.focus(); } }
});

// Before/after sliders -----------------------------------------------------
document.querySelectorAll<HTMLElement>('[data-compare]').forEach((wrap) => {
  const input = wrap.querySelector<HTMLInputElement>('input[type=range]')!;
  const box = wrap.querySelector<HTMLElement>('.compare')!;
  const set = () => {
    box.style.setProperty('--pos', `${input.value}%`);
    input.setAttribute('aria-valuetext', `${input.value} percent`);
  };
  input.addEventListener('input', () => { box.style.animation = 'none'; set(); });
  // Pointer drag anywhere on the photo (mouse, touch and pen) maps straight to the divider, so a tap or drag behaves
  // the same in every engine (WebKit's native range only moves from its thumb). Vertical swipes still scroll the page
  // (touch-action: pan-y). Keyboard and screen readers keep using the native range input.
  // Touch waits for intent: a tap or a horizontal drag moves the divider, while a vertical swipe that starts on the
  // photo only scrolls (the browser then sends pointercancel).
  let pressed = false, dragging = false, sx = 0, sy = 0;
  const moveTo = (x: number) => {
    const r = box.getBoundingClientRect();
    if (!r.width) return;
    const v = String(Math.round(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))));
    if (v !== input.value) { input.value = v; input.dispatchEvent(new Event('input', { bubbles: true })); }
  };
  const start = (e: PointerEvent) => {
    dragging = true;
    box.classList.add('is-dragging');
    try { box.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    input.focus({ preventScroll: true });
    moveTo(e.clientX);
  };
  box.addEventListener('pointerdown', (e) => {
    if (wrap.classList.contains('is-side') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pressed = true; sx = e.clientX; sy = e.clientY;
    if (e.pointerType !== 'touch') { e.preventDefault(); start(e); }
  });
  box.addEventListener('pointermove', (e) => {
    if (dragging) { moveTo(e.clientX); return; }
    if (pressed && e.pointerType === 'touch' && Math.abs(e.clientX - sx) > 6 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) start(e);
  });
  const end = () => { pressed = false; dragging = false; box.classList.remove('is-dragging'); };
  box.addEventListener('pointerup', (e) => {
    if (pressed && !dragging && e.pointerType === 'touch' && Math.hypot(e.clientX - sx, e.clientY - sy) < 10) { input.focus({ preventScroll: true }); moveTo(e.clientX); }
    end();
  });
  box.addEventListener('pointercancel', end);
  box.addEventListener('lostpointercapture', () => { dragging = false; box.classList.remove('is-dragging'); });
  const toggle = wrap.querySelector<HTMLButtonElement>('[data-compare-toggle]');
  toggle?.addEventListener('click', () => {
    const side = wrap.classList.toggle('is-side');
    toggle.setAttribute('aria-pressed', String(side));
    toggle.textContent = side ? 'Use slider' : 'Side by side';
  });
});

// Lightbox -----------------------------------------------------------------
const lb = document.querySelector<HTMLDialogElement>('dialog.lb');
if (lb) {
  const img = lb.querySelector('img')!;
  const title = lb.querySelector('[data-lb-title]')!;
  const info = lb.querySelector('[data-lb-info]')!;
  let opener: HTMLElement | null = null;
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-zoom]');
    if (!t) return;
    opener = t;
    img.src = t.dataset.zoom!;
    img.alt = t.dataset.alt || '';
    title.textContent = t.dataset.title || '';
    info.textContent = t.dataset.info || '';
    const askRow = lb.querySelector<HTMLElement>('[data-lb-ask-row]');
    const ask = lb.querySelector<HTMLAnchorElement>('[data-lb-ask]');
    if (askRow && ask) {
      askRow.hidden = !t.dataset.ask;
      if (t.dataset.ask) { ask.href = t.dataset.ask; ask.setAttribute('aria-label', `Ask about this style: ${t.dataset.title || ''}`.trim()); }
    }
    lb.showModal();
  });
  lb.querySelector('[data-lb-close]')?.addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => opener?.focus());
}

// Portfolio Section 2: room chips and More Design Ideas -------------------------
// One room-group chip state drives the before-and-after cards ([data-pair]) and the design ideas ([data-item]).
// The design ideas also keep their own style chips. Narrow screens show a first batch of each, then "Show all".
// Without JavaScript every card and design is visible, and the design ideas open as a normal <details>.
const roomsRoot = document.querySelector<HTMLElement>('[data-rooms]');
if (roomsRoot) {
  const narrow = window.matchMedia('(max-width: 720px)');
  const groupChips = [...roomsRoot.querySelectorAll<HTMLButtonElement>('[data-group-chip]')];
  const cards = [...roomsRoot.querySelectorAll<HTMLElement>('[data-pair]')];
  const pairCount = roomsRoot.querySelector<HTMLElement>('[data-pair-count]');
  const pairsGrid = roomsRoot.querySelector<HTMLElement>('[data-pairs]');
  const outdoorBlock = roomsRoot.querySelector<HTMLElement>('[data-outdoor]');
  const pairsMoreRow = roomsRoot.querySelector<HTMLElement>('[data-pairs-more-row]');
  const pairsMore = roomsRoot.querySelector<HTMLButtonElement>('[data-pairs-more]');
  const roomsReset = roomsRoot.querySelector<HTMLButtonElement>('[data-rooms-reset]');
  const firstPairs = Number(pairsMore?.dataset.first || 0);
  const ideas = roomsRoot.querySelector<HTMLDetailsElement>('[data-library]');
  const items = ideas ? [...ideas.querySelectorAll<HTMLElement>('[data-item]')] : [];
  const count = ideas?.querySelector<HTMLElement>('[data-count]');
  const empty = ideas?.querySelector<HTMLElement>('[data-empty]');
  const clear = ideas?.querySelector<HTMLButtonElement>('[data-clear]');
  const summary = ideas?.querySelector<HTMLElement>('[data-ideas-summary]');
  const moreRow = ideas?.querySelector<HTMLElement>('[data-more-row]');
  const more = ideas?.querySelector<HTMLButtonElement>('[data-more]');
  const first = Number(more?.dataset.first || 0);
  const state = { group: 'all', style: 'all' };
  let pairsExpanded = false, ideasExpanded = false;
  const labelOf = (g: string) => groupChips.find((b) => b.dataset.value === g)?.dataset.label || '';
  const apply = () => {
    // Before-and-after cards
    let n = 0, shown = 0;
    const limit = firstPairs > 0 && narrow.matches && !pairsExpanded ? firstPairs : Infinity;
    cards.forEach((el) => {
      const match = state.group === 'all' || el.dataset.group === state.group;
      if (match) n++;
      const show = match && n <= limit;
      el.hidden = !show;
      if (show) shown++;
    });
    if (pairsGrid) pairsGrid.hidden = !cards.some((el) => !el.hidden && pairsGrid.contains(el));
    if (outdoorBlock) outdoorBlock.hidden = !cards.some((el) => !el.hidden && outdoorBlock.contains(el));
    if (pairCount) pairCount.textContent = shown < n ? `Showing ${shown} of ${n} comparisons` : `${n} ${n === 1 ? 'comparison' : 'comparisons'} shown`;
    if (pairsMoreRow && pairsMore) { pairsMoreRow.hidden = shown >= n; pairsMore.textContent = `Show all ${n} comparisons`; }
    groupChips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === state.group)));
    if (roomsReset) roomsReset.hidden = state.group === 'all';
    // Design ideas
    if (!ideas) return;
    let m = 0, mShown = 0;
    const mLimit = more && first > 0 && narrow.matches && !ideasExpanded ? first : Infinity;
    items.forEach((el) => {
      const match = (state.style === 'all' || el.dataset.style === state.style) && (state.group === 'all' || el.dataset.group === state.group);
      if (match) m++;
      const show = match && m <= mLimit;
      el.hidden = !show;
      if (show) mShown++;
    });
    if (count) count.textContent = mShown < m ? `Showing ${mShown} of ${m} designs` : `${m} ${m === 1 ? 'design' : 'designs'} shown`;
    if (moreRow && more) { moreRow.hidden = mShown >= m; more.textContent = `Show all ${m} designs`; }
    if (empty) empty.hidden = m > 0;
    if (clear) clear.hidden = state.style === 'all' && state.group === 'all';
    if (summary) summary.textContent = state.group === 'all' ? `Show all ${m} design ideas` : `Show ${m} ${labelOf(state.group).toLowerCase()} design ideas`;
    ideas.querySelectorAll<HTMLButtonElement>('[data-filter=style]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === state.style)));
  };
  roomsRoot.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const chip = t.closest<HTMLButtonElement>('[data-group-chip]');
    if (chip) { state.group = chip.dataset.value!; pairsExpanded = false; ideasExpanded = false; apply(); return; }
    if (t.closest('[data-rooms-reset]')) {
      state.group = 'all'; pairsExpanded = false; ideasExpanded = false; apply();
      groupChips.find((b) => b.dataset.value === 'all')?.focus();
      return;
    }
    const f = t.closest<HTMLButtonElement>('[data-filter=style]');
    if (f) { state.style = f.dataset.value!; ideasExpanded = false; apply(); return; }
    if (t.closest('[data-clear], [data-clear-2]')) { state.style = 'all'; state.group = 'all'; ideasExpanded = false; apply(); return; }
    if (t.closest('[data-pairs-more]')) {
      const before = cards.filter((el) => !el.hidden).length;
      pairsExpanded = true; apply();
      cards.filter((el) => !el.hidden)[before]?.querySelector<HTMLElement>('input[type=range]')?.focus();
      return;
    }
    if (t.closest('[data-more]')) {
      const before = items.filter((el) => !el.hidden).length;
      ideasExpanded = true; apply();
      // Keyboard and screen reader users continue from the first design that was just revealed.
      items.filter((el) => !el.hidden)[before]?.querySelector<HTMLElement>('.gal__btn')?.focus();
      return;
    }
    const link = t.closest<HTMLAnchorElement>('[data-ideas-link]');
    if (link && ideas) {
      e.preventDefault();
      state.group = link.dataset.ideasLink!; state.style = 'all'; ideasExpanded = false; apply();
      ideas.open = true;
      ideas.scrollIntoView({ block: 'start' });
      ideas.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
    }
  });
  narrow.addEventListener('change', apply);
  // Presets: ?room=<room id> selects the chip whose group holds that room; ?style=<style id> sets the design-idea
  // style. Unknown values are ignored. Either one, arriving at #room-designs or #design-ideas, opens the design ideas.
  const q = new URLSearchParams(location.search);
  const qr = q.get('room'); const qs = q.get('style');
  const roomChip = qr ? groupChips.find((b) => (b.dataset.rooms || '').split(' ').includes(qr)) : undefined;
  if (roomChip) state.group = roomChip.dataset.value!;
  const styleOk = Boolean(qs && ideas?.querySelector(`[data-filter=style][data-value="${CSS.escape(qs)}"]`));
  if (styleOk) state.style = qs!;
  apply();
  if (ideas && (roomChip || styleOk) && /^#(room-designs|design-ideas)$/.test(location.hash)) {
    ideas.open = true;
    if (location.hash === '#design-ideas') ideas.scrollIntoView({ block: 'start' });
  }
}

// Portfolio Section 3: one room in eight styles --------------------------------
// Buttons swap the after image of a single slider and show that style's panel. Never rotates on its own.
// #style-<id> or ?style=<id> selects a style on arrival; otherwise the default (Transitional).
const styleSwitch = document.querySelector<HTMLElement>('[data-style-switch]');
if (styleSwitch) {
  const btns = [...styleSwitch.querySelectorAll<HTMLButtonElement>('[data-style-btn]')];
  const afterImg = styleSwitch.querySelector<HTMLImageElement>('[data-compare-after]');
  const range = styleSwitch.querySelector<HTMLInputElement>('input[type=range]');
  const status = styleSwitch.querySelector<HTMLElement>('[data-style-status]');
  const panels = [...styleSwitch.querySelectorAll<HTMLElement>('[data-style-panel]')];
  const preload = (b: HTMLButtonElement) => {
    if (b.dataset.loaded) return;
    b.dataset.loaded = '1';
    const i = new Image();
    if (afterImg?.sizes) i.sizes = afterImg.sizes;
    if (b.dataset.srcset) i.srcset = b.dataset.srcset;
    i.src = b.dataset.src!;
  };
  const select = (id: string | null | undefined) => {
    const b = btns.find((x) => x.dataset.style === id);
    if (!b) return false;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (afterImg) {
      if (b.dataset.srcset) afterImg.srcset = b.dataset.srcset;
      afterImg.src = b.dataset.src!;
      afterImg.alt = b.dataset.alt || '';
    }
    panels.forEach((p) => { p.hidden = p.dataset.stylePanel !== id; });
    if (status) status.textContent = `Showing ${b.dataset.name}`;
    range?.setAttribute('aria-label', `Compare the empty room with the ${b.dataset.name} version`);
    return true;
  };
  btns.forEach((b) => {
    b.addEventListener('click', () => select(b.dataset.style));
    b.addEventListener('pointerenter', () => preload(b));
    b.addEventListener('focus', () => preload(b));
  });
  const fromHash = () => { const m = /^#style-([a-z-]+)$/.exec(location.hash); return m ? m[1] : null; };
  const show = (id: string | null) => {
    if (!select(id)) return false;
    styleSwitch.scrollIntoView({ block: 'start' });
    return true;
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-pick-style]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    if (show(a.dataset.pickStyle!)) btns.find((x) => x.dataset.style === a.dataset.pickStyle)?.focus({ preventScroll: true });
  }));
  window.addEventListener('hashchange', () => { show(fromHash()); });
  const qs = new URLSearchParams(location.search).get('style');
  if (!show(fromHash()) && !select(qs)) select(styleSwitch.dataset.default);
}

// Quote and contact forms --------------------------------------------------
document.querySelectorAll<HTMLFormElement>('form[data-inquiry]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  // Arriving from an "Ask About This Style" link: ?ask=staging&style=<id>&room=<id>. Only known ids are used, mapped
  // to their names from the form's own lists, and the result goes into a visible field the visitor can edit or clear.
  const interestBox = form.querySelector<HTMLElement>('[data-interest]');
  const interest = form.querySelector<HTMLInputElement>('[name=interest]');
  const q = new URLSearchParams(location.search);
  if (interestBox && interest && q.get('ask') === 'staging') {
    const names = (k: string): Record<string, string> => { try { return JSON.parse(form.dataset[k] || '{}'); } catch { return {}; } };
    const st = names('styles')[q.get('style') || ''];
    const rm = names('rooms')[q.get('room') || ''];
    interest.value = !st ? 'Virtual staging' : rm ? `Virtual staging, ${st} style, as in the ${st} ${rm} design` : `Virtual staging, ${st} style`;
    interest.defaultValue = interest.value;
    interestBox.hidden = false;
  }
  const contact = form.dataset.email!;
  const fieldErr = (name: string, msg: string) => {
    const el = form.querySelector<HTMLElement>(`[data-err="${name}"]`);
    const input = form.elements.namedItem(name) as HTMLInputElement | RadioNodeList | null;
    if (el) { el.textContent = msg; el.hidden = !msg; }
    if (input instanceof HTMLElement) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
  };
  const validate = (fd: FormData) => {
    const problems: string[] = [];
    const need = (name: string, msg: string, ok: (v: string) => boolean) => {
      const v = String(fd.get(name) ?? '').trim();
      const bad = !ok(v);
      fieldErr(name, bad ? msg : '');
      if (bad) problems.push(name);
    };
    need('name', 'Enter your name.', (v) => v.length >= 2);
    need('email', 'Enter a valid email address, like name@example.com.', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
    need('message', 'Tell us a little about the project (at least 10 characters).', (v) => v.length >= 10);
    if (form.querySelector('[data-err="services"]')) {
      const none = fd.getAll('services').length === 0;
      fieldErr('services', none ? 'Choose at least one service, or "Not sure yet".' : '');
      if (none) problems.push('services');
    }
    const noConsent = !fd.get('consent');
    fieldErr('consent', noConsent ? (form.querySelector<HTMLElement>('[data-err="consent"]')?.dataset.msg || 'Please confirm you have read the privacy policy.') : '');
    if (noConsent) problems.push('consent');
    return problems;
  };
  const composeBody = (fd: FormData) => {
    const lines: string[] = [];
    const add = (l: string, k: string) => { const v = fd.getAll(k).map(String).filter(Boolean).join(', '); if (v) lines.push(`${l}: ${v}`); };
    add('Name', 'name'); add('Email', 'email'); add('Phone', 'phone'); add('Company', 'company'); add('Asking about', 'interest'); add('Role', 'role'); add('Services', 'services');
    add('Number of photos', 'photos'); add('Property location', 'location'); add('MLS', 'mls'); add('Intended use', 'use');
    lines.push('', String(fd.get('message') ?? ''));
    return lines.join('\n');
  };
  const mailto = (fd: FormData) => `mailto:${contact}?subject=${encodeURIComponent(form.dataset.subject || 'StageLiora inquiry')}&body=${encodeURIComponent(composeBody(fd))}`;
  const show = (kind: string, heading: string, text: string, fd: FormData) => {
    status.hidden = false;
    status.dataset.kind = kind;
    status.innerHTML = '';
    const h = document.createElement('h3'); h.textContent = heading; h.tabIndex = -1;
    const p = document.createElement('p'); p.textContent = text;
    status.append(h, p);
    if (kind !== 'ok') {
      const a = document.createElement('a'); a.className = 'btn btn--primary'; a.href = mailto(fd); a.textContent = 'Open in my email app';
      status.append(a);
    }
    h.focus();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const problems = validate(fd);
    if (problems.length) {
      const first = form.querySelector<HTMLElement>(`[name="${problems[0]}"]`);
      first?.focus();
      status.hidden = false; status.dataset.kind = 'error';
      status.textContent = `Please fix ${problems.length} ${problems.length === 1 ? 'field' : 'fields'} before continuing.`;
      return;
    }
    if (fd.get('website')) return; // honeypot
    const endpoint = form.dataset.endpoint || '';
    if (!endpoint) {
      show('info', 'Your message has not been sent yet', 'Nothing has left your browser. Open it in your email app to review it and send it yourself.', fd);
      return;
    }
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    btn.disabled = true;
    try {
      const payload: Record<string, unknown> = {};
      for (const k of new Set(fd.keys())) { const v = fd.getAll(k).map(String); payload[k] = v.length > 1 || k === 'services' ? v : v[0]; }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show('ok', 'Request received', 'Thanks. Your request reached us, and we will reply by email.', fd);
    } catch {
      show('error', 'Your request could not be sent', 'Something went wrong, and we did not receive your request. Your details are still in the form. Please try again, or send them by email.', fd);
    } finally {
      btn.disabled = false;
    }
  });
});

// Upload draft: validates files locally and transmits nothing ------------------
const drop = document.querySelector<HTMLElement>('[data-drop]');
if (drop) {
  const input = drop.querySelector<HTMLInputElement>('input[type=file]')!;
  const list = document.querySelector<HTMLElement>('[data-files]')!;
  const MAX = 25 * 1024 * 1024;
  const OK = /\.(jpe?g|png|heic)$/i;
  const add = (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const li = document.createElement('li');
      const problem = !OK.test(f.name) ? 'Not accepted: use JPG, PNG or HEIC' : f.size > MAX ? 'Not accepted: larger than 25 MB' : 'Passes local check. Not uploaded.';
      const a = document.createElement('span'); a.textContent = f.name;
      const b = document.createElement('span'); b.textContent = problem; b.className = problem.startsWith('Not') ? 'err' : 'hint';
      li.append(a, b); list.append(li);
    }
  };
  input.addEventListener('change', () => { add(input.files); });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => add((e as DragEvent).dataTransfer?.files ?? null));
}

// Showcase tabs ------------------------------------------------------------
// Accessible tabs pattern. Without JavaScript, a noscript rule shows every panel instead.
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')!)!);
  const select = (i: number, focus: boolean) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) { tabs[i].focus(); tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i, false));
    t.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
      if (next < 0) return;
      e.preventDefault();
      select(next, true);
    });
  });
});

// Sticky call to action ----------------------------------------------------
// Hidden on the first screen, so it never covers the content a visitor sees on arrival.
// It appears once the visitor scrolls. html { scroll-padding-bottom } keeps focused elements clear of it.
const sticky = document.querySelector<HTMLElement>('.sticky-cta');
if (sticky) {
  const update = () => { if (window.scrollY > window.innerHeight * 0.6) sticky.removeAttribute('data-hidden'); else sticky.setAttribute('data-hidden', ''); };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
