self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'New notification', body: event.data?.text() || '' };
  }

  const title = data.title || 'DailyStack';
  const options = {
    body: data.body || 'You have a new message',
    icon: '/assets/logos/icon-192.png',
    badge: '/assets/logos/icon-96.png',
    data: data
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
