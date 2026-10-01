"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const VOICE_STORAGE_KEY = "subsonic_nexus_voice_uri";

export interface SpeechSynthesisOptions {
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
}

export function useSpeechSynthesis({
  defaultRate = 0.96,
  defaultPitch = 0.92,
  defaultVolume = 1.0,
}: SpeechSynthesisOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(defaultRate);
  const [pitch, setPitch] = useState(defaultPitch);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Initialize and load available device voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (!available || available.length === 0) return;

      setVoices(available);

      // Try reading persisted voice choice
      const savedUri = localStorage.getItem(VOICE_STORAGE_KEY);
      if (savedUri && available.some((v) => v.voiceURI === savedUri)) {
        setSelectedVoiceUri(savedUri);
      } else {
        // Preferred voice heuristics: look for high-quality English command voice
        // E.g. Daniel, Aaron, Oliver, Samantha, Google US English, Alex, Natural
        const preferredVoices = [
          "Daniel",
          "Aaron",
          "Arthur",
          "Google US English",
          "Microsoft Guy",
          "Microsoft Christopher",
          "Alex",
          "Samantha",
        ];

        let matchedVoice: SpeechSynthesisVoice | undefined;
        for (const pref of preferredVoices) {
          matchedVoice = available.find(
            (v) =>
              v.name.includes(pref) &&
              (v.lang.startsWith("en") || v.lang === "")
          );
          if (matchedVoice) break;
        }

        if (!matchedVoice) {
          // Fallback to first English voice, or first available voice
          matchedVoice =
            available.find((v) => v.lang.startsWith("en")) || available[0];
        }

        if (matchedVoice) {
          setSelectedVoiceUri(matchedVoice.voiceURI);
        }
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectVoice = useCallback((voiceUri: string) => {
    setSelectedVoiceUri(voiceUri);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceUri);
    } catch {
      // Ignore
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
        onEndCallbackRef.current = null;
      }
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !text.trim()
      ) {
        if (onEnd) onEnd();
        return;
      }

      // Resume if browser synthesis is paused or stalled
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Only cancel if already speaking or pending
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }

      onEndCallbackRef.current = onEnd || null;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = defaultVolume;

      // Select voice object by uri or fallback to best available
      const availableVoices =
        voices.length > 0 ? voices : window.speechSynthesis.getVoices();

      if (availableVoices.length > 0) {
        if (selectedVoiceUri) {
          const found = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
          if (found) utterance.voice = found;
        }
        if (!utterance.voice) {
          const englishVoice = availableVoices.find(
            (v) => v.lang.startsWith("en") && !v.name.includes("Bad")
          );
          if (englishVoice) utterance.voice = englishVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis utterance error:", e);
        setIsSpeaking(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      };

      utteranceRef.current = utterance;

      // Chrome/Safari delay buffer to avoid speech cancellation race condition
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("SpeechSynthesis speak exception:", err);
          setIsSpeaking(false);
          if (onEnd) onEnd();
        }
      }, 30);
    },
    [defaultVolume, pitch, rate, selectedVoiceUri, voices]
  );

  return {
    isSupported,
    voices,
    selectedVoiceUri,
    selectVoice,
    isSpeaking,
    speak,
    stop,
    rate,
    setRate,
    pitch,
    setPitch,
  };
}
