// Conteúdo do site: contactos, casas e textos em 8 línguas.
// Para mudar um texto, edite aqui e corra `npm run build`.

// Línguas do site, pela ordem do menu. A primeira visita escolhe a do telemóvel/computador; senão inglês.
export const LANGS = ['en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl'];

// Sufixo de língua das páginas do Booking.com.
const BOOKING_LANG = { pt: 'pt-pt', en: 'en-gb', es: 'es', fr: 'fr', de: 'de', it: 'it', nl: 'nl', pl: 'pl' };

export const SITE = {
  url: 'https://casadapetisqueira.com',
  name: 'Casa da Petisqueira',
  phone: '+351 919 425 125',
  phoneRaw: '+351919425125',
  whatsapp: '351919425125',
  email: 'casadapetisqueira@gmail.com',
  facebook: 'https://www.facebook.com/people/Casa-da-Petisqueira/100085431469542/',
  // Sem datas abre no passo de escolher datas e pessoas (#DatesGuests-BE).
  // Com ?start_date=AAAA-MM-DD&end_date=…&adults=N&children=N abre logo a lista de casas com preços (#RoomSelection-BE).
  bookingEngineBase: (lang) => `https://casa-da-petisqueira.amenitiz.io/${lang}/booking/room`,
  bookingEngine: (lang) => `https://casa-da-petisqueira.amenitiz.io/${lang}/booking/room#DatesGuests-BE`,
  // Nota no rodapé: quem fez e mantém o site.
  dev: { name: 'Leandro Moreira', role: 'Software Engineer', site: 'https://leandromoreira.pt' },
  bookingCom: (base, lang) => `${base}.${BOOKING_LANG[lang] ?? 'en-gb'}.html`,
};

export const LOCATIONS = {
  porto: {
    maps: 'https://maps.app.goo.gl/DUYhV2oWHg5ivuF38',
    embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d376.62!2d-8.40183881592977!3d41.22728451380961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd248b27ad9c5cff%3A0xb9b17e1838074910!2sCasa+Da+Petisqueira!5e0!3m2!1spt!2spt!4v1749587958000!5m2!1spt!2spt',
    geo: [41.22728451380961, -8.40183881592977],
    address: 'Rebordosa, Paredes, Porto',
    // [km (ou texto, ex. '30 min'), chave em T[lang].place ou nome próprio]
    distances: [[4, 'Paredes'], [10, 'Paços de Ferreira'], [15, 'Penafiel'], [25, 'Porto'], [30, 'airport'], [39, 'Amarante'], [43, 'Guimarães'], [45, 'beach'], [60, 'douro']],
  },
  seia: {
    maps: 'https://maps.app.goo.gl/FHEMChCHV4iTKqAZA',
    embed: 'https://maps.google.com/maps?q=40.41847021539861,-7.7550886249468025&z=13&output=embed',
    geo: [40.41847021539861, -7.7550886249468025],
    address: 'Folgosa da Madalena, Seia, Serra da Estrela',
    distances: [[7, 'Seia'], [21, 'Sabugueiro'], [22, 'Gouveia'], ['30 min', 'Serra da Estrela'], [32, 'park'], [33, 'Live Beach Mangualde'], [35, 'Torre'], [35, 'spa'], [52, 'aerodrome']],
  },
};

// Links de navegação (abrem a app no telemóvel).
export const googleMapsDir = ([lat, lng]) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
export const wazeDir = ([lat, lng]) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

// Os dois sites gerados. Mudar `url` quando o domínio do bungalow estiver escolhido.
export const SITES = {
  casas: {
    out: 'dist',
    url: 'https://casadapetisqueira.com',
    name: 'Casa da Petisqueira',
    properties: ['casa-61', 'casa-88', 'casa-54'],
    location: 'porto',
    hero: ['casa-88', 16],
  },
  bungalow: {
    out: 'dist-bungalow',
    url: 'https://bungalowserraestrela.com',
    // Publicado pelo repositório aishend/bungalow-serra-estrela (ver .github/bungalow-deploy.yml).
    live: true,
    name: 'Eco Bungalow da Serra da Estrela',
    properties: ['bungalow-seia'],
    location: 'seia',
    hero: ['bungalow-seia', 51],
  },
};

// Partes dos URLs em cada língua: [início, contacto, reservar, casas, casa]. pt/en/fr mantêm os URLs do site antigo.
const SLUGS = {
  pt: ['/', 'contacto', 'reservar', 'propriedades', 'apartamento'],
  en: ['/en/', 'contact', 'booking', 'properties', 'house'],
  es: ['/es/', 'contacto', 'reservar', 'alojamientos', 'casa'],
  fr: ['/fr/', 'contact', 'reserver', 'proprietes', 'maison'],
  de: ['/de/', 'kontakt', 'buchen', 'unterkuenfte', 'haus'],
  it: ['/it/', 'contatti', 'prenota', 'alloggi', 'casa'],
  nl: ['/nl/', 'contact', 'boeken', 'accommodaties', 'huis'],
  pl: ['/pl/', 'kontakt', 'rezerwacja', 'obiekty', 'dom'],
};
const route = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(...SLUGS[l])]));

// Caminho de cada página em cada língua.
export const ROUTES = {
  home: route((b) => b),
  contact: route((b, c) => `${b}${c}/`),
  booking: route((b, c, r) => `${b}${r}/`),
  ...Object.fromEntries(['61', '88', '54'].map((n) => [`casa-${n}`, route((b, c, r, p, h) => `${b}${p}/${h}-${n}/`)])),
};

// URLs antigos que deixaram de ser páginas próprias -> para onde redirecionam.
export const REDIRECTS = {
  // O bungalow tem agora site próprio
  '/propriedades/contentor-seia/':     'BUNGALOW:/',
  '/en/properties/contentor-seia/':   'BUNGALOW:/en/',
  '/fr/proprietes/contentor-seia/':   'BUNGALOW:/fr/',
  '/propriedades/':    '/#casas',
  '/sobre/':           '/',
  '/en/properties/':   '/en/#casas',
  '/en/about/':        '/en/',
  '/fr/proprietes/':   '/fr/#casas',
  '/fr/a-propos/':     '/fr/',
};

// id = pasta em static/img/<id>/ e chave em ROUTES.
// guests: [pessoas em camas, pessoas em sofás-cama]
// rooms: cama de cada quarto (double = casal, twin = duas individuais); sofas: sofás-cama na sala.
// booking / airbnb / expedia: anúncios da casa nessas plataformas (os que faltarem não aparecem).
// amenities: chaves de T[lang].am, pela ordem em que aparecem (as 4 primeiras vão para os cartões).
export const PROPERTIES = [
  {
    id: 'casa-61',
    amenitiz: 62916, // id do quarto no Amenitiz
    name: 'Casa 61',
    kind: 'apartment',
    location: 'porto',
    featured: [37, 25, 11, 3, 16], // capa + 4 fotos em destaque (nº do ficheiro)
    // Fotos escolhidas, pela ordem da galeria (sem repetidas nem fracas). As outras ficam em static/ mas não aparecem.
    photos: [37, 25, 11, 3, 16, 1, 20, 32, 27, 29, 38, 35, 9, 5, 13, 17, 21, 41, 42, 43, 46, 48, 45, 44],
    // O que mostra cada foto (para o texto alternativo que o Google lê).
    scenes: { 37: 'living', 25: 'dining', 11: 'bedroom', 3: 'bedroom', 16: 'bathroom', 1: 'bedroom', 20: 'bedroom', 32: 'living', 27: 'kitchen', 29: 'dining', 38: 'living', 35: 'living', 9: 'bedroom', 5: 'bedroom', 13: 'bedroom', 17: 'bathroom', 21: 'bedroom', 41: 'laundry', 42: 'outside', 43: 'outside', 46: 'area', 48: 'area', 45: 'view', 44: 'area' },
    video: 'casa-61',
    guests: [6, 2],
    typology: 'T3',
    rooms: ['double', 'double', 'twin'],
    sofas: 2,
    bathrooms: 1,
    area: 80,
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'linen', 'washer', 'dishwasher', 'tv'],
    booking: 'https://www.booking.com/hotel/pt/casa-da-petisqueira',
    airbnb: 'https://www.airbnb.com/rooms/52890901',
    expedia: 'https://www.expedia.com/Paredes-Hotels-Casas-Da-Petisqueira-Paredes-Oporto.h99046711.Hotel-Information',
  },
  {
    id: 'casa-88',
    amenitiz: 62917, // id do quarto no Amenitiz
    name: 'Casa 88',
    kind: 'apartment',
    location: 'porto',
    featured: [17, 16, 3, 12, 26],
    // Fotos escolhidas, pela ordem da galeria (sem repetidas nem fracas). As outras ficam em static/ mas não aparecem.
    photos: [17, 16, 3, 12, 26, 14, 19, 21, 23, 4, 5, 13, 8, 9, 36, 1, 29, 33, 35, 32, 31],
    // O que mostra cada foto (para o texto alternativo que o Google lê).
    scenes: { 17: 'kitchen', 16: 'living', 3: 'bedroom', 12: 'bedroom', 26: 'patio', 14: 'living', 19: 'dining', 21: 'living', 23: 'kitchen', 4: 'bedroom', 5: 'bedroom', 13: 'bedroom', 8: 'bathroom', 9: 'bathroom', 36: 'patio', 1: 'patio', 29: 'outside', 33: 'area', 35: 'area', 32: 'view', 31: 'area' },
    video: 'casa-88',
    guests: [4, 2],
    typology: 'T2',
    rooms: ['double', 'twin'],
    sofas: 2,
    bathrooms: 1,
    area: 75,
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'terrace', 'linen', 'washer', 'dishwasher', 'tv'],
    booking: 'https://www.booking.com/hotel/pt/casa-petisqueira-88-paredes-oporto',
    airbnb: 'https://www.airbnb.com/rooms/963762738774530762',
    expedia: 'https://www.expedia.com/Paredes-Hotels-Casa-Da-Petisqueira-88.h97041508.Hotel-Information',
  },
  {
    id: 'casa-54',
    amenitiz: 117371, // id do quarto no Amenitiz
    name: 'Casa 54',
    kind: 'apartment',
    location: 'porto',
    featured: [5, 25, 7, 15, 34],
    // Fotos escolhidas, pela ordem da galeria (sem repetidas nem fracas). As outras ficam em static/ mas não aparecem.
    photos: [5, 25, 7, 15, 34, 29, 27, 14, 58, 31, 42, 9, 11, 20, 1, 2, 23, 33, 35, 22, 21],
    // O que mostra cada foto (para o texto alternativo que o Google lê).
    scenes: { 5: 'living', 25: 'kitchen', 7: 'bedroom', 15: 'bedroom', 34: 'balcony', 29: 'dining', 27: 'kitchen', 14: 'bedroom', 58: 'living', 31: 'living', 42: 'kitchen', 9: 'bedroom', 11: 'bedroom', 20: 'bedroom', 1: 'bathroom', 2: 'bathroom', 23: 'hall', 33: 'balcony', 35: 'balcony', 22: 'outside', 21: 'outside' },
    guests: [4, 2],
    typology: 'T2',
    rooms: ['double', 'twin'],
    sofas: 2,
    bathrooms: 1,
    area: 75,
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'balcony', 'dining', 'linen', 'washer', 'dishwasher', 'tv'],
    booking: 'https://www.booking.com/hotel/pt/casa-da-petisqueira-54-paredes',
    airbnb: 'https://www.airbnb.com/rooms/1349271731704884962',
    expedia: 'https://www.expedia.com/Paredes-Hotels-Casa-Petisqueira-54-Paredes-Oporto.h112919038.Hotel-Information',
  },
  {
    id: 'bungalow-seia',
    amenitiz: 140762, // id do quarto no Amenitiz
    name: 'Eco Bungalow da Serra da Estrela',
    kind: 'bungalow',
    location: 'seia',
    featured: [50, 10, 9, 11, 37],
    // Fotos escolhidas, pela ordem da galeria (sem repetidas nem fracas). As outras ficam em static/ mas não aparecem.
    photos: [50, 10, 9, 1, 11, 51, 2, 5, 6, 8, 15, 17, 19, 4, 12, 21, 52, 37, 41, 45, 46],
    // O que mostra cada foto (para o texto alternativo que o Google lê).
    scenes: { 50: 'outside', 51: 'outside', 52: 'outside', 10: 'bedroom', 9: 'kitchen', 1: 'kitchen', 11: 'bathroom', 2: 'kitchen', 5: 'bedroom', 6: 'bedroom', 8: 'bedroom', 15: 'bedroom', 17: 'bedroom', 19: 'bedroom', 4: 'kitchen', 12: 'bathroom', 21: 'bedroom', 39: 'outside', 37: 'view', 41: 'view', 45: 'area', 46: 'area' },
    guests: [2, 0],
    rooms: ['double'],
    sofas: 0,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'parking', 'forest', 'linen', 'tv'],
    booking: 'https://www.booking.com/hotel/pt/eco-bungalow-com-vista-serra-da-estrela-pinhal',
    expedia: 'https://www.expedia.com/Seia-Hotels-Eco-Bungalow-Vista-Serra-Da-Estrela.h128409174.Hotel-Information',
  },
];

// Plural simples (1 / vários).
const pl = (one, many) => (n) => `${n} ${n === 1 ? one : many}`;
// Polaco: 1 / 2–4 / 5+.
const plPL = (one, few, many) => (n) => `${n} ${n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many}`;

// Textos da interface. `terms`: palavras extra para a pesquisa de língua (nome noutras línguas, países).
export const T = {
  en: {
    htmlLang: 'en', langName: 'English',
    skip: 'Skip to content',
    terms: 'english inglês inglés anglais englisch inglese engels angielski uk united kingdom england usa united states america ireland canada australia new zealand india south africa reino unido inglaterra estados unidos eua irlanda austrália royaume-uni angleterre etats-unis vereinigtes königreich england grossbritannien regno unito inghilterra verenigd koninkrijk engeland wielka brytania anglia',
    search: 'Language or country', menu: 'Menu', noLang: 'Not listed? Use English.',
    nav: { houses: 'Houses', location: 'Location', contact: 'Contact' },
    book: 'Book', call: 'Call',
    mapShort: 'Directions',
    pick: { dates: 'Dates', add: 'Add date', clear: 'Clear', done: 'Done', n1: 'night', n2: 'nights', n5: 'nights', checkin: 'Check-in', checkout: 'Check-out', adults: 'Adults', children: 'Children', go: 'See availability' },
    rights: 'All rights reserved',
    credit: 'Developed and maintained by',
    hero: 'Three apartments in Rebordosa, Paredes, 25 km from Porto.',
    phoneLabel: 'Bookings by phone',
    directions: 'Getting here', houses: 'Houses', distances: 'Distances', others: 'Other houses',
    photos: (n) => `${n} photos`,
    guests: 'guests', rooms: pl('bedroom', 'bedrooms'), baths: pl('bathroom', 'bathrooms'),
    beds: 'Beds', room: (n) => `Bedroom ${n}`, living: 'Living room', amenities: 'Included', video: 'Video',
    bed: { double: 'Double bed', twin: '2 single beds', sofa: 'Sofa bed' },
    am: { wifi: 'Wi-Fi', ac: 'Air conditioning', kitchen: 'Equipped kitchen', parking: 'Parking', linen: 'Bed linen & towels', washer: 'Washing machine', dishwasher: 'Dishwasher', tv: 'TV', terrace: 'Terrace', balcony: 'Balcony', dining: 'Dining room', forest: 'Pine forest' },
    kind: { apartment: 'Apartment', bungalow: 'Bungalow' },
    waText: (name) => `Hello, I would like to check availability for ${name}.`,
    sheet: { close: 'Close', newTab: 'Open in new window', loading: 'Loading…', slow: 'Taking too long?', help: 'Questions?' },
    alsoOn: 'Also on',
    place: { airport: 'Porto Airport', beach: 'Matosinhos Beach', douro: 'Douro Valley', park: 'Serra da Estrela Natural Park', spa: 'Caldas de Manteigas Spa', aerodrome: 'Viseu Aerodrome' },
    meta: { home: 'Three apartments in Rebordosa, Paredes, 25 km from Porto.', contact: 'Phone, WhatsApp, email and address of Casa da Petisqueira.', booking: 'Book at Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Holiday apartments in Rebordosa, near Porto',
      homeDesc: 'Official site. Stays in Rebordosa, Paredes, 25 km from Porto: three apartments for up to 8 guests, Wi-Fi, air conditioning, kitchen and parking. Book direct.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: entire apartment in Rebordosa, Paredes, 25 km from Porto. ${rooms}, up to ${n} guests, Wi-Fi, air conditioning, equipped kitchen and parking.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Accommodation in Seia',
      bunDesc: 'Official site. Stay in Serra da Estrela: Eco Bungalow for 2 in a pine forest in Seia, 30 minutes from the mountain. Kitchen, Wi-Fi and parking. Book direct.',
    },
    contact: { title: 'Contact', phone: 'Phone', email: 'Email' },
    lightbox: { close: 'Close', prev: 'Previous', next: 'Next' },
    notFound: { title: 'Page not found', back: 'Go to home page' },
    otherSite: { bungalow: 'Bungalow in Serra da Estrela', casas: 'Apartments near Porto' },
  },
  pt: {
    htmlLang: 'pt-PT', langName: 'Português',
    skip: 'Saltar para o conteúdo',
    terms: 'portuguese portugués portugais portugiesisch portoghese portugees portugalski portugal brasil brazil angola moçambique mozambique cabo verde portogallo portugalia brasile brésil brasilien brazilië brazylia',
    search: 'Língua ou país', menu: 'Menu', noLang: 'Não encontra? Use inglês.',
    nav: { houses: 'Casas', location: 'Localização', contact: 'Contacto' },
    book: 'Reservar', call: 'Ligar',
    mapShort: 'Como chegar',
    pick: { dates: 'Datas', add: 'Escolher', clear: 'Limpar', done: 'Confirmar', n1: 'noite', n2: 'noites', n5: 'noites', checkin: 'Chegada', checkout: 'Saída', adults: 'Adultos', children: 'Crianças', go: 'Ver disponibilidade' },
    rights: 'Todos os direitos reservados',
    credit: 'Desenvolvido e mantido por',
    hero: 'Três apartamentos em Rebordosa, Paredes, a 25 km do Porto.',
    phoneLabel: 'Reservas por telefone',
    directions: 'Como chegar', houses: 'Casas', distances: 'Distâncias', others: 'Outras casas',
    photos: (n) => `${n} fotos`,
    guests: 'hóspedes', rooms: pl('quarto', 'quartos'), baths: pl('casa de banho', 'casas de banho'),
    beds: 'Camas', room: (n) => `Quarto ${n}`, living: 'Sala', amenities: 'Inclui', video: 'Vídeo',
    bed: { double: 'Cama de casal', twin: '2 camas individuais', sofa: 'Sofá-cama' },
    am: { wifi: 'Wi-Fi', ac: 'Ar condicionado', kitchen: 'Cozinha equipada', parking: 'Estacionamento', linen: 'Roupa de cama e toalhas', washer: 'Máquina de lavar roupa', dishwasher: 'Máquina de lavar loiça', tv: 'TV', terrace: 'Terraço', balcony: 'Varanda', dining: 'Sala de jantar', forest: 'Pinhal' },
    kind: { apartment: 'Apartamento', bungalow: 'Bungalow' },
    waText: (name) => `Olá, gostaria de saber a disponibilidade da ${name}.`,
    sheet: { close: 'Fechar', newTab: 'Abrir em nova janela', loading: 'A carregar…', slow: 'Está a demorar?', help: 'Dúvidas?' },
    alsoOn: 'Também em',
    place: { airport: 'Aeroporto do Porto', beach: 'Praia de Matosinhos', douro: 'Vale do Douro', park: 'Parque Natural da Serra da Estrela', spa: 'Termas de Caldas de Manteigas', aerodrome: 'Aeródromo de Viseu' },
    meta: { home: 'Três apartamentos em Rebordosa, Paredes, a 25 km do Porto.', contact: 'Telefone, WhatsApp, email e morada da Casa da Petisqueira.', booking: 'Reservar na Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Alojamento local em Rebordosa, perto do Porto',
      homeDesc: 'Site oficial. Estadias em Rebordosa, Paredes, a 25 km do Porto: três apartamentos até 8 pessoas, Wi-Fi, ar condicionado, cozinha e estacionamento. Reserva direta.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: apartamento inteiro em Rebordosa, Paredes, a 25 km do Porto. ${rooms}, até ${n} pessoas, Wi-Fi, ar condicionado, cozinha equipada e estacionamento.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Alojamento em Seia',
      bunDesc: 'Site oficial. Estadia na Serra da Estrela: Eco Bungalow para 2 num pinhal em Seia, a 30 minutos da serra. Cozinha, Wi-Fi e estacionamento. Reserva direta.',
    },
    contact: { title: 'Contacto', phone: 'Telefone', email: 'Email' },
    lightbox: { close: 'Fechar', prev: 'Anterior', next: 'Seguinte' },
    notFound: { title: 'Página não encontrada', back: 'Ir para o início' },
    otherSite: { bungalow: 'Bungalow na Serra da Estrela', casas: 'Apartamentos perto do Porto' },
  },
  es: {
    htmlLang: 'es', langName: 'Español',
    skip: 'Saltar al contenido',
    terms: 'spanish espanhol espagnol spanisch spagnolo spaans hiszpański españa espana spain mexico méxico argentina colombia chile peru perú venezuela uruguay ecuador cuba espanha espagne spanien spagna spanje hiszpania méxico mexique mexiko messico meksyk',
    search: 'Idioma o país', menu: 'Menú', noLang: '¿No está? Use inglés.',
    nav: { houses: 'Casas', location: 'Ubicación', contact: 'Contacto' },
    book: 'Reservar', call: 'Llamar',
    mapShort: 'Cómo llegar',
    pick: { dates: 'Fechas', add: 'Elegir', clear: 'Borrar', done: 'Confirmar', n1: 'noche', n2: 'noches', n5: 'noches', checkin: 'Llegada', checkout: 'Salida', adults: 'Adultos', children: 'Niños', go: 'Ver disponibilidad' },
    rights: 'Todos los derechos reservados',
    credit: 'Desarrollado y mantenido por',
    hero: 'Tres apartamentos en Rebordosa, Paredes, a 25 km de Oporto.',
    phoneLabel: 'Reservas por teléfono',
    directions: 'Cómo llegar', houses: 'Casas', distances: 'Distancias', others: 'Otras casas',
    photos: (n) => `${n} fotos`,
    guests: 'huéspedes', rooms: pl('dormitorio', 'dormitorios'), baths: pl('baño', 'baños'),
    beds: 'Camas', room: (n) => `Dormitorio ${n}`, living: 'Salón', amenities: 'Incluye', video: 'Vídeo',
    bed: { double: 'Cama de matrimonio', twin: '2 camas individuales', sofa: 'Sofá cama' },
    am: { wifi: 'Wi-Fi', ac: 'Aire acondicionado', kitchen: 'Cocina equipada', parking: 'Aparcamiento', linen: 'Ropa de cama y toallas', washer: 'Lavadora', dishwasher: 'Lavavajillas', tv: 'TV', terrace: 'Terraza', balcony: 'Balcón', dining: 'Comedor', forest: 'Pinar' },
    kind: { apartment: 'Apartamento', bungalow: 'Bungalow' },
    waText: (name) => `Hola, me gustaría saber la disponibilidad de ${name}.`,
    sheet: { close: 'Cerrar', newTab: 'Abrir en otra ventana', loading: 'Cargando…', slow: '¿Tarda demasiado?', help: '¿Dudas?' },
    alsoOn: 'También en',
    place: { airport: 'Aeropuerto de Oporto', beach: 'Playa de Matosinhos', douro: 'Valle del Duero', park: 'Parque Natural de la Serra da Estrela', spa: 'Termas de Caldas de Manteigas', aerodrome: 'Aeródromo de Viseu' },
    meta: { home: 'Tres apartamentos en Rebordosa, Paredes, a 25 km de Oporto.', contact: 'Teléfono, WhatsApp, email y dirección de Casa da Petisqueira.', booking: 'Reservar en Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Apartamentos en Rebordosa, cerca de Oporto',
      homeDesc: 'Web oficial. Estancias en Rebordosa, Paredes, a 25 km de Oporto: tres apartamentos hasta 8 personas, Wi-Fi, aire acondicionado, cocina y aparcamiento. Reserva directa.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: apartamento completo en Rebordosa, Paredes, a 25 km de Oporto. ${rooms}, hasta ${n} personas, Wi-Fi, aire acondicionado, cocina equipada y aparcamiento.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Alojamiento en Seia',
      bunDesc: 'Web oficial. Estancia en la Serra da Estrela: Eco Bungalow para 2 en un pinar en Seia, a 30 minutos de la sierra. Cocina, Wi-Fi y aparcamiento. Reserva directa.',
    },
    contact: { title: 'Contacto', phone: 'Teléfono', email: 'Email' },
    lightbox: { close: 'Cerrar', prev: 'Anterior', next: 'Siguiente' },
    notFound: { title: 'Página no encontrada', back: 'Ir al inicio' },
    otherSite: { bungalow: 'Bungalow en la Serra da Estrela', casas: 'Apartamentos cerca de Oporto' },
  },
  fr: {
    htmlLang: 'fr', langName: 'Français',
    skip: 'Aller au contenu',
    terms: 'french francês francés französisch francese frans francuski france belgique belgium suisse switzerland luxembourg canada québec quebec monaco sénégal maroc morocco algérie tunisie frança francia frankreich frankrijk francja bélgica belgica belgien belgio belgia suíça suiza suisse schweiz svizzera zwitserland szwajcaria',
    search: 'Langue ou pays', menu: 'Menu', noLang: 'Absente ? Utilisez l’anglais.',
    nav: { houses: 'Maisons', location: 'Localisation', contact: 'Contact' },
    book: 'Réserver', call: 'Appeler',
    mapShort: 'Itinéraire',
    pick: { dates: 'Dates', add: 'Choisir', clear: 'Effacer', done: 'Valider', n1: 'nuit', n2: 'nuits', n5: 'nuits', checkin: 'Arrivée', checkout: 'Départ', adults: 'Adultes', children: 'Enfants', go: 'Voir les disponibilités' },
    rights: 'Tous droits réservés',
    credit: 'Développé et maintenu par',
    hero: 'Trois appartements à Rebordosa, Paredes, à 25 km de Porto.',
    phoneLabel: 'Réservations par téléphone',
    directions: 'Comment venir', houses: 'Maisons', distances: 'Distances', others: 'Autres maisons',
    photos: (n) => `${n} photos`,
    guests: 'personnes', rooms: pl('chambre', 'chambres'), baths: pl('salle de bain', 'salles de bain'),
    beds: 'Lits', room: (n) => `Chambre ${n}`, living: 'Salon', amenities: 'Inclus', video: 'Vidéo',
    bed: { double: 'Lit double', twin: '2 lits simples', sofa: 'Canapé-lit' },
    am: { wifi: 'Wi-Fi', ac: 'Climatisation', kitchen: 'Cuisine équipée', parking: 'Parking', linen: 'Linge de lit et serviettes', washer: 'Lave-linge', dishwasher: 'Lave-vaisselle', tv: 'TV', terrace: 'Terrasse', balcony: 'Balcon', dining: 'Salle à manger', forest: 'Pinède' },
    kind: { apartment: 'Appartement', bungalow: 'Bungalow' },
    waText: (name) => `Bonjour, j’aimerais connaître les disponibilités de ${name}.`,
    sheet: { close: 'Fermer', newTab: 'Ouvrir dans une nouvelle fenêtre', loading: 'Chargement…', slow: 'Trop long ?', help: 'Questions ?' },
    alsoOn: 'Aussi sur',
    place: { airport: 'Aéroport de Porto', beach: 'Plage de Matosinhos', douro: 'Vallée du Douro', park: 'Parc naturel de la Serra da Estrela', spa: 'Thermes de Caldas de Manteigas', aerodrome: 'Aérodrome de Viseu' },
    meta: { home: 'Trois appartements à Rebordosa, Paredes, à 25 km de Porto.', contact: 'Téléphone, WhatsApp, email et adresse de la Casa da Petisqueira.', booking: 'Réserver à la Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Appartements à Rebordosa, près de Porto',
      homeDesc: 'Site officiel. Séjours à Rebordosa, Paredes, à 25 km de Porto : trois appartements jusqu’à 8 personnes, Wi-Fi, climatisation, cuisine et parking. Réservation directe.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name} : appartement entier à Rebordosa, Paredes, à 25 km de Porto. ${rooms}, jusqu’à ${n} personnes, Wi-Fi, climatisation, cuisine équipée et parking.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Hébergement à Seia',
      bunDesc: 'Site officiel. Séjour dans la Serra da Estrela : Eco Bungalow pour 2 dans une pinède à Seia, à 30 minutes de la montagne. Cuisine, Wi-Fi et parking. Réservation directe.',
    },
    contact: { title: 'Contact', phone: 'Téléphone', email: 'Email' },
    lightbox: { close: 'Fermer', prev: 'Précédente', next: 'Suivante' },
    notFound: { title: 'Page introuvable', back: 'Aller à l’accueil' },
    otherSite: { bungalow: 'Bungalow dans la Serra da Estrela', casas: 'Appartements près de Porto' },
  },
  de: {
    htmlLang: 'de', langName: 'Deutsch',
    skip: 'Zum Inhalt',
    terms: 'german alemão alemán allemand tedesco duits niemiecki deutschland germany österreich osterreich austria schweiz switzerland liechtenstein alemanha alemania allemagne germania duitsland niemcy áustria autriche oostenrijk austria suíça suiza suisse svizzera zwitserland szwajcaria',
    search: 'Sprache oder Land', menu: 'Menü', noLang: 'Nicht dabei? Englisch wählen.',
    nav: { houses: 'Häuser', location: 'Lage', contact: 'Kontakt' },
    book: 'Buchen', call: 'Anrufen',
    mapShort: 'Route',
    pick: { dates: 'Reisedaten', add: 'Wählen', clear: 'Löschen', done: 'Fertig', n1: 'Nacht', n2: 'Nächte', n5: 'Nächte', checkin: 'Anreise', checkout: 'Abreise', adults: 'Erwachsene', children: 'Kinder', go: 'Verfügbarkeit prüfen' },
    rights: 'Alle Rechte vorbehalten',
    credit: 'Entwickelt und betreut von',
    hero: 'Drei Ferienwohnungen in Rebordosa, Paredes, 25 km von Porto.',
    phoneLabel: 'Buchung per Telefon',
    directions: 'Anfahrt', houses: 'Häuser', distances: 'Entfernungen', others: 'Weitere Häuser',
    photos: (n) => `${n} Fotos`,
    guests: 'Gäste', rooms: pl('Schlafzimmer', 'Schlafzimmer'), baths: pl('Badezimmer', 'Badezimmer'),
    beds: 'Betten', room: (n) => `Schlafzimmer ${n}`, living: 'Wohnzimmer', amenities: 'Inklusive', video: 'Video',
    bed: { double: 'Doppelbett', twin: '2 Einzelbetten', sofa: 'Schlafsofa' },
    am: { wifi: 'WLAN', ac: 'Klimaanlage', kitchen: 'Ausgestattete Küche', parking: 'Parkplatz', linen: 'Bettwäsche & Handtücher', washer: 'Waschmaschine', dishwasher: 'Geschirrspüler', tv: 'TV', terrace: 'Terrasse', balcony: 'Balkon', dining: 'Esszimmer', forest: 'Kiefernwald' },
    kind: { apartment: 'Ferienwohnung', bungalow: 'Bungalow' },
    waText: (name) => `Hallo, ich möchte die Verfügbarkeit von ${name} anfragen.`,
    sheet: { close: 'Schließen', newTab: 'In neuem Fenster öffnen', loading: 'Wird geladen…', slow: 'Dauert es zu lange?', help: 'Fragen?' },
    alsoOn: 'Auch auf',
    place: { airport: 'Flughafen Porto', beach: 'Strand von Matosinhos', douro: 'Douro-Tal', park: 'Naturpark Serra da Estrela', spa: 'Thermalbad Caldas de Manteigas', aerodrome: 'Flugplatz Viseu' },
    meta: { home: 'Drei Ferienwohnungen in Rebordosa, Paredes, 25 km von Porto.', contact: 'Telefon, WhatsApp, E-Mail und Adresse der Casa da Petisqueira.', booking: 'Casa da Petisqueira buchen.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Ferienwohnungen in Rebordosa bei Porto',
      homeDesc: 'Offizielle Website. Unterkunft in Rebordosa, Paredes, 25 km von Porto: drei ganze Wohnungen für bis zu 8 Personen, WLAN, Klimaanlage, Küche und Parkplatz. Direkt buchen.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: ganze Ferienwohnung in Rebordosa, Paredes, 25 km von Porto. ${rooms}, bis zu ${n} Personen, WLAN, Klimaanlage, ausgestattete Küche und Parkplatz.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Unterkunft in Seia',
      bunDesc: 'Offizielle Website. Urlaub in der Serra da Estrela: Eco Bungalow für 2 im Kiefernwald in Seia, 30 Minuten vom Gebirge. Küche, WLAN und Parkplatz. Direkt buchen.',
    },
    contact: { title: 'Kontakt', phone: 'Telefon', email: 'E-Mail' },
    lightbox: { close: 'Schließen', prev: 'Zurück', next: 'Weiter' },
    notFound: { title: 'Seite nicht gefunden', back: 'Zur Startseite' },
    otherSite: { bungalow: 'Bungalow in der Serra da Estrela', casas: 'Ferienwohnungen bei Porto' },
  },
  it: {
    htmlLang: 'it', langName: 'Italiano',
    skip: 'Vai al contenuto',
    terms: 'italian italiano italien italienisch italiaans włoski italia italy svizzera switzerland san marino itália italie italien italië włochy suíça suiza suisse schweiz zwitserland szwajcaria',
    search: 'Lingua o paese', menu: 'Menu', noLang: 'Non c’è? Usa l’inglese.',
    nav: { houses: 'Case', location: 'Posizione', contact: 'Contatti' },
    book: 'Prenota', call: 'Chiama',
    mapShort: 'Indicazioni',
    pick: { dates: 'Date', add: 'Scegli', clear: 'Cancella', done: 'Conferma', n1: 'notte', n2: 'notti', n5: 'notti', checkin: 'Arrivo', checkout: 'Partenza', adults: 'Adulti', children: 'Bambini', go: 'Vedi disponibilità' },
    rights: 'Tutti i diritti riservati',
    credit: 'Sviluppato e gestito da',
    hero: 'Tre appartamenti a Rebordosa, Paredes, a 25 km da Porto.',
    phoneLabel: 'Prenotazioni per telefono',
    directions: 'Come arrivare', houses: 'Case', distances: 'Distanze', others: 'Altre case',
    photos: (n) => `${n} foto`,
    guests: 'ospiti', rooms: pl('camera', 'camere'), baths: pl('bagno', 'bagni'),
    beds: 'Letti', room: (n) => `Camera ${n}`, living: 'Soggiorno', amenities: 'Incluso', video: 'Video',
    bed: { double: 'Letto matrimoniale', twin: '2 letti singoli', sofa: 'Divano letto' },
    am: { wifi: 'Wi-Fi', ac: 'Aria condizionata', kitchen: 'Cucina attrezzata', parking: 'Parcheggio', linen: 'Biancheria e asciugamani', washer: 'Lavatrice', dishwasher: 'Lavastoviglie', tv: 'TV', terrace: 'Terrazza', balcony: 'Balcone', dining: 'Sala da pranzo', forest: 'Pineta' },
    kind: { apartment: 'Appartamento', bungalow: 'Bungalow' },
    waText: (name) => `Buongiorno, vorrei sapere la disponibilità di ${name}.`,
    sheet: { close: 'Chiudi', newTab: 'Apri in una nuova finestra', loading: 'Caricamento…', slow: 'Ci mette troppo?', help: 'Domande?' },
    alsoOn: 'Anche su',
    place: { airport: 'Aeroporto di Porto', beach: 'Spiaggia di Matosinhos', douro: 'Valle del Douro', park: 'Parco naturale della Serra da Estrela', spa: 'Terme di Caldas de Manteigas', aerodrome: 'Aerodromo di Viseu' },
    meta: { home: 'Tre appartamenti a Rebordosa, Paredes, a 25 km da Porto.', contact: 'Telefono, WhatsApp, email e indirizzo di Casa da Petisqueira.', booking: 'Prenota a Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Appartamenti a Rebordosa, vicino a Porto',
      homeDesc: 'Sito ufficiale. Soggiorni a Rebordosa, Paredes, a 25 km da Porto: tre appartamenti fino a 8 persone, Wi-Fi, aria condizionata, cucina e parcheggio. Prenotazione diretta.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: appartamento intero a Rebordosa, Paredes, a 25 km da Porto. ${rooms}, fino a ${n} persone, Wi-Fi, aria condizionata, cucina attrezzata e parcheggio.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Alloggio a Seia',
      bunDesc: 'Sito ufficiale. Soggiorno nella Serra da Estrela: Eco Bungalow per 2 in una pineta a Seia, a 30 minuti dalla montagna. Cucina, Wi-Fi e parcheggio. Prenotazione diretta.',
    },
    contact: { title: 'Contatti', phone: 'Telefono', email: 'Email' },
    lightbox: { close: 'Chiudi', prev: 'Precedente', next: 'Successiva' },
    notFound: { title: 'Pagina non trovata', back: 'Vai alla home' },
    otherSite: { bungalow: 'Bungalow nella Serra da Estrela', casas: 'Appartamenti vicino a Porto' },
  },
  nl: {
    htmlLang: 'nl', langName: 'Nederlands',
    skip: 'Naar inhoud',
    terms: 'dutch holandês neerlandés néerlandais niederländisch olandese niderlandzki nederland netherlands holland belgië belgie belgium vlaanderen flanders suriname holanda países baixos paises bajos pays-bas niederlande paesi bassi holandia bélgica belgica belgique belgien belgio belgia',
    search: 'Taal of land', menu: 'Menu', noLang: 'Niet gevonden? Kies Engels.',
    nav: { houses: 'Huizen', location: 'Ligging', contact: 'Contact' },
    book: 'Boeken', call: 'Bellen',
    mapShort: 'Route',
    pick: { dates: 'Data', add: 'Kiezen', clear: 'Wissen', done: 'Klaar', n1: 'nacht', n2: 'nachten', n5: 'nachten', checkin: 'Aankomst', checkout: 'Vertrek', adults: 'Volwassenen', children: 'Kinderen', go: 'Beschikbaarheid bekijken' },
    rights: 'Alle rechten voorbehouden',
    credit: 'Ontwikkeld en onderhouden door',
    hero: 'Drie appartementen in Rebordosa, Paredes, op 25 km van Porto.',
    phoneLabel: 'Boeken per telefoon',
    directions: 'Route', houses: 'Huizen', distances: 'Afstanden', others: 'Andere huizen',
    photos: (n) => `${n} foto’s`,
    guests: 'gasten', rooms: pl('slaapkamer', 'slaapkamers'), baths: pl('badkamer', 'badkamers'),
    beds: 'Bedden', room: (n) => `Slaapkamer ${n}`, living: 'Woonkamer', amenities: 'Inbegrepen', video: 'Video',
    bed: { double: 'Tweepersoonsbed', twin: '2 eenpersoonsbedden', sofa: 'Slaapbank' },
    am: { wifi: 'Wifi', ac: 'Airconditioning', kitchen: 'Uitgeruste keuken', parking: 'Parkeren', linen: 'Beddengoed & handdoeken', washer: 'Wasmachine', dishwasher: 'Vaatwasser', tv: 'Tv', terrace: 'Terras', balcony: 'Balkon', dining: 'Eetkamer', forest: 'Dennenbos' },
    kind: { apartment: 'Appartement', bungalow: 'Bungalow' },
    waText: (name) => `Hallo, ik wil graag de beschikbaarheid van ${name} weten.`,
    sheet: { close: 'Sluiten', newTab: 'Openen in nieuw venster', loading: 'Laden…', slow: 'Duurt het te lang?', help: 'Vragen?' },
    alsoOn: 'Ook op',
    place: { airport: 'Luchthaven Porto', beach: 'Strand van Matosinhos', douro: 'Dourovallei', park: 'Natuurpark Serra da Estrela', spa: 'Thermen van Caldas de Manteigas', aerodrome: 'Vliegveld Viseu' },
    meta: { home: 'Drie appartementen in Rebordosa, Paredes, op 25 km van Porto.', contact: 'Telefoon, WhatsApp, e-mail en adres van Casa da Petisqueira.', booking: 'Boeken bij Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Appartementen in Rebordosa, bij Porto',
      homeDesc: 'Officiële website. Verblijf in Rebordosa, Paredes, op 25 km van Porto: drie volledige appartementen tot 8 personen, wifi, airco, keuken en parkeren. Direct boeken.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: volledig appartement in Rebordosa, Paredes, op 25 km van Porto. ${rooms}, tot ${n} personen, wifi, airconditioning, uitgeruste keuken en parkeren.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Verblijf in Seia',
      bunDesc: 'Officiële website. Verblijf in de Serra da Estrela: Eco Bungalow voor 2 in een dennenbos in Seia, op 30 minuten van het gebergte. Keuken, wifi en parkeren. Direct boeken.',
    },
    contact: { title: 'Contact', phone: 'Telefoon', email: 'E-mail' },
    lightbox: { close: 'Sluiten', prev: 'Vorige', next: 'Volgende' },
    notFound: { title: 'Pagina niet gevonden', back: 'Naar de startpagina' },
    otherSite: { bungalow: 'Bungalow in de Serra da Estrela', casas: 'Appartementen bij Porto' },
  },
  pl: {
    htmlLang: 'pl', langName: 'Polski',
    skip: 'Przejdź do treści',
    terms: 'polish polaco polonais polnisch polacco pools polska poland polónia polonia pologne polen',
    search: 'Język lub kraj', menu: 'Menu', noLang: 'Brak języka? Wybierz angielski.',
    nav: { houses: 'Domy', location: 'Lokalizacja', contact: 'Kontakt' },
    book: 'Rezerwuj', call: 'Zadzwoń',
    mapShort: 'Dojazd',
    pick: { dates: 'Daty', add: 'Wybierz', clear: 'Wyczyść', done: 'Gotowe', n1: 'noc', n2: 'noce', n5: 'nocy', checkin: 'Przyjazd', checkout: 'Wyjazd', adults: 'Dorośli', children: 'Dzieci', go: 'Sprawdź dostępność' },
    rights: 'Wszelkie prawa zastrzeżone',
    credit: 'Stworzone i utrzymywane przez',
    hero: 'Trzy apartamenty w Rebordosa, Paredes, 25 km od Porto.',
    phoneLabel: 'Rezerwacje telefoniczne',
    directions: 'Dojazd', houses: 'Domy', distances: 'Odległości', others: 'Inne domy',
    photos: (n) => `${n} zdjęć`,
    guests: 'osób', rooms: plPL('sypialnia', 'sypialnie', 'sypialni'), baths: plPL('łazienka', 'łazienki', 'łazienek'),
    beds: 'Łóżka', room: (n) => `Sypialnia ${n}`, living: 'Salon', amenities: 'W cenie', video: 'Wideo',
    bed: { double: 'Łóżko podwójne', twin: '2 łóżka pojedyncze', sofa: 'Rozkładana sofa' },
    am: { wifi: 'Wi-Fi', ac: 'Klimatyzacja', kitchen: 'Wyposażona kuchnia', parking: 'Parking', linen: 'Pościel i ręczniki', washer: 'Pralka', dishwasher: 'Zmywarka', tv: 'TV', terrace: 'Taras', balcony: 'Balkon', dining: 'Jadalnia', forest: 'Las sosnowy' },
    kind: { apartment: 'Apartament', bungalow: 'Bungalow' },
    waText: (name) => `Dzień dobry, pytanie o dostępność: ${name}.`,
    sheet: { close: 'Zamknij', newTab: 'Otwórz w nowym oknie', loading: 'Ładowanie…', slow: 'Trwa to za długo?', help: 'Pytania?' },
    alsoOn: 'Także na',
    place: { airport: 'Lotnisko Porto', beach: 'Plaża Matosinhos', douro: 'Dolina Douro', park: 'Park Przyrody Serra da Estrela', spa: 'Uzdrowisko Caldas de Manteigas', aerodrome: 'Lotnisko Viseu' },
    meta: { home: 'Trzy apartamenty w Rebordosa, Paredes, 25 km od Porto.', contact: 'Telefon, WhatsApp, e-mail i adres Casa da Petisqueira.', booking: 'Rezerwacja w Casa da Petisqueira.' },
    seo: {
      homeTitle: 'Casa da Petisqueira · Apartamenty w Rebordosa koło Porto',
      homeDesc: 'Oficjalna strona. Noclegi w Rebordosa, Paredes, 25 km od Porto: trzy całe apartamenty do 8 osób, Wi-Fi, klimatyzacja, kuchnia i parking. Rezerwacja bezpośrednia.',
      propTitle: (name, rooms) => `${name} — ${rooms}, Rebordosa, Paredes`,
      propDesc: (name, rooms, n) => `${name}: cały apartament w Rebordosa, Paredes, 25 km od Porto. ${rooms}, do ${n} osób, Wi-Fi, klimatyzacja, wyposażona kuchnia i parking.`,
      bunTitle: 'Eco Bungalow da Serra da Estrela · Nocleg w Seia',
      bunDesc: 'Oficjalna strona. Pobyt w Serra da Estrela: Eco Bungalow dla 2 osób w lesie sosnowym w Seia, 30 minut od gór. Kuchnia, Wi-Fi i parking. Rezerwacja bezpośrednia.',
    },
    contact: { title: 'Kontakt', phone: 'Telefon', email: 'E-mail' },
    lightbox: { close: 'Zamknij', prev: 'Poprzednie', next: 'Następne' },
    notFound: { title: 'Nie znaleziono strony', back: 'Strona główna' },
    otherSite: { bungalow: 'Bungalow w Serra da Estrela', casas: 'Apartamenty koło Porto' },
  },
};

// O que visitar perto do bungalow (site do bungalow). q = pesquisa no Google Maps; icon = ícone em build.mjs.
// Só factos conhecidos; as distâncias e o caminho vêm do Google Maps (botão "Como chegar").
// Fotos da Serra (Wikimedia Commons, licenças livres): geradas por um script, com autor e licença para os créditos.
import SERRA_PHOTOS from './serra-photos.json' with { type: 'json' };

export const REGION = {
  photos: SERRA_PHOTOS,
  title: { en: 'Serra da Estrela nearby', pt: 'Serra da Estrela, aqui perto', es: 'Serra da Estrela, cerca', fr: 'La Serra da Estrela, tout près', de: 'Serra da Estrela in der Nähe', it: 'Serra da Estrela, qui vicino', nl: 'Serra da Estrela in de buurt', pl: 'Serra da Estrela w pobliżu' },
  places: [
    { name: 'Torre', q: 'Torre, Serra da Estrela', icon: 'mountain', photo: 2, t: {
      en: 'Highest point in mainland Portugal (1993 m). Snow in winter.', pt: 'Ponto mais alto de Portugal continental (1993 m). Neve no inverno.', es: 'Punto más alto de Portugal continental (1993 m). Nieve en invierno.', fr: 'Point culminant du Portugal continental (1993 m). Neige en hiver.', de: 'Höchster Punkt des portugiesischen Festlands (1993 m). Schnee im Winter.', it: 'Punto più alto del Portogallo continentale (1993 m). Neve in inverno.', nl: 'Hoogste punt van het Portugese vasteland (1993 m). Sneeuw in de winter.', pl: 'Najwyższy punkt Portugalii kontynentalnej (1993 m). Zimą śnieg.' } },
    { name: 'Lagoa Comprida', q: 'Lagoa Comprida, Serra da Estrela', icon: 'water', photo: 3, t: {
      en: 'The largest lake in Serra da Estrela.', pt: 'A maior lagoa da Serra da Estrela.', es: 'La mayor laguna de la Serra da Estrela.', fr: 'Le plus grand lac de la Serra da Estrela.', de: 'Der größte See der Serra da Estrela.', it: 'Il lago più grande della Serra da Estrela.', nl: 'Het grootste meer van de Serra da Estrela.', pl: 'Największe jezioro Serra da Estrela.' } },
    { name: 'Vale Glaciar do Zêzere', q: 'Vale Glaciar do Zêzere, Manteigas', icon: 'mountain', photo: 4, t: {
      en: 'U-shaped glacial valley between Torre and Manteigas.', pt: 'Vale glaciar em forma de U, entre a Torre e Manteigas.', es: 'Valle glaciar en forma de U, entre la Torre y Manteigas.', fr: 'Vallée glaciaire en U, entre la Torre et Manteigas.', de: 'U-förmiges Gletschertal zwischen Torre und Manteigas.', it: 'Valle glaciale a U, tra la Torre e Manteigas.', nl: 'U-vormig gletsjerdal tussen Torre en Manteigas.', pl: 'Polodowcowa dolina w kształcie litery U między Torre a Manteigas.' } },
    { name: 'Covão d’Ametade', q: 'Covão d’Ametade, Manteigas', icon: 'mountain', photo: 5, t: {
      en: 'Birch grove at the source of the Zêzere river.', pt: 'Bosque de bétulas junto à nascente do Zêzere.', es: 'Bosque de abedules junto al nacimiento del Zêzere.', fr: 'Bois de bouleaux à la source du Zêzere.', de: 'Birkenwald an der Quelle des Zêzere.', it: 'Bosco di betulle alla sorgente dello Zêzere.', nl: 'Berkenbos bij de bron van de Zêzere.', pl: 'Brzozowy las przy źródle rzeki Zêzere.' } },
    { name: 'Cântaro Magro', q: 'Cântaro Magro, Serra da Estrela', icon: 'mountain', photo: 6, t: {
      en: 'Granite peak above the glacial valley.', pt: 'Pico de granito sobre o vale glaciar.', es: 'Pico de granito sobre el valle glaciar.', fr: 'Pic de granit au-dessus de la vallée glaciaire.', de: 'Granitgipfel über dem Gletschertal.', it: 'Picco di granito sopra la valle glaciale.', nl: 'Granieten piek boven het gletsjerdal.', pl: 'Granitowy szczyt nad doliną polodowcową.' } },
    { name: 'Loriga', q: 'Loriga, Seia', icon: 'mountain', photo: 8, t: {
      en: 'Mountain village with terraces and a river beach.', pt: 'Vila de montanha com socalcos e praia fluvial.', es: 'Pueblo de montaña con terrazas y playa fluvial.', fr: 'Village de montagne en terrasses, avec plage fluviale.', de: 'Bergdorf mit Terrassen und Flussbad.', it: 'Paese di montagna con terrazze e spiaggia fluviale.', nl: 'Bergdorp met terrassen en een rivierstrand.', pl: 'Górska wioska z tarasami i kąpieliskiem rzecznym.' } },
  ],
};

// Textos curtos da página Serra da Estrela e do bloco que liga os dois sites (mesmo dono, sítios diferentes).
// ours = "também nosso"; far = o que é o outro sítio, em poucas palavras.
export const EXTRA = {
  en: { beds: (n) => `${n} ${n === 1 ? 'bed' : 'beds'}`, room: { living: 'Living room', dining: 'Dining area', kitchen: 'Kitchen', bedroom: 'Bedroom', bathroom: 'Bathroom', laundry: 'Laundry', patio: 'Patio', balcony: 'Balcony', hall: 'Hallway', outside: 'Outside', area: 'Surroundings', view: 'View' }, stayIn: 'holiday rental in', direct: 'Official site · Book direct, no extra fees', from: '30 min from the bungalow', see: 'Serra da Estrela photos', places: 'Places to visit', credits: 'Photos', ours: 'Also ours', farBungalow: 'Pine-forest bungalow in Seia, Serra da Estrela', farCasas: '3 apartments in Rebordosa, 25 km from Porto', serraTitle: 'Serra da Estrela: what to see near the Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, the Zêzere glacial valley and more, 30 minutes from the Eco Bungalow in Seia. Photos and directions.' },
  pt: { beds: (n) => `${n} ${n === 1 ? 'cama' : 'camas'}`, room: { living: 'Sala', dining: 'Sala de jantar', kitchen: 'Cozinha', bedroom: 'Quarto', bathroom: 'Casa de banho', laundry: 'Lavandaria', patio: 'Pátio', balcony: 'Varanda', hall: 'Corredor', outside: 'Exterior', area: 'Arredores', view: 'Vista' }, stayIn: 'alojamento local em', direct: 'Site oficial · Reserva direta, sem taxas extra', from: 'A 30 min do bungalow', see: 'Fotos da Serra da Estrela', places: 'O que visitar', credits: 'Fotos', ours: 'Também nosso', farBungalow: 'Bungalow num pinhal em Seia, Serra da Estrela', farCasas: '3 apartamentos em Rebordosa, a 25 km do Porto', serraTitle: 'Serra da Estrela: o que visitar perto do Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, Vale Glaciar do Zêzere e mais, a 30 minutos do Eco Bungalow em Seia. Fotos e caminhos.' },
  es: { beds: (n) => `${n} ${n === 1 ? 'cama' : 'camas'}`, room: { living: 'Salón', dining: 'Comedor', kitchen: 'Cocina', bedroom: 'Dormitorio', bathroom: 'Baño', laundry: 'Lavandería', patio: 'Patio', balcony: 'Balcón', hall: 'Pasillo', outside: 'Exterior', area: 'Alrededores', view: 'Vistas' }, stayIn: 'alojamiento en', direct: 'Web oficial · Reserva directa, sin gastos extra', from: 'A 30 min del bungalow', see: 'Fotos de la Serra da Estrela', places: 'Qué visitar', credits: 'Fotos', ours: 'También nuestro', farBungalow: 'Bungalow en un pinar en Seia, Serra da Estrela', farCasas: '3 apartamentos en Rebordosa, a 25 km de Oporto', serraTitle: 'Serra da Estrela: qué ver cerca del Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, el valle glaciar del Zêzere y más, a 30 minutos del Eco Bungalow en Seia. Fotos y cómo llegar.' },
  fr: { beds: (n) => `${n} ${n === 1 ? 'lit' : 'lits'}`, room: { living: 'Salon', dining: 'Salle à manger', kitchen: 'Cuisine', bedroom: 'Chambre', bathroom: 'Salle de bain', laundry: 'Buanderie', patio: 'Patio', balcony: 'Balcon', hall: 'Couloir', outside: 'Extérieur', area: 'Alentours', view: 'Vue' }, stayIn: 'location de vacances à', direct: 'Site officiel · Réservation directe, sans frais supplémentaires', from: 'À 30 min du bungalow', see: 'Photos de la Serra da Estrela', places: 'À visiter', credits: 'Photos', ours: 'Chez nous aussi', farBungalow: 'Bungalow dans une pinède à Seia, Serra da Estrela', farCasas: '3 appartements à Rebordosa, à 25 km de Porto', serraTitle: 'Serra da Estrela : que voir près de l’Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, la vallée glaciaire du Zêzere et plus, à 30 minutes de l’Eco Bungalow à Seia. Photos et itinéraires.' },
  de: { beds: (n) => `${n} ${n === 1 ? 'Bett' : 'Betten'}`, room: { living: 'Wohnzimmer', dining: 'Essbereich', kitchen: 'Küche', bedroom: 'Schlafzimmer', bathroom: 'Badezimmer', laundry: 'Waschraum', patio: 'Innenhof', balcony: 'Balkon', hall: 'Flur', outside: 'Außenansicht', area: 'Umgebung', view: 'Aussicht' }, stayIn: 'Ferienunterkunft in', direct: 'Offizielle Website · Direkt buchen, ohne Zusatzgebühren', from: '30 Min. vom Bungalow', see: 'Fotos der Serra da Estrela', places: 'Ausflugsziele', credits: 'Fotos', ours: 'Auch von uns', farBungalow: 'Bungalow im Kiefernwald in Seia, Serra da Estrela', farCasas: '3 Apartments in Rebordosa, 25 km von Porto', serraTitle: 'Serra da Estrela: Ausflugsziele beim Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, das Gletschertal des Zêzere und mehr, 30 Minuten vom Eco Bungalow in Seia. Fotos und Routen.' },
  it: { beds: (n) => `${n} ${n === 1 ? 'letto' : 'letti'}`, room: { living: 'Soggiorno', dining: 'Zona pranzo', kitchen: 'Cucina', bedroom: 'Camera', bathroom: 'Bagno', laundry: 'Lavanderia', patio: 'Patio', balcony: 'Balcone', hall: 'Corridoio', outside: 'Esterno', area: 'Dintorni', view: 'Vista' }, stayIn: 'casa vacanze a', direct: 'Sito ufficiale · Prenotazione diretta, senza costi extra', from: 'A 30 min dal bungalow', see: 'Foto della Serra da Estrela', places: 'Cosa visitare', credits: 'Foto', ours: 'Anche nostro', farBungalow: 'Bungalow in una pineta a Seia, Serra da Estrela', farCasas: '3 appartamenti a Rebordosa, a 25 km da Porto', serraTitle: 'Serra da Estrela: cosa vedere vicino all’Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, la valle glaciale dello Zêzere e altro, a 30 minuti dall’Eco Bungalow a Seia. Foto e indicazioni.' },
  nl: { beds: (n) => `${n} ${n === 1 ? 'bed' : 'bedden'}`, room: { living: 'Woonkamer', dining: 'Eethoek', kitchen: 'Keuken', bedroom: 'Slaapkamer', bathroom: 'Badkamer', laundry: 'Wasruimte', patio: 'Patio', balcony: 'Balkon', hall: 'Gang', outside: 'Buitenkant', area: 'Omgeving', view: 'Uitzicht' }, stayIn: 'vakantieverblijf in', direct: 'Officiële website · Direct boeken, zonder extra kosten', from: '30 min van de bungalow', see: 'Foto’s van de Serra da Estrela', places: 'Wat te bezoeken', credits: 'Foto’s', ours: 'Ook van ons', farBungalow: 'Bungalow in een dennenbos in Seia, Serra da Estrela', farCasas: '3 appartementen in Rebordosa, 25 km van Porto', serraTitle: 'Serra da Estrela: wat te zien bij de Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, het gletsjerdal van de Zêzere en meer, 30 minuten van de Eco Bungalow in Seia. Foto’s en routes.' },
  pl: { beds: (n) => `${n} ${n === 1 ? 'łóżko' : n < 5 ? 'łóżka' : 'łóżek'}`, room: { living: 'Salon', dining: 'Jadalnia', kitchen: 'Kuchnia', bedroom: 'Sypialnia', bathroom: 'Łazienka', laundry: 'Pralnia', patio: 'Patio', balcony: 'Balkon', hall: 'Korytarz', outside: 'Z zewnątrz', area: 'Okolica', view: 'Widok' }, stayIn: 'nocleg w', direct: 'Oficjalna strona · Rezerwacja bezpośrednia, bez dodatkowych opłat', from: '30 min od bungalowu', see: 'Zdjęcia Serra da Estrela', places: 'Co zwiedzić', credits: 'Zdjęcia', ours: 'Również nasze', farBungalow: 'Bungalow w sosnowym lesie w Seia, Serra da Estrela', farCasas: '3 apartamenty w Rebordosa, 25 km od Porto', serraTitle: 'Serra da Estrela: co zobaczyć w pobliżu Eco Bungalow, Seia', serraDesc: 'Torre, Lagoa Comprida, Sabugueiro, polodowcowa dolina Zêzere i więcej, 30 minut od Eco Bungalow w Seia. Zdjęcia i dojazd.' },
};
