/**
 * PLINK ENGINE — Subsonic Society AI Range Marshal
 * ────────────────────────────────────────────────
 * Plink is an always-on, rule-based chat moderator that appears
 * as a first-class participant in all Subsonic Society channels.
 *
 * Phase 1: Rule-based pattern matching (free, instant, no API)
 * Phase 2: Gemini API integration (toggle-ready via /api/plink)
 */

import { ChatMessage } from "./types";

// ─── PLINK IDENTITY ───────────────────────────────────────────────────────────

export const PLINK_AUTHOR = {
  id: "plink_ai_moderator",
  name: "Plink",
  callsign: "PLINK",
  role: "AI_MODERATOR" as const,
  badgeText: "AI RANGE MARSHAL",
  division: "Subsonic Society Staff",
  rifleSetup: undefined,
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ViolationType =
  | "FIREARM_SALE"
  | "STRONG_LANGUAGE"
  | "HARASSMENT"
  | "SPAM"
  | "COMMERCIAL"
  | null;

export interface PlinkResponse {
  content: string;
  warningTier: 0 | 1 | 2 | 3;
  violationType: ViolationType;
  shouldEscalate: boolean;
  targetCallsign: string;
}

// ─── DETECTION PATTERNS ───────────────────────────────────────────────────────

const SALE_PATTERNS: RegExp[] = [
  /\bWTS\b/i,
  /\bfor\s+sale\b/i,
  /\bselling\b/i,
  /\bask(?:ing)?\s*\$?\s*\d+/i,
  /\bdm\s+(me\s+)?for\s+price/i,
  /\bpm\s+me\b/i,
  /ship\s+to\s+ffl/i,
  /transfer\s+fee/i,
  /\$\s*\d+\s*(obo|shipped|firm|tyd)/i,
  /\btrade\s+(my|for|a)\b/i,
  /\bclassified\b/i,
  /\bprice\s+drop\b/i,
  /\bwanna\s+(sell|trade)\b/i,
  /\banyone\s+(want|buying)\b/i,
  /\bcash\s+(only|accepted)\b/i,
  /\bgunbroker\b/i,
];

const PROFANITY_PATTERNS: RegExp[] = [
  /\bf+u+c+k+/i,
  /\bs+h+i+t+\b/i,
  /\ba+s+s+h+o+l+e+/i,
  /\bb+i+t+c+h+/i,
  /\bd+a+m+n+\b/i,
  /\bc+r+a+p+\b/i,
  /\bwtf\b/i,
  /\bstfu\b/i,
  /\bbs\b.*\b(that|this|is)\b/i,
];

const HARASSMENT_PATTERNS: RegExp[] = [
  /\bi('ll| will)\s+(find|hurt|kill|destroy|ruin)\s+you\b/i,
  /\byou('re| are)\s+(trash|garbage|worthless|pathetic|stupid)\b/i,
  /\bshut\s+up\b/i,
  /\bget\s+out\b.*\b(here|channel|chat)\b/i,
  /\bnobody\s+(likes|wants|cares)\s+(you|about you)\b/i,
  /doxx/i,
  /\bpersonal\s+(address|info)\b/i,
];

const SPAM_PATTERNS: RegExp[] = [
  /(.{4,})\1{2,}/i, // repeated phrase 3+ times
  /^(.)\1{8,}$/, // same character repeated (aaaaaaaaaa)
];

const COMMERCIAL_PATTERNS: RegExp[] = [
  /use\s+(code|coupon)\s+\w+/i,
  /referral\s+link/i,
  /\baffiliate\b/i,
  /discount\s+(code|link)/i,
  /\bcheck\s+out\s+my\s+(store|shop|website|channel|youtube|insta)/i,
  /\bfolllow\s+me\b/i,
  /bit\.ly|tinyurl|goo\.gl/i,
  /\bclick\s+(here|this)\b/i,
];

const PLINK_MENTION = /@plink/i;

// ─── RESPONSE BANKS ───────────────────────────────────────────────────────────

const SOFT_LANGUAGE_WARNINGS = [
  (c: string) => `Easy on the language, ${c} — we keep it range-professional here. 🎯`,
  (c: string) => `Heads up ${c} — let's keep transmissions clean. All callsigns are monitoring this channel.`,
  (c: string) => `${c}, friendly reminder to keep the comms PG-13 — families and new shooters read these channels too.`,
];

const FORMAL_LANGUAGE_WARNINGS = [
  (c: string) => `⚠️ [${c}] — This is a formal warning for language that violates Society standards. This message has been flagged for Range Marshal review. Continued violations may result in chat restriction.`,
  (c: string) => `⚠️ Formal warning issued to [${c}]: repeated use of prohibited language. This incident has been logged and escalated to staff.`,
];

const SOFT_SALE_WARNINGS = [
  (c: string) => `[${c}] — Gear and firearm sales aren't permitted in Society channels. For classifieds, reach out to staff directly. Your post has been flagged. 📋`,
  (c: string) => `Heads up [${c}] — Subsonic Society chat is not a marketplace. No sales, trades, or classified listings in any channel. Staff have been notified.`,
  (c: string) => `[${c}] — Firearm and equipment transactions aren't allowed here for legal and safety reasons. Please remove commercial content. This has been logged.`,
];

const FORMAL_SALE_WARNINGS = [
  (c: string) => `🚫 [${c}] — Formal warning: posting sales, trades, or solicitations is a serious policy violation. This message has been escalated to Range Marshal staff and may result in immediate chat suspension.`,
];

const HARASSMENT_WARNINGS = [
  (c: string) => `🚫 [${c}] — Harassment, threats, or targeted abuse toward other members is not tolerated. This transmission has been escalated to Range Marshal staff. Your access is under review.`,
];

const SPAM_WARNINGS = [
  (c: string) => `[${c}] — Looks like your message may have been sent multiple times or is flooding the channel. Please keep transmissions intentional and spaced out. 📡`,
];

const COMMERCIAL_WARNINGS = [
  (c: string) => `[${c}] — Promotional links, referral codes, and commercial content aren't permitted in Society channels. Please keep it rimfire-relevant. This has been flagged.`,
];

// ─── CHANNEL WELCOME MESSAGES ─────────────────────────────────────────────────

const CHANNEL_WELCOMES: Record<string, (callsign: string) => string> = {
  "bristol-pro-shootout": (c) =>
    `Range open. Welcome to #bristol-pro-shootout, ${c}. Keep transmissions to match-day DOPE, stage strategy, and elevation calls. No sales, no spam. Type @plink for help anytime. 🏔️`,
  "squad-briefings": (c) =>
    `On net, ${c}. #squad-briefings is for staging times, rotation orders, and squad coordination. Keep it operational and on-time. Type @plink rules to see channel guidelines.`,
  "match-day-alerts": (c) =>
    `ALERT CHANNEL ACTIVE — ${c}, this is a Match Director broadcast channel. Listen-only unless you're staff or RO. Critical match updates only. 🚨`,
  "ro-disputes-appeals": (c) =>
    `${c}, you're in #ro-disputes-appeals. Formal target challenges and stage rule inquiries only. State your callsign, stage number, and target in dispute. Staff respond within 15 minutes during active match hours.`,
  "general-society": (c) =>
    `Hey ${c} — welcome to #general-society. This is the main community channel. Rimfire talk, range meetups, travel, and good faith debate welcome. Keep it clean and respectful. Type @plink help anytime. 🎯`,
  "ballistics-and-gear": (c) =>
    `Welcome to #ballistics-and-gear, ${c}. Share your LabRadar data, lot testing results, and optic notes here. No sales or classifieds — tech talk and data only. 📊`,
  "range-conditions-weather": (c) =>
    `${c}, you're on the weather net. #range-conditions-weather is for Holston Mountain live conditions — crosswinds, mirage flags, DA updates, and barometric readings. Currently monitoring: 3,420 FT elevation. 🌬️`,
};

const DEFAULT_WELCOME = (channelId: string, callsign: string) =>
  `Welcome to #${channelId}, ${callsign}. Subsonic Society channels are staff-moderated. Keep transmissions rimfire-relevant, respectful, and free of commercial content. Type @plink rules for community guidelines.`;

// ─── FAQ RESPONSE SYSTEM ──────────────────────────────────────────────────────

export function getFaqResponse(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes("rule") || lower.includes("guideline") || lower.includes("policy")) {
    return `📋 Subsonic Society Community Rules:\n1️⃣ No firearm or gear sales in chat — ever.\n2️⃣ Respect all callsigns — harassment = immediate ban.\n3️⃣ PRO NET channels are for match-day DOPE and competition talk only.\n4️⃣ No promotional links, referral codes, or commercial content.\n5️⃣ Staff and Range Marshal decisions are final. Type @plink help for more commands.`;
  }

  if (lower.includes("help") || lower.includes("command") || lower.includes("what can you")) {
    return `🤖 I'm Plink — Subsonic Society's AI Range Marshal. I monitor all channels for policy violations and can answer questions. Try:\n@plink rules — community guidelines\n@plink channels — what to post where\n@plink bristol — range info\n@plink contact — reach live staff`;
  }

  if (lower.includes("channel") || lower.includes("where") || lower.includes("post")) {
    return `📡 Channel guide:\n#bristol-pro-shootout → Match DOPE & stage strategy\n#squad-briefings → Staging & rotation logistics\n#match-day-alerts → MD broadcasts only\n#general-society → Community talk\n#ballistics-and-gear → Tech, ammo, LabRadar data\n#range-conditions-weather → Live Holston Mountain conditions`;
  }

  if (lower.includes("bristol") || lower.includes("elevation") || lower.includes("hideout") || lower.includes("range")) {
    return `🏔️ The Hideout — Holston Mountain, Bristol TN. Elevation: 3,420 FT. 18 natural terrain barricade stages. Steel arrays from 25–465 yards. Cross-canyon wind channels. October 17–18, 2026. Conditions updated live in #range-conditions-weather.`;
  }

  if (lower.includes("contact") || lower.includes("staff") || lower.includes("director") || lower.includes("marshal")) {
    return `📻 To reach live Range Marshal staff: post in #ro-disputes-appeals during match hours, or email staff via the Contact page at subsonicsociety.com. For urgent match issues, your RO on deck has priority radio.`;
  }

  if (lower.includes("ammo") || lower.includes("ammunition") || lower.includes("lot") || lower.includes("lapur") || lower.includes("eley")) {
    return `🎯 Authorized ammo: standard-velocity or subsonic .22 LR under 1,120 FPS at sea level equivalent. Hyper-velocity is prohibited. For lot data and SD charts, check the Subsonic DNA section at subsonicsociety.com/dna.`;
  }

  if (lower.includes("register") || lower.includes("sign up") || lower.includes("entry") || lower.includes("fee")) {
    return `✍️ Match registration: subsonicsociety.com/register — \$275 entry fee. $7,500 guaranteed cash purse + $15,000+ prize table. Presented by Modacam Custom Rifles. Spots are limited — don't wait.`;
  }

  if (lower.includes("warn") || lower.includes("ban") || lower.includes("muted") || lower.includes("appeal")) {
    return `⚖️ To appeal a warning or restriction, post in #ro-disputes-appeals with your callsign, the warning timestamp, and your explanation. A live Range Marshal will review within the match cycle.`;
  }

  // Generic fallback
  return `🤖 I'm Plink, your AI Range Marshal. I'm monitoring all channels for community standards. Try @plink rules, @plink channels, @plink bristol, or @plink help. For complex questions, contact live staff via #ro-disputes-appeals.`;
}

// ─── CHANNEL WELCOME ──────────────────────────────────────────────────────────

export function getChannelWelcome(channelId: string, callsign: string): string {
  const fn = CHANNEL_WELCOMES[channelId];
  return fn ? fn(callsign) : DEFAULT_WELCOME(channelId, callsign);
}

// ─── RANDOM PICKER ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── CORE ANALYSIS ENGINE ─────────────────────────────────────────────────────

export function analyzeMsgForPlink(
  msg: ChatMessage,
  userWarningHistory: Record<string, number>,
  lastMessageContent?: string
): PlinkResponse | null {
  // Never respond to ourselves
  if (msg.author.id === "plink_ai_moderator") return null;

  const content = msg.content || "";
  const callsign = msg.author.callsign || msg.author.name || "Shooter";
  const userId = msg.author.id;
  const priorWarnings = userWarningHistory[userId] || 0;

  // ── @plink mention ─────────────────────────────────────────────────────────
  if (PLINK_MENTION.test(content)) {
    return {
      content: getFaqResponse(content),
      warningTier: 0,
      violationType: null,
      shouldEscalate: false,
      targetCallsign: callsign,
    };
  }

  // ── Firearm / item sales ───────────────────────────────────────────────────
  if (SALE_PATTERNS.some((p) => p.test(content))) {
    const tier = priorWarnings >= 1 ? 2 : 1;
    const responses = tier >= 2 ? FORMAL_SALE_WARNINGS : SOFT_SALE_WARNINGS;
    return {
      content: pick(responses)(callsign),
      warningTier: tier as 1 | 2,
      violationType: "FIREARM_SALE",
      shouldEscalate: tier >= 2,
      targetCallsign: callsign,
    };
  }

  // ── Harassment / threats ───────────────────────────────────────────────────
  if (HARASSMENT_PATTERNS.some((p) => p.test(content))) {
    return {
      content: pick(HARASSMENT_WARNINGS)(callsign),
      warningTier: 3,
      violationType: "HARASSMENT",
      shouldEscalate: true,
      targetCallsign: callsign,
    };
  }

  // ── Commercial solicitation ────────────────────────────────────────────────
  if (COMMERCIAL_PATTERNS.some((p) => p.test(content))) {
    return {
      content: pick(COMMERCIAL_WARNINGS)(callsign),
      warningTier: 1,
      violationType: "COMMERCIAL",
      shouldEscalate: false,
      targetCallsign: callsign,
    };
  }

  // ── Strong language ────────────────────────────────────────────────────────
  if (PROFANITY_PATTERNS.some((p) => p.test(content))) {
    const tier = priorWarnings >= 2 ? 2 : 1;
    const responses = tier >= 2 ? FORMAL_LANGUAGE_WARNINGS : SOFT_LANGUAGE_WARNINGS;
    return {
      content: pick(responses)(callsign),
      warningTier: tier as 1 | 2,
      violationType: "STRONG_LANGUAGE",
      shouldEscalate: tier >= 2,
      targetCallsign: callsign,
    };
  }

  // ── Spam / duplicate ──────────────────────────────────────────────────────
  if (
    SPAM_PATTERNS.some((p) => p.test(content)) ||
    (lastMessageContent && content.trim() === lastMessageContent.trim() && content.length > 5)
  ) {
    return {
      content: pick(SPAM_WARNINGS)(callsign),
      warningTier: 1,
      violationType: "SPAM",
      shouldEscalate: false,
      targetCallsign: callsign,
    };
  }

  return null;
}

// ─── PLINK MESSAGE BUILDER ────────────────────────────────────────────────────

export function buildPlinkMessage(
  content: string,
  channelId: string,
  warningTier: 0 | 1 | 2 | 3 = 0
): ChatMessage {
  const now = new Date();
  const timestamp = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    id: `plink_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    channelId,
    type: warningTier >= 2 ? "MATCH_ALERT" : "STANDARD",
    author: {
      ...PLINK_AUTHOR,
    },
    content,
    timestamp,
    reactions: [],
    moderationStatus: "APPROVED",
    aiModerationReport:
      warningTier > 0
        ? {
            toxicityScore: 0,
            threatScore: 0,
            policyScore: 0,
            sentiment: "NEUTRAL",
            aiEngine: "Plink v1",
          }
        : undefined,
  };
}
