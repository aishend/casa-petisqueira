// Gera os dois sites estáticos: dist/ (apartamentos) e dist-bungalow/ (bungalow). Sem dependências: só Node.
//   node src/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE as CONTACT, LOCATIONS, LANGS, SITES, ROUTES as MAIN_ROUTES, REDIRECTS, PROPERTIES as ALL_PROPERTIES, T, REGION, EXTRA, googleMapsDir, wazeDir } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC = join(ROOT, 'static');
const WIDTHS = [480, 1024, 1920];

// Site que está a ser gerado (mudado por useSite()).
let SITE, CFG, OTHER, ROUTES, PROPERTIES, HERO, DIST, IS_BUNGALOW;
function useSite(key) {
  CFG = SITES[key];
  OTHER = SITES[key === 'casas' ? 'bungalow' : 'casas'];
  IS_BUNGALOW = key === 'bungalow';
  SITE = { ...CONTACT, url: CFG.url, name: CFG.name };
  PROPERTIES = ALL_PROPERTIES.filter((p) => CFG.properties.includes(p.id));
  HERO = CFG.hero;
  DIST = join(ROOT, CFG.out);
  // O site do bungalow é uma só página por língua.
  // Site do bungalow: página principal + página da Serra da Estrela (o nome não se traduz).
  ROUTES = IS_BUNGALOW
    ? { home: MAIN_ROUTES.home, serra: Object.fromEntries(LANGS.map((l) => [l, `${MAIN_ROUTES.home[l]}serra-da-estrela/`])) }
    : MAIN_ROUTES;
}

// ---------- utilitários ----------

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

function write(path, html) {
  const file = join(DIST, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Lê largura/altura de um ficheiro WebP (VP8, VP8L ou VP8X).
const sizeCache = new Map();
function webpSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);
  const b = readFileSync(file);
  const chunk = b.toString('ascii', 12, 16);
  let w, h;
  if (chunk === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
  else if (chunk === 'VP8L') { const v = b.readUInt32LE(21); w = 1 + (v & 0x3fff); h = 1 + ((v >> 14) & 0x3fff); }
  else { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
  sizeCache.set(file, [w, h]);
  return [w, h];
}

// Número de fotos de cada casa (ficheiros NN-480.webp em static/img/<id>/).
const photoCount = (id) => readdirSync(join(STATIC, 'img', id)).filter((f) => f.endsWith('-480.webp')).length;
// Fotos a mostrar de uma casa: a seleção em PROPERTIES (photos) ou, sem ela, todas pela ordem dos ficheiros.
const photosOf = (p) => p.photos ?? Array.from({ length: photoCount(p.id) }, (_, i) => i + 1);

const imgPath = (id, n, w) => `/img/${id}/${pad(n)}-${w}.webp`;

// <img> responsivo. sizes descreve a largura no ecrã.
// No telemóvel basta a versão média (1024 px), mesmo em ecrãs muito nítidos: carrega mais depressa.
const HERO_SIZES = '(max-width: 767px) 340px, 100vw';
const srcsetOf = (id, n) => WIDTHS.map((w) => `${imgPath(id, n, w)} ${webpSize(join(STATIC, imgPath(id, n, w)))[0]}w`).join(', ');

// late: a foto só começa a carregar depois da página (o main.js troca data-src por src), para não atrasar a foto de topo.
function img(id, n, { alt = '', sizes = '100vw', eager = false, cls = '', low = false, late = false } = {}) {
  const srcset = WIDTHS.map((w) => {
    const [rw] = webpSize(join(STATIC, imgPath(id, n, w)));
    return `${imgPath(id, n, w)} ${rw}w`;
  }).join(', ');
  const [w, h] = webpSize(join(STATIC, imgPath(id, n, 1024)));
  const s = late ? 'data-' : '';
  return `<img ${s}src="${imgPath(id, n, 1024)}" ${s}srcset="${srcset}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : `loading="lazy"${low ? ' fetchpriority="low"' : ''}`} decoding="async">`;
}


// Ícones (SVG em linha, herdam a cor do texto).
const ICON = {
  guests: '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3.5"/><path d="M22 19v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  bed: '<path d="M2 18V6M2 14h20v4M22 14v-3a3 3 0 0 0-3-3h-8v6"/><circle cx="6.5" cy="10.5" r="2"/>',
  bath: '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3zM6 12V5a2 2 0 0 1 4 0M7 20l-1 2M17 20l1 2"/>',
  area: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h4M9 3v4M21 15h-4M15 21v-4"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  whatsapp: '<path d="M3 21l1.6-4.8A9 9 0 1 1 8 19.5L3 21z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2L9 9.5z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  nav: '<path d="M3 11 22 2l-9 19-2-8-8-2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  // comodidades
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5.2 12.3a10.5 10.5 0 0 1 13.6 0M8.6 15.8a5.5 5.5 0 0 1 6.8 0"/><circle cx="12" cy="19.3" r=".9" fill="currentColor"/>',
  ac: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9.5 3.5 12 5.5l2.5-2M9.5 20.5 12 18.5l2.5 2M3.8 10.5l3-1-.6-3.1M20.2 13.5l-3 1 .6 3.1M20.2 10.5l-3-1 .6-3.1M3.8 13.5l3 1-.6 3.1"/>',
  kitchen: '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM2 10h2M20 10h2M9 3.5c0 1.2-1 1.3-1 2.5s1 1.3 1 2.5M13 3.5c0 1.2-1 1.3-1 2.5s1 1.3 1 2.5M17 3.5c0 1.2-1 1.3-1 2.5s1 1.3 1 2.5"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9.5 17V7H13a3 3 0 0 1 0 6H9.5"/>',
  linen: '<path d="M7 3h12v13a2 2 0 0 1-2 2H7zM7 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10M10 13h6"/>',
  washer: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M8 5.5h.01M11 5.5h.01M10 14.5c1.3-1 2.7 1 4 0"/>',
  dishwasher: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 7h16M7.5 4.5h.01M14 4.5h3M8.5 11v7M12 11v7M15.5 11v7"/>',
  tv: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
  terrace: '<path d="M12 3v18M3.5 9.5C5 5.8 8.3 3 12 3s7 2.8 8.5 6.5zM7 21h10M5 14v7M19 14v7M5 16h3M16 16h3"/>',
  balcony: '<path d="M7 12V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7M3 12h18M3 21h18M5 12v9M9.5 12v9M14.5 12v9M19 12v9"/>',
  dining: '<path d="M7 2v20M4 2v5a3 3 0 0 0 6 0V2M18 22V2c-2.2 1.5-3.5 4.5-3.5 8.5H18"/>',
  forest: '<path d="M12 2 6 10h3l-4 6h14l-4-6h3zM12 16v6"/>',
  // Serra da Estrela
  mountain: '<path d="m3 20 6.5-11 3.5 6 2.5-4L21 20zM8 11.5l1.5 1 1.5-1"/>',
  village: '<path d="M3 21V11l5-4 5 4v10M13 21v-7l4-3 4 3v7M2 21h20M6.5 21v-4h3v4"/>',
  water: '<path d="M2 15c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M12 3s-4 4.5-4 7a4 4 0 0 0 8 0c0-2.5-4-7-4-7z"/>',
  museum: '<path d="M3 21h18M4 18h16M5 18v-8M9.5 18v-8M14.5 18v-8M19 18v-8M2.5 10h19L12 3z"/>',
  // camas
  double: '<path d="M3 20v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 17h18M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M7 11V8.5h4V11M13 11V8.5h4V11"/>',
  twin: '<path d="M2 20v-6a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 10 14v6M2 17.5h8M14 20v-6a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 22 14v6M14 17.5h8M4 12.5V10h4v2.5M16 12.5V10h4v2.5"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 11a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 4 0v5H1v-5a2 2 0 0 1 2-2zM4 18v2M20 18v2"/>',
};
const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

const PATH_WA = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z';
const PATH_FB = 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z';
// Logótipos com as cores das marcas (desenhos de simple-icons, CC0; Booking.com simplificado).
const BRAND = {
  whatsapp: `<path fill="#25D366" d="${PATH_WA}"/>`,
  facebook: `<path fill="#0866FF" d="${PATH_FB}"/>`,
  gmaps: '<path fill="#EA4335" d="M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.019-2.525-.51-.944-1.145-1.817-1.79-2.671L19.527 4.799zM8.545 7.705l-3.959 4.707c.724 1.54 1.821 2.863 2.871 4.18.247.31.494.622.737.936l4.984-5.925-.029.01c-1.741.601-3.691-.291-4.392-1.987a3.377 3.377 0 0 1-.209-.716c-.063-.437-.077-.761-.004-1.198l.001-.007zM5.492 3.149l-.003.004c-1.947 2.466-2.281 5.88-1.117 8.77l4.785-5.689-.058-.05-3.607-3.035zM14.661.436l-3.838 4.563a.295.295 0 0 1 .027-.01c1.6-.551 3.403.15 4.22 1.626.176.319.323.683.377 1.045.068.446.085.773.012 1.22l-.003.016 3.836-4.561A8.382 8.382 0 0 0 14.67.439l-.009-.003zM9.466 5.868L14.162.285l-.047-.012A8.31 8.31 0 0 0 11.986 0a8.439 8.439 0 0 0-6.169 2.766l-.016.018 3.665 3.084z"/>',
  waze: '<path fill="#33CCFF" d="M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z"/>',
  airbnb: '<path fill="#FF5A5F" d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z"/>',
  expedia: '<path fill="#191E3B" d="M19.067 0H4.933A4.94 4.94 0 0 0 0 4.933v14.134A4.932 4.932 0 0 0 4.933 24h14.134A4.932 4.932 0 0 0 24 19.067V4.933C24.01 2.213 21.797 0 19.067 0ZM7.336 19.341c0 .19-.148.337-.337.337h-2.33a.333.333 0 0 1-.337-.337v-2.33c0-.189.148-.336.337-.336H7c.19 0 .337.147.337.337zm12.121-1.486-2.308 2.298c-.169.168-.422.053-.422-.2V9.57l-6.44 6.44a.533.533 0 0 1-.421.17H8.169a.32.32 0 0 1-.338-.338v-1.697c0-.2.053-.316.169-.422l6.44-6.44H4.058c-.253 0-.369-.253-.2-.421l2.297-2.309c.137-.137.285-.232.517-.232H18.15c.854 0 1.539.686 1.539 1.54v11.478c-.01.231-.095.368-.232.516z"/>',
  booking: '<rect width="24" height="24" rx="5" fill="#003B95"/><text x="5" y="18" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="16" fill="#fff">B</text><circle cx="17.8" cy="16.5" r="1.9" fill="#00A2FF"/>',
};
const brand = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${BRAND[name]}</svg>`;

// Ícone de contacto: logótipo da marca quando existe, senão ícone simples.
const contactIcon = (name, cls) => (BRAND[name] ? brand(name, cls) : icon(name, cls));

// Bandeiras (SVG simples).
const FLAG = {
  pt: '<rect width="30" height="20" fill="#da291c"/><rect width="12" height="20" fill="#046a38"/><circle cx="12" cy="10" r="4.4" fill="#ffe000"/><circle cx="12" cy="10" r="3.1" fill="#da291c"/><path d="M10.4 8.2h3.2v2.6a1.6 1.6 0 0 1-3.2 0z" fill="#fff"/>',
  en: '<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.5"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.5"/>',
  fr: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#002654"/><rect x="20" width="10" height="20" fill="#ce1126"/>',
  es: '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>',
  de: '<rect width="30" height="20" fill="#ffce00"/><rect width="30" height="13.4" fill="#dd0000"/><rect width="30" height="6.7" fill="#000"/>',
  it: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#009246"/><rect x="20" width="10" height="20" fill="#ce2b37"/>',
  nl: '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.7" fill="#ae1c28"/><rect y="13.3" width="30" height="6.7" fill="#21468b"/>',
  pl: '<rect width="30" height="20" fill="#dc143c"/><rect width="30" height="10" fill="#fff"/>',
};
const flag = (l) => `<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">${FLAG[l]}</svg>`;

const waLink = (text) => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// Botão que abre a janela de reservas (Amenitiz). Sem JavaScript, o link abre o Amenitiz diretamente.
const bookBtn = (lang, label, cls = 'btn btn--primary') =>
  `<a class="${cls}" href="${SITE.bookingEngine(lang)}" data-book>${icon('calendar')}<span>${label}</span></a>`;

// Datas e pessoas: abre o Amenitiz já com tudo preenchido, na lista de casas com preços.
// Sem JavaScript, o formulário abre o Amenitiz com os mesmos parâmetros.
function picker(lang, max, cls = '') {
  const t = T[lang];
  const step = (name, label, value, min, ic = '') => `<div class="picker__row">
      <span>${ic}${label}</span>
      <div class="stepper">
        <button type="button" data-step="-1" aria-label="${esc(label)} −">−</button>
        <input type="number" name="${name}" value="${value}" min="${min}" max="${max}" inputmode="numeric" aria-label="${esc(label)}">
        <button type="button" data-step="1" aria-label="${esc(label)} +">+</button>
      </div>
    </div>`;
  // As datas escolhem-se no calendário do main.js (botões data-cal); ficam nos campos escondidos.
  const day = (k, label) => `<button type="button" data-cal="${k}">${icon('calendar', 'icon icon--sm')}<span><small data-label="${k}">${label}</small><b data-show="${k}">${t.pick.add}</b></span></button>`;
  return `<form class="picker ${cls}" action="${SITE.bookingEngineBase(lang)}" method="get" data-picker data-max="${max}" data-t="${esc(JSON.stringify({ ...t.pick, locale: t.htmlLang }))}">
    <div class="picker__dates">${day('start', t.pick.checkin)}${day('end', t.pick.checkout)}</div>
    <input type="hidden" name="start_date"><input type="hidden" name="end_date">
    ${step('adults', t.pick.adults, Math.min(2, max), 1, icon('guests', 'icon icon--sm'))}
    ${step('children', t.pick.children, 0, 0)}
    <button class="btn btn--primary btn--block btn--lg" type="submit">${icon('calendar')}<span>${t.pick.go}</span></button>
  </form>`;
}

// Anúncios da casa noutras plataformas, com logótipo.
function platforms(p, lang) {
  const links = [
    ['booking', 'Booking.com', SITE.bookingCom(p.booking, lang)],
    p.airbnb && ['airbnb', 'Airbnb', p.airbnb],
    p.expedia && ['expedia', 'Expedia', p.expedia],
  ].filter(Boolean);
  // Discreto de propósito: a reserva direta é o destaque.
  return `<p class="also"><span>${T[lang].alsoOn}</span>${links.map(([k, name, href]) => `<a href="${href}" rel="noopener">${brand(k)}${name}</a>`).join('')}</p>`;
}

// Botão Booking.com com logótipo.
const bookingComBtn = (p, lang, label = 'Booking.com', cls = 'btn btn--line') =>
  `<a class="${cls}" href="${SITE.bookingCom(p.booking, lang)}" rel="noopener">${brand('booking')}<span>${esc(label)}</span></a>`;

// ---------- CSS / JS com versão (para limpar a cache quando mudam) ----------

const css = readFileSync(join(ROOT, 'src/styles.css'), 'utf8');
const js = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const CSS_URL = `/assets/styles.css?v=${hash(css)}`;
const JS_URL = `/assets/main.js?v=${hash(js)}`;

// Escolhe a língua na primeira visita: a que o utilizador escolheu antes (bandeira),
// senão a do telemóvel/computador (se o site a tiver), senão inglês. Não redireciona robôs de pesquisa
// nem navegação dentro do site.
const langScript = (lang) => `(function(){try{
var cur=${JSON.stringify(lang)},want=localStorage.getItem('lang');
if(!want){
if(/bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent))return;
if(document.referrer&&new URL(document.referrer).origin===location.origin)return;
var ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];
var S=${JSON.stringify(LANGS)};want='en';for(var i=0;i<ls.length;i++){var c=String(ls[i]).slice(0,2).toLowerCase();if(S.indexOf(c)>-1){want=c;break;}}
}
if(want===cur)return;
var a=document.querySelector('link[rel=alternate][hreflang^="'+want+'"]');
if(a)location.replace(new URL(a.href).pathname+location.hash);
}catch(e){}})();`.replace(/\n/g, '');

const OG_LOCALE = { pt: 'pt_PT', en: 'en_GB', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', nl: 'nl_NL', pl: 'pl_PL' };

// ---------- layout comum ----------

// Menu de línguas: lista curta com pesquisa por língua ou país.
function langMenu(lang, key) {
  const t = T[lang];
  const items = LANGS.map((l) => {
    const href = ROUTES[key]?.[l] ?? ROUTES.home[l];
    const terms = `${l} ${T[l].langName} ${T[l].terms}`.toLowerCase();
    return `<a href="${href}" hreflang="${T[l].htmlLang}" lang="${T[l].htmlLang}" data-lang="${l}" data-terms="${esc(terms)}"${l === lang ? ' aria-current="true"' : ''}>${flag(l)}<span>${T[l].langName}</span></a>`;
  }).join('');
  return `<details class="lang">
      <summary aria-label="Language — ${t.langName}">${flag(lang)}<span>${lang.toUpperCase()}</span>${icon('chevron', 'icon icon--xs')}</summary>
      <div class="lang__menu">
        <label class="lang__search">${icon('search', 'icon icon--sm')}<input type="search" placeholder="${esc(t.search)}" aria-label="${esc(t.search)}" autocomplete="off" spellcheck="false"></label>
        <div class="lang__list">${items}</div>
        <p class="lang__none" hidden>${t.noLang}</p>
      </div>
    </details>`;
}

function layout({ lang, key, title, description, body, image, jsonld, preload = '' }) {
  const t = T[lang];
  const route = ROUTES[key]?.[lang] ?? '/404.html';
  const home = ROUTES.home[lang];
  const ogImage = SITE.url + (image ?? imgPath(...HERO, 1920));
  const alternates = ROUTES[key]
    ? LANGS.map((l) => `<link rel="alternate" hreflang="${T[l].htmlLang}" href="${SITE.url}${ROUTES[key][l]}">`).join('') +
      `<link rel="alternate" hreflang="x-default" href="${SITE.url}${ROUTES[key].en}">`
    : '';
  const footLangs = LANGS.map((l) => `<a href="${ROUTES[key]?.[l] ?? ROUTES.home[l]}" hreflang="${T[l].htmlLang}" lang="${T[l].htmlLang}" data-lang="${l}" title="${T[l].langName}"${l === lang ? ' aria-current="true"' : ''}>${flag(l)}<span>${l.toUpperCase()}</span></a>`).join('');
  const navItem = (href, label, k) => `<a href="${href}"${k === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const engine = SITE.bookingEngine(lang);

  return `<!doctype html>
<html lang="${t.htmlLang}"${IS_BUNGALOW ? ' class="eco"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${key ? '' : '<meta name="robots" content="noindex">'}<link rel="canonical" href="${SITE.url}${route}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${SITE.url}${route}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${IS_BUNGALOW ? '#f3eadb' : '#ffffff'}">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="preconnect" href="${new URL(engine).origin}">
<link rel="stylesheet" href="${CSS_URL}">
${ROUTES[key] ? `<script>${langScript(lang)}</script>` : ''}
<script src="${JS_URL}" defer></script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
${key === 'home' ? `<script type="application/ld+json">${JSON.stringify(website(lang))}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="header">
  <div class="wrap header__inner">
    <a class="brand" href="${home}" aria-label="${SITE.name}">${IS_BUNGALOW
      ? `<img src="/marca-bungalow/letras-360.webp" srcset="/marca-bungalow/letras-360.webp 360w, /marca-bungalow/letras-720.webp 720w" sizes="200px" width="360" height="76" alt="${SITE.name}">`
      : `<img src="/img/logo-horizontal.webp" width="650" height="97" alt="${SITE.name}">`}</a>
    <nav class="nav" id="nav">
      ${IS_BUNGALOW ? navItem(ROUTES.serra[lang], 'Serra da Estrela', 'serra') : navItem(`${home}#casas`, t.nav.houses, 'houses')}
      ${navItem(`${home}#localizacao`, t.nav.location, 'location')}
      ${navItem(IS_BUNGALOW ? `${home}#contacto` : ROUTES.contact[lang], t.nav.contact, 'contact')}
    </nav>
    ${langMenu(lang, key)}
    ${bookBtn(lang, t.book, 'btn btn--primary btn--sm header__book')}
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav" aria-label="${t.menu}">${icon('menu')}</button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="wrap footer__grid">
    <a class="footer__brand" href="${home}">${IS_BUNGALOW
      ? `<img src="/marca-bungalow/logo-420.webp" srcset="/marca-bungalow/logo-420.webp 420w, /marca-bungalow/logo-840.webp 840w" sizes="320px" width="420" height="238" alt="${SITE.name}" loading="lazy">`
      : `<img src="/img/logo.webp" width="361" height="226" alt="${SITE.name}" loading="lazy">`}</a>
    <div>
      <h2 class="footer__title">${IS_BUNGALOW ? 'Eco Bungalow' : t.nav.houses}</h2>
      <ul class="footer__list">
        ${IS_BUNGALOW
          ? `<li><a href="${ROUTES.serra[lang]}">Serra da Estrela</a></li><li><a href="${home}#localizacao">${t.nav.location}</a></li><li><a href="${home}#contacto">${t.nav.contact}</a></li>`
          : PROPERTIES.map((p) => `<li><a href="${ROUTES[p.id][lang]}">${esc(p.name)}</a></li>`).join('')}
        <li><a href="${otherSiteHref(lang)}" rel="noopener">${esc(OTHER.name)} →</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer__title">${t.nav.contact}</h2>
      <ul class="footer__list footer__contacts">
        <li><a href="tel:${SITE.phoneRaw}">${icon('phone', 'icon icon--sm')}${SITE.phone}</a></li>
        <li><a href="${waLink()}" rel="noopener">${brand('whatsapp', 'icon icon--sm')}WhatsApp</a></li>
        <li><a href="mailto:${SITE.email}">${icon('mail', 'icon icon--sm')}${SITE.email}</a></li>
        ${IS_BUNGALOW ? '' : `<li><a href="${SITE.facebook}" rel="noopener">${brand('facebook', 'icon icon--sm')}Facebook</a></li>`}
      </ul>
    </div>
  </div>
  <div class="wrap footer__bottom"><span>© ${new Date().getFullYear()} ${SITE.name}. ${t.rights}.</span><span class="footer__langs">${footLangs}</span></div>
  <p class="wrap footer__credit">${t.credit} <a href="${SITE.dev.site}" rel="noopener">${SITE.dev.name}</a>, ${SITE.dev.role} · <a href="${SITE.dev.site}" rel="noopener">${new URL(SITE.dev.site).host}</a></p>
</footer>

<nav class="bar" aria-label="${t.book}">
  <a class="bar__btn" href="${googleMapsDir(LOCATIONS[CFG.location].geo)}" rel="noopener">${brand('gmaps')}<span>${t.mapShort}</span></a>
  <a class="bar__btn" href="tel:${SITE.phoneRaw}">${icon('phone')}<span>${t.call}</span></a>
  <a class="bar__btn" href="${waLink()}" rel="noopener">${brand('whatsapp')}<span>WhatsApp</span></a>
  ${bookBtn(lang, t.book, 'bar__book')}
</nav>

<dialog class="sheet" id="booking" aria-labelledby="booking-title">
  <div class="sheet__bar">
    <h2 class="sheet__title" id="booking-title">${t.book}</h2>
    <a class="sheet__tool" href="tel:${SITE.phoneRaw}" aria-label="${t.call}">${icon('phone', 'icon icon--sm')}<span>${t.call}</span></a>
    <a class="sheet__tool" href="${waLink()}" rel="noopener" aria-label="WhatsApp">${brand('whatsapp', 'icon icon--sm')}<span>${t.sheet.help}</span></a>
    <a class="sheet__tool sheet__ext" href="${engine}" target="_blank" rel="noopener">${icon('external', 'icon icon--sm')}<span>${t.sheet.newTab}</span></a>
    <button class="sheet__close" type="button" aria-label="${t.sheet.close}">${icon('close')}</button>
  </div>
  <div class="sheet__body">
    <div class="sheet__loading">
      <span class="spinner" aria-hidden="true"></span>
      <p>${t.sheet.loading}</p>
      <p class="sheet__slow" hidden>${t.sheet.slow}<a class="btn btn--primary" href="${engine}" target="_blank" rel="noopener">${icon('external', 'icon icon--sm')}${t.sheet.newTab}</a></p>
    </div>
    <iframe data-src="${engine}" title="${esc(t.book)} — ${SITE.name}" allow="payment *"></iframe>
  </div>
</dialog>
</body>
</html>
`;
}

// ---------- blocos ----------

const guestsLabel = (p) => (p.guests[1] ? `${p.guests[0]} + ${p.guests[1]}` : `${p.guests[0]}`);

// Pessoas, quartos, casas de banho e área, com ícones. compact: só números (cartões).
function facts(p, lang, { compact = false } = {}) {
  const t = T[lang];
  const items = [
    ['guests', guestsLabel(p), `${guestsLabel(p)} ${t.guests}`],
    ['bed', p.rooms.length, t.rooms(p.rooms.length)],
    ['bath', p.bathrooms, t.baths(p.bathrooms)],
    p.area && ['area', `${p.area} m²`, `${p.area} m²`],
  ].filter(Boolean);
  return `<ul class="facts${compact ? ' facts--compact' : ''}">${items.map(([ic, short, long]) =>
    compact
      ? `<li title="${esc(long)}">${icon(ic, 'icon icon--sm')}<span aria-hidden="true">${short}</span><span class="sr-only">${esc(long)}</span></li>`
      : `<li>${icon(ic, 'icon icon--sm')}<span>${long}</span></li>`).join('')}</ul>`;
}

// Ícones das comodidades principais (cartões).
const amenityIcons = (p, lang, n = 4) =>
  `<ul class="am-icons">${p.amenities.slice(0, n).map((a) => `<li title="${esc(T[lang].am[a])}">${icon(a, 'icon icon--sm')}<span class="sr-only">${esc(T[lang].am[a])}</span></li>`).join('')}</ul>`;

function card(p, lang) {
  const t = T[lang];
  return `<a class="card" href="${ROUTES[p.id][lang]}">
  <div class="card__img">
    ${img(p.id, p.featured[0], { alt: `${p.name}, ${EXTRA[lang].stayIn} ${LOCATIONS[p.location].address}`, sizes: '(min-width: 900px) 560px, 84vw' })}
  </div>
  <div class="card__body">
    <h3 class="card__title">${esc(p.name)}</h3>
    ${facts(p, lang, { compact: true })}
    ${amenityIcons(p, lang)}
  </div>
</a>`;
}

const placeName = (k, lang) => T[lang].place[k] ?? k;
const distList = (k, lang) => `<ul>${LOCATIONS[k].distances.map(([km, n]) => `<li><span>${placeName(n, lang)}</span><b>${typeof km === 'number' ? `${km} km` : km}</b></li>`).join('')}</ul>`;

// Mapa + botões Google Maps e Waze (com logótipos).
function mapBlock(k, lang) {
  const l = LOCATIONS[k];
  return `<div class="map">
  <div class="map__frame"><iframe src="${l.embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${esc(l.address)}" allowfullscreen></iframe></div>
  <div class="map__info">
    <p class="map__title">${icon('pin', 'icon icon--sm')}${l.address}</p>
    <div class="map__actions">
      <a class="btn btn--line btn--lg" href="${googleMapsDir(l.geo)}" rel="noopener">${brand('gmaps')}<span>Google Maps</span></a>
      <a class="btn btn--line btn--lg" href="${wazeDir(l.geo)}" rel="noopener">${brand('waze')}<span>Waze</span></a>
    </div>
  </div>
</div>`;
}

// ---------- páginas ----------

function homePage(lang) {
  const t = T[lang];
  const body = `
<section class="hero">
  ${img(...HERO, { alt: `${SITE.name}, Rebordosa, Paredes`, sizes: HERO_SIZES, eager: true, cls: 'hero__img' })}
  <div class="wrap hero__content">
    <h1 class="hero__title">${SITE.name}</h1>
    <p class="hero__text">${t.hero}</p>
    <p class="hero__note">${icon('check', 'icon icon--xs')}${EXTRA[lang].direct}</p>
  </div>
</section>

<div class="wrap quick">
  ${picker(lang, Math.max(...PROPERTIES.map((p) => p.guests[0] + p.guests[1])), 'picker--wide')}
  <a class="quick__link" href="tel:${SITE.phoneRaw}">
    ${icon('phone', 'icon quick__icon')}
    <span><small>${t.phoneLabel}</small><b>${SITE.phone}</b></span>
  </a>
  <a class="quick__link" href="${waLink()}" rel="noopener">
    ${brand('whatsapp', 'icon quick__icon')}
    <span><small>WhatsApp</small><b>${SITE.phone}</b></span>
  </a>
</div>

<section class="section" id="localizacao">
  <div class="wrap">
    <h2 class="h2">${t.directions}</h2>
    <div class="where">
      ${mapBlock('porto', lang)}
      <div class="dist"><h3 class="dist__title">${t.distances}</h3>${distList('porto', lang)}</div>
    </div>
  </div>
</section>

<section class="section section--tint" id="casas">
  <div class="wrap">
    <h2 class="h2">${t.houses}</h2>
  </div>
  <div class="rail rail--3">${PROPERTIES.map((p) => card(p, lang)).join('')}</div>
  <div class="wrap">${ours(lang)}</div>
</section>`;

  return layout({
    lang, key: 'home', title: t.seo.homeTitle, description: t.seo.homeDesc, body,
    preload: `<link rel="preload" as="image" imagesrcset="${srcsetOf(...HERO)}" imagesizes="${HERO_SIZES}" fetchpriority="high">`,
    jsonld: {
      '@context': 'https://schema.org',
      ...business(lang),
      description: t.seo.homeDesc,
      containsPlace: PROPERTIES.map((p) => accommodation(p, lang)),
    },
  });
}

// Camas por quarto + sofás-cama na sala.
function bedList(p, lang) {
  const t = T[lang];
  const rooms = p.rooms.map((b, i) => `<li>${icon(b, 'icon beds__icon')}<span><small>${t.room(i + 1)}</small>${t.bed[b]}</span></li>`);
  if (p.sofas) rooms.push(`<li>${icon('sofa', 'icon beds__icon')}<span><small>${t.living}</small>${p.sofas > 1 ? `${p.sofas} × ` : ''}${t.bed.sofa}</span></li>`);
  return `<ul class="beds">${rooms.join('')}</ul>`;
}

function propertyPage(p, lang, { standalone = false } = {}) {
  const t = T[lang];
  const all = photosOf(p);
  const total = all.length;
  // Ex.: "Sala — Casa 61, alojamento local em Rebordosa, Paredes, Porto"
  const x = EXTRA[lang];
  const alt = (n) => `${p.scenes?.[n] ? `${x.room[p.scenes[n]]} — ` : ''}${p.name}, ${x.stayIn} ${LOCATIONS[p.location].address}`;
  const [main, ...rest] = p.featured;
  const others = PROPERTIES.filter((o) => o.id !== p.id);
  const loc = LOCATIONS[p.location];
  const kind = t.kind[p.kind];
  // No telemóvel começa pelas fotos em destaque e depois as restantes.
  const order = [...p.featured, ...all.filter((n) => !p.featured.includes(n))];
  const summary = `${kind} · ${t.rooms(p.rooms.length)} · ${guestsLabel(p)} ${t.guests} · ${loc.address}`;

  // Lista de fotos para a galeria em ecrã inteiro (lida pelo main.js).
  const gallery = order.map((n) => ({
    src: imgPath(p.id, n, 1920),
    srcset: WIDTHS.map((w) => `${imgPath(p.id, n, w)} ${webpSize(join(STATIC, imgPath(p.id, n, w)))[0]}w`).join(', '),
  }));

  const body = `
<div class="gallery" data-gallery='${JSON.stringify(gallery)}'>
  <div class="carousel">
    <div class="carousel__track">
      ${order.map((n, i) => `<button class="carousel__item" data-open="${i}">${img(p.id, n, { alt: alt(n), sizes: `(min-width: 768px) 1px, ${i === 0 ? '340px' : '100vw'}`, eager: i === 0, late: i > 0 })}</button>`).join('')}
    </div>
    <span class="carousel__count" aria-hidden="true"><span data-count>1</span> / ${total}</span>
  </div>
  <div class="wrap mosaic">
    <button class="mosaic__item mosaic__item--main" data-open="0">${img(p.id, main, { alt: alt(main), sizes: '(min-width: 768px) 60vw, 1px' })}</button>
    ${rest.map((n, i) => `<button class="mosaic__item" data-open="${i + 1}">${img(p.id, n, { alt: alt(n), sizes: '(min-width: 768px) 20vw, 1px' })}</button>`).join('')}
    <button class="btn btn--glass mosaic__all" data-open="0">${icon('grid', 'icon icon--sm')}${t.photos(total)}</button>
  </div>
</div>

<div class="wrap prop">
  <div class="prop__head">
    ${standalone ? '' : `<nav class="crumbs" aria-label="breadcrumb"><a href="${ROUTES.home[lang]}#casas">${t.houses}</a> / <span>${esc(p.name)}</span></nav>`}
    <h1 class="h1">${esc(p.name)}</h1>
    <p class="prop__place">${kind} · <a href="#localizacao">${icon('pin', 'icon icon--xs')}${loc.address}</a></p>
    ${facts(p, lang)}
  </div>

  <aside class="prop__aside">
    <div class="book-card">
      <p class="book-card__name">${esc(p.name)}</p>
      ${picker(lang, p.guests[0] + p.guests[1])}
      <div class="book-card__row">
        <a class="btn btn--line" href="tel:${SITE.phoneRaw}">${icon('phone', 'icon icon--sm')}${t.call}</a>
        <a class="btn btn--line" href="${waLink(t.waText(p.name))}" rel="noopener">${brand('whatsapp', 'icon icon--sm')}WhatsApp</a>
      </div>
      <p class="direct">${icon('check', 'icon icon--xs')}${EXTRA[lang].direct}</p>
      ${platforms(p, lang)}
    </div>
  </aside>

  <div class="prop__main">
    <section class="block block--first">
      <h2 class="h3">${t.amenities}</h2>
      <ul class="amenities">${p.amenities.map((a) => `<li>${icon(a)}<span>${t.am[a]}</span></li>`).join('')}</ul>
    </section>
    <section class="block">
      <h2 class="h3">${t.beds}</h2>
      ${bedList(p, lang)}
    </section>
    ${p.video ? `<section class="block">
      <h2 class="h3">${t.video}</h2>
      <video class="video" controls preload="none" playsinline poster="/video/${p.video}.webp"><source src="/video/${p.video}.mp4" type="video/mp4"></video>
    </section>` : ''}
    <section class="block" id="localizacao">
      <h2 class="h3">${t.directions}</h2>
      ${mapBlock(p.location, lang)}
    </section>
  </div>
</div>

${standalone ? standaloneExtra(p, lang) : `<section class="section section--tint">
  <div class="wrap"><h2 class="h2">${t.others}</h2></div>
  <div class="rail">${others.map((o) => card(o, lang)).join('')}</div>
</section>`}

<dialog class="lightbox" aria-label="${esc(p.name)}">
  <img class="lightbox__img" alt="">
  <p class="lightbox__count"></p>
  <button class="lightbox__btn lightbox__close" aria-label="${t.lightbox.close}">${icon('close')}</button>
  <button class="lightbox__btn lightbox__prev" aria-label="${t.lightbox.prev}">‹</button>
  <button class="lightbox__btn lightbox__next" aria-label="${t.lightbox.next}">›</button>
</dialog>`;

  return layout({
    lang, key: standalone ? 'home' : p.id,
    title: standalone ? t.seo.bunTitle : `${t.seo.propTitle(p.name, t.rooms(p.rooms.length))} | ${SITE.name}`,
    description: standalone ? t.seo.bunDesc : t.seo.propDesc(p.name, t.rooms(p.rooms.length), p.guests[0] + p.guests[1]),
    image: imgPath(p.id, main, 1920), body,
    jsonld: standalone
      ? { '@context': 'https://schema.org', ...business(lang), description: t.seo.bunDesc, containsPlace: [accommodation(p, lang)] }
      : {
        '@context': 'https://schema.org',
        '@graph': [
          { ...accommodation(p, lang), containedInPlace: { '@id': `${SITE.url}/#business` } },
          { ...business(lang) },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: SITE.name, item: SITE.url + ROUTES.home[lang] },
              { '@type': 'ListItem', position: 2, name: p.name, item: SITE.url + ROUTES[p.id][lang] },
            ],
          },
        ],
      },
  });
}

// ---------- dados estruturados (Google) ----------

// O alojamento (Casa da Petisqueira ou o bungalow): morada, contactos, horas de entrada e saída.
function business(lang) {
  const loc = LOCATIONS[CFG.location];
  const address = CFG.location === 'porto'
    ? { streetAddress: 'Rua de Santa Luzia 61', postalCode: '4585-447', addressLocality: 'Rebordosa, Paredes', addressRegion: 'Porto' }
    : { addressLocality: 'Folgosa da Madalena, Seia', addressRegion: 'Guarda' };
  const all = [...new Set(PROPERTIES.flatMap((p) => p.amenities))];
  return {
    '@type': 'LodgingBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    url: SITE.url + ROUTES.home[lang],
    telephone: SITE.phoneRaw,
    email: SITE.email,
    image: SITE.url + imgPath(...HERO, 1920),
    logo: SITE.url + (IS_BUNGALOW ? '/marca-bungalow/logo-840.webp' : '/img/logo.webp'),
    areaServed: IS_BUNGALOW ? ['Seia', 'Serra da Estrela'] : ['Rebordosa', 'Paredes', 'Porto'],
    address: { '@type': 'PostalAddress', ...address, addressCountry: 'PT' },
    geo: { '@type': 'GeoCoordinates', latitude: loc.geo[0], longitude: loc.geo[1] },
    hasMap: loc.maps,
    checkinTime: '16:00',
    checkoutTime: '11:00',
    amenityFeature: all.map((a) => ({ '@type': 'LocationFeatureSpecification', name: T.en.am[a], value: true })),
    sameAs: IS_BUNGALOW ? PROPERTIES.flatMap((p) => [`${p.booking}.html`, p.airbnb, p.expedia].filter(Boolean)) : [SITE.facebook],
  };
}

// O nome do site, para o Google o mostrar nos resultados ("site oficial").
function website(lang) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: SITE.url + ROUTES.home[lang], inLanguage: lang, publisher: { '@id': `${SITE.url}/#business` } };
}

// Cada casa: quartos, camas, lotação, área e comodidades.
function accommodation(p, lang) {
  const t = T[lang];
  const loc = LOCATIONS[p.location];
  return {
    '@type': p.kind === 'apartment' ? 'Apartment' : 'Accommodation',
    name: p.name,
    url: SITE.url + (ROUTES[p.id]?.[lang] ?? ROUTES.home[lang]),
    description: p.kind === 'apartment' ? t.seo.propDesc(p.name, t.rooms(p.rooms.length), p.guests[0] + p.guests[1]) : t.seo.bunDesc,
    image: p.featured.map((n) => SITE.url + imgPath(p.id, n, 1920)),
    numberOfRooms: p.rooms.length,
    numberOfBedrooms: p.rooms.length,
    numberOfBathroomsTotal: p.bathrooms,
    occupancy: { '@type': 'QuantitativeValue', maxValue: p.guests[0] + p.guests[1] },
    bed: [
      ...p.rooms.map((b) => ({ '@type': 'BedDetails', numberOfBeds: b === 'twin' ? 2 : 1, typeOfBed: b === 'twin' ? 'Single' : 'Double' })),
      ...(p.sofas ? [{ '@type': 'BedDetails', numberOfBeds: p.sofas, typeOfBed: 'Sofa bed' }] : []),
    ],
    amenityFeature: p.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: T.en.am[a], value: true })),
    ...(p.area && { floorSize: { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' } }),
    geo: { '@type': 'GeoCoordinates', latitude: loc.geo[0], longitude: loc.geo[1] },
  };
}

function contactList(lang) {
  const c = T[lang].contact;
  const item = (ic, label, value, href) => `<a class="contact" href="${href}"${href.startsWith('http') ? ' rel="noopener"' : ''}>${contactIcon(ic, 'icon quick__icon')}<span><small>${label}</small><b>${value}</b></span></a>`;
  return `<div class="contacts">
    ${item('phone', c.phone, SITE.phone, `tel:${SITE.phoneRaw}`)}
    ${item('whatsapp', 'WhatsApp', SITE.phone, waLink())}
    ${item('mail', c.email, SITE.email, `mailto:${SITE.email}`)}
    ${IS_BUNGALOW ? '' : item('facebook', 'Facebook', 'Casa da Petisqueira', SITE.facebook)}
  </div>`;
}

// Locais da Serra: cartões com foto e botão de caminho desde o bungalow.
function spots(lang) {
  const from = LOCATIONS[SITES.bungalow.location].geo.join(',');
  const dir = (q) => `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${encodeURIComponent(q)}`;
  return `<ul class="places">${REGION.places.map((s) => `<li class="place">
      ${img('serra', s.photo, { alt: `${s.name}, Serra da Estrela`, sizes: '(min-width: 1100px) 360px, (min-width: 640px) 50vw, 340px' })}
      <div class="place__body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.t[lang])}</p>
        <a class="place__go" href="${dir(s.q)}" rel="noopener">${brand('gmaps', 'icon icon--sm')}${T[lang].directions}</a>
      </div>
    </li>`).join('')}</ul>`;
}

// O outro sítio do mesmo dono (sítios diferentes, sem relação; só uma recomendação discreta).
function ours(lang) {
  const x = EXTRA[lang];
  const logo = IS_BUNGALOW
    ? '<img src="/img/logo.webp" width="361" height="226" alt="" loading="lazy" decoding="async">'
    : '<img src="/marca-bungalow/logo-420.webp" width="420" height="238" alt="" loading="lazy" decoding="async">';
  return `<a class="ours" href="${otherSiteHref(lang)}" rel="noopener">
    <span class="ours__logo">${logo}</span>
    <span class="ours__text"><small>${x.ours}</small><b>${esc(OTHER.name)}</b><span>${IS_BUNGALOW ? x.farCasas : x.farBungalow}</span></span>
    ${icon('arrow')}
  </a>`;
}

// Fim da página do bungalow: fotos da Serra (levam à página dela) ao lado das distâncias; contactos.
function standaloneExtra(p, lang) {
  const t = T[lang], x = EXTRA[lang];
  const ph = REGION.photos.slice(0, 5);
  return `<section class="section section--tint" id="serra">
  <div class="wrap">
    <div class="sec-head"><h2 class="h2">Serra da Estrela</h2><p>${icon('mountain', 'icon icon--sm')}${x.from}</p></div>
    <div class="where">
      <a class="teaser" href="${ROUTES.serra[lang]}">
        ${ph.map((f, i) => `<span class="teaser__item">${img('serra', f.n, { alt: `${f.place}, Serra da Estrela`, sizes: i ? '(min-width: 900px) 13vw, 120px' : '(min-width: 900px) 30vw, 340px' })}</span>`).join('')}
        <span class="btn btn--glass teaser__all">${icon('grid', 'icon icon--sm')}${x.see} →</span>
      </a>
      <div class="dist"><h3 class="dist__title">${t.distances}</h3>${distList(p.location, lang)}</div>
    </div>
  </div>
</section>
<section class="section" id="contacto">
  <div class="wrap">
    <h2 class="h2">${t.contact.title}</h2>
    ${contactList(lang)}
    ${ours(lang)}
  </div>
</section>`;
}

// Página "Serra da Estrela" (só no site do bungalow): galeria em mosaico, locais e reserva.
function serraPage(lang) {
  const t = T[lang], x = EXTRA[lang], p = PROPERTIES[0];
  const photos = REGION.photos;
  const alt = (f) => `${f.place}, Serra da Estrela`;
  const gallery = photos.map((f) => ({ src: imgPath('serra', f.n, 1920), srcset: srcsetOf('serra', f.n) }));
  // Padrão de tamanhos que se repete: dá um mosaico vivo sem buracos (grid dense).
  const shapes = photos.slice(1).map((_, i) => ['big', '', '', 'wide', '', '', 'wide', '', '', ''][i % 10]);
  const cells = () => shapes.reduce((n, s) => n + (s === 'big' ? 4 : s === 'wide' ? 2 : 1), 0);
  for (let i = shapes.length - 1; cells() % 4 && i >= 0; i--) if (!shapes[i]) shapes[i] = 'wide';
  const shape = (i) => shapes[i];
  const body = `
<section class="hero hero--serra">
  ${img('serra', photos[0].n, { alt: alt(photos[0]), sizes: HERO_SIZES, eager: true, cls: 'hero__img' })}
  <div class="wrap hero__content">
    <h1 class="hero__title">Serra da Estrela</h1>
    <p class="hero__text">${icon('mountain', 'icon icon--sm')} ${x.from}</p>
    ${bookBtn(lang, t.book, 'btn btn--primary btn--lg')}
  </div>
</section>

<section class="section">
  <div class="wrap gallery" data-gallery='${JSON.stringify(gallery)}'>
    <h2 class="sr-only">${x.see}</h2>
    <div class="mosaic-serra">
      ${photos.slice(1).map((f, i) => `<button class="ms ${shape(i) ? `ms--${shape(i)}` : ''}" data-open="${i + 1}">${img('serra', f.n, { alt: alt(f), sizes: shape(i) ? '(min-width: 768px) 50vw, 340px' : '(min-width: 768px) 25vw, 160px', late: true })}<span>${esc(f.place)}</span></button>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <h2 class="h2">${x.places}</h2>
    ${spots(lang)}
  </div>
</section>

<section class="section">
  <div class="wrap cta">
    <img src="/marca-bungalow/logo-420.webp" srcset="/marca-bungalow/logo-420.webp 420w, /marca-bungalow/logo-840.webp 840w" sizes="260px" width="420" height="238" alt="${SITE.name}" loading="lazy">
    <div class="cta__actions">
      ${bookBtn(lang, t.book, 'btn btn--primary btn--lg')}
      <a class="btn btn--line btn--lg" href="${waLink(t.waText(p.name))}" rel="noopener">${brand('whatsapp', 'icon icon--sm')}WhatsApp</a>
    </div>
    <details class="credits"><summary>${x.credits}: Wikimedia Commons</summary>
      <ul>${photos.map((f) => `<li>${esc(f.place)}: <a href="${f.page}" rel="noopener">${esc(f.author)}</a>, <a href="${f.licUrl}" rel="noopener license">${esc(f.license)}</a></li>`).join('')}</ul>
    </details>
  </div>
</section>

<dialog class="lightbox" aria-label="Serra da Estrela">
  <img class="lightbox__img" alt="">
  <p class="lightbox__count"></p>
  <button class="lightbox__btn lightbox__close" aria-label="${t.lightbox.close}">${icon('close')}</button>
  <button class="lightbox__btn lightbox__prev" aria-label="${t.lightbox.prev}">‹</button>
  <button class="lightbox__btn lightbox__next" aria-label="${t.lightbox.next}">›</button>
</dialog>`;

  const url = SITE.url + ROUTES.serra[lang];
  return layout({
    lang, key: 'serra', title: x.serraTitle, description: x.serraDesc, body,
    image: imgPath('serra', photos[0].n, 1920),
    preload: `<link rel="preload" as="image" imagesrcset="${srcsetOf('serra', photos[0].n)}" imagesizes="${HERO_SIZES}" fetchpriority="high">`,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': url, url, name: x.serraTitle, description: x.serraDesc, inLanguage: t.htmlLang,
          about: { '@type': 'Place', name: 'Serra da Estrela', geo: { '@type': 'GeoCoordinates', latitude: 40.3217, longitude: -7.6114 } },
          isPartOf: { '@id': `${SITE.url}/#business` } },
        ...REGION.places.map((s) => ({ '@type': 'TouristAttraction', name: s.name, description: s.t[lang], hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.q)}` })),
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: SITE.url + ROUTES.home[lang] },
          { '@type': 'ListItem', position: 2, name: 'Serra da Estrela', item: url },
        ] },
      ],
    },
  });
}

function contactPage(lang) {
  const t = T[lang];
  const body = `
<div class="wrap page">
  <h1 class="h1">${t.contact.title}</h1>
  ${contactList(lang)}
  <h2 class="h2">${t.directions}</h2>
  ${mapBlock(CFG.location, lang)}
</div>`;
  return layout({ lang, key: 'contact', title: `${t.contact.title} · ${SITE.name}, Rebordosa, Paredes`, description: `${t.meta.contact} ${t.hero}`, body });
}

// Página /reservar: o Amenitiz ocupa o ecrã todo.
function bookingPage(lang) {
  const t = T[lang];
  const engine = SITE.bookingEngine(lang);
  const body = `
<h1 class="sr-only">${t.book}</h1>
<div class="booking-frame">
  <iframe src="${engine}" title="${esc(t.book)} — ${SITE.name}" allow="payment *"></iframe>
</div>
<div class="wrap booking-alt">
  <a class="btn btn--line" href="${engine}" target="_blank" rel="noopener">${icon('external', 'icon icon--sm')}${t.sheet.newTab}</a>
  <a class="btn btn--line" href="${waLink()}" rel="noopener">${brand('whatsapp', 'icon icon--sm')}${t.sheet.help}</a>
  ${PROPERTIES.map((p) => bookingComBtn(p, lang, p.name)).join('')}
</div>`;
  return layout({ lang, key: 'booking', title: `${t.book} · ${SITE.name}, Rebordosa, Paredes`, description: `${t.meta.booking} ${t.hero}`, body });
}

function notFoundPage() {
  const body = `<div class="wrap page page--center">
  <h1 class="h2">${T.en.notFound.title}</h1>
  <div class="notfound">${LANGS.map((l) => `<a class="btn btn--line" href="${ROUTES.home[l]}" lang="${T[l].htmlLang}">${flag(l)}${T[l].notFound.back}</a>`).join('')}</div>
</div>`;
  return layout({ lang: 'en', key: null, title: `404 | ${SITE.name}`, description: T.en.notFound.title, body });
}

// Link para o outro site. Enquanto o site do bungalow não estiver publicado, vai para a página dele no Booking.com.
const bungalowHref = (lang) => SITES.bungalow.live
  ? SITES.bungalow.url + MAIN_ROUTES.home[lang]
  : SITE.bookingCom(ALL_PROPERTIES.find((p) => p.id === SITES.bungalow.properties[0]).booking, lang);
const otherSiteHref = (lang) => (IS_BUNGALOW ? OTHER.url + MAIN_ROUTES.home[lang] : bungalowHref(lang));

const redirectPage = (target) => { const to = target.startsWith('BUNGALOW:') ? bungalowHref(LANGS.find((l) => MAIN_ROUTES.home[l] === target.slice(9)) ?? 'pt') : target; const abs = to.startsWith('http') ? to : SITE.url + to; return `<!doctype html><html><head><meta charset="utf-8"><title>${SITE.name}</title><link rel="canonical" href="${abs}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${abs}</a></body></html>`; };

// ---------- build ----------

// Copia static/ sem as fotos e vídeos das casas que não pertencem a este site.
function copyStatic() {
  const skip = ALL_PROPERTIES.filter((p) => !CFG.properties.includes(p.id));
  const skipDirs = skip.map((p) => join(STATIC, 'img', p.id));
  const skipVideos = skip.filter((p) => p.video).map((p) => join(STATIC, 'video', p.video));
  cpSync(STATIC, DIST, {
    recursive: true,
    filter: (src) => (IS_BUNGALOW || !src.startsWith(join(STATIC, 'img', 'serra'))) && !skipDirs.some((d) => src === d || src.startsWith(d + '/')) && !skipVideos.some((v) => src.startsWith(v + '.')),
  });
}

function buildSite(key) {
  useSite(key);
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  copyStatic();
  // O bungalow tem os seus próprios ícones (monograma EB).
  if (IS_BUNGALOW) for (const f of ['favicon.ico', 'favicon-192.png', 'apple-touch-icon.png']) cpSync(join(STATIC, 'marca-bungalow', f), join(DIST, f));
  write('assets/styles.css', css);
  write('assets/main.js', js);

  for (const lang of LANGS) {
    if (IS_BUNGALOW) {
      write(ROUTES.home[lang], propertyPage(PROPERTIES[0], lang, { standalone: true }));
      write(ROUTES.serra[lang], serraPage(lang));
      continue;
    }
    write(ROUTES.home[lang], homePage(lang));
    write(ROUTES.contact[lang], contactPage(lang));
    write(ROUTES.booking[lang], bookingPage(lang));
    for (const p of PROPERTIES) write(ROUTES[p.id][lang], propertyPage(p, lang));
  }
  const urls = Object.keys(ROUTES).flatMap((k) => LANGS.map((l) => ROUTES[k][l]));
  const redirects = IS_BUNGALOW ? {} : REDIRECTS;
  for (const [from, to] of Object.entries(redirects)) write(from, redirectPage(to));
  write('404.html', notFoundPage());

  // Fotos de cada página no sitemap (pesquisa de imagens do Google).
  const photosOf = (k) => {
    const p = PROPERTIES.find((x) => x.id === k) ?? (k === 'home' && IS_BUNGALOW ? PROPERTIES[0] : null);
    if (p) return photosOf(p).map((n) => imgPath(p.id, n, 1920));
    if (k === 'serra') return REGION.photos.map((f) => imgPath('serra', f.n, 1920));
    return k === 'home' ? [imgPath(HERO[0], HERO[1], 1920)] : [];
  };
  const images = (k) => photosOf(k).map((u) => `<image:image><image:loc>${SITE.url}${u}</image:loc></image:image>`).join('');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.keys(ROUTES).flatMap((k) => LANGS.map((l) => `  <url><loc>${SITE.url}${ROUTES[k][l]}</loc>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${T[a].htmlLang}" href="${SITE.url}${ROUTES[k][a]}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE.url}${ROUTES[k].en}"/><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>${images(k)}</url>`)).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
  write('.nojekyll', '');
  write('site.webmanifest', JSON.stringify({ name: SITE.name, short_name: IS_BUNGALOW ? 'Eco Bungalow' : SITE.name, start_url: '/', display: 'browser', background_color: IS_BUNGALOW ? '#f3eadb' : '#faf7f3', theme_color: IS_BUNGALOW ? '#2f4a37' : '#7d2632', icons: [{ src: '/favicon-192.png', sizes: '192x192', type: 'image/png' }] }));
  if (CFG.cname !== false) write('CNAME', new URL(SITE.url).hostname + '\n');

  console.log(`✓ ${CFG.out}/: ${urls.length} páginas + ${Object.keys(redirects).length} redirecionamentos`);
}

buildSite('casas');
buildSite('bungalow');
