// Service worker mínimo — existe apenas para satisfazer os critérios de
// instalabilidade do Chrome/Android (exige um SW com handler de "fetch").
// Não faz caching agressivo: deixa sempre passar o pedido para a rede,
// para nunca servir versões desatualizadas da aplicação.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
