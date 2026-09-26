"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DirectorModeContextType {
  isDirectorMode: boolean;
  toggleDirectorMode: () => void;
  enableDirectorMode: () => void;
  disableDirectorMode: () => void;
}

const DirectorModeContext = createContext<DirectorModeContextType>({
  isDirectorMode: false,
  toggleDirectorMode: () => {},
  enableDirectorMode: () => {},
  disableDirectorMode: () => {},
});

export function DirectorModeProvider({ children }: { children: React.ReactNode }) {
  const [isDirectorMode, setIsDirectorMode] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;

    // Check URL query parameters (?preview=full, ?full=true, ?director=true)
    const urlParams = new URLSearchParams(window.location.search);
    const hasDirectorParam = 
      urlParams.get("preview") === "full" ||
      urlParams.get("full") === "true" ||
      urlParams.get("director") === "true" ||
      urlParams.get("director") === "1";

    const saved = localStorage.getItem("subsonic_director_mode");
    if (hasDirectorParam || saved === "true") {
      setIsDirectorMode(true);
      if (hasDirectorParam) {
        localStorage.setItem("subsonic_director_mode", "true");
      }
    }
  }, []);

  const toggleDirectorMode = () => {
    setIsDirectorMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("subsonic_director_mode", String(next));
      }
      return next;
    });
  };

  const enableDirectorMode = () => {
    setIsDirectorMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_director_mode", "true");
    }
  };

  const disableDirectorMode = () => {
    setIsDirectorMode(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("subsonic_director_mode", "false");
    }
  };

  return (
    <DirectorModeContext.Provider
      value={{
        isDirectorMode,
        toggleDirectorMode,
        enableDirectorMode,
        disableDirectorMode,
      }}
    >
      {children}
    </DirectorModeContext.Provider>
  );
}

export function useDirectorMode() {
  return useContext(DirectorModeContext);
}
