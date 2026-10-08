"use client";

import { useState, useEffect, useCallback } from "react";

const DISMISS_STORAGE_KEY = "subsonic_pwa_install_dismissed_until";
const SNOOZE_DAYS = 14;

export function usePWAInstall() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallNative, setCanInstallNative] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone mode (already installed & launched from homescreen)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // Detect device platform
    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const android = /android/.test(ua);
    const mobile = ios || android || /mobile/.test(ua);

    setIsIOS(ios);
    setIsAndroid(android);
    setIsMobile(mobile);

    // If already running standalone, do not show any install banners
    if (standalone) return;

    // Capture Chrome/Android PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallNative(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstallNative(false);
      setIsStandalone(true);
      setIsBannerVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check snooze status before displaying automatic floating banner
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      const isSnoozed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

      if (!isSnoozed && mobile) {
        // Polite delay before showing banner so it doesn't disrupt initial page load
        const timer = setTimeout(() => {
          setIsBannerVisible(true);
        }, 9000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
          window.removeEventListener("appinstalled", handleAppInstalled);
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Trigger 1-tap native prompt (Android/Chrome) or open visual guide (iOS)
  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          setDeferredPrompt(null);
          setCanInstallNative(false);
          setIsBannerVisible(false);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.warn("PWA install prompt error:", err);
        setIsModalOpen(true);
      }
    } else {
      // iOS or browsers without native prompt: show visual guide modal
      setIsModalOpen(true);
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback((temporaryOnly = false) => {
    setIsBannerVisible(false);
    if (!temporaryOnly) {
      try {
        const snoozeUntil = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(DISMISS_STORAGE_KEY, snoozeUntil.toString());
      } catch {}
    }
  }, []);

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isMobile,
    canInstallNative,
    isModalOpen,
    setIsModalOpen,
    isBannerVisible,
    promptInstall,
    dismissBanner,
  };
}
