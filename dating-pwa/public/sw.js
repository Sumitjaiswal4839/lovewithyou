self.addEventListener("push", function(event) {
  if (event.data) {
    const data = event.data.text();
    const options = {
      body: data,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2"
      },
      actions: [
        {action: "explore", title: "Open App"}
      ]
    };
    event.waitUntil(self.registration.showNotification("Dating PWA 💖", options));
  }
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
