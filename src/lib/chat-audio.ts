/**
 * Subsonic Society — Tactical Audio Engine
 * 
 * Provides distinct audio signatures for Real Human Comms vs Automated Bot Telemetry:
 * - Real Comms: Authentic tactical VHF radio comms burst / roger chirp (dual frequency hop)
 * - Bot Telemetry: Distinct digital synthetic telemetry tone (cyber chime & harmonic pip)
 * 
 * Uses a resilient, unlocked singleton AudioContext to ensure background timers (like bots)
 * can play audio reliably without being blocked by browser autoplay/suspension policies.
 */

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Ensures the Web Audio API context is unlocked by a user interaction.
 * Call this on any button click or tap (like "Start Bots", sound toggle, etc.)
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// Auto-register touch/click unlock in the browser
if (typeof window !== "undefined") {
  const unlockEvents = ["pointerdown", "touchstart", "keydown"];
  const handleUnlock = () => {
    unlockAudio();
    unlockEvents.forEach((ev) => window.removeEventListener(ev, handleUnlock));
  };
  unlockEvents.forEach((ev) => window.addEventListener(ev, handleUnlock, { passive: true }));
}

/**
 * TRANSMISSION SENT TONE / REAL HUMAN COMMS CHIRP
 * Dual-pulse tactical VHF radio mic-key burst & roger chirp (820 Hz -> 1,280 Hz -> 1,840 Hz)
 */
export function playTransmitChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Pulse 1: Tactical VHF mic-key snap (820 Hz -> 1280 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(820, now);
    osc1.frequency.exponentialRampToValueAtTime(1280, now + 0.05);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // Pulse 2: High radio roger burst (1380 Hz -> 1840 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1380, now + 0.055);
    osc2.frequency.exponentialRampToValueAtTime(1840, now + 0.13);
    gain2.gain.setValueAtTime(0.32, now + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.055);
    osc2.stop(now + 0.13);
  } catch {
    // Silent fallback
  }
}

// Alias for backwards compatibility
export const playRealCommsChirp = playTransmitChirp;

/**
 * INCOMING MESSAGE CHIME
 * Crisp, pleasant tactical two-tone notification chime for incoming broadcasts
 */
export function playIncomingChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // First tone: 1046 Hz (C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046, now);
    gain1.gain.setValueAtTime(0.26, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    // Second tone: 1396 Hz (F6 - bright harmonic bell)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1396, now + 0.065);
    gain2.gain.setValueAtTime(0.32, now + 0.065);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.065);
    osc2.stop(now + 0.18);
  } catch {
    // Silent fallback
  }
}

/**
 * DIRECT MESSAGE ALERT CHIME
 * Three-tone rising priority alert for 1-on-1 private encrypted comms
 */
export function playDirectMessageChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    [
      { freq: 880, start: 0, dur: 0.055, gain: 0.24 },
      { freq: 1175, start: 0.06, dur: 0.055, gain: 0.28 },
      { freq: 1568, start: 0.12, dur: 0.14, gain: 0.32 },
    ].forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(tone.freq, now + tone.start);
      gain.gain.setValueAtTime(tone.gain, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.dur);
    });
  } catch {
    // Silent fallback
  }
}

/**
 * AUDIO TOGGLE FEEDBACK TONE
 * Immediate auditory confirmation when clicking the Audio On/Off toggle
 */
export function playToggleAudioTone(enabled: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (enabled) {
      // Rising positive double chirp (800 Hz -> 1440 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.06);
      gain1.gain.setValueAtTime(0.26, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1100, now + 0.065);
      osc2.frequency.exponentialRampToValueAtTime(1440, now + 0.15);
      gain2.gain.setValueAtTime(0.32, now + 0.065);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.065);
      osc2.stop(now + 0.15);
    } else {
      // Falling soft mute blip (920 Hz -> 460 Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.08);
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Silent fallback
  }
}

/**
 * BOT TELEMETRY CHIRP
 * Distinct digital synthetic cyber telemetry tone (580 Hz triangle blip + 880 Hz -> 1050 Hz cyber pip)
 */
export function playBotTelemetryChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Pulse 1: Low digital carrier blip (580 Hz triangle wave)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.setValueAtTime(640, now + 0.04);
    gain1.gain.setValueAtTime(0.20, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Pulse 2: Bright synthetic cyber harmonic (880 Hz -> 1050 Hz sine)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(1050, now + 0.10);
    gain2.gain.setValueAtTime(0.22, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.10);
  } catch {
    // Silent fallback
  }
}

/**
 * Standard UI tactical click chirp
 */
export function playTacticalChirp(frequency = 940) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Silent fallback
  }
}

/**
 * NEXUS VOICE INTERCOM CHIRP
 * Distinct tactical radio clicks for PTT engage, disengage, and AI uplink
 */
export function playNexusCommsChirp(type: "ptt_on" | "ptt_off" | "response" = "ptt_on") {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (type === "ptt_on") {
      // Mic-open chirp: quick rising dual-tone chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.06);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "ptt_off") {
      // Mic-close chirp: falling low squelch tail
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // AI Uplink / Response incoming: cyber dual-pip
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(920, now);
      gain1.gain.setValueAtTime(0.16, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1480, now + 0.05);
      gain2.gain.setValueAtTime(0.20, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.10);
    }
  } catch {
    // Silent fallback
  }
}

