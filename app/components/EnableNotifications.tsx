"use client";
import { useCallback, useEffect, useState } from "react";

export function EnableNotifications() {
  const [isPossible, setIsPossible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const onClick = useCallback(async () => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      try {
        await registerSW();
        setIsEnabled(true);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isPossible) {
      try {
        checkPermission();
        setIsPossible(true);
      } catch (_err) {
        setIsPossible(false);
      }
    }
  }, [isPossible]);

  useEffect(() => {
    if (!isEnabled) {
      (async () => {
        const permission = await Notification.requestPermission();
        const registration = await navigator.serviceWorker.getRegistration();

        if (permission === "granted" && registration) {
          setIsEnabled(true);
        }
      })();
    }
  }, [isEnabled]);

  if (!isPossible || isEnabled) {
    return null;
  }

  return (
    <button
      className='font-bold text-xl text-left text-blue-600'
      onClick={onClick}
    >
      Enable notifications
    </button>
  );
}

const checkPermission = () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("No support for service worker!");
  }

  if (!("Notification" in window)) {
    throw new Error("No support for notification API");
  }

  if (!("PushManager" in window)) {
    throw new Error("No support for Push API");
  }
};

const registerSW = async () => {
  const registration = await navigator.serviceWorker.register(
    "./serviceWorker.js"
  );
  return registration;
};
