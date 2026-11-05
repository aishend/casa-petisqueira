// Menu, língua, janela de reservas (Amenitiz), separadores dos mapas, carrossel e galeria em ecrã inteiro.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- menu no telemóvel ----------
const toggle = $('.menu-toggle');
const nav = $('#nav');
if (toggle && nav) {
  const setOpen = (open) => { nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', open); };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
}

// ---------- língua ----------
// A escolha por bandeira fica guardada; a deteção automática (no <head>) respeita-a.
document.addEventListener('click', (e) => {
  const pick = e.target.closest('[data-lang]');
  if (pick) { try { localStorage.setItem('lang', pick.dataset.lang); } catch (_) {} }
  const menu = $('.lang[open]');
  if (menu && !e.target.closest('.lang')) menu.open = false;
});

// Pesquisa no menu de línguas (por língua ou país, sem acentos).
const langBox = $('.lang');
if (langBox) {
  const input = $('.lang__search input', langBox);
  const items = $$('.lang__list a', langBox);
  const none = $('.lang__none', langBox);
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const filter = () => {
    const q = norm(input.value);
    let shown = 0;
    items.forEach((a) => { const ok = !q || norm(a.dataset.terms).includes(q); a.hidden = !ok; if (ok) shown++; });
    none.hidden = shown > 0;
  };
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); items.find((a) => !a.hidden)?.click(); }
    if (e.key === 'Escape') { langBox.open = false; $('summary', langBox).focus(); }
  });
  langBox.addEventListener('toggle', () => {
    if (!langBox.open) { input.value = ''; filter(); return; }
    // No telemóvel não abre o teclado sozinho.
    if (matchMedia('(pointer: fine)').matches) input.focus();
  });
}

// ---------- janela de reservas ----------
// O iframe do Amenitiz carrega na primeira abertura, quando o dedo toca num botão de reservar,
// ou (com boa ligação) uns segundos depois de a página abrir, para já estar pronto.
const sheet = $('#booking');
if (sheet && typeof sheet.showModal === 'function') {
  let frame = $('iframe', sheet);
  const loading = $('.sheet__loading', sheet);
  const slow = $('.sheet__slow', sheet);
  let loaded = false;
  let used = false;
  let slowTimer;

  const ext = $$('.sheet__ext, .sheet__slow a', sheet);
  const c = navigator.connection;
  const goodNet = !c || (!c.saveData && !/2g/.test(c.effectiveType || ''));

  const onLoad = () => { loaded = true; loading.hidden = true; clearTimeout(slowTimer); };
  frame.addEventListener('load', onLoad);
  const start = () => { if (!frame.src) frame.src = frame.dataset.src; };

  // Depois de a pessoa mexer no Amenitiz, o browser perguntava "Quer sair do site?" ao mudar de página.
  // Ao fechar a janela troca-se o iframe por um novo: o aviso desaparece e o novo volta a carregar em fundo.
  const reset = () => {
    if (!used) return;
    used = false;
    const fresh = frame.cloneNode(false);
    fresh.removeAttribute('src');
    fresh.addEventListener('load', onLoad);
    frame.replaceWith(fresh);
    frame = fresh;
    loaded = false; loading.hidden = false; slow.hidden = true;
    ext.forEach((a) => { a.href = frame.dataset.src; });
    if (goodNet) setTimeout(start, 1000);
  };
  // Muda o endereço do Amenitiz (ex.: com datas e pessoas).
  const go = (url) => {
    if (frame.src === url) return;
    loaded = false; loading.hidden = false; slow.hidden = true;
    frame.src = url;
    ext.forEach((a) => { a.href = url; });
  };

  const open = (url) => {
    if (url) go(url); else start();
    // Se demorar, mostra um botão grande para abrir o Amenitiz noutra janela.
    if (!loaded) { clearTimeout(slowTimer); slowTimer = setTimeout(() => { slow.hidden = false; }, 8000); }
    used = true;
    sheet.showModal();
    $('.sheet__close', sheet).focus();
    // O botão "voltar" do telemóvel fecha a janela em vez de sair da página.
    if (history.state?.sheet !== true) history.pushState({ sheet: true }, '', '#reservar');
  };
  const close = () => { if (sheet.open) sheet.close(); };

  sheet.addEventListener('close', () => {
    reset();
    if (history.state?.sheet === true) history.back();
  });
  addEventListener('popstate', () => { if (history.state?.sheet !== true) close(); });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-book]');
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    nav?.classList.remove('is-open');
    open();
  });
  $('.sheet__close', sheet).addEventListener('click', close);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });

  document.addEventListener('pointerdown', (e) => { if (e.target.closest?.('[data-book]')) start(); }, { passive: true });

  // Formulário de datas e pessoas: abre o Amenitiz já preenchido (lista de casas com preços).
  $$('[data-picker]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Sem datas, abre o calendário em vez de seguir.
      if (!form.start_date.value || !form.end_date.value) { form.openCal?.(form.start_date.value ? 'end' : 'start'); return; }
      const q = new URLSearchParams(new FormData(form)).toString();
      open(`${form.action}?${q}#RoomSelection-BE`);
    });
  });

  // Pré-carrega com boa ligação e sem poupança de dados.
  if (goodNet) {
    addEventListener('load', () => {
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1));
      setTimeout(() => idle(start), 3000);
    });
  }

  if (location.hash === '#reservar') { history.replaceState(null, '', location.pathname); open(); }
}

// ---------- datas e pessoas ----------
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const parse = (s) => new Date(`${s}T12:00:00`);
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);

// Calendário: toca-se na chegada e depois na saída; o intervalo fica pintado e mostra as noites.
// data-busy (opcional) = lista de noites ocupadas "AAAA-MM-DD", que ficam riscadas.
function calendar(form) {
  const t = JSON.parse(form.dataset.t);
  let busy = new Set();
  const fmt = (o) => new Intl.DateTimeFormat(t.locale, o);
  const fDay = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
  const fShort = fmt({ day: 'numeric', month: 'short' });
  const fMonth = fmt({ month: 'long', year: 'numeric' });
  const fWeek = fmt({ weekday: 'narrow' });
  const icon = '☾ ';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const nights = (n) => `${n} ${n === 1 ? t.n1 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? t.n2 : t.n5}`;
  const today = iso(new Date());
  let a = null, b = null, hover = null;
  // 'start' = a próxima data tocada é a chegada; 'end' = é a saída.
  let mode = 'start';

  // Monta a janela uma vez: chegada e saída lado a lado, 12 meses e rodapé.
  const dlg = document.createElement('dialog');
  dlg.className = 'cal';
  dlg.setAttribute('aria-label', t.dates);
  const week = Array.from({ length: 7 }, (_, i) => `<span>${fWeek.format(parse(addDays('2024-01-01', i)))}</span>`).join('');
  let months = '';
  const first = parse(today); first.setDate(1);
  for (let m = 0; m < 12; m++) {
    const d = new Date(first.getFullYear(), first.getMonth() + m, 1, 12);
    const blanks = (d.getDay() + 6) % 7;
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    let cells = '<span></span>'.repeat(blanks);
    for (let n = 1; n <= days; n++) { const k = iso(new Date(d.getFullYear(), d.getMonth(), n, 12)); cells += `<button type="button" data-d="${k}">${n}</button>`; }
    months += `<section class="cal__month" data-m="${iso(d).slice(0, 7)}"><h3>${cap(fMonth.format(d))}</h3><div class="cal__week">${week}</div><div class="cal__grid">${cells}</div></section>`;
  }
  const tab = (k, label) => `<button type="button" class="cal__tab" data-tab="${k}"><small>${label}</small><b></b></button>`;
  dlg.innerHTML = `<div class="cal__head">${tab('start', t.checkin)}<span class="cal__arrow" aria-hidden="true">→</span>${tab('end', t.checkout)}<button type="button" class="cal__x" aria-label="×">×</button></div>
    <div class="cal__months">${months}</div>
    <div class="cal__foot"><p class="cal__sum"></p><button type="button" class="cal__clear">${t.clear}</button><button type="button" class="btn btn--primary cal__done">${t.done}</button></div>`;
  document.body.appendChild(dlg);
  const btns = $$('[data-d]', dlg);
  const tabs = { start: $('[data-tab=start]', dlg), end: $('[data-tab=end]', dlg) };
  const sum = $('.cal__sum', dlg);
  const done = $('.cal__done', dlg);

  // Primeira noite ocupada a partir da chegada: a saída não pode passar dela.
  const limit = () => { if (!a) return null; for (let d = a, i = 0; i < 400; i++, d = addDays(d, 1)) if (busy.has(d)) return d; return null; };
  const endOk = (d) => { const lim = limit(); return a && d > a && (!lim || d <= lim); };

  const paint = () => {
    const choosingEnd = mode === 'end' && a;
    const end = choosingEnd && hover && endOk(hover) ? hover : b;
    btns.forEach((el) => {
      const d = el.dataset.d;
      // A escolher a saída: só dias depois da chegada e antes da próxima noite ocupada (tocar antes muda a chegada).
      el.disabled = d < today || (choosingEnd && d > a ? !endOk(d) : busy.has(d));
      el.classList.toggle('is-busy', busy.has(d) && d >= today);
      el.classList.toggle('is-start', d === a);
      el.classList.toggle('is-end', d === end);
      el.classList.toggle('in-range', !!(a && end && d > a && d < end));
    });
    // Chegada e saída sempre visíveis no topo; a que se está a escolher fica destacada.
    tabs.start.querySelector('b').textContent = a ? fShort.format(parse(a)) : '—';
    tabs.end.querySelector('b').textContent = b ? fShort.format(parse(b)) : '—';
    tabs.start.classList.toggle('is-on', mode === 'start');
    tabs.end.classList.toggle('is-on', mode === 'end');
    sum.textContent = a && end ? `${fShort.format(parse(a))} → ${fShort.format(parse(end))} · ${nights(nightsBetween(a, end))}` : '';
    done.disabled = !(a && b);
  };

  const apply = () => {
    form.start_date.value = a && b ? a : '';
    form.end_date.value = a && b ? b : '';
    $('[data-show=start]', form).textContent = a && b ? fDay.format(parse(a)) : t.add;
    $('[data-show=end]', form).textContent = a && b ? fDay.format(parse(b)) : t.add;
    form.classList.toggle('has-dates', !!(a && b));
    const n = $('[data-nights]', form);
    n.hidden = !(a && b);
    n.textContent = a && b ? `${icon}${nights(nightsBetween(a, b))}` : '';
  };

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) { dlg.close(); return; }
    const tb = e.target.closest('[data-tab]');
    if (tb) { mode = tb.dataset.tab === 'end' && a ? 'end' : 'start'; hover = null; paint(); return; }
    const el = e.target.closest('[data-d]');
    if (!el || el.disabled) return;
    const d = el.dataset.d;
    if (mode === 'end' && endOk(d)) {
      b = d;
      apply();
      paint();
      // Escolhida a saída, fecha sozinho.
      setTimeout(() => dlg.close(), 700);
      return;
    }
    // Nova chegada. Se a saída antiga ainda servir, mantém-se; senão escolhe-se a seguir.
    a = d;
    if (b && !endOk(b)) b = null;
    mode = 'end';
    paint();
  });
  if (matchMedia('(pointer: fine)').matches) {
    dlg.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-d]'); if (mode === 'end' && el) { hover = el.dataset.d; paint(); } });
  }
  $('.cal__x', dlg).addEventListener('click', () => dlg.close());
  $('.cal__clear', dlg).addEventListener('click', () => { a = b = hover = null; mode = 'start'; apply(); paint(); });
  done.addEventListener('click', () => { apply(); dlg.close(); });

  form.openCal = (which) => {
    busy = new Set(JSON.parse(form.dataset.busy || '[]'));
    a = form.start_date.value || null;
    b = form.end_date.value || null;
    mode = which === 'end' && a ? 'end' : 'start';
    hover = null;
    paint();
    dlg.showModal();
    const m = $(`[data-m="${((mode === 'end' && b) || a || today).slice(0, 7)}"]`, dlg);
    $('.cal__months', dlg).scrollTop = m ? m.offsetTop - $('.cal__months', dlg).offsetTop : 0;
  };
  form.addEventListener('click', (e) => { const el = e.target.closest('[data-cal]'); if (el) form.openCal(el.dataset.cal); });
}

$$('[data-picker]').forEach((form) => {
  const max = Number(form.dataset.max);
  calendar(form);
  // Botões − e +, com o total de pessoas limitado à lotação da casa.
  const nums = $$('input[type=number]', form);
  const clamp = (input) => {
    const others = nums.filter((n) => n !== input).reduce((a, n) => a + Number(n.value), 0);
    const v = Math.max(Number(input.min), Math.min(Number(input.value) || 0, max - others));
    input.value = v;
  };
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const input = $('input', b.parentElement);
    input.value = Number(input.value) + Number(b.dataset.step);
    clamp(input);
  });
  nums.forEach((n) => n.addEventListener('change', () => clamp(n)));
});


// ---------- separadores dos mapas ----------
const tabs = $$('.tabs__btn');
if (tabs.length) {
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const load = (panel) => { const f = $('iframe[data-src]', panel); if (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); } };
  const select = (i) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => { p.hidden = i !== j; });
    load(panels[i]);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(n); tabs[n].focus();
      }
    });
  });
  select(0);
  // Em ecrãs largos os dois mapas aparecem lado a lado.
  const wide = matchMedia('(min-width: 900px)');
  const showAll = () => { if (wide.matches) panels.forEach(load); };
  wide.addEventListener('change', showAll);
  showAll();
}

// ---------- carrossel de fotos (telemóvel) ----------
const track = $('.carousel__track');
const counter = $('[data-count]');
if (track && counter) {
  track.addEventListener('scroll', () => {
    counter.textContent = Math.round(track.scrollLeft / track.clientWidth) + 1;
  }, { passive: true });
}

// ---------- galeria em ecrã inteiro ----------
const gallery = $('[data-gallery]');
const box = $('.lightbox');
if (gallery && box) {
  const photos = JSON.parse(gallery.dataset.gallery);
  const image = $('.lightbox__img', box);
  const count = $('.lightbox__count', box);
  let index = 0;

  const preload = (i) => { const p = photos[(i + photos.length) % photos.length]; const im = new Image(); im.sizes = '100vw'; im.srcset = p.srcset; };
  const show = (i) => {
    index = (i + photos.length) % photos.length;
    image.sizes = '100vw';
    image.srcset = photos[index].srcset;
    image.src = photos[index].src;
    image.alt = `${box.getAttribute('aria-label')} — ${index + 1}/${photos.length}`;
    count.textContent = `${index + 1} / ${photos.length}`;
    preload(index + 1);
    preload(index - 1);
  };

  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    show(Number(btn.dataset.open));
    box.showModal();
  });
  $('.lightbox__close', box).addEventListener('click', () => box.close());
  $('.lightbox__prev', box).addEventListener('click', () => show(index - 1));
  $('.lightbox__next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });

  let startX = null;
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
}
