// REGHOR - Service Worker
// Permite instalar REGHOR como app (PWA) y da acceso básico sin conexión a
// las páginas ya visitadas. Los datos en sí (tabla de registros) siguen
// necesitando conexión a Supabase: aquí solo se cachean los ficheros
// estáticos de la propia app (HTML/JS/manifest/iconos), nunca las
// peticiones a Supabase ni a los CDN externos (Chart.js, jsPDF, Supabase JS).
//
// IMPORTANTE: al subir cambios de index.html/app.js/etc. a producción, sube
// SIEMPRE este fichero también, y cambia CACHE_VERSION -si no, los
// navegadores que ya tengan la PWA instalada pueden seguir viendo una
// versión antigua en caché durante un tiempo.
const CACHE_VERSION = 'reghor-v1';

// Ficheros que se cachean de entrada (los que sabemos seguro que existen).
// El resto de páginas de la app (informes.html, gantt.html, festivos.html,
// login.html, auth.js...) se cachean solas la primera vez que se visitan
// (ver el "fetch" más abajo), así que no hace falta listarlas aquí a mano.
const PRECACHE_URLS = [
  './index.html',
  './config.js',
  './app.js',
  './graficos.html',
  './graficos.js',
  './Semana.html',
  './Semana.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // allSettled en vez de cache.addAll: si algún fichero de la lista
      // fallase (p.ej. se renombra en el futuro) no debe impedir que el
      // resto se cachee ni que la instalación del Service Worker se complete.
      return Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((claves) => {
      return Promise.all(
        claves.filter((clave) => clave !== CACHE_VERSION).map((clave) => caches.delete(clave))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo se gestiona lo que pide la propia app (mismo origen) y solo
  // peticiones GET; todo lo demás (Supabase, CDN de Chart.js/jsPDF/Supabase
  // JS, llamadas POST/PATCH/DELETE a la API) va directo a la red, sin pasar
  // por el Service Worker ni por la caché.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cacheado) => {
      const redFetch = fetch(req).then((respuesta) => {
        // Se guarda en caché una copia de la respuesta válida más reciente,
        // para que la próxima vez que no haya conexión se sirva esta versión
        // en vez de una más vieja.
        if (respuesta && respuesta.status === 200) {
          const copia = respuesta.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copia));
        }
        return respuesta;
      }).catch(() => cacheado); // sin conexión y sin red: se cae a lo cacheado (si existe)

      // Estrategia "network-first": si hay red, se usa siempre la versión
      // más reciente (evita servir una página vieja por error estando
      // online); solo se usa la caché cuando falla la red de verdad.
      return redFetch;
    })
  );
});
