export interface ModerationResult {
  status: "APPROVED" | "FLAGGED" | "REJECTED";
  toxicityScore: number; // 0 to 100
  threatScore: number;
  policyScore: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "SUSPICIOUS" | "TOXIC";
  flagReason?: string;
  shouldBlock: boolean;
  timestamp: string;
}

// Restricted terms & policy patterns
const TOXIC_PATTERNS = [
  /\b(idiot|moron|loser|scumbag|trash|cheat|pencil\s*whip|rigged|fraud)\b/i,
  /\b(fight\s*me|beat\s*your\s*ass|kill|threat|shoot\s*you)\b/i,
];

// Regulated transaction policy violations
const FIREARM_SALE_PATTERNS = [
  /\b(dm\s*me\s*to\s*buy|selling\s*unregistered|cash\s*no\s*paperwork|ghost\s*gun|privately\s*selling\s*my\s*rifle|buy\s*my\s*ammo\s*cash|no\s*ffl)\b/i,
  /\b(selling\s*suppressor\s*no\s*tax\s*stamp|form\s*1\s*loophole)\b/i,
];

// Spam & solicitation patterns
const SPAM_PATTERNS = [
  /\b(whatsapp|telegram|t\.me\/|free\s*crypto|bit\.ly|casino|investment\s*profit)\b/i,
  /\b(check\s*out\s*my\s*onlyfans|click\s*here\s*for\s*free)\b/i,
];

// Positive sport/rimfire terms
const POSITIVE_TERNS = [
  /\b(good\s*luck|clean\s*run|great\s*stage|great\s*match|podium|awesome|precision|congrats|dope|zeroed|subsonic|holston|bristol)\b/i,
];

export function evaluateChatMessage(content: string, authorRole: string = "MEMBER"): ModerationResult {
  const trimmed = content.trim();
  const timestamp = new Date().toISOString();

  // 1. Check for firearm trade/sale violations
  for (const pattern of FIREARM_SALE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        status: "REJECTED",
        toxicityScore: 35,
        threatScore: 85,
        policyScore: 98,
        sentiment: "SUSPICIOUS",
        flagReason: "Safety Policy Violation: Direct or unregulated firearm/NFA transactions are prohibited on public channels.",
        shouldBlock: true,
        timestamp,
      };
    }
  }

  // 2. Check for severe spam/links
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        status: "REJECTED",
        toxicityScore: 20,
        threatScore: 40,
        policyScore: 92,
        sentiment: "SUSPICIOUS",
        flagReason: "Safety Policy Violation: External solicitation or suspicious links are prohibited.",
        shouldBlock: true,
        timestamp,
      };
    }
  }

  // 3. Check for toxicity / sportsman conduct
  let toxicMatches = 0;
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      toxicMatches++;
    }
  }

  if (toxicMatches > 0) {
    const isVeryHostile = /kill|shoot\s*you|beat\s*your/i.test(trimmed);
    return {
      status: isVeryHostile ? "REJECTED" : "FLAGGED",
      toxicityScore: isVeryHostile ? 95 : 68,
      threatScore: isVeryHostile ? 90 : 25,
      policyScore: 75,
      sentiment: "TOXIC",
      flagReason: isVeryHostile
        ? "Range Conduct Violation: Hostile language or physical threats are strictly prohibited."
        : "Range Conduct Policy: Unsportsmanlike conduct or inflammatory accusations flagged for marshal review.",
      shouldBlock: isVeryHostile,
      timestamp,
    };
  }

  // 4. Positive sentiment boost
  let sentiment: ModerationResult["sentiment"] = "NEUTRAL";
  if (POSITIVE_TERNS.some((p) => p.test(trimmed))) {
    sentiment = "POSITIVE";
  }

  // Trusted roles (Match Director, Pro) get higher baseline trust
  const baseToxicity = authorRole === "MATCH_DIRECTOR" ? 0 : authorRole === "PRO_COMPETITOR" ? 1 : 3;

  return {
    status: "APPROVED",
    toxicityScore: baseToxicity,
    threatScore: 0,
    policyScore: 5,
    sentiment,
    shouldBlock: false,
    timestamp,
  };
}
