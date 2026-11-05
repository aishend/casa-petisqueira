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
  const frame = $('iframe', sheet);
  const loading = $('.sheet__loading', sheet);
  const slow = $('.sheet__slow', sheet);
  let loaded = false;
  let slowTimer;

  const ext = $$('.sheet__ext, .sheet__slow a', sheet);

  frame.addEventListener('load', () => { loaded = true; loading.hidden = true; clearTimeout(slowTimer); });
  const start = () => { if (!frame.src) frame.src = frame.dataset.src; };
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
    sheet.showModal();
    $('.sheet__close', sheet).focus();
    // O botão "voltar" do telemóvel fecha a janela em vez de sair da página.
    if (history.state?.sheet !== true) history.pushState({ sheet: true }, '', '#reservar');
  };
  const close = () => { if (sheet.open) sheet.close(); };

  sheet.addEventListener('close', () => { if (history.state?.sheet === true) history.back(); });
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
      if (!form.reportValidity()) return;
      e.preventDefault();
      const q = new URLSearchParams(new FormData(form)).toString();
      open(`${form.action}?${q}#RoomSelection-BE`);
    });
  });

  // Pré-carrega com boa ligação e sem poupança de dados.
  const c = navigator.connection;
  if (!c || (!c.saveData && !/2g/.test(c.effectiveType || ''))) {
    addEventListener('load', () => {
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1));
      setTimeout(() => idle(start), 3000);
    });
  }

  if (location.hash === '#reservar') { history.replaceState(null, '', location.pathname); open(); }
}

// ---------- datas e pessoas ----------
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(`${s}T12:00:00`); d.setDate(d.getDate() + n); return iso(d); };
$$('[data-picker]').forEach((form) => {
  const max = Number(form.dataset.max);
  const [inn, out] = $$('input[type=date]', form);
  const today = iso(new Date());
  inn.min = today;
  out.min = addDays(today, 1);
  // Escolhida a chegada, a saída passa a ser pelo menos no dia seguinte e abre logo o calendário.
  inn.addEventListener('change', () => {
    if (!inn.value) return;
    out.min = addDays(inn.value, 1);
    if (!out.value || out.value <= inn.value) out.value = addDays(inn.value, 2);
    try { out.showPicker(); } catch (_) {}
  });
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
