export interface TelemetryEvent {
  id: string;
  eventType: "click" | "pageview" | "dwell" | "scroll" | "modal_open" | "action";
  targetElement: string;
  targetText?: string;
  targetCategory?: string;
  pageRoute: string;
  dwellSeconds?: number;
  scrollDepth?: number;
  timestamp: string;
  device: {
    isMobile: boolean;
    isIOS: boolean;
    screenWidth: number;
    screenHeight: number;
    userAgent: string;
  };
  sessionId: string;
  visitorId: string;
}

export interface MatchEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  locationDetails: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tier: "PRO_SERIES" | "REGIONAL_QUALIFIER" | "CLUB_MATCH" | "CLINIC";
  stages: number;
  roundCount: number;
  distanceRange: string;
  maxCompetitors: number;
  registeredCount: number;
  entryFee: number;
  prizePool: string;
  matchDirector: {
    name: string;
    callsign: string;
    email: string;
    phone: string;
  };
  description: string;
  stageBriefs: {
    stageNumber: number;
    name: string;
    distance: string;
    targetType: string;
    roundCount: number;
    timeLimit: string;
    description: string;
  }[];
  status: "REGISTRATION_OPEN" | "SPOTS_FILLING" | "SOLD_OUT" | "COMPLETED";
  featured?: boolean;
}

export interface DopeCardData {
  targetDistance: string; // e.g. "340 YDS"
  targetDescription?: string; // e.g. "Stage 4 Diamond KYL"
  elevationMils: string; // e.g. "8.4 MIL"
  windHoldMils: string; // e.g. "L 0.6 MIL"
  windVelocity?: string; // e.g. "9 MPH @ 260°"
  ammo?: string; // e.g. "Lapua Center-X 40gr"
  densityAltitude?: string; // e.g. "+2,150 FT"
  notes?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  type?: "STANDARD" | "DOPE_DROP" | "MATCH_ALERT" | "RADIO_CHECK";
  dopeCard?: DopeCardData;
  author: {
    id: string;
    name: string;
    callsign?: string;
    avatarUrl?: string;
    role: "PRO_COMPETITOR" | "MATCH_DIRECTOR" | "OFFICIAL" | "VIP" | "MEMBER";
    badgeText?: string;
    division?: string;
    rifleSetup?: string;
  };
  content: string;
  timestamp: string;
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  moderationStatus: "APPROVED" | "FLAGGED" | "PENDING_REVIEW" | "REJECTED";
  aiModerationReport?: {
    toxicityScore: number; // 0 to 100
    threatScore: number;
    policyScore: number;
    flagReason?: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "SUSPICIOUS" | "TOXIC";
    aiEngine?: string;
  };
}

export interface FacebookPostItem {
  id: string;
  content: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  imageUrl?: string;
  videoUrl?: string;
  externalUrl: string;
  tags: string[];
}

export interface AthleteProfile {
  id: string;
  name: string;
  division: string;
  ranking: string;
  homeRange: string;
  rifleSetup: {
    action: string;
    barrel: string;
    chassis: string;
    optic: string;
    ammo: string;
  };
  quote: string;
  imageUrl: string;
  podiums: number;
}

export interface CommsAbuseAlert {
  id: string;
  timestamp: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  category: "PHYSICAL_THREAT" | "ILLEGAL_COMMERCE" | "HARASSMENT" | "SPAM_SOLICITATION" | "UNSPORTSMANLIKE";
  shooterName: string;
  shooterCallsign: string;
  shooterRole: string;
  squad: string;
  channel: string;
  messageContent: string;
  toxicityScore: number;
  threatScore: number;
  policyScore: number;
  status: "ACTIVE" | "WARNED" | "MUTED" | "DISQUALIFIED" | "DISMISSED";
  aiRationale: string;
  autoActionTaken: string;
}

