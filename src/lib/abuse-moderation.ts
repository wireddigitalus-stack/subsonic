import { CommsAbuseAlert } from "./types";

const STORAGE_KEY = "subsonic_comms_abuse_alerts_v1";

export const INITIAL_COMMS_ABUSE_ALERTS: CommsAbuseAlert[] = [
  {
    id: "alert-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    severity: "CRITICAL",
    category: "ILLEGAL_COMMERCE",
    shooterName: "Colt Stryker",
    shooterCallsign: "GHOST-TAC",
    shooterRole: "MEMBER",
    squad: "Public Comms #Unassigned",
    channel: "general-society",
    messageContent: "Selling custom titanium rimfire suppressor no tax stamp cash only meet behind range bunkhouse",
    toxicityScore: 35,
    threatScore: 92,
    policyScore: 99,
    status: "ACTIVE",
    aiRationale: "Direct NFA regulated item transaction attempt without FFL/Tax Stamp. Auto-blocked by AI policy shield.",
    autoActionTaken: "Transmission Terminated • User IP Flagged • Queued for Match Director",
  },
  {
    id: "alert-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    severity: "CRITICAL",
    category: "PHYSICAL_THREAT",
    shooterName: "Marcus Kane",
    shooterCallsign: "RIDGE-99",
    shooterRole: "PRO_COMPETITOR",
    squad: "Squad 4 (Stage 11)",
    channel: "bristol-pro-shootout",
    messageContent: "Stage 9 RO is a cheating fraud, stole 2 impacts from me. Wait till we get to the parking lot buddy",
    toxicityScore: 94,
    threatScore: 89,
    policyScore: 88,
    status: "ACTIVE",
    aiRationale: "Direct verbal physical threat targeting match range official. Severe sportsman conduct breach.",
    autoActionTaken: "Message Suppressed • RO Notified • Immediate Disqualification Pending",
  },
  {
    id: "alert-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 92).toISOString(),
    severity: "HIGH",
    category: "UNSPORTSMANLIKE",
    shooterName: "Travis Boyd",
    shooterCallsign: "TRIGGER-BOY",
    shooterRole: "PRO_COMPETITOR",
    squad: "Squad 2 (Stage 4)",
    channel: "bristol-pro-shootout",
    messageContent: "Whoever shot right before me is pencil whipping their scorebook, total loser cheat",
    toxicityScore: 78,
    threatScore: 28,
    policyScore: 72,
    status: "WARNED",
    aiRationale: "Hostile unsportsmanlike slander against fellow squad competitor without official protest filing.",
    autoActionTaken: "Flagged with Warning Badge • Match Director Formal Reprimand Issued",
  },
  {
    id: "alert-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    severity: "MEDIUM",
    category: "SPAM_SOLICITATION",
    shooterName: "CryptoMarksman_22",
    shooterCallsign: "BOT-NET",
    shooterRole: "MEMBER",
    squad: "Spectator Access",
    channel: "ballistics-and-gear",
    messageContent: "Earn 500% guaranteed profit on custom rimfire ammo trading! Join telegram t.me/subsoniccryptobet",
    toxicityScore: 18,
    threatScore: 15,
    policyScore: 94,
    status: "MUTED",
    aiRationale: "Automated Telegram spam solicitation bot detected.",
    autoActionTaken: "Auto-Muted for 24 Hours • Links Stripped",
  },
];

export function getCommsAbuseAlerts(): CommsAbuseAlert[] {
  if (typeof window === "undefined") return INITIAL_COMMS_ABUSE_ALERTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMS_ABUSE_ALERTS));
      return INITIAL_COMMS_ABUSE_ALERTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMS_ABUSE_ALERTS;
  }
}

export function saveCommsAbuseAlerts(alerts: CommsAbuseAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent("subsonic-comms-abuse-alert-updated"));
  } catch (err) {
    console.error("Failed saving comms abuse alerts", err);
  }
}

export function recordCommsAbuseAlert(alertData: Omit<CommsAbuseAlert, "id" | "timestamp" | "status"> & { status?: CommsAbuseAlert["status"] }): CommsAbuseAlert {
  const current = getCommsAbuseAlerts();
  const newAlert: CommsAbuseAlert = {
    ...alertData,
    id: `alert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    status: alertData.status || "ACTIVE",
  };
  const updated = [newAlert, ...current].slice(0, 100);
  saveCommsAbuseAlerts(updated);

  // Dispatch alert event for immediate audio/visual alert popups
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("subsonic-comms-abuse-kicked-up", { detail: newAlert })
    );
  }
  return newAlert;
}

export function updateCommsAbuseAlertStatus(id: string, status: CommsAbuseAlert["status"]): void {
  const current = getCommsAbuseAlerts();
  const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
  saveCommsAbuseAlerts(updated);
}

export function dismissCommsAbuseAlert(id: string): void {
  const current = getCommsAbuseAlerts();
  const updated = current.filter((a) => a.id !== id);
  saveCommsAbuseAlerts(updated);
}

export function clearCommsAbuseAlerts(): void {
  saveCommsAbuseAlerts([]);
}

/**
 * Web Audio API tactical alarm chirp for high-urgency comms abuse warnings
 */
export function playTacticalAbuseAlertSound(severity: "CRITICAL" | "HIGH" | "MEDIUM" = "CRITICAL") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (severity === "CRITICAL") {
      // Rapid dual-tone tactical warble
      const now = ctx.currentTime;
      [0, 0.12, 0.24].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now + offset);
        osc.frequency.setValueAtTime(1240, now + offset + 0.05);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } else {
      // Single alert ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // Audio unpermitted or unavailable
  }
}

/**
 * Simulates a realistic incoming comms abuse attack for test verification
 */
export function simulateAbuseAttack(type: "THREAT" | "WEAPON_SALE" | "PENCIL_WHIP" | "SPAM"): CommsAbuseAlert {
  const attacks: Record<string, Omit<CommsAbuseAlert, "id" | "timestamp" | "status">> = {
    THREAT: {
      severity: "CRITICAL",
      category: "PHYSICAL_THREAT",
      shooterName: "Devon 'Viper' Briggs",
      shooterCallsign: "VIPER-7",
      shooterRole: "PRO_COMPETITOR",
      squad: "Squad 6 (Stage 14)",
      channel: "bristol-pro-shootout",
      messageContent: "Call that a hit again and I will punch your lights out in the staging tent you punk",
      toxicityScore: 96,
      threatScore: 92,
      policyScore: 89,
      aiRationale: "Aggressive physical threat and harassment directed toward competitor / scorer. Immediate DQ required.",
      autoActionTaken: "Transmission Blocked • Shooter Red-Carded • Squad Chief Alerted",
    },
    WEAPON_SALE: {
      severity: "CRITICAL",
      category: "ILLEGAL_COMMERCE",
      shooterName: "Anonymous Guest #84",
      shooterCallsign: "TACTICAL-X",
      shooterRole: "MEMBER",
      squad: "Public Spectator",
      channel: "general-society",
      messageContent: "WTS modified rimfire binary trigger pack cash in hand no paperwork required pm fast",
      toxicityScore: 28,
      threatScore: 84,
      policyScore: 98,
      aiRationale: "Direct unregulated weapon modification commerce detected. Strict federal policy violation.",
      autoActionTaken: "Transmission Dropped • Account Blacklisted • Admin Notified",
    },
    PENCIL_WHIP: {
      severity: "HIGH",
      category: "UNSPORTSMANLIKE",
      shooterName: "Clayton Vance",
      shooterCallsign: "BOOMSTICK",
      shooterRole: "PRO_COMPETITOR",
      squad: "Squad 1 (Stage 1)",
      channel: "bristol-pro-shootout",
      messageContent: "They gave Keller 10 impacts when everyone saw him miss 3 on the barricade! Rigged match!",
      toxicityScore: 82,
      threatScore: 31,
      policyScore: 79,
      aiRationale: "Public match tampering accusations and unsportsmanlike slander without filing an official written protest.",
      autoActionTaken: "Flagged with Warning Badge • Placed into Match Director Queue",
    },
    SPAM: {
      severity: "MEDIUM",
      category: "SPAM_SOLICITATION",
      shooterName: "ApexCrypto_GunBot",
      shooterCallsign: "SPAM-BOT",
      shooterRole: "MEMBER",
      squad: "Unverified Guest",
      channel: "ballistics-and-gear",
      messageContent: "WIN 10,000 ROUNDS OF ELEY MATCH AMMO! CLICK FREE ENTRY: bit.ly/eley-free-giveaway-2026",
      toxicityScore: 12,
      threatScore: 10,
      policyScore: 95,
      aiRationale: "Phishing link and malicious external solicitation pattern matched.",
      autoActionTaken: "Content Sanitized • Bot Silenced for 60 Minutes",
    },
  };

  const payload = attacks[type] || attacks.THREAT;
  const alert = recordCommsAbuseAlert(payload);
  playTacticalAbuseAlertSound(payload.severity);
  return alert;
}
