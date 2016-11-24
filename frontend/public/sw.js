// Version 0.11
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  clients.claim();
})

self.addEventListener('push', e => {
  const data = e.data.json();

  e.waitUntil(self.registration.showNotification(
    data.title, {
      body: data.description || "",
      icon: data.icon || "",
      data: data
    }
  ))
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data.url;

  if(url) {
    e.waitUntil(clients.openWindow(url));
  }
});