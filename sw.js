/* sw.js */
const CACHE_NAME = "app-azul-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./cabecera.png",
  "./presente.png",
  "./archivo.png",
  "./prevision.png",
  "./ahorro.png"
];

// Instalar: cachea assets básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpia caches antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: estrategia "cache-first" (rápida y funciona offline)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      // Si no está en caché, pide a red y guarda
      return fetch(req)
        .then((res) => {
          // Evitar cachear respuestas raras
          if (!res || res.status !== 200 || res.type === "opaque") return res;

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // fallback offline: si falla y era navegación, devuelve index
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
