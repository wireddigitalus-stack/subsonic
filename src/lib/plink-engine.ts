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
  /(.{4,})\1{2,}/i,
  /^(.)\1{8,}$/,
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

// ─── CONVERSATIONAL TRIGGERS ──────────────────────────────────────────────────

// Direct greetings: "hey plink", "hi plink", "hello plink", "yo plink"
const PLINK_GREETING    = /\b(hey|hi|hello|sup|yo|howdy|hiya|greetings)\s+plink\b/i;
// Name-first: "Plink," or "Plink!" or "Plink?"
const PLINK_NAME_FIRST  = /^plink\s*[,!?]/i;
// Question directed at Plink: "plink, what..." or "@plink what..."
const PLINK_QUESTION    = /\bplink[\s,]+.{0,40}\?/i;
// @plink mention
const PLINK_MENTION     = /@plink/i;
// Thank you to Plink
const PLINK_THANKS      = /\b(thanks|thank you|ty|thx|cheers|appreciate)\b.*\bplink\b|\bplink\b.*\b(thanks|thank you|ty|thx|cheers)\b/i;
// Who / what are you
const PLINK_IDENTITY    = /\b(who|what)\s+(are|is)\s+plink\b|plink[\s,]+(who|what)\s+are\s+you/i;
// Are you real / AI
const PLINK_REAL        = /\bplink\b.*(real|ai|bot|robot|human|alive|automated)/i;
// How are you
const PLINK_HOW         = /\bplink\b.*(how\s+are\s+you|you\s+ok|you\s+good|all\s+good)/i;
// General name catch (lowest priority)
const PLINK_MENTIONED   = /\bplink\b/i;

// ─── RESPONSE BANKS ───────────────────────────────────────────────────────────

const PLINK_GREETING_RESPONSES = [
  (c: string) =>
    `Hey ${c}! \u{1F3AF} Plink here — on net and monitoring all channels. What do you need? Try @plink rules, @plink channels, or just ask me anything.`,
  (c: string) =>
    `${c}, on net. \u{1F44B} Plink standing post at The Hideout. I watch all 7 channels around the clock. What can I help you with?`,
  (c: string) =>
    `Hey there ${c}! I'm Plink — Subsonic Society's AI Range Marshal. Always watching, never sleeping. Ask me anything — rules, range info, channels, or just chat. \u{1F3D4}\uFE0F`,
  (c: string) =>
    `Plink here, ${c}. On net and monitoring. Whether it's community guidelines, range intel, or just a question — I'm your first call. What's up?`,
  (c: string) =>
    `${c}! Good to hear from you. \u{1F3AF} I'm Plink — trained on SS guidelines and Holston Mountain range data. What's on your mind?`,
];

const PLINK_THANKS_RESPONSES = [
  (c: string) => `Roger that, ${c}. Plink out. \u{1F3AF} Always here if you need me.`,
  (c: string) => `Anytime, ${c}. Stay dialed in. \u{1F3D4}\uFE0F`,
  (c: string) => `Copy, ${c}. Plink monitoring. Stay on net.`,
  (c: string) => `Happy to help, ${c}. \u{1F3AF} I'll be here.`,
];

const PLINK_IDENTITY_RESPONSES = [
  (c: string) =>
    `I'm Plink — Subsonic Society's AI Range Marshal. \u{1F916} I'm always on net across all 7 channels, watching for policy violations and answering member questions. I'm built on rimfire culture, SS community guidelines, and Holston Mountain range data. Type @plink help to see what I can do, ${c}.`,
  (c: string) =>
    `Plink is an AI Range Marshal, ${c} — think of me as an always-on staff member who never needs coffee. I watch every channel, flag violations, and help members navigate the Society. Ask me anything.`,
];

const PLINK_REAL_RESPONSES = [
  (c: string) =>
    `I'm an AI, ${c} — but I'm a real presence in these channels. \u{1F916} Built specifically for Subsonic Society to keep things clean, helpful, and on-range. I don't sleep, I don't miss messages, and I genuinely know rimfire. Ask me anything.`,
  (c: string) =>
    `AI through and through, ${c}. Phase 1 Plink is rule-based and fast. Phase 2 will bring full Gemini conversational AI. Either way — I'm always watching and happy to help.`,
];

const PLINK_HOW_RESPONSES = [
  (c: string) =>
    `All systems nominal, ${c}. \u{1F7E2} 7 channels monitored, 0 critical incidents active. Weather net is quiet. Range is standing by. How are you?`,
  (c: string) =>
    `Running clean, ${c}. Pattern banks loaded, channel monitors active, no current escalations. \u{1F3AF} How can I help you today?`,
];

const PLINK_GENERAL_RESPONSES = [
  (c: string) =>
    `${c} — you mentioned me. What do you need? Try @plink rules, @plink channels, @plink bristol, or just ask your question directly. \u{1F3AF}`,
  (c: string) =>
    `On net, ${c}. Did you have a question for me? Type @plink help to see what I can help with.`,
  (c: string) =>
    `I caught my name, ${c}. What's up? I can help with community rules, range info, channel guidelines, or just general questions. Fire away.`,
];

const SOFT_LANGUAGE_WARNINGS = [
  (c: string) => `Easy on the language, ${c} — we keep it range-professional here. \u{1F3AF}`,
  (c: string) => `Heads up ${c} — let's keep transmissions clean. All callsigns are monitoring this channel.`,
  (c: string) => `${c}, friendly reminder to keep the comms PG-13 — families and new shooters read these channels too.`,
];

const FORMAL_LANGUAGE_WARNINGS = [
  (c: string) => `\u26A0\uFE0F [${c}] — This is a formal warning for language that violates Society standards. This message has been flagged for Range Marshal review. Continued violations may result in chat restriction.`,
  (c: string) => `\u26A0\uFE0F Formal warning issued to [${c}]: repeated use of prohibited language. This incident has been logged and escalated to staff.`,
];

const SOFT_SALE_WARNINGS = [
  (c: string) => `[${c}] — Gear and firearm sales aren't permitted in Society channels. For classifieds, reach out to staff directly. Your post has been flagged.`,
  (c: string) => `Heads up [${c}] — Subsonic Society chat is not a marketplace. No sales, trades, or classified listings in any channel. Staff have been notified.`,
  (c: string) => `[${c}] — Firearm and equipment transactions aren't allowed here for legal and safety reasons. Please remove commercial content. This has been logged.`,
];

const FORMAL_SALE_WARNINGS = [
  (c: string) => `\u{1F6AB} [${c}] — Formal warning: posting sales, trades, or solicitations is a serious policy violation. This message has been escalated to Range Marshal staff and may result in immediate chat suspension.`,
];

const HARASSMENT_WARNINGS = [
  (c: string) => `\u{1F6AB} [${c}] — Harassment, threats, or targeted abuse toward other members is not tolerated. This transmission has been escalated to Range Marshal staff. Your access is under review.`,
];

const SPAM_WARNINGS = [
  (c: string) => `[${c}] — Looks like your message may have been sent multiple times or is flooding the channel. Please keep transmissions intentional and spaced out.`,
];

const COMMERCIAL_WARNINGS = [
  (c: string) => `[${c}] — Promotional links, referral codes, and commercial content aren't permitted in Society channels. Please keep it rimfire-relevant. This has been flagged.`,
];

// ─── CHANNEL WELCOME MESSAGES ─────────────────────────────────────────────────

const CHANNEL_WELCOMES: Record<string, (callsign: string) => string> = {
  "bristol-pro-shootout": (c) =>
    `Range open. Welcome to #bristol-pro-shootout, ${c}. Keep transmissions to match-day DOPE, stage strategy, and elevation calls. No sales, no spam. Say "hey plink" anytime you need me. \u{1F3D4}\uFE0F`,
  "squad-briefings": (c) =>
    `On net, ${c}. #squad-briefings is for staging times, rotation orders, and squad coordination. Keep it operational. Say "hey plink" or type @plink rules to see channel guidelines.`,
  "match-day-alerts": (c) =>
    `ALERT CHANNEL ACTIVE — ${c}, this is a Match Director broadcast channel. Listen-only unless you're staff or RO. Critical match updates only.`,
  "ro-disputes-appeals": (c) =>
    `${c}, you're in #ro-disputes-appeals. Formal target challenges and stage rule inquiries only. State your callsign, stage number, and target in dispute. Staff respond within 15 minutes during active match hours.`,
  "general-society": (c) =>
    `Hey ${c} — welcome to #general-society. Main community channel. Rimfire talk, range meetups, travel welcome. Keep it clean. Say "hey plink" or type @plink help anytime. \u{1F3AF}`,
  "ballistics-and-gear": (c) =>
    `Welcome to #ballistics-and-gear, ${c}. Share LabRadar data, lot testing results, and optic notes. No sales — tech talk and data only.`,
  "range-conditions-weather": (c) =>
    `${c}, you're on the weather net. #range-conditions-weather is for Holston Mountain live conditions — crosswinds, mirage flags, DA updates. Currently monitoring: 3,420 FT elevation. \u{1F32C}\uFE0F`,
};

const DEFAULT_WELCOME = (channelId: string, callsign: string) =>
  `Welcome to #${channelId}, ${callsign}. Subsonic Society channels are staff-moderated. Keep transmissions rimfire-relevant and respectful. Say "hey plink" or type @plink rules for community guidelines.`;

// ─── FAQ RESPONSE SYSTEM ──────────────────────────────────────────────────────

export function getFaqResponse(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes("rule") || lower.includes("guideline") || lower.includes("policy")) {
    return `\u{1F4CB} Subsonic Society Community Rules:\n1\uFE0F\u20E3 No firearm or gear sales in chat — ever.\n2\uFE0F\u20E3 Respect all callsigns — harassment = immediate ban.\n3\uFE0F\u20E3 PRO NET channels are for match-day DOPE and competition talk only.\n4\uFE0F\u20E3 No promotional links, referral codes, or commercial content.\n5\uFE0F\u20E3 Staff and Range Marshal decisions are final.\nSay "hey plink" to chat, or type @plink help for more commands.`;
  }

  if (lower.includes("help") || lower.includes("command") || lower.includes("what can you")) {
    return `\u{1F916} I'm Plink — Subsonic Society's AI Range Marshal. Here's what I know:\n\n\u{1F4AC} Say "hey plink" — chat with me directly\n\u{1F4CB} @plink rules — community guidelines\n\u{1F4E1} @plink channels — what to post where\n\u{1F3D4}\uFE0F @plink bristol — range info + elevation\n\u{1F4FB} @plink contact — reach live staff\n\u{1F3AF} @plink ammo — authorized ammunition\n\u270D\uFE0F @plink register — match registration\n\u2696\uFE0F @plink appeal — dispute a warning\n\nOr just ask me a question naturally — I'm always listening.`;
  }

  if (lower.includes("channel") || lower.includes("where") || lower.includes("post")) {
    return `\u{1F4E1} Channel guide:\n#bristol-pro-shootout \u2192 Match DOPE & stage strategy\n#squad-briefings \u2192 Staging & rotation logistics\n#match-day-alerts \u2192 MD broadcasts only\n#general-society \u2192 Community talk\n#ballistics-and-gear \u2192 Tech, ammo, LabRadar data\n#range-conditions-weather \u2192 Live Holston Mountain conditions`;
  }

  if (lower.includes("bristol") || lower.includes("elevation") || lower.includes("hideout") || lower.includes("range")) {
    return `\u{1F3D4}\uFE0F The Hideout — Holston Mountain, Bristol TN. Elevation: 3,420 FT. 18 natural terrain barricade stages. Steel arrays from 25–465 yards. Cross-canyon wind channels. October 17–18, 2026. Conditions updated live in #range-conditions-weather.`;
  }

  if (lower.includes("contact") || lower.includes("staff") || lower.includes("director") || lower.includes("marshal")) {
    return `\u{1F4FB} To reach live Range Marshal staff: post in #ro-disputes-appeals during match hours, or email staff via the Contact page at subsonicsociety.com. For urgent match issues, your RO on deck has priority radio.`;
  }

  if (lower.includes("ammo") || lower.includes("ammunition") || lower.includes("lot") || lower.includes("lapua") || lower.includes("eley")) {
    return `\u{1F3AF} Authorized ammo: standard-velocity or subsonic .22 LR under 1,120 FPS at sea level equivalent. Hyper-velocity is prohibited. For lot data and SD charts, check the Subsonic DNA section at subsonicsociety.com/dna.`;
  }

  if (lower.includes("register") || lower.includes("sign up") || lower.includes("entry") || lower.includes("fee")) {
    return `\u270D\uFE0F Match registration: subsonicsociety.com/register — $275 entry fee. $7,500 guaranteed cash purse + $15,000+ prize table. Presented by Modacam Custom Rifles. Spots are limited.`;
  }

  if (lower.includes("warn") || lower.includes("ban") || lower.includes("muted") || lower.includes("appeal")) {
    return `\u2696\uFE0F To appeal a warning or restriction, post in #ro-disputes-appeals with your callsign, the warning timestamp, and your explanation. A live Range Marshal will review within the match cycle.`;
  }

  if (lower.includes("weather") || lower.includes("wind") || lower.includes("condition")) {
    return `\u{1F32C}\uFE0F Live range conditions are posted in #range-conditions-weather. Holston Mountain: 3,420 FT elevation. Cross-canyon winds are unpredictable — check the channel before staging.`;
  }

  if (lower.includes("score") || lower.includes("result") || lower.includes("standing") || lower.includes("winner")) {
    return `\u{1F3C6} Live scores and standings are posted in #match-day-alerts by Match Directors after each stage. Final results post within 2 hours of the last stage.`;
  }

  if (lower.includes("stage") || lower.includes("barricade") || lower.includes("target")) {
    return `\u{1F3AF} The Hideout has 18 natural terrain barricade stages. Steel targets from 25–465 yards. Stage briefings post in #squad-briefings before each stage cycle. RO and MD calls are final — disputes go to #ro-disputes-appeals.`;
  }

  return `\u{1F916} I'm Plink, your AI Range Marshal. I'm monitoring all channels. Try @plink rules, @plink channels, @plink bristol, or @plink help. Or just say "hey plink" and ask me directly.`;
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
  if (msg.author.id === "plink_ai_moderator") return null;

  const content = msg.content || "";
  const callsign = msg.author.callsign || msg.author.name || "Shooter";
  const userId = msg.author.id;
  const priorWarnings = userWarningHistory[userId] || 0;

  // ── Conversational checks FIRST (before moderation) ────────────────────────

  if (PLINK_THANKS.test(content)) {
    return { content: pick(PLINK_THANKS_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (PLINK_IDENTITY.test(content)) {
    return { content: pick(PLINK_IDENTITY_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (PLINK_REAL.test(content)) {
    return { content: pick(PLINK_REAL_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (PLINK_HOW.test(content)) {
    return { content: pick(PLINK_HOW_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (PLINK_GREETING.test(content) || PLINK_NAME_FIRST.test(content)) {
    return { content: pick(PLINK_GREETING_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (PLINK_MENTION.test(content) || PLINK_QUESTION.test(content)) {
    return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  // ── Moderation checks ───────────────────────────────────────────────────────

  if (SALE_PATTERNS.some((p) => p.test(content))) {
    const tier = priorWarnings >= 1 ? 2 : 1;
    const responses = tier >= 2 ? FORMAL_SALE_WARNINGS : SOFT_SALE_WARNINGS;
    return { content: pick(responses)(callsign), warningTier: tier as 1 | 2, violationType: "FIREARM_SALE", shouldEscalate: tier >= 2, targetCallsign: callsign };
  }

  if (HARASSMENT_PATTERNS.some((p) => p.test(content))) {
    return { content: pick(HARASSMENT_WARNINGS)(callsign), warningTier: 3, violationType: "HARASSMENT", shouldEscalate: true, targetCallsign: callsign };
  }

  if (COMMERCIAL_PATTERNS.some((p) => p.test(content))) {
    return { content: pick(COMMERCIAL_WARNINGS)(callsign), warningTier: 1, violationType: "COMMERCIAL", shouldEscalate: false, targetCallsign: callsign };
  }

  if (PROFANITY_PATTERNS.some((p) => p.test(content))) {
    const tier = priorWarnings >= 2 ? 2 : 1;
    const responses = tier >= 2 ? FORMAL_LANGUAGE_WARNINGS : SOFT_LANGUAGE_WARNINGS;
    return { content: pick(responses)(callsign), warningTier: tier as 1 | 2, violationType: "STRONG_LANGUAGE", shouldEscalate: tier >= 2, targetCallsign: callsign };
  }

  if (
    SPAM_PATTERNS.some((p) => p.test(content)) ||
    (lastMessageContent && content.trim() === lastMessageContent.trim() && content.length > 5)
  ) {
    return { content: pick(SPAM_WARNINGS)(callsign), warningTier: 1, violationType: "SPAM", shouldEscalate: false, targetCallsign: callsign };
  }

  // ── Low-priority: "plink" mentioned casually ──────────────────────────────
  if (PLINK_MENTIONED.test(content)) {
    return { content: pick(PLINK_GENERAL_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
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
    author: { ...PLINK_AUTHOR },
    content,
    timestamp,
    reactions: [],
    moderationStatus: "APPROVED",
    aiModerationReport:
      warningTier > 0
        ? { toxicityScore: warningTier * 30, threatScore: 0, policyScore: 0, sentiment: "NEUTRAL", aiEngine: "Plink v1" }
        : undefined,
  };
}
