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
    lb.showModal();
  });
  lb.querySelector('[data-lb-close]')?.addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => opener?.focus());
}

// Design Library filters ---------------------------------------------------
const libRoot = document.querySelector<HTMLElement>('[data-library]');
if (libRoot) {
  const items = [...libRoot.querySelectorAll<HTMLElement>('[data-item]')];
  const count = libRoot.querySelector('[data-count]')!;
  const empty = libRoot.querySelector<HTMLElement>('[data-empty]')!;
  const clear = libRoot.querySelector<HTMLButtonElement>('[data-clear]')!;
  const state: Record<string, string> = { style: 'all', room: 'all' };
  const apply = () => {
    let n = 0;
    items.forEach((el) => {
      const show = (state.style === 'all' || el.dataset.style === state.style) && (state.room === 'all' || el.dataset.room === state.room);
      el.hidden = !show;
      if (show) n++;
    });
    count.textContent = `${n} ${n === 1 ? 'design' : 'designs'} shown`;
    empty.hidden = n > 0;
    clear.hidden = state.style === 'all' && state.room === 'all';
    libRoot.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) => {
      b.setAttribute('aria-pressed', String(state[b.dataset.filter!] === b.dataset.value));
    });
  };
  libRoot.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (b) { state[b.dataset.filter!] = b.dataset.value!; apply(); }
    if ((e.target as HTMLElement).closest('[data-clear], [data-clear-2]')) { state.style = 'all'; state.room = 'all'; apply(); }
  });
  const q = new URLSearchParams(location.search);
  const qs = q.get('style'); const qr = q.get('room');
  if (qs && libRoot.querySelector(`[data-filter=style][data-value="${CSS.escape(qs)}"]`)) state.style = qs;
  if (qr && libRoot.querySelector(`[data-filter=room][data-value="${CSS.escape(qr)}"]`)) state.room = qr;
  apply();
}

// Quote and contact forms --------------------------------------------------
document.querySelectorAll<HTMLFormElement>('form[data-inquiry]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
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
    add('Name', 'name'); add('Email', 'email'); add('Phone', 'phone'); add('Company', 'company'); add('Role', 'role'); add('Services', 'services');
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
