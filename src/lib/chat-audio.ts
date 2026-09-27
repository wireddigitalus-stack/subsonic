/**
 * Subsonic Society — Tactical Audio Engine
 * 
 * Provides distinct audio signatures for Real Human Comms vs Automated Bot Telemetry:
 * - Real Comms: Authentic tactical VHF radio comms burst / roger chirp (dual frequency hop)
 * - Bot Telemetry: Distinct digital synthetic telemetry tone (cyber chime & harmonic pip)
 */

export function playRealCommsChirp() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pulse 1: Tactical VHF mic-key snap (820 Hz -> 1240 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(820, now);
    osc1.frequency.exponentialRampToValueAtTime(1240, now + 0.04);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Pulse 2: High radio roger burst (1240 Hz -> 1720 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1240, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(1720, now + 0.095);
    gain2.gain.setValueAtTime(0.09, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.095);
  } catch {
    // Silent fallback
  }
}

export function playBotTelemetryChirp() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pulse 1: Low digital carrier blip (520 Hz triangle wave)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.setValueAtTime(520, now + 0.038);
    gain1.gain.setValueAtTime(0.07, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.038);

    // Pulse 2: Synthetic cyber harmonic (780 Hz -> 880 Hz sine)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(780, now + 0.042);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    gain2.gain.setValueAtTime(0.075, now + 0.042);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.042);
    osc2.stop(now + 0.09);
  } catch {
    // Silent fallback
  }
}

export function playTacticalChirp(frequency = 940) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // Silent fallback
  }
}
