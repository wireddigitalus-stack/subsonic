"use client";

import React, { useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { InstallAppBanner } from "./InstallAppBanner";
import { InstallAppModal } from "./InstallAppModal";

export function PWAInstallPrompt() {
  const {
    isStandalone,
    isIOS,
    isAndroid,
    canInstallNative,
    isModalOpen,
    setIsModalOpen,
    isBannerVisible,
    promptInstall,
    dismissBanner,
  } = usePWAInstall();

  // Listen for programmatic open requests from anywhere in the app (e.g. Navbar or User Menu)
  useEffect(() => {
    const handleOpenRequest = () => {
      promptInstall();
    };

    window.addEventListener("open-pwa-install", handleOpenRequest);
    return () => window.removeEventListener("open-pwa-install", handleOpenRequest);
  }, [promptInstall]);

  // If running inside standalone homescreen app, suppress all prompts
  if (isStandalone) return null;

  return (
    <>
      <InstallAppBanner
        isVisible={isBannerVisible && !isModalOpen}
        isIOS={isIOS}
        canInstallNative={canInstallNative}
        onInstallClick={promptInstall}
        onDismiss={() => dismissBanner(false)}
      />

      <InstallAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        canInstallNative={canInstallNative}
        onPromptNative={promptInstall}
      />
    </>
  );
}
