/**
 * SubSonic Society — Real Celestial Constellations & Eastern Time Solar/Lunar Engine
 * 
 * Accurately models real Northern Hemisphere constellations visible from SubSonic HQ (Bristol, TN),
 * with apparent star magnitudes, spectral color temperatures, classical stick-figure filaments,
 * and real-time Earth diurnal rotation synchronized to Eastern Time (America/New_York).
 */

export interface ConstellationStar {
  id: string;
  name: string;
  constellation: string;
  // Celestial dome coordinates in pixels relative to celestial pole (0, 0)
  x: number;
  y: number;
  magnitude: number; // 0 (brightest like Vega/Sirius) to ~4.5 (fainter)
  color: string;     // Spectral chromatic hex
  glowColor: string; // Soft corona flare
  hasSpike?: boolean;// Dazzling 4-point diffraction spike (Sirius, Vega, Rigel, Betelgeuse, Arcturus)
}

export interface ConstellationConnection {
  constellation: string;
  starA: string;
  starB: string;
}

export interface ConstellationLabel {
  name: string;
  latinName?: string;
  x: number;
  y: number;
}

// ─── 1. REAL CELESTIAL STARS CATALOG ──────────────────────────────────────────
export const REAL_STARS: ConstellationStar[] = [
  // ── POLARIS (North Star / Celestial Pivot) ───────────────────
  { id: "polaris", name: "Polaris", constellation: "Ursa Minor", x: 0, y: -40, magnitude: 1.9, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.7)", hasSpike: true },
  { id: "kochab", name: "Kochab", constellation: "Ursa Minor", x: -90, y: -160, magnitude: 2.0, color: "#FED7AA", glowColor: "rgba(254, 215, 170, 0.5)" },
  { id: "pherkad", name: "Pherkad", constellation: "Ursa Minor", x: -140, y: -180, magnitude: 3.0, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.4)" },
  { id: "yildun", name: "Yildun", constellation: "Ursa Minor", x: -35, y: -90, magnitude: 4.2, color: "#E2E8F0", glowColor: "rgba(226, 232, 240, 0.3)" },

  // ── URSA MAJOR (The Great Bear / Big Dipper) ─────────────────
  { id: "dubhe", name: "Dubhe", constellation: "Ursa Major", x: -280, y: -290, magnitude: 1.8, color: "#FDE68A", glowColor: "rgba(253, 230, 138, 0.6)" },
  { id: "merak", name: "Merak", constellation: "Ursa Major", x: -260, y: -380, magnitude: 2.3, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.5)" },
  { id: "phecda", name: "Phecda", constellation: "Ursa Major", x: -380, y: -370, magnitude: 2.4, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.5)" },
  { id: "megrez", name: "Megrez", constellation: "Ursa Major", x: -390, y: -280, magnitude: 3.3, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.4)" },
  { id: "alioth", name: "Alioth", constellation: "Ursa Major", x: -500, y: -250, magnitude: 1.7, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.6)" },
  { id: "mizar", name: "Mizar", constellation: "Ursa Major", x: -590, y: -210, magnitude: 2.2, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.5)" },
  { id: "alkaid", name: "Alkaid", constellation: "Ursa Major", x: -700, y: -160, magnitude: 1.8, color: "#93C5FD", glowColor: "rgba(147, 197, 253, 0.6)" },

  // ── CASSIOPEIA (The Celestial Queen 'W') ────────────────────
  { id: "schedar", name: "Schedar", constellation: "Cassiopeia", x: 260, y: 180, magnitude: 2.2, color: "#FDE68A", glowColor: "rgba(253, 230, 138, 0.6)" },
  { id: "caph", name: "Caph", constellation: "Cassiopeia", x: 200, y: 110, magnitude: 2.3, color: "#FEF08A", glowColor: "rgba(254, 240, 138, 0.5)" },
  { id: "gamma_cas", name: "Navi", constellation: "Cassiopeia", x: 340, y: 150, magnitude: 2.1, color: "#67E8F9", glowColor: "rgba(103, 232, 249, 0.6)", hasSpike: true },
  { id: "ruchbah", name: "Ruchbah", constellation: "Cassiopeia", x: 410, y: 220, magnitude: 2.7, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.4)" },
  { id: "segin", name: "Segin", constellation: "Cassiopeia", x: 490, y: 200, magnitude: 3.3, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.3)" },

  // ── CYGNUS (The Swan / Northern Cross) ───────────────────────
  { id: "deneb", name: "Deneb", constellation: "Cygnus", x: 460, y: -220, magnitude: 1.2, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.8)", hasSpike: true },
  { id: "sadr", name: "Sadr", constellation: "Cygnus", x: 540, y: -300, magnitude: 2.2, color: "#FEF08A", glowColor: "rgba(254, 240, 138, 0.5)" },
  { id: "gienah_cyg", name: "Gienah", constellation: "Cygnus", x: 620, y: -250, magnitude: 2.7, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.4)" },
  { id: "delta_cyg", name: "Fawaris", constellation: "Cygnus", x: 450, y: -350, magnitude: 2.8, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.4)" },
  { id: "albireo", name: "Albireo", constellation: "Cygnus", x: 640, y: -390, magnitude: 3.0, color: "#FBBF24", glowColor: "rgba(251, 191, 36, 0.5)" },

  // ── LYRA ─────────────────────────────────────────────────────
  { id: "vega", name: "Vega", constellation: "Lyra", x: 380, y: -450, magnitude: 0.03, color: "#67E8F9", glowColor: "rgba(103, 232, 249, 0.95)", hasSpike: true },
  { id: "sheliak", name: "Sheliak", constellation: "Lyra", x: 420, y: -510, magnitude: 3.5, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.3)" },
  { id: "sulafat", name: "Sulafat", constellation: "Lyra", x: 450, y: -490, magnitude: 3.2, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.3)" },

  // ── ORION (The Hunter) ───────────────────────────────────────
  { id: "betelgeuse", name: "Betelgeuse", constellation: "Orion", x: -620, y: 380, magnitude: 0.5, color: "#FB923C", glowColor: "rgba(251, 146, 60, 0.9)", hasSpike: true },
  { id: "bellatrix", name: "Bellatrix", constellation: "Orion", x: -480, y: 350, magnitude: 1.6, color: "#93C5FD", glowColor: "rgba(147, 197, 253, 0.6)" },
  { id: "alnitak", name: "Alnitak", constellation: "Orion", x: -580, y: 470, magnitude: 1.8, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "alnilam", name: "Alnilam", constellation: "Orion", x: -550, y: 460, magnitude: 1.7, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.6)" },
  { id: "mintaka", name: "Mintaka", constellation: "Orion", x: -520, y: 450, magnitude: 2.2, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "saiph", name: "Saiph", constellation: "Orion", x: -610, y: 560, magnitude: 2.0, color: "#93C5FD", glowColor: "rgba(147, 197, 253, 0.5)" },
  { id: "rigel", name: "Rigel", constellation: "Orion", x: -460, y: 540, magnitude: 0.1, color: "#67E8F9", glowColor: "rgba(103, 232, 249, 0.95)", hasSpike: true },
  { id: "meissa", name: "Meissa", constellation: "Orion", x: -550, y: 320, magnitude: 3.4, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.3)" },

  // ── CANIS MAJOR ──────────────────────────────────────────────
  { id: "sirius", name: "Sirius", constellation: "Canis Major", x: -380, y: 680, magnitude: -1.46, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 1.0)", hasSpike: true },
  { id: "murzim", name: "Murzim", constellation: "Canis Major", x: -430, y: 650, magnitude: 2.0, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "wezen", name: "Wezen", constellation: "Canis Major", x: -350, y: 760, magnitude: 1.8, color: "#FDE68A", glowColor: "rgba(253, 230, 138, 0.6)" },
  { id: "adhara", name: "Adhara", constellation: "Canis Major", x: -390, y: 780, magnitude: 1.5, color: "#93C5FD", glowColor: "rgba(147, 197, 253, 0.6)" },

  // ── TAURUS & THE PLEIADES ────────────────────────────────────
  { id: "aldebaran", name: "Aldebaran", constellation: "Taurus", x: -340, y: 220, magnitude: 0.85, color: "#F97316", glowColor: "rgba(249, 115, 22, 0.85)", hasSpike: true },
  { id: "elnath", name: "Elnath", constellation: "Taurus", x: -240, y: 150, magnitude: 1.6, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "tianguan", name: "Tianguan", constellation: "Taurus", x: -290, y: 290, magnitude: 3.0, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.4)" },
  // Pleiades cluster (Seven Sisters)
  { id: "alcyone", name: "Alcyone (Pleiades)", constellation: "Taurus", x: -390, y: 160, magnitude: 2.8, color: "#67E8F9", glowColor: "rgba(103, 232, 249, 0.7)" },
  { id: "maia", name: "Maia", constellation: "Taurus", x: -400, y: 155, magnitude: 3.8, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "electra", name: "Electra", constellation: "Taurus", x: -382, y: 168, magnitude: 3.7, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },

  // ── LEO (The Lion) ───────────────────────────────────────────
  { id: "regulus", name: "Regulus", constellation: "Leo", x: -680, y: -20, magnitude: 1.35, color: "#67E8F9", glowColor: "rgba(103, 232, 249, 0.8)", hasSpike: true },
  { id: "algieba", name: "Algieba", constellation: "Leo", x: -620, y: -70, magnitude: 2.0, color: "#FDE68A", glowColor: "rgba(253, 230, 138, 0.5)" },
  { id: "denebola", name: "Denebola", constellation: "Leo", x: -760, y: -110, magnitude: 2.1, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.5)" },
  { id: "zosma", name: "Zosma", constellation: "Leo", x: -690, y: -130, magnitude: 2.6, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.4)" },

  // ── PEGASUS ──────────────────────────────────────────────────
  { id: "alpheratz", name: "Alpheratz", constellation: "Pegasus", x: 620, y: 160, magnitude: 2.1, color: "#BAE6FD", glowColor: "rgba(186, 230, 253, 0.5)" },
  { id: "scheat", name: "Scheat", constellation: "Pegasus", x: 650, y: 40, magnitude: 2.4, color: "#FDBA74", glowColor: "rgba(253, 186, 116, 0.5)" },
  { id: "markab", name: "Markab", constellation: "Pegasus", x: 740, y: 70, magnitude: 2.5, color: "#E0F2FE", glowColor: "rgba(224, 242, 254, 0.5)" },
  { id: "algenib", name: "Algenib", constellation: "Pegasus", x: 720, y: 190, magnitude: 2.8, color: "#93C5FD", glowColor: "rgba(147, 197, 253, 0.4)" },

  // ── BOÖTES ───────────────────────────────────────────────────
  { id: "arcturus", name: "Arcturus", constellation: "Boötes", x: -280, y: -620, magnitude: -0.05, color: "#FB923C", glowColor: "rgba(251, 146, 60, 0.95)", hasSpike: true },
  { id: "izar", name: "Izar", constellation: "Boötes", x: -210, y: -570, magnitude: 2.3, color: "#FDE68A", glowColor: "rgba(253, 230, 138, 0.5)" },
  { id: "muphrid", name: "Muphrid", constellation: "Boötes", x: -330, y: -560, magnitude: 2.7, color: "#FEF08A", glowColor: "rgba(254, 240, 138, 0.4)" },
];

// ─── 2. CLASSICAL "CONNECT THE DOTS" FILAMENTS ──────────────────────────────
export const CONSTELLATION_CONNECTIONS: ConstellationConnection[] = [
  // Ursa Minor
  { constellation: "Ursa Minor", starA: "polaris", starB: "yildun" },
  { constellation: "Ursa Minor", starA: "yildun", starB: "pherkad" },
  { constellation: "Ursa Minor", starA: "pherkad", starB: "kochab" },

  // Ursa Major (Big Dipper)
  { constellation: "Ursa Major", starA: "dubhe", starB: "merak" },
  { constellation: "Ursa Major", starA: "merak", starB: "phecda" },
  { constellation: "Ursa Major", starA: "phecda", starB: "megrez" },
  { constellation: "Ursa Major", starA: "megrez", starB: "dubhe" },
  { constellation: "Ursa Major", starA: "megrez", starB: "alioth" },
  { constellation: "Ursa Major", starA: "alioth", starB: "mizar" },
  { constellation: "Ursa Major", starA: "mizar", starB: "alkaid" },

  // Cassiopeia ('W')
  { constellation: "Cassiopeia", starA: "caph", starB: "schedar" },
  { constellation: "Cassiopeia", starA: "schedar", starB: "gamma_cas" },
  { constellation: "Cassiopeia", starA: "gamma_cas", starB: "ruchbah" },
  { constellation: "Cassiopeia", starA: "ruchbah", starB: "segin" },

  // Cygnus (Northern Cross)
  { constellation: "Cygnus", starA: "deneb", starB: "sadr" },
  { constellation: "Cygnus", starA: "sadr", starB: "albireo" },
  { constellation: "Cygnus", starA: "delta_cyg", starB: "sadr" },
  { constellation: "Cygnus", starA: "sadr", starB: "gienah_cyg" },

  // Lyra
  { constellation: "Lyra", starA: "vega", starB: "sheliak" },
  { constellation: "Lyra", starA: "sheliak", starB: "sulafat" },
  { constellation: "Lyra", starA: "sulafat", starB: "vega" },

  // Orion
  { constellation: "Orion", starA: "betelgeuse", starB: "meissa" },
  { constellation: "Orion", starA: "meissa", starB: "bellatrix" },
  { constellation: "Orion", starA: "betelgeuse", starB: "alnitak" },
  { constellation: "Orion", starA: "alnitak", starB: "alnilam" },
  { constellation: "Orion", starA: "alnilam", starB: "mintaka" },
  { constellation: "Orion", starA: "mintaka", starB: "bellatrix" },
  { constellation: "Orion", starA: "alnitak", starB: "saiph" },
  { constellation: "Orion", starA: "mintaka", starB: "rigel" },
  { constellation: "Orion", starA: "saiph", starB: "rigel" },

  // Canis Major
  { constellation: "Canis Major", starA: "sirius", starB: "murzim" },
  { constellation: "Canis Major", starA: "sirius", starB: "wezen" },
  { constellation: "Canis Major", starA: "wezen", starB: "adhara" },

  // Taurus
  { constellation: "Taurus", starA: "aldebaran", starB: "tianguan" },
  { constellation: "Taurus", starA: "aldebaran", starB: "alcyone" },
  { constellation: "Taurus", starA: "tianguan", starB: "elnath" },

  // Leo
  { constellation: "Leo", starA: "regulus", starB: "algieba" },
  { constellation: "Leo", starA: "algieba", starB: "zosma" },
  { constellation: "Leo", starA: "zosma", starB: "denebola" },
  { constellation: "Leo", starA: "regulus", starB: "denebola" },

  // Pegasus
  { constellation: "Pegasus", starA: "alpheratz", starB: "scheat" },
  { constellation: "Pegasus", starA: "scheat", starB: "markab" },
  { constellation: "Pegasus", starA: "markab", starB: "algenib" },
  { constellation: "Pegasus", starA: "algenib", starB: "alpheratz" },

  // Boötes
  { constellation: "Boötes", starA: "arcturus", starB: "izar" },
  { constellation: "Boötes", starA: "arcturus", starB: "muphrid" },
];

// ─── 3. CONSTELLATION TITLE LABELS ──────────────────────────────────────────
export const CONSTELLATION_LABELS: ConstellationLabel[] = [
  { name: "URSA MAJOR", latinName: "Big Dipper", x: -440, y: -340 },
  { name: "URSA MINOR", latinName: "Little Bear", x: -80, y: -120 },
  { name: "CASSIOPEIA", latinName: "The Queen", x: 340, y: 195 },
  { name: "CYGNUS", latinName: "Northern Cross", x: 530, y: -260 },
  { name: "LYRA", latinName: "The Harp", x: 410, y: -470 },
  { name: "ORION", latinName: "The Hunter", x: -550, y: 410 },
  { name: "CANIS MAJOR", latinName: "The Great Dog", x: -370, y: 730 },
  { name: "TAURUS", latinName: "The Bull", x: -310, y: 200 },
  { name: "LEO", latinName: "The Lion", x: -670, y: -60 },
  { name: "PEGASUS", latinName: "Winged Horse", x: 680, y: 110 },
  { name: "BOÖTES", latinName: "The Herdsman", x: -270, y: -580 },
];

// ─── 4. EASTERN TIME DIURNAL ROTATION & SOLAR/LUNAR CALCULATION ─────────────
export interface EasternTimeInfo {
  etHours: number;           // 0.0 to 24.0
  hours: number;             // 0 to 23
  minutes: number;           // 0 to 59
  seconds: number;           // 0 to 59
  timeString12: string;      // e.g. "4:31:25 PM EDT"
  timeString24: string;      // e.g. "16:31:25 EDT"
  isDaylight: boolean;       // 06:30 to 19:30 ET
  statusLabel: string;       // "☀️ DAYLIGHT GLIDE" or "🌙 CELESTIAL NIGHT"
  celestialAngleRad: number; // 24-hour diurnal rotation angle in radians
  sunProgress: number;       // 0.0 to 1.0 along the 24h day track (0.5 = High Noon)
  moonProgress: number;      // 0.0 to 1.0 along the 24h day track (opposite sun)
  moonPhaseName: string;     // e.g. "Waxing Gibbous"
  moonPhaseIcon: string;     // 🌔
}

/**
 * Calculates live Eastern Time values, celestial rotation angles, and solar/lunar metrics.
 */
export function getEasternTimeInfo(): EasternTimeInfo {
  const now = new Date();

  // Robustly extract Eastern Time (America/New_York) components
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const parts = etFormatter.formatToParts(now);
  let hours = 12;
  let minutes = 0;
  let seconds = 0;

  for (const p of parts) {
    if (p.type === "hour") hours = parseInt(p.value, 10);
    if (p.type === "minute") minutes = parseInt(p.value, 10);
    if (p.type === "second") seconds = parseInt(p.value, 10);
  }

  // Fraction of 24h day in Eastern Time
  const etHours = hours + minutes / 60 + seconds / 3600;
  const dayFraction = etHours / 24;

  // Earth rotates 360 deg (2*PI) once every 24 hours
  // At midnight (etHours = 0) angle is 0; continuously revolves counter-clockwise to match Earth rotation
  const celestialAngleRad = dayFraction * Math.PI * 2;

  // Daylight in Bristol, TN typically spans 06:30 to 19:30 ET
  const isDaylight = etHours >= 6.5 && etHours < 19.5;
  const statusLabel = isDaylight ? "DAYLIGHT GLIDE" : "CELESTIAL NIGHT";

  // Sun position: progress 0.0 (midnight) -> 0.5 (noon, zenith) -> 1.0 (midnight)
  const sunProgress = dayFraction;
  // Moon position: diametrically opposite the Sun in the 24h cycle
  const moonProgress = (dayFraction + 0.5) % 1.0;

  // 12-hour formatted time string
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const pad = (n: number) => String(n).padStart(2, "0");
  const timeString12 = `${h12}:${pad(minutes)}:${pad(seconds)} ${ampm} EDT`;
  const timeString24 = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} EDT`;

  // Approximate real moon phase calculation
  // Known reference new moon: January 11, 2024 at 11:57 UTC
  const synodicMonth = 29.53058867; // days
  const refNewMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const diffDays = (now.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const cycleProgress = (diffDays % synodicMonth) / synodicMonth;

  let moonPhaseName = "Full Moon";
  let moonPhaseIcon = "🌕";

  if (cycleProgress < 0.03 || cycleProgress > 0.97) {
    moonPhaseName = "New Moon";
    moonPhaseIcon = "🌑";
  } else if (cycleProgress < 0.22) {
    moonPhaseName = "Waxing Crescent";
    moonPhaseIcon = "🌒";
  } else if (cycleProgress < 0.28) {
    moonPhaseName = "First Quarter";
    moonPhaseIcon = "🌓";
  } else if (cycleProgress < 0.47) {
    moonPhaseName = "Waxing Gibbous";
    moonPhaseIcon = "🌔";
  } else if (cycleProgress < 0.53) {
    moonPhaseName = "Full Moon";
    moonPhaseIcon = "🌕";
  } else if (cycleProgress < 0.72) {
    moonPhaseName = "Waning Gibbous";
    moonPhaseIcon = "🌖";
  } else if (cycleProgress < 0.78) {
    moonPhaseName = "Last Quarter";
    moonPhaseIcon = "🌗";
  } else {
    moonPhaseName = "Waning Crescent";
    moonPhaseIcon = "🌘";
  }

  return {
    etHours,
    hours,
    minutes,
    seconds,
    timeString12,
    timeString24,
    isDaylight,
    statusLabel,
    celestialAngleRad,
    sunProgress,
    moonProgress,
    moonPhaseName,
    moonPhaseIcon,
  };
}
