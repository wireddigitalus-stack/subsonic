"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface SpeechRecognitionOptions {
  onFinalResult?: (transcript: string) => void;
  lang?: string;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onFinalResult,
  lang = "en-US",
  continuous = false,
}: SpeechRecognitionOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = lang;

      setTranscript("");
      setInterimTranscript("");
      setError(null);

      recognition.onstart = () => {
        setIsListening(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(25);
        }
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr) {
          const trimmed = finalStr.trim();
          setTranscript(trimmed);
          setInterimTranscript("");
          if (onFinalResultRef.current) {
            onFinalResultRef.current(trimmed);
          }
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is a common benign event when user stays silent
        if (event.error !== "no-speech") {
          console.warn("Speech recognition error:", event.error);
          setError(event.error || "Speech recognition error");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setError(err?.message || "Failed to start speech recognition");
      setIsListening(false);
    }
  }, [continuous, lang]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
