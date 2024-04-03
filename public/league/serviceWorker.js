const publicKey = 'BGsr1b6XHD50SVpEMuFKuHwc8UFJzQ24czBUAdhp3texWUFV_H7n86Wz2fCGAhenPPaySb98wBhWerHFsOV6duw'
const id = crypto.randomUUID()
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const saveSubscription = async (subscription) => {
  const response = await fetch("/api/subscription", {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({subscription, id}),
  });

  return response.json();
};

self.addEventListener("activate", async (e) => {
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      publicKey
    ),
  });

  await saveSubscription(subscription);
});

self.addEventListener("push", (e) => {
  self.registration.showNotification("Wordsmith", { body: e.data.text() });
});

self.addEventListener('pushsubscriptionchange', async (event) => {
  const subscription = await self.registration.pushManager.subscribe(event.oldSubscription.options)
  await saveSubscription(subscription)
});
