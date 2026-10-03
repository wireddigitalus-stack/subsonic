/**
 * Subsonic Society — EVOS 1.0 Neural Topology Data Architecture
 * 
 * Maps real platform entities (competitors, autonomous bots, AI moderation sentinels,
 * master admin controls, and the central telemetry router) into an organic
 * bio-luminous node topology with Bezier synapses and rich data cards.
 */

export interface EvoTransmission {
  content: string;
  channel: string;
  timestamp: string;
  type?: "STANDARD" | "DOPE_DROP" | "MATCH_ALERT" | "WEATHER" | "VIOLATION";
  reactionsCount?: number;
}

export interface EvoDopeCard {
  targetDistance: string;
  targetDescription: string;
  elevationMils: string;
  windHoldMils: string;
  ammo: string;
  densityAltitude: string;
  notes?: string;
}

export interface EvoModerationData {
  standing: "CLEAN" | "WATCHLIST" | "FLAGGED" | "SENTINEL";
  toxicityScore: number;
  threatScore?: number;
  policyScore?: number;
  warningsCount: number;
  lastFlagReason?: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "WARNING" | "VIOLATION";
}

export interface EvoBotSpecs {
  personality: string;
  primaryChannels: string[];
  dopeDropRate: number;
  reactionRate: number;
  isBadActor?: boolean;
  violationRate?: number;
}

export interface EvoTelemetryStats {
  totalClicks?: number;
  dwellSeconds?: number;
  lastSeen?: string;
  favoriteRoute?: string;
}

export interface EvoMatchResult {
  matchName: string;
  date: string;
  finish: string;
  points: string;
  division: string;
  percentile?: string;
}

export interface EvoRankBadge {
  tier: "GRANDMASTER" | "MASTER" | "EXPERT" | "PRO" | "MARKSMAN";
  rating: number;
  percentile: string;
  regionalRank?: string;
}

export interface EvoChannelCoverage {
  roomName: string;
  activeShooters: number;
  health: "NOMINAL" | "HIGH_LOAD" | "FLAGGED";
  lastAudit?: string;
}

export interface EvoEnforcementStats {
  flagsProcessed: number;
  mutesIssued: number;
  warnings: number;
  cleanRate: string;
  aiSentinelUptime: string;
}

export interface EvoSimTimelineEvent {
  time: string;
  event: string;
  type: "chat" | "dope" | "flag" | "ping";
}

export interface EvoSystemHealth {
  uptime: string;
  throughput: string;
  memoryUsed: string;
  activeSockets: number;
  dbLag: string;
}

export interface EvoSecurityLogEntry {
  timestamp: string;
  event: string;
  level: "info" | "warning" | "alert";
  ipMasked?: string;
}

export interface EvoNode {
  id: string;
  parentId?: string;
  label: string;
  sublabel?: string;
  cluster: "HUB" | "USERS" | "MODS" | "ADMIN" | "BOTS";
  role?: string;
  callsign?: string;
  memberId?: string;
  division?: string;
  ranking?: string;
  homeRange?: string;
  
  // Equipment / Rifle Rig Specs
  rifleSetup?: string;
  action?: string;
  barrel?: string;
  chassis?: string;
  optic?: string;
  ammo?: string;
  
  // Real transmission & DOPE data
  latestTransmission?: EvoTransmission;
  dopeCard?: EvoDopeCard;
  moderationData?: EvoModerationData;
  botSpecs?: EvoBotSpecs;
  telemetryStats?: EvoTelemetryStats;

  // Rich Dossier & Deep Inspection Data
  matchHistory?: EvoMatchResult[];
  rankBadge?: EvoRankBadge;
  channelCoverage?: EvoChannelCoverage[];
  enforcementStats?: EvoEnforcementStats;
  simulationTimeline?: EvoSimTimelineEvent[];
  systemHealth?: EvoSystemHealth;
  securityLog?: EvoSecurityLogEntry[];
  connectedNodeIds?: string[];

  // Spatial canvas properties
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  icon?: "user" | "shield" | "lock" | "bell" | "bot" | "sliders" | "chart" | "hub" | "radar" | "zap";
  status?: "ACTIVE" | "AWAY" | "ALERT" | "STANDBY";
  latencyMs?: number;
  metrics?: {
    accuracy?: number;
    learningProgress?: number;
    responseTimeMs?: number;
    activityLogMs?: number;
    sparkline?: number[];
  };
  details?: {
    joinDate?: string;
    protocol?: string;
    tools?: string[];
  };
}

export interface EvoLink {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  latencyLabel?: string;
  curvature?: number; // bezier bend factor
  pulseSpeed?: number; // speed of travelling packet
}

export const EVO_CLUSTERS = {
  HUB: {
    title: "MAIN HUB",
    subtitle: "ACTIVITY HUB",
    color: "#06B6D4",
    accent: "#EC4899",
    glow: "rgba(6, 182, 212, 0.4)",
  },
  USERS: {
    title: "USER POPULATION",
    subtitle: "Active Competitors & Squads",
    color: "#38BDF8",
    accent: "#0284C7",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  MODS: {
    title: "MODERATOR TEAM",
    subtitle: "RO BOT AI Sentinel & Host Watch",
    color: "#F43F5E",
    accent: "#E11D48",
    glow: "rgba(244, 63, 94, 0.4)",
  },
  ADMIN: {
    title: "ADMIN CONTROLS",
    subtitle: "Master Admin & Core Security",
    color: "#06B6D4",
    accent: "#6366F1",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  BOTS: {
    title: "AI BOTS TEST BED",
    subtitle: "Autonomous Simulation Fleet",
    color: "#F59E0B",
    accent: "#D97706",
    glow: "rgba(245, 158, 11, 0.4)",
  },
};

export const EVO_NODES: EvoNode[] = [
  // ─── 1. CENTRAL MAIN HUB ──────────────────────────────────────────
  {
    id: "hub-main",
    label: "MAIN HUB",
    sublabel: "ACTIVITY HUB",
    cluster: "HUB",
    role: "CENTRAL TELEMETRY & COMMS BUS",
    callsign: "NEXUS",
    memberId: "SYSTEM-CORE",
    x: 0,
    y: 0,
    radius: 72,
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.55)",
    icon: "hub",
    status: "ACTIVE",
    latencyMs: 1,
    metrics: {
      responseTimeMs: 1,
      accuracy: 99.9,
      learningProgress: 94,
      sparkline: [42, 58, 64, 78, 85, 92, 98],
    },
    systemHealth: {
      uptime: "99.98% (24d 14h)",
      throughput: "1,420 packets/sec",
      memoryUsed: "148 MB / 512 MB",
      activeSockets: 94,
      dbLag: "1.2 ms",
    },
    details: {
      protocol: "WebSocket / Supabase Realtime Stream",
      tools: ["DOPE Card Calculator", "Harmonic Tuner Analyzer", "AES-256 Comms Gate"],
    },
    latestTransmission: {
      content: "Central Nexus routing 18 stages, 94 registered marksmen, and 6 active simulation bots.",
      channel: "System Broadcaster",
      timestamp: "Just Now",
      type: "MATCH_ALERT",
      reactionsCount: 42,
    },
  },
  {
    id: "hub-feed-bristol",
    parentId: "hub-main",
    label: "BRISTOL PRO FEED",
    sublabel: "Stage 1-18 Live Stream",
    cluster: "HUB",
    role: "MATCH_STREAM",
    callsign: "STAGE",
    x: -110,
    y: 80,
    radius: 30,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.4)",
    icon: "zap",
    status: "ACTIVE",
    latencyMs: 2,
    latestTransmission: {
      content: "Live Stage 4 terminal glide active. Steel arrays 425 to 465 yards reporting 1.4s flight time.",
      channel: "bristol-pro-shootout",
      timestamp: "2m ago",
      type: "STANDARD",
    },
  },
  {
    id: "hub-feed-ballistics",
    parentId: "hub-main",
    label: "BALLISTICS LAB",
    sublabel: "Radar Chrono & Tuner Logs",
    cluster: "HUB",
    role: "RESEARCH_STREAM",
    callsign: "DOPE",
    x: 110,
    y: -80,
    radius: 30,
    color: "#EC4899",
    glowColor: "rgba(236, 72, 153, 0.4)",
    icon: "chart",
    status: "ACTIVE",
    latencyMs: 2,
    latestTransmission: {
      content: "Doppler benchmark complete: Lapua Center-X SD 4.2 fps across 50-round string.",
      channel: "ballistics-and-gear",
      timestamp: "5m ago",
      type: "STANDARD",
    },
  },

  // ─── 2. USER POPULATION CLUSTER (Top-Left) ────────────────────────
  {
    id: "cluster-users",
    parentId: "hub-main",
    label: "USER POPULATION",
    sublabel: "Active Competitors Hub",
    cluster: "USERS",
    role: "COMMUNITY_CLUSTER",
    callsign: "USERS",
    x: -460,
    y: -260,
    radius: 48,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.5)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 4,
    metrics: {
      accuracy: 94,
      responseTimeMs: 6,
    },
  },
  {
    id: "user-wyatt",
    parentId: "cluster-users",
    label: "Wyatt Sterling",
    sublabel: "Open Pro • Rank #4",
    cluster: "USERS",
    role: "PRO_COMPETITOR",
    callsign: "GHOST",
    memberId: "SS-2026-1044",
    division: "Open Division Pro",
    ranking: "National Rank #4",
    homeRange: "Holston Range, Bristol, TN",
    action: "Vudoo V-22 3-Lug Rimfire",
    barrel: "Bartlein MTU 20\" Match 1:16 Twist",
    chassis: "MDT ACC Elite Carbon Titanium",
    optic: "Zero Compromise Optic ZC527 MPCT3X",
    ammo: "Lapua Center-X 40gr Subsonic",
    rifleSetup: "Vudoo V-22 / Bartlein MTU 20\" / ZCO 527",
    x: -690,
    y: -380,
    radius: 28,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.5)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 4,
    metrics: {
      accuracy: 98,
      responseTimeMs: 8,
      sparkline: [92, 95, 94, 98, 97, 99, 98],
    },
    rankBadge: {
      tier: "GRANDMASTER",
      rating: 2410,
      percentile: "Top 0.4%",
      regionalRank: "Appalachian Rimfire #1",
    },
    matchHistory: [
      {
        matchName: "Smoky Mountain Rimfire Classic",
        date: "Sep 2026",
        finish: "1st of 82",
        points: "98.4 / 100",
        division: "Open Division Pro",
        percentile: "100th",
      },
      {
        matchName: "Bristol Fall Steel Challenge",
        date: "Aug 2026",
        finish: "2nd of 74",
        points: "96.2 / 100",
        division: "Open Division Pro",
        percentile: "98th",
      },
      {
        matchName: "Blue Ridge PRS Qualifier",
        date: "Jul 2026",
        finish: "1st of 95",
        points: "99.1 / 100",
        division: "Open Division Pro",
        percentile: "100th",
      },
    ],
    dopeCard: {
      targetDistance: "340 YDS",
      targetDescription: "Stage 4 • Diamond KYL Rack",
      elevationMils: "8.4 MIL",
      windHoldMils: "L 0.6 MIL",
      ammo: "Lapua Center-X 40gr (1,062 FPS)",
      densityAltitude: "+2,150 FT",
      notes: "Hold left-edge center. Downdraft causes 0.2 mil vertical drop if wind drops under 6 mph.",
    },
    latestTransmission: {
      content: "Verified DOPE card for the 340-yard diamond plate on Stage 4. Lapua Center-X lot 32187 holding 1062 fps. Watch for the thermal lift off the lower draw.",
      channel: "bristol-pro-shootout",
      timestamp: "10:45 AM",
      type: "DOPE_DROP",
      reactionsCount: 33,
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 0,
      warningsCount: 0,
      sentiment: "POSITIVE",
    },
    telemetryStats: {
      totalClicks: 84,
      dwellSeconds: 420,
      favoriteRoute: "/bristol-pro",
    },
    details: {
      joinDate: "Charter Member (Feb 2026)",
    },
  },
  {
    id: "user-kendra",
    parentId: "cluster-users",
    label: "Kendra Cross",
    sublabel: "SE Regional Champion",
    cluster: "USERS",
    role: "PRO_COMPETITOR",
    callsign: "COLDBORE",
    memberId: "SS-2026-1082",
    division: "Open Rimfire Pro",
    ranking: "Southeast Regional Champion",
    homeRange: "Smoky Mountain Precision, TN",
    action: "Zermatt RimX Precision Action",
    barrel: "Proof Research Carbon 22\"",
    chassis: "Foundation Revelation Stock",
    optic: "Tangent Theta TT525P Gen 3XR",
    ammo: "SK Match Long Range 40gr",
    rifleSetup: "RimX / Proof Carbon 22\" / TT525P",
    x: -510,
    y: -470,
    radius: 26,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.45)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 6,
    metrics: {
      accuracy: 96,
      responseTimeMs: 11,
    },
    latestTransmission: {
      content: "For anyone asking about tuners on the RimX: The Harrell tuner clamped 1.5 inches back tightened our 100-yard group from 0.42 MOA to 0.28 MOA with SK Long Range.",
      channel: "ballistics-and-gear",
      timestamp: "11:20 AM",
      type: "STANDARD",
      reactionsCount: 20,
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 0,
      warningsCount: 0,
      sentiment: "POSITIVE",
    },
    telemetryStats: {
      totalClicks: 62,
      dwellSeconds: 310,
      favoriteRoute: "/dna",
    },
    details: {
      joinDate: "Member since March 2026",
    },
  },
  {
    id: "user-eli",
    parentId: "cluster-users",
    label: "Eli McAllister",
    sublabel: "Appalachian Cup Winner",
    cluster: "USERS",
    role: "MEMBER",
    callsign: "DIALED",
    memberId: "SS-2026-2005",
    division: "Production Division",
    ranking: "Appalachian Cup Winner",
    homeRange: "Tri-Cities Rimfire Club, Bristol, TN",
    action: "CZ 457 MTR Tuned",
    barrel: "Factory 20.5\" Match Chamber",
    chassis: "MDT XRS Hybrid Chassis",
    optic: "Vortex Razor HD Gen III 6-36x56",
    ammo: "ELEY Tenex 1058 fps Subsonic",
    rifleSetup: "CZ 457 MTR / Vortex Razor Gen III",
    x: -700,
    y: -220,
    radius: 24,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.4)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 9,
    latestTransmission: {
      content: "Anyone travelling to Bristol from North Carolina wanting to share a cabin near South Holston Lake? Plenty of room for gear cases and loading benches.",
      channel: "general-society",
      timestamp: "12:05 PM",
      type: "STANDARD",
      reactionsCount: 6,
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 2,
      warningsCount: 0,
      sentiment: "POSITIVE",
    },
    details: {
      joinDate: "Member since April 2026",
    },
  },
  {
    id: "user-sofia",
    parentId: "cluster-users",
    label: "Sofia Reyes",
    sublabel: "Production Class",
    cluster: "USERS",
    role: "MEMBER",
    callsign: "VIPER",
    memberId: "SS-2026-3012",
    division: "Production Division",
    rifleSetup: "Bergara B-14R / Bushnell XRS3 6-36",
    ammo: "Lapua Center-X 40gr",
    x: -330,
    y: -430,
    radius: 22,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.35)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 11,
    latestTransmission: {
      content: "Just zeroed the Bergara at 50 yards with Lapua Center-X lot 34. Single hole 10-shot group.",
      channel: "ballistics-and-gear",
      timestamp: "1:40 PM",
      type: "STANDARD",
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 0,
      warningsCount: 0,
    },
  },
  {
    id: "user-caleb",
    parentId: "cluster-users",
    label: "Caleb Sterling",
    sublabel: "Match Director Staff",
    cluster: "USERS",
    role: "RANGE_SAFETY_OFFICER",
    callsign: "RO-CHIEF",
    memberId: "SS-2026-0088",
    division: "Staff Safety Lead",
    rifleSetup: "Bergara B-14R Trainer / Kestrel 5700",
    x: -250,
    y: -280,
    radius: 22,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.35)",
    icon: "shield",
    status: "ACTIVE",
    latencyMs: 5,
    latestTransmission: {
      content: "Range safety briefing: All rifles must be transported with clear chamber flags inserted.",
      channel: "squad-briefings",
      timestamp: "8:00 AM",
      type: "STANDARD",
    },
  },
  {
    id: "user-comm-groups",
    parentId: "cluster-users",
    label: "COMMUN GROUPS",
    sublabel: "Squad Comms Channels",
    cluster: "USERS",
    role: "SQUAD_CHANNEL_HUB",
    callsign: "SQUADS",
    x: -430,
    y: -80,
    radius: 34,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.35)",
    icon: "sliders",
    status: "ACTIVE",
    latencyMs: 5,
  },
  {
    id: "user-apex",
    parentId: "cluster-users",
    label: "Jackson Miller",
    sublabel: "Open Division Squad 2",
    cluster: "USERS",
    role: "COMPETITOR",
    callsign: "APEX-22",
    memberId: "SS-2026-1140",
    division: "Open Division",
    rifleSetup: "Vudoo V-22 / MDT ACC / Leupold Mark 5HD",
    x: -620,
    y: -70,
    radius: 20,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.3)",
    icon: "user",
    status: "AWAY",
    latencyMs: 14,
  },
  {
    id: "user-ghostrider",
    parentId: "cluster-users",
    label: "Dan Kowalski",
    sublabel: "Squad 3 Barricade Lead",
    cluster: "USERS",
    role: "COMPETITOR",
    callsign: "GHOST RIDER",
    memberId: "SS-2026-1055",
    division: "Production Division",
    rifleSetup: "RimX / MDT Field Stock / Bushnell Match Pro",
    x: -470,
    y: 60,
    radius: 20,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.3)",
    icon: "user",
    status: "STANDBY",
    latencyMs: 19,
  },

  // ─── 3. MODERATOR TEAM CLUSTER (Top-Right) ────────────────────────
  {
    id: "cluster-mods",
    parentId: "hub-main",
    label: "MODERATOR TEAM",
    sublabel: "Range Marshal Watch",
    cluster: "MODS",
    role: "MODERATION_CLUSTER",
    callsign: "MODS",
    x: 460,
    y: -260,
    radius: 48,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.5)",
    icon: "shield",
    status: "ACTIVE",
    latencyMs: 3,
    metrics: {
      accuracy: 99.8,
      responseTimeMs: 8,
    },
  },
  {
    id: "mod-sentinel",
    parentId: "cluster-mods",
    label: "RO BOT AI RANGE OFFICER",
    sublabel: "Gemini 2.5 Sentinel",
    cluster: "MODS",
    role: "AI_SAFETY_ENGINE",
    callsign: "RO BOT",
    memberId: "AI-MOD-01",
    x: 690,
    y: -380,
    radius: 34,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.6)",
    icon: "shield",
    status: "ACTIVE",
    latencyMs: 2,
    metrics: {
      accuracy: 99.9,
      responseTimeMs: 6,
      sparkline: [99, 100, 98, 100, 99, 100, 100],
    },
    enforcementStats: {
      flagsProcessed: 184,
      mutesIssued: 4,
      warnings: 12,
      cleanRate: "99.8%",
      aiSentinelUptime: "99.99%",
    },
    channelCoverage: [
      { roomName: "bristol-pro-shootout", activeShooters: 48, health: "NOMINAL", lastAudit: "30s ago" },
      { roomName: "ballistics-and-gear", activeShooters: 24, health: "NOMINAL", lastAudit: "1m ago" },
      { roomName: "general-society", activeShooters: 38, health: "NOMINAL", lastAudit: "15s ago" },
      { roomName: "trade-and-classifieds", activeShooters: 14, health: "NOMINAL", lastAudit: "45s ago" },
    ],
    moderationData: {
      standing: "SENTINEL",
      toxicityScore: 0,
      threatScore: 0,
      policyScore: 0,
      warningsCount: 0,
      sentiment: "POSITIVE",
    },
    details: {
      protocol: "Google Gemini 2.5 Flash + Heuristic Safety Engine",
      tools: ["Sentiment Classifier", "Anti-Commerce Filter", "Harassment Interceptor"],
    },
    latestTransmission: {
      content: "All channels nominal. Heuristic scanner active on chat and trade streams. Zero policy violations currently unaddressed.",
      channel: "Safety Sentinel Monitor",
      timestamp: "Active",
      type: "MATCH_ALERT",
    },
  },
  {
    id: "mod-host-1",
    parentId: "cluster-mods",
    label: "HOST ROOM 1",
    sublabel: "Bristol Pro Shootout",
    cluster: "MODS",
    role: "CHANNEL_HOST",
    callsign: "ROOM 1",
    x: 270,
    y: -390,
    radius: 28,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    icon: "chart",
    status: "ACTIVE",
    latencyMs: 8,
    latestTransmission: {
      content: "Live Stage 1-18 squad check-ins monitored. 94 competitor registrations verified.",
      channel: "bristol-pro-shootout",
      timestamp: "Active",
      type: "STANDARD",
    },
  },
  {
    id: "mod-host-12",
    parentId: "cluster-mods",
    label: "HOST ROOM 12",
    sublabel: "Ballistics & DOPE",
    cluster: "MODS",
    role: "CHANNEL_HOST",
    callsign: "ROOM 12",
    x: 490,
    y: -470,
    radius: 26,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    icon: "chart",
    status: "ACTIVE",
    latencyMs: 14,
  },
  {
    id: "mod-host-23",
    parentId: "cluster-mods",
    label: "HOST ROOM 23",
    sublabel: "Squad Comms & Trade",
    cluster: "MODS",
    role: "CHANNEL_HOST",
    callsign: "ROOM 23",
    x: 690,
    y: -200,
    radius: 24,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    icon: "chart",
    status: "ACTIVE",
    latencyMs: 18,
  },
  {
    id: "mod-policy",
    parentId: "cluster-mods",
    label: "SAFETY PROTOCOLS",
    sublabel: "Auto-Mute Timer",
    cluster: "MODS",
    role: "POLICY_GATEWAY",
    callsign: "GATEWAY",
    x: 270,
    y: -180,
    radius: 24,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.35)",
    icon: "lock",
    status: "ACTIVE",
    latencyMs: 4,
  },

  // ─── 4. ADMIN CONTROLS CLUSTER (Bottom-Left) ──────────────────────
  {
    id: "cluster-admin",
    parentId: "hub-main",
    label: "ADMIN CONTROLS",
    sublabel: "Core Security Hub",
    cluster: "ADMIN",
    role: "MASTER_ADMIN_CLUSTER",
    callsign: "ADMIN",
    x: -460,
    y: 280,
    radius: 48,
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.5)",
    icon: "radar",
    status: "ACTIVE",
    latencyMs: 2,
    metrics: {
      accuracy: 100,
      responseTimeMs: 3,
    },
  },
  {
    id: "admin-rob",
    parentId: "cluster-admin",
    label: "Rob Neilson",
    sublabel: "Master Admin • Systems Architecture",
    cluster: "ADMIN",
    role: "MASTER_OWNER",
    callsign: "RADAR",
    memberId: "SS-2026-0001",
    division: "Master Admin",
    homeRange: "Systems Engineering & Infrastructure Hub",
    rifleSetup: "Systems & Infrastructure Architecture (Non-Shooter)",
    x: -680,
    y: 400,
    radius: 36,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.6)",
    icon: "radar",
    status: "ACTIVE",
    latencyMs: 1,
    metrics: {
      accuracy: 100,
      responseTimeMs: 1,
      sparkline: [98, 99, 100, 100, 100, 100, 100],
    },
    systemHealth: {
      uptime: "99.99% • Master Host Online",
      throughput: "3,840 events/min",
      memoryUsed: "210 MB / 1024 MB",
      activeSockets: 94,
      dbLag: "0.8 ms",
    },
    securityLog: [
      { timestamp: "12m ago", event: "Master PIN validated (2468)", level: "info" },
      { timestamp: "1h ago", event: "Automated Supabase sync verified clean", level: "info" },
      { timestamp: "3h ago", event: "Zero threat escalations in triage queue", level: "info" },
    ],
    telemetryStats: {
      totalClicks: 1420,
      dwellSeconds: 5200,
      favoriteRoute: "/admin",
      lastSeen: "Active Master Session",
    },
    details: {
      joinDate: "Founding Master Admin (Jan 2026)",
      protocol: "Superuser Master Credential (Passkey 2468 / 620620)",
      tools: ["Telemetry JSONL Stream", "Supabase Sync", "Member Management", "Panic Lock"],
    },
    latestTransmission: {
      content: "EVOS 1.0 dynamic neural topology online. Telemetry pipeline synchronized with data/telemetry-events.jsonl.",
      channel: "Executive Comms",
      timestamp: "Active",
      type: "STANDARD",
    },
  },
  {
    id: "admin-telemetry-db",
    parentId: "cluster-admin",
    label: "TELEMETRY ENGINE",
    sublabel: "telemetry-events.jsonl",
    cluster: "ADMIN",
    role: "PERSISTENT_STORAGE",
    callsign: "JSONL",
    x: -280,
    y: 420,
    radius: 28,
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    icon: "chart",
    status: "ACTIVE",
    latencyMs: 2,
    details: {
      protocol: "Node.js appendFile JSON Lines + In-Memory Deduplication",
    },
  },
  {
    id: "admin-member-db",
    parentId: "cluster-admin",
    label: "MEMBER REGISTRY",
    sublabel: "120 Registered Shooters",
    cluster: "ADMIN",
    role: "DATABASE",
    callsign: "REGISTRY",
    x: -480,
    y: 490,
    radius: 26,
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    icon: "user",
    status: "ACTIVE",
    latencyMs: 4,
  },
  {
    id: "admin-security",
    parentId: "cluster-admin",
    label: "GATEKEEPER AUTH",
    sublabel: "Passkey Security Gate",
    cluster: "ADMIN",
    role: "SECURITY_PROTOCOL",
    callsign: "PASSKEY",
    x: -260,
    y: 240,
    radius: 24,
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.35)",
    icon: "lock",
    status: "ACTIVE",
    latencyMs: 2,
  },
  {
    id: "admin-panic-lock",
    parentId: "cluster-admin",
    label: "EMERGENCY LOCKDOWN",
    sublabel: "Global Comms Killswitch",
    cluster: "ADMIN",
    role: "KILLSWITCH",
    callsign: "KILLSWITCH",
    x: -680,
    y: 230,
    radius: 24,
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    icon: "lock",
    status: "STANDBY",
    latencyMs: 1,
  },

  // ─── 5. AI BOTS TEST BED CLUSTER (Bottom-Right) ───────────────────
  {
    id: "cluster-bots",
    parentId: "hub-main",
    label: "AI BOTS TEST BED",
    sublabel: "Autonomous Fleet Hub",
    cluster: "BOTS",
    role: "BOT_FLEET_HUB",
    callsign: "BOTS",
    x: 460,
    y: 280,
    radius: 48,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.5)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 5,
    metrics: {
      learningProgress: 91,
      responseTimeMs: 12,
    },
  },
  {
    id: "bot-marcus-badactor",
    parentId: "cluster-bots",
    label: "Marcus Webb",
    sublabel: "AI Mod Stress Actor",
    cluster: "BOTS",
    role: "PRO_COMPETITOR",
    callsign: "IRONHIDE",
    memberId: "BOT-MARCUS-01",
    division: "Open Division Pro",
    rifleSetup: "Vudoo Ravage / Krieger 20\" / NF ATACR 7-35",
    action: "Vudoo Ravage Rimfire",
    barrel: "Krieger 20\" Custom Match",
    optic: "Nightforce ATACR 7-35x56",
    ammo: "Lapua Midas+ 40gr",
    x: 680,
    y: 400,
    radius: 34,
    color: "#EF4444",
    glowColor: "rgba(239, 68, 68, 0.65)",
    icon: "bot",
    status: "ALERT",
    latencyMs: 12,
    metrics: {
      accuracy: 94,
      responseTimeMs: 18,
      sparkline: [62, 70, 85, 74, 91, 88, 94],
    },
    simulationTimeline: [
      { time: "2m ago", event: "Transmitted stage condition briefing", type: "chat" },
      { time: "14m ago", event: "Calculated dummy DOPE drop (1062 fps)", type: "dope" },
      { time: "42m ago", event: "Generated boundary edge case for RO BOT AI Sentinel", type: "flag" },
      { time: "1h ago", event: "Simulated peer ping response (12ms)", type: "ping" },
    ],
    botSpecs: {
      personality: "veteran-tactical",
      primaryChannels: ["bristol-pro-shootout", "range-conditions-weather", "squad-briefings"],
      dopeDropRate: 0.3,
      reactionRate: 0.3,
      isBadActor: true,
      violationRate: 0.15,
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 0,
      threatScore: 0,
      policyScore: 0,
      warningsCount: 0,
      sentiment: "POSITIVE",
    },
    latestTransmission: {
      content: "Squad briefing check complete. Range conditions nominal for Bristol Pro Shootout.",
      channel: "bristol-pro-shootout",
      timestamp: "12m ago",
      type: "STANDARD",
      reactionsCount: 1,
    },
    details: {
      protocol: "Autonomous Bad-Actor Stress Generator (tests RO BOT AI Sentinel)",
    },
  },
  {
    id: "bot-garrett",
    parentId: "cluster-bots",
    label: "Garrett Vance (Bot)",
    sublabel: "Match Director Bot",
    cluster: "BOTS",
    role: "MATCH_DIRECTOR",
    callsign: "DIRECTOR",
    memberId: "BOT-GARRETT-01",
    division: "RANGE MASTER",
    rifleSetup: "Kestrel 5700 Elite Link",
    x: 280,
    y: 420,
    radius: 26,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.4)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 6,
    botSpecs: {
      personality: "official-formal",
      primaryChannels: ["bristol-pro-shootout", "match-day-alerts", "range-conditions-weather", "squad-briefings"],
      dopeDropRate: 0,
      reactionRate: 0.15,
      isBadActor: false,
    },
    latestTransmission: {
      content: "Ridge weather update from Station 2 (Elevation 3,420 FT): Current winds 9 gusting 14 mph from 270° (WNW). Density altitude +2,150 ft.",
      channel: "range-conditions-weather",
      timestamp: "12:30 PM",
      type: "WEATHER",
      reactionsCount: 15,
    },
    moderationData: {
      standing: "CLEAN",
      toxicityScore: 0,
      warningsCount: 0,
    },
  },
  {
    id: "bot-wyatt-sim",
    parentId: "cluster-bots",
    label: "Wyatt Sterling (Bot)",
    sublabel: "Simulated Open Pro",
    cluster: "BOTS",
    role: "PRO_COMPETITOR",
    callsign: "GHOST-BOT",
    memberId: "BOT-WYATT-01",
    division: "Open Division Pro",
    rifleSetup: "Vudoo V-22 / Bartlein MTU 20\" / ZCO 527",
    x: 690,
    y: 230,
    radius: 24,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.35)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 8,
    botSpecs: {
      personality: "elite-data-driven",
      primaryChannels: ["bristol-pro-shootout", "squad-briefings", "ballistics-and-gear"],
      dopeDropRate: 0.35,
      reactionRate: 0.4,
    },
  },
  {
    id: "bot-kendra-sim",
    parentId: "cluster-bots",
    label: "Kendra Cross (Bot)",
    sublabel: "Simulated Ballistics",
    cluster: "BOTS",
    role: "PRO_COMPETITOR",
    callsign: "COLD-BOT",
    memberId: "BOT-KENDRA-01",
    division: "Open Rimfire Pro",
    rifleSetup: "RimX / Proof Carbon 22\" / TT525P",
    x: 500,
    y: 490,
    radius: 24,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.35)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 9,
    botSpecs: {
      personality: "technical-analytical",
      primaryChannels: ["ballistics-and-gear", "bristol-pro-shootout", "range-conditions-weather"],
      dopeDropRate: 0.2,
      reactionRate: 0.35,
    },
  },
  {
    id: "bot-eli-sim",
    parentId: "cluster-bots",
    label: "Eli McAllister (Bot)",
    sublabel: "Simulated Production",
    cluster: "BOTS",
    role: "MEMBER",
    callsign: "DIALED-BOT",
    memberId: "BOT-ELI-01",
    division: "Production Division",
    rifleSetup: "CZ 457 MTR / Vortex Razor Gen III",
    x: 270,
    y: 240,
    radius: 22,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 14,
    botSpecs: {
      personality: "enthusiastic-newcomer",
      primaryChannels: ["general-society", "ballistics-and-gear", "bristol-pro-shootout"],
      dopeDropRate: 0.05,
      reactionRate: 0.7,
    },
  },
  {
    id: "bot-sofia-sim",
    parentId: "cluster-bots",
    label: "Sofia Reyes (Bot)",
    sublabel: "Simulated Enthusiast",
    cluster: "BOTS",
    role: "MEMBER",
    callsign: "VIPER-BOT",
    memberId: "BOT-SOFIA-01",
    division: "Production Division",
    rifleSetup: "Bergara B-14R / Bushnell XRS3",
    x: 410,
    y: 440,
    radius: 22,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "bot",
    status: "ACTIVE",
    latencyMs: 16,
    botSpecs: {
      personality: "budget-friendly-social",
      primaryChannels: ["general-society", "ballistics-and-gear", "range-conditions-weather"],
      dopeDropRate: 0.05,
      reactionRate: 0.6,
    },
  },
];

export const EVO_LINKS: EvoLink[] = [
  // ─── MAIN HUB INTERNAL ARTERY LINKS ──────────────────────────────
  { id: "link-hub-bristol", sourceId: "hub-main", targetId: "hub-feed-bristol", color: "#38BDF8", latencyLabel: "2ms", curvature: -0.2, pulseSpeed: 0.02 },
  { id: "link-hub-ballistics", sourceId: "hub-main", targetId: "hub-feed-ballistics", color: "#EC4899", latencyLabel: "2ms", curvature: 0.2, pulseSpeed: 0.02 },

  // ─── MAIN HUB TO CLUSTER PRINCIPALS ──────────────────────────────
  { id: "link-hub-users", sourceId: "hub-main", targetId: "cluster-users", color: "#38BDF8", latencyLabel: "4ms", curvature: 0.15, pulseSpeed: 0.015 },
  { id: "link-hub-comm", sourceId: "hub-main", targetId: "user-comm-groups", color: "#38BDF8", latencyLabel: "5ms", curvature: -0.1, pulseSpeed: 0.018 },
  { id: "link-hub-mods", sourceId: "hub-main", targetId: "cluster-mods", color: "#F43F5E", latencyLabel: "3ms", curvature: -0.15, pulseSpeed: 0.016 },
  { id: "link-hub-sentinel", sourceId: "hub-main", targetId: "mod-sentinel", color: "#F43F5E", latencyLabel: "2ms", curvature: 0.25, pulseSpeed: 0.025 },
  { id: "link-hub-admin", sourceId: "hub-main", targetId: "cluster-admin", color: "#06B6D4", latencyLabel: "2ms", curvature: -0.12, pulseSpeed: 0.014 },
  { id: "link-hub-rob", sourceId: "hub-main", targetId: "admin-rob", color: "#F59E0B", latencyLabel: "1ms", curvature: 0.18, pulseSpeed: 0.022 },
  { id: "link-hub-bots", sourceId: "hub-main", targetId: "cluster-bots", color: "#F59E0B", latencyLabel: "5ms", curvature: 0.12, pulseSpeed: 0.015 },

  // ─── USERS CLUSTER NERVE SYNAPSES ────────────────────────────────
  { id: "link-users-comm", sourceId: "cluster-users", targetId: "user-comm-groups", color: "#38BDF8", latencyLabel: "3ms", curvature: 0.1, pulseSpeed: 0.012 },
  { id: "link-users-wyatt", sourceId: "cluster-users", targetId: "user-wyatt", color: "#38BDF8", latencyLabel: "4ms", curvature: 0.2, pulseSpeed: 0.02 },
  { id: "link-users-kendra", sourceId: "cluster-users", targetId: "user-kendra", color: "#38BDF8", latencyLabel: "6ms", curvature: -0.2, pulseSpeed: 0.018 },
  { id: "link-users-eli", sourceId: "cluster-users", targetId: "user-eli", color: "#38BDF8", latencyLabel: "9ms", curvature: 0.15, pulseSpeed: 0.014 },
  { id: "link-users-sofia", sourceId: "cluster-users", targetId: "user-sofia", color: "#38BDF8", latencyLabel: "11ms", curvature: -0.15, pulseSpeed: 0.012 },
  { id: "link-users-caleb", sourceId: "cluster-users", targetId: "user-caleb", color: "#38BDF8", latencyLabel: "5ms", curvature: 0.05, pulseSpeed: 0.016 },
  { id: "link-comm-apex", sourceId: "user-comm-groups", targetId: "user-apex", color: "#38BDF8", latencyLabel: "14ms", curvature: 0.1, pulseSpeed: 0.01 },
  { id: "link-comm-ghostrider", sourceId: "user-comm-groups", targetId: "user-ghostrider", color: "#38BDF8", latencyLabel: "19ms", curvature: -0.1, pulseSpeed: 0.01 },

  // ─── MODERATOR CLUSTER NERVE SYNAPSES ────────────────────────────
  { id: "link-mods-sentinel", sourceId: "cluster-mods", targetId: "mod-sentinel", color: "#F43F5E", latencyLabel: "2ms", curvature: 0.15, pulseSpeed: 0.025 },
  { id: "link-mods-host1", sourceId: "cluster-mods", targetId: "mod-host-1", color: "#F43F5E", latencyLabel: "8ms", curvature: -0.2, pulseSpeed: 0.018 },
  { id: "link-mods-host12", sourceId: "cluster-mods", targetId: "mod-host-12", color: "#F43F5E", latencyLabel: "14ms", curvature: 0.1, pulseSpeed: 0.015 },
  { id: "link-mods-host23", sourceId: "cluster-mods", targetId: "mod-host-23", color: "#F43F5E", latencyLabel: "18ms", curvature: 0.25, pulseSpeed: 0.012 },
  { id: "link-mods-policy", sourceId: "cluster-mods", targetId: "mod-policy", color: "#F43F5E", latencyLabel: "4ms", curvature: -0.1, pulseSpeed: 0.02 },

  // ─── ADMIN CLUSTER NERVE SYNAPSES ────────────────────────────────
  { id: "link-admin-rob", sourceId: "cluster-admin", targetId: "admin-rob", color: "#F59E0B", latencyLabel: "1ms", curvature: 0.1, pulseSpeed: 0.025 },
  { id: "link-admin-telemetry", sourceId: "cluster-admin", targetId: "admin-telemetry-db", color: "#06B6D4", latencyLabel: "2ms", curvature: -0.15, pulseSpeed: 0.02 },
  { id: "link-admin-members", sourceId: "cluster-admin", targetId: "admin-member-db", color: "#06B6D4", latencyLabel: "4ms", curvature: 0.2, pulseSpeed: 0.015 },
  { id: "link-admin-sec", sourceId: "cluster-admin", targetId: "admin-security", color: "#06B6D4", latencyLabel: "2ms", curvature: -0.1, pulseSpeed: 0.018 },
  { id: "link-admin-panic", sourceId: "cluster-admin", targetId: "admin-panic-lock", color: "#F43F5E", latencyLabel: "1ms", curvature: 0.15, pulseSpeed: 0.01 },

  // ─── AI BOTS CLUSTER NERVE SYNAPSES ──────────────────────────────
  { id: "link-bots-marcus", sourceId: "cluster-bots", targetId: "bot-marcus-badactor", color: "#EF4444", latencyLabel: "12ms", curvature: 0.2, pulseSpeed: 0.024 },
  { id: "link-bots-garrett", sourceId: "cluster-bots", targetId: "bot-garrett", color: "#F59E0B", latencyLabel: "6ms", curvature: -0.2, pulseSpeed: 0.018 },
  { id: "link-bots-wyatt", sourceId: "cluster-bots", targetId: "bot-wyatt-sim", color: "#F59E0B", latencyLabel: "8ms", curvature: -0.15, pulseSpeed: 0.016 },
  { id: "link-bots-kendra", sourceId: "cluster-bots", targetId: "bot-kendra-sim", color: "#F59E0B", latencyLabel: "9ms", curvature: 0.15, pulseSpeed: 0.015 },
  { id: "link-bots-eli", sourceId: "cluster-bots", targetId: "bot-eli-sim", color: "#F59E0B", latencyLabel: "14ms", curvature: 0.1, pulseSpeed: 0.014 },
  { id: "link-bots-sofia", sourceId: "cluster-bots", targetId: "bot-sofia-sim", color: "#F59E0B", latencyLabel: "16ms", curvature: -0.1, pulseSpeed: 0.013 },

  // ─── CROSS-CLUSTER TELEMETRY CORRIDORS ───────────────────────────
  // Bad actor Marcus Webb is monitored directly by Plink AI Sentinel:
  { id: "link-sentinel-marcus", sourceId: "mod-sentinel", targetId: "bot-marcus-badactor", color: "#EF4444", latencyLabel: "SENTINEL WATCH", curvature: -0.35, pulseSpeed: 0.03 },
  // Wyatt Sterling leads Host Room 1:
  { id: "link-wyatt-host1", sourceId: "user-wyatt", targetId: "mod-host-1", color: "#38BDF8", latencyLabel: "SQUAD LEAD", curvature: -0.25, pulseSpeed: 0.012 },
  // Master Admin Rob oversees Telemetry & Plink Sentinel:
  { id: "link-rob-telemetry", sourceId: "admin-rob", targetId: "admin-telemetry-db", color: "#F59E0B", latencyLabel: "AUDIT", curvature: 0.1, pulseSpeed: 0.02 },
  { id: "link-rob-sentinel", sourceId: "admin-rob", targetId: "mod-sentinel", color: "#F59E0B", latencyLabel: "ROOT OVERRIDE", curvature: 0.4, pulseSpeed: 0.015 },
];
