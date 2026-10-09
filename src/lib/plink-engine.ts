/**
 * RO (RANGE OFFICER) ENGINE — Subsonic Society Official Range Marshal
 * ────────────────────────────────────────────────────────────────────────
 * RO is the official Range Officer for Subsonic Society and The Hideout.
 * Armed with complete operational knowledge of the 2026 Subsonic Society Invitational
 * Money Match, the 220-acre facility, Bristol lodging, dining, and local entertainment.
 */

import { ChatMessage } from "./types";

// ─── RO IDENTITY ──────────────────────────────────────────────────────────────

export const RO_AUTHOR = {
  id: "plink_ai_moderator", // keep ID for backwards compatibility with message moderation & filters
  name: "RO BOT",
  callsign: "RO BOT",
  role: "OFFICIAL" as const,
  badgeText: "AI Range Officer",
  division: "Autonomous AI Range Officer • The Hideout",
  rifleSetup: "Autonomous AI Assistant • Range Safety & Bristol Intel",
};

// Export PLINK_AUTHOR alias for backwards compatibility
export const PLINK_AUTHOR = RO_AUTHOR;

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ViolationType =
  | "FIREARM_SALE"
  | "STRONG_LANGUAGE"
  | "HARASSMENT"
  | "UNSPORTSMANLIKE"
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
  /\bpunch\s+your\s+lights\b/i,
  /\bbeat\s+(your|you)\s+up\b/i,
  /\bparking\s+lot\b.*\b(wait|buddy)\b/i,
];

const UNSPORTSMANLIKE_PATTERNS: RegExp[] = [
  /pencil\s*whip/i,
  /\brigged\b/i,
  /\bcheat(ing|er|s)?\b/i,
  /\bfraud\b/i,
  /\bstole\s+\d+\s+(impact|second|point)/i,
  /\btrash\s+(officiating|ro|marshal|referee)/i,
  /\bcomplete\s+idiot\b/i,
  /\bcorrupt\b/i,
];

const SPAM_PATTERNS: RegExp[] = [
  /(.{8,})\1{4,}/i,
  /^(.)\1{15,}$/,
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

// ─── CONVERSATIONAL TRIGGERS (RO BOT) ───────────────────────────

const RO_GREETING = /\b(hey|hi|hello|sup|yo|howdy|hiya|greetings)\s+(ro|range\s*officer)\b/i;
const RO_NAME_FIRST = /^(ro|range\s*officer)\s*[,!?]/i;
const RO_QUESTION = /\b(ro|range\s*officer)[\s,]+.{0,50}\?/i;
const RO_MENTION = /@(ro|range\s*officer)\b/i;
const RO_THANKS = /\b(thanks|thank you|ty|thx|cheers|appreciate)\b.*\b(ro|range\s*officer)\b|\b(ro|range\s*officer)\b.*\b(thanks|thank you|ty|thx|cheers)\b/i;
const RO_IDENTITY = /\b(who|what)\s+(are|is)\s+(ro|range\s*officer)\b|(ro|range\s*officer)[\s,]+(who|what)\s+are\s+you/i;
const RO_REAL = /\b(ro|range\s*officer)\b.*(real|ai|bot|robot|human|alive|automated)/i;
const RO_HOW = /\b(ro|range\s*officer)\b.*(how\s+are\s+you|you\s+ok|you\s+good|all\s+good)/i;
const RO_MENTIONED = /\b(ro|range\s*officer)\b/i;

// ─── RESPONSE BANKS ───────────────────────────────────────────────────────────

const RO_GREETING_RESPONSES = [
  (c: string) =>
    `Hey ${c}! 🤖 RO BOT here — your autonomous AI Range Officer on deck for The Hideout. Ready to help with Bristol lodging, food spots, local entertainment, and range safety. What do you need?`,
  (c: string) =>
    `${c}, RO BOT on net! 📻 Standing 24/7 post for The Hideout in Bristol. Need info on hotels in Bristol, campgrounds, or where to grab dinner tonight? Ask away.`,
  (c: string) =>
    `Welcome to the frequency, ${c}! ⛰️ I'm RO BOT, your 24/7 AI Range Officer. I have Bristol intel locked in — hotels, campgrounds, BBQ, steaks & sushi at 620 State, and local entertainment. How can I help you?`,
  (c: string) =>
    `RO BOT here, ${c}. Frequencies open. As your AI Range Officer, whether you need hotel recommendations, range safety rules, or great steaks and sushi at 620 State St, I've got your DOPE.`,
];

const RO_THANKS_RESPONSES = [
  (c: string) => `Roger that, ${c}. RO BOT out. 🤖 Keep your chamber flagged and stay dialed in.`,
  (c: string) => `Anytime, ${c}. See you on the firing line at The Hideout. ⛰️`,
  (c: string) => `Copy that, ${c}. RO BOT standing by on frequency.`,
  (c: string) => `Glad to help, ${c}. Stay safe on the line. Said. Done. 🎯`,
];

const RO_IDENTITY_RESPONSES = [
  (c: string) =>
    `I'm RO BOT — your official autonomous AI Range Officer for The Hideout in Bristol, TN. 🤖 I'm dialed into Bristol hospitality & facility info: 12 Bristol hotels, campgrounds & RV parks, top restaurants like 620 State, and local entertainment like South Holston fly fishing and the Bristol Casino.`,
  (c: string) =>
    `I am the autonomous AI Range Officer (RO BOT) for Subsonic Society, ${c}. Think of me as your 24/7 digital range safety assistant and Bristol town concierge. Ask me any question!`,
];

const RO_REAL_RESPONSES = [
  (c: string) =>
    `I'm your autonomous AI Range Officer, ${c} (RO BOT) — running 24/7 Subsonic Society intelligence. 🤖 I'm always on duty across The Hideout network to keep chat safe, answer local questions, and guide visitors in Bristol.`,
];

const RO_HOW_RESPONSES = [
  (c: string) =>
    `Range is in prime condition, ${c}! 🟢 220 acres prepped, steel freshly painted, elevation 3,420 FT, and Bristol is ready for all marksmen. How's your gear prep going?`,
  (c: string) =>
    `All systems nominal on the frequency, ${c}. Weather telemetry is monitoring Holston Mountain drafts, and hotel blocks are filling up fast. What questions can I answer for you?`,
];

const RO_GENERAL_RESPONSES = [
  (c: string) =>
    `${c} — you called for the Range Officer. What do you need? Ask about hotels, restaurants, campgrounds, or entertainment in Bristol. 🎯`,
  (c: string) =>
    `RO standing by, ${c}. Need intel on The Hideout, hotels, or where to eat in Bristol? Fire away.`,
];

// ─── WARNING MESSAGES ─────────────────────────────────────────────────────────

const SOFT_LANGUAGE_WARNINGS = [
  (c: string) => `Easy on the language, ${c} — Range Officer reminder to keep transmissions range-professional. 🎯`,
  (c: string) => `Heads up ${c} — let's keep chat clean. Competitors, sponsors, and families monitor this net.`,
];

const FORMAL_LANGUAGE_WARNINGS = [
  (c: string) => `⚠️ [${c}] — Formal warning from the Range Officer for language violating Society standards. Continued violations will result in removal from the frequency.`,
];

const SOFT_SALE_WARNINGS = [
  (c: string) => `[${c}] — Gear and firearm transactions aren't permitted on Invitational chat. Contact match staff directly for official swap tables.`,
];

const FORMAL_SALE_WARNINGS = [
  (c: string) => `🚫 [${c}] — Range Officer notice: Unsolicited sales and commercial solicitations are strictly prohibited on official match frequencies.`,
];

const HARASSMENT_WARNINGS = [
  (c: string) => `🚫 [${c}] — Unsportsmanlike conduct and targeted harassment will not be tolerated. This incident has been logged by the Range Officer and escalated to Match Director Allen Hurley.`,
];

const UNSPORTSMANLIKE_WARNINGS = [
  (c: string) => `⚠️ [${c}] — Range Officer notice: Disputing scores or attacking officials in chat violates match rules. Official score protests must be submitted directly to the Match Director.`,
];

const SPAM_WARNINGS = [
  (c: string) => `[${c}] — Message flooding detected. Clear the net and space out your transmissions.`,
];

const COMMERCIAL_WARNINGS = [
  (c: string) => `[${c}] — Commercial promotions and external links are restricted. Keep transmissions focused on the Invitational match and Bristol community.`,
];

// ─── INVITATIONAL FAQ & BRISTOL KNOWLEDGE BASE ─────────────────────────────────

export function getFaqResponse(content: string): string {
  const lower = content.toLowerCase();

  // 1. RV HOOKUPS & CAMPGROUNDS (BRISTOL / HOLSTON AREA)
  if (
    lower.includes("rv") ||
    lower.includes("hookup") ||
    lower.includes("camper") ||
    lower.includes("motorhome") ||
    lower.includes("trailer") ||
    (lower.includes("camp") && !lower.includes("hotel") && !lower.includes("motel"))
  ) {
    return `🚐 **RV Hookups & Camping Policy for The Hideout:**\n\n` +
      `**Official Range Policy:**\n` +
      `❌ **Negative on on-site RV hookups.** We do **NOT** have RV electric, water, or sewer hookups available at the clubhouse or range facility at this time.\n\n` +
      `⛺ **Reputable RV Parks & Campgrounds in the Area:**\n` +
      `• **Hilltop Campground / BMS Hilltop RV** (Bristol, TN) — *Highly Recommended.* Very reputable, popular event and traveler campground perched on the ridge overlooking Bristol. Excellent access for rigs.\n` +
      `• **Lakeview RV Resort** (Bluff City / Bristol, TN — Hwy 11E) — Premier full-hookup resort (30/50 amp, water, sewer) with 87 sites, swimming pool, bathhouse, and lake recreation. Located ~10–12 min from the gate.\n` +
      `• **Bristol / Kingsport KOA Holiday** (Blountville, TN) — 100% full hookups with 50-amp pull-through sites, high-speed Wi-Fi, camp store, and modern bathhouses.\n` +
      `• **Lake Retreat RV Park & Campground** (Bristol, TN) — Full hookups located directly on scenic South Holston Lake with boat ramps and mountain views.\n` +
      `• **Sugar Hollow Park Campground** (Bristol, VA) — 75 sites with water/electric hookups in a quiet 400-acre city park with clean bathhouses.\n` +
      `• **Hicks White Top & Farmer Bob's Campgrounds** (Bristol, TN) — Established regional campgrounds catering to large rigs.\n\n` +
      `💡 *Shooter Advisory:* If you are traveling in an RV or towing a camper, we strongly recommend reserving your site in advance at Hilltop or Lakeview RV Resort as regional sites fill quickly during major Appalachian sporting weekends!`;
  }

  // 2. HOTELS & LODGING IN BRISTOL
  if (
    lower.includes("hotel") ||
    lower.includes("lodg") ||
    lower.includes("stay") ||
    lower.includes("room") ||
    lower.includes("cabin") ||
    lower.includes("motel")
  ) {
    return `🏨 **Bristol Lodging Guide:**\n\n` +
      `• **The Bristol Hotel (Historic Downtown)** — 12 mi / 18 min. Boutique luxury, Lumac Rooftop Bar & Vivian's Table. Highly recommended for couples & squads.\n` +
      `• **Hard Rock Hotel & Casino Bristol** — 13 mi / 20 min. 24/7 resort gaming, upscale dining, Caesars sportsbook.\n` +
      `• **Courtyard & Fairfield Inn by Marriott** — 9 mi / 14 min off I-81 Exit 74 near The Pinnacle shopping center.\n` +
      `• **Hilton Garden Inn & Hampton Inn** — 10–11 mi / 15 min. Clean, dependable, with hot breakfast.\n` +
      `• **Extended Stay America** — 10 mi / 15 min. Kitchenettes ideal for traveling shooters carrying pelican cases.\n` +
      `• **Quality Inn / Days Inn / Red Roof** — 10–11 mi. Solid budget-friendly options.\n` +
      `• **RVs & Campers:** Note that the clubhouse has no on-site RV hookups at this time. Recommended reputable options: Hilltop Campground in Bristol and Lakeview RV Resort just 10–12 min away.`;
  }

  // 2. STEAKS, SUSHI & 620 STATE STREET (TOP SPOTLIGHT)
  if (
    lower.includes("steak") ||
    lower.includes("strak") ||
    lower.includes("sushi") ||
    lower.includes("suhi") ||
    lower.includes("620") ||
    (lower.includes("state") && lower.includes("st")) ||
    (lower.includes("where") && (lower.includes("eat") || lower.includes("dinner")) && (lower.includes("best") || lower.includes("tonight") || lower.includes("squad")))
  ) {
    return `🥩🍣 **Range Officer Recommendation — 620 State!**\n\n` +
      `For great **hand-cut steaks and gourmet sushi**, guide your squad straight to:\n\n` +
      `📍 **620 State Restaurant & Bar**\n` +
      `• **Address:** 620 State St, Bristol, TN 37620 (Right on the historic state line!)\n` +
      `• **Specialty:** Prime hand-cut steaks, artisan fresh sushi bar, Asian-fusion entrees & craft cocktails.\n` +
      `• **Vibe:** The #1 premier downtown dinner spot for marksmen, squads, and match visitors looking for top-tier food after running stages.\n\n` +
      `Ask any local shooter — 620 State is the undisputed top squad dinner spot in downtown Bristol!`;
  }

  // 3. GENERAL FOOD & DINING IN BRISTOL
  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("restaur") ||
    lower.includes("diner") ||
    lower.includes("dinner") ||
    lower.includes("lunch") ||
    lower.includes("breakfast") ||
    lower.includes("bbq") ||
    lower.includes("bakery") ||
    lower.includes("doughnut") ||
    lower.includes("donut") ||
    lower.includes("beer") ||
    lower.includes("brew") ||
    lower.includes("bourbon") ||
    lower.includes("drink") ||
    lower.includes("coffee")
  ) {
    return `🍽️ **Bristol Food & Dining Intel (Top Picks):**\n\n` +
      `• **620 State** (620 State St, Bristol TN) — **#1 Squad Dinner Pick!** Hand-cut prime steaks, gourmet sushi bar, Asian-fusion dishes & craft cocktails right on the historic state line.\n` +
      `• **Blackbird Bakery** (56 Piedmont Ave, Bristol VA) — Open 24h Mon–Sat! World-famous doughnuts, artisan pastries & espresso. Mandatory pre-match morning stop!\n` +
      `• **Lumac Rooftop Bar** (510 State St, Bristol VA) — Craft cocktails & small plates with panoramic sunset views over the Appalachians.\n` +
      `• **Vivian's Table** (Bristol Hotel) — Refined Southern dining, prime ribeyes & top-tier bourbon list.\n` +
      `• **Delta Blues BBQ** (724 State St) — Slow-smoked Memphis-style ribs, brisket, pulled pork & weekend live blues.\n` +
      `• **State Street Brewing & Michael Waltrip Brewing** — Downtown small-batch craft beer & NASCAR heritage taprooms.\n` +
      `• **Lost State Distilling** (295 4th St) — Award-winning Tennessee whiskey, bourbon & gin tastings.\n` +
      `• **Bloom Café & Listening Room** — Craft espresso, scratch breakfast & live acoustic music.\n` +
      `• **The Angry Italian** (714 State St) — Chicago-style deep-dish pizza & Italian beef sandwiches for hungry squads.\n` +
      `• **Cootie Brown's** (118 Volunteer Pkwy) — Jamaican jerk chicken, tamales & signature Key Lime pie.`;
  }

  // 3. ENTERTAINMENT, ATTRACTIONS & FLY FISHING
  if (
    lower.includes("entertain") ||
    lower.includes("attraction") ||
    lower.includes("do") ||
    lower.includes("fish") ||
    lower.includes("trout") ||
    lower.includes("casino") ||
    lower.includes("speedway") ||
    lower.includes("nascar") ||
    lower.includes("nightlife") ||
    lower.includes("pinnacle") ||
    lower.includes("bass pro") ||
    lower.includes("hike") ||
    lower.includes("trail") ||
    lower.includes("museum") ||
    lower.includes("lake")
  ) {
    return `🎯 **Bristol Entertainment & Leisure Guide:**\n\n` +
      `• **South Holston River Fly Fishing** 🎣 — Ranked among the top tailwater wild brown & rainbow trout fisheries in the eastern US! 40+ miles of cold water. Call South Holston River Fly Shop or Trophy Water Guide Service. TWRA trout license required.\n` +
      `• **Hard Rock Hotel & Casino Bristol** 🎰 — 24/7 gaming with table games, slots, Caesars Sportsbook & live entertainment.\n` +
      `• **Historic Downtown State Street** 🏛️ — Walk the brass marker line separating Tennessee and Virginia simultaneously. Independent shops, taprooms, and cafes.\n` +
      `• **Bristol Motor Speedway & Dragway** 🏎️ — "The Last Great Colosseum", iconic high-banked half-mile concrete track (146,000+ capacity).\n` +
      `• **Birthplace of Country Music Museum** 🎵 — Smithsonian affiliate commemorating the historic 1927 Bristol Sessions.\n` +
      `• **The Pinnacle** 🏹 — Massive shopping center off I-81 Exit 74 anchored by Bass Pro Shops.\n` +
      `• **Appalachian Trail & Backbone Rock** ⛰️ — "The Shortest Tunnel in the World" and South Holston Dam overlook 20–30 min away.\n` +
      `• **Bristol Caverns & Appalachian Caverns** 🦇 — Spectacular underground illuminated geological formations.\n` +
      `• **Historic Abingdon & Barter Theatre** 🎭 — 15 min north in VA; historic brick town with the State Theatre of Virginia & 34-mile Creeper Bike Trail.`;
  }

  // 4. MATCH OPERATIONS & EVENT INQUIRIES (OFFICIAL DIRECTORY NOTICE)
  if (
    lower.includes("match") ||
    lower.includes("schedule") ||
    lower.includes("time") ||
    lower.includes("date") ||
    lower.includes("when") ||
    lower.includes("timeline") ||
    lower.includes("friday") ||
    lower.includes("saturday") ||
    lower.includes("sunday") ||
    lower.includes("purse") ||
    lower.includes("prize") ||
    lower.includes("cash") ||
    lower.includes("side match") ||
    lower.includes("cold bore") ||
    lower.includes("speed duel") ||
    lower.includes("money match")
  ) {
    return `🎯 **Range Officer Notice — Event & Match Operations:**\n\n` +
      `All official match schedules, registration, stage briefings, and event prize details are managed directly by Match Director Allen Hurley.\n\n` +
      `For Bristol lodging, campgrounds, top restaurants (like steaks & sushi at 620 State), local attractions, and range safety rules, I'm here 24/7!`;
  }

  // 6. THE HIDEOUT FACILITY & ADDRESS
  if (
    lower.includes("hideout") ||
    lower.includes("facility") ||
    lower.includes("address") ||
    lower.includes("location") ||
    lower.includes("where is") ||
    lower.includes("directions") ||
    lower.includes("acres")
  ) {
    return `📍 **The Hideout Facility Blueprint:**\n\n` +
      `• **Address:** 111 Hwy 44, Bristol, TN 37620\n` +
      `• **Property:** 220 acres of private Appalachian mountain ridgeline\n` +
      `• **Ranges:**\n` +
      `  - 300-Yard Dedicated Precision Rimfire Range (Barricades, tank traps, rooftop, rock ledges)\n` +
      `  - 1,000-Yard Centerfire Long-Range Course\n` +
      `  - Sporting Clays & Skeet Field\n` +
      `• **Clubhouse:** Air-conditioned pro shop, lounge, conference rooms & staging pavilions\n` +
      `• **Camping / RVs:** No on-site RV hookups at the clubhouse at this time. Recommended nearby Bristol RV parks: Hilltop Campground and Lakeview RV Resort (10–12 min away).\n` +
      `• **Host:** Allen Hurley — Subsonic Society Founder ("Said. Done.")`;
  }

  // 7. AMMO, BALLISTICS & GEAR
  if (
    lower.includes("ammo") ||
    lower.includes("bullet") ||
    lower.includes("velocity") ||
    lower.includes("subsonic") ||
    lower.includes("gear") ||
    lower.includes("spec") ||
    lower.includes("lapua") ||
    lower.includes("eley") ||
    lower.includes("sk")
  ) {
    return `🎯 **Ammunition & Gear Specifications:**\n\n` +
      `• **Authorized Ammunition:** Standard-velocity or subsonic .22 LR with muzzle velocity under 1,120 FPS at sea level equivalent.\n` +
      `• **Prohibited:** Any hyper-velocity or magnum rimfire (.22 WMR, .17 HMR).\n` +
      `• **Chrono Station:** Random squad chronograph checks conducted during Friday practice & Saturday staging.\n` +
      `• **Top Match Lots:** Lapua Center-X, SK Long Range Match, Eley Tenex, and RWS R50.\n` +
      `• **Elevation DOPE:** Range elevation sits at 3,420 FT. Account for thermal ridge drafts and lower air density. Check the Competitor Packet (/competitor-packet) for range elevation and match ballistics.`;
  }

  // 8. RULES & SAFETY
  if (
    lower.includes("rule") ||
    lower.includes("safety") ||
    lower.includes("flag") ||
    lower.includes("chamber") ||
    lower.includes("ro") ||
    lower.includes("range officer")
  ) {
    return `📋 **Range Safety & Match Regulations:**\n\n` +
      `1️⃣ **Cold Range Standard:** Rifles remain completely unloaded with chamber flags inserted until the RO gives the command to load and make ready.\n` +
      `2️⃣ **Muzzle Discipline:** 120-degree muzzle rule enforced on all transition stages and barricades.\n` +
      `3️⃣ **Eye & Ear Protection:** Mandatory for all competitors, squad leads, ROs, and spectators.\n` +
      `4️⃣ **Score Protests:** Inquiries must be filed with the Chief RO or Match Director within 30 minutes of stage completion.\n` +
      `5️⃣ **Community Comms:** No gear sales, harassment, or commercial spam on the frequency. Respect all marksmen.`;
  }

  // 9. GENERAL HELP & COMMANDS
  if (lower.includes("help") || lower.includes("command") || lower.includes("what can you")) {
    return `🎯 **I'm RO — Official Range Officer for The Hideout. Here's what I know:**\n\n` +
      `• **@ro hotels** — Recommended Bristol hotels, rates & distances\n` +
      `• **@ro rv** — RV hookup policy & reputable Bristol campgrounds (Hilltop, Lakeview, KOA)\n` +
      `• **@ro food** — Top Bristol restaurants, BBQ, steaks & sushi at 620 State, Blackbird Bakery\n` +
      `• **@ro entertainment** — Fly fishing, Hard Rock Casino, Speedway & attractions\n` +
      `• **@ro hideout** — 220-acre facility amenities, ranges & address\n` +
      `• **@ro ammo** — Authorized ammo specs & subsonic speed limits\n` +
      `• **@ro rules** — Safety SOPs and cold range rules\n\n` +
      `Or just ask any question about Bristol lodging, dining, campgrounds, or range safety — I'm monitoring this frequency 24/7!`;
  }

  return `🎯 Range Officer on net! Ask me about Bristol hotels, campgrounds, restaurants (head to 620 State for steaks & sushi!), or local entertainment like South Holston fly fishing and the Hard Rock Casino. Type @ro help for commands!`;
}

export function getRoDirectAnswer(content: string, callsign: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `Copy that, [${callsign}]. Range Officer standing by on your private point-to-point net. What Bristol lodging, dining, campground, or range safety details can I verify for your squad?`;
  }
  return getFaqResponse(content);
}

// ─── CHANNEL WELCOME ──────────────────────────────────────────────────────────

export function getChannelWelcome(channelId: string, callsign: string): string {
  return `🎯 Range Officer on net! Welcome to #${channelId}, ${callsign}.\n\n` +
    `This is the official Subsonic Society frequency for The Hideout in Bristol, TN. ` +
    `Use this channel for squad comms, Bristol hotel coordination, food runs, and local entertainment.\n\n` +
    `Say "hey ro" or ask me anything about Bristol dining (head to 620 State for steaks & sushi!), lodging, campgrounds, or fly fishing on the South Holston!`;
}

// ─── RANDOM PICKER ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── CORE ANALYSIS ENGINE ─────────────────────────────────────────────────────

export function analyzeMsgForPlink(
  msg: ChatMessage,
  userWarningHistory: Record<string, number>,
  lastMessageContent?: string,
  isDirectChat: boolean = false
): PlinkResponse | null {
  if (msg.author.id === "plink_ai_moderator") return null;

  const content = msg.content || "";
  const callsign = msg.author.callsign || msg.author.name || "Shooter";
  const userId = msg.author.id;
  const priorWarnings = userWarningHistory[userId] || 0;

  // ── Moderation checks (Active across ALL channels, including direct chat) ────

  if (SALE_PATTERNS.some((p) => p.test(content))) {
    const tier = priorWarnings >= 1 ? 2 : 1;
    const responses = tier >= 2 ? FORMAL_SALE_WARNINGS : SOFT_SALE_WARNINGS;
    const warningText = isDirectChat
      ? `⚠️ [RO DIRECT NET MONITOR] [${callsign}] — Range Officer notice: Direct private transmissions remain subject to Subsonic Society match safety regulations. Commercial firearm or ammunition transactions are strictly prohibited.`
      : pick(responses)(callsign);
    return { content: warningText, warningTier: tier as 1 | 2, violationType: "FIREARM_SALE", shouldEscalate: true, targetCallsign: callsign };
  }

  if (HARASSMENT_PATTERNS.some((p) => p.test(content))) {
    const warningText = isDirectChat
      ? `⚠️ [RO DIRECT NET MONITOR] [${callsign}] — Hostile conduct or personal attacks on private frequencies violate range regulations. This transmission has been logged for Match Director review.`
      : pick(HARASSMENT_WARNINGS)(callsign);
    return { content: warningText, warningTier: 3, violationType: "HARASSMENT", shouldEscalate: true, targetCallsign: callsign };
  }

  if (UNSPORTSMANLIKE_PATTERNS.some((p) => p.test(content))) {
    const warningText = isDirectChat
      ? `⚠️ [RO DIRECT NET MONITOR] [${callsign}] — Range Officer reminder: Maintain professional sportsmanship across all Subsonic Society chat channels.`
      : pick(UNSPORTSMANLIKE_WARNINGS)(callsign);
    return { content: warningText, warningTier: 2, violationType: "UNSPORTSMANLIKE", shouldEscalate: true, targetCallsign: callsign };
  }

  if (COMMERCIAL_PATTERNS.some((p) => p.test(content))) {
    const isPhishingSpam = /bit\.ly|tinyurl|telegram|t\.me|crypto|free\s*eley|giveaway/i.test(content);
    return { content: pick(COMMERCIAL_WARNINGS)(callsign), warningTier: isPhishingSpam ? 2 : 1, violationType: "COMMERCIAL", shouldEscalate: isPhishingSpam, targetCallsign: callsign };
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

  // ── Direct Chat Behavior: No unsolicited welcome/greetings, monitor silently ──
  if (isDirectChat) {
    // Only answer if shooter explicitly addressed RO with @ro or ro question
    if (RO_MENTION.test(content) || RO_QUESTION.test(content) || /^(hey|hi|hello)\s+(ro)\b/i.test(content)) {
      return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
    }
    // Otherwise RO monitors silently without interrupting the 1-on-1 convo
    return null;
  }

  // ── Public Net Conversational checks ─────────────────────────────────────────

  if (RO_THANKS.test(content)) {
    return { content: pick(RO_THANKS_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (RO_IDENTITY.test(content)) {
    return { content: pick(RO_IDENTITY_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (RO_REAL.test(content)) {
    return { content: pick(RO_REAL_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (RO_HOW.test(content)) {
    return { content: pick(RO_HOW_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (RO_GREETING.test(content) || RO_NAME_FIRST.test(content)) {
    return { content: pick(RO_GREETING_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  if (RO_MENTION.test(content) || RO_QUESTION.test(content)) {
    return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  // Direct RV, camping, hookup, or trailer inquiries
  const lower = content.toLowerCase();
  if (
    lower.includes("rv") ||
    lower.includes("hookup") ||
    lower.includes("camper") ||
    lower.includes("motorhome") ||
    lower.includes("campsite") ||
    lower.includes("campground") ||
    lower.includes("hilltop") ||
    (lower.includes("camp") && (lower.includes("?") || lower.includes("clubhouse") || lower.includes("on site") || lower.includes("weekend") || lower.includes("ro")))
  ) {
    return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  // Direct steak, sushi, or 620 State Street inquiries
  if (
    lower.includes("steak") ||
    lower.includes("strak") ||
    lower.includes("sushi") ||
    lower.includes("suhi") ||
    lower.includes("620")
  ) {
    return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  // Direct question keywords about Bristol hospitality & amenities
  if (
    (lower.includes("where to stay") || lower.includes("hotel") || lower.includes("lodging") || lower.includes("where to eat") || lower.includes("restaurant") || lower.includes("blackbird") || lower.includes("bbq") || lower.includes("fly fishing") || lower.includes("south holston") || lower.includes("casino") || lower.includes("campground") || lower.includes("rv") || lower.includes("camper")) &&
    (lower.includes("?") || lower.includes("recommend") || lower.includes("best") || lower.includes("ro") || lower.includes("anyone") || lower.includes("dinner") || lower.includes("food"))
  ) {
    return { content: getFaqResponse(content), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  // Low-priority: RO BOT mentioned casually
  if (RO_MENTIONED.test(content)) {
    return { content: pick(RO_GENERAL_RESPONSES)(callsign), warningTier: 0, violationType: null, shouldEscalate: false, targetCallsign: callsign };
  }

  return null;
}

// ─── RO MESSAGE BUILDER ───────────────────────────────────────────────────────

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
    id: `ro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    channelId,
    type: warningTier >= 2 ? "MATCH_ALERT" : "STANDARD",
    author: { ...RO_AUTHOR },
    content,
    timestamp,
    reactions: [],
    moderationStatus: "APPROVED",
    aiModerationReport:
      warningTier > 0
        ? { toxicityScore: warningTier * 30, threatScore: 0, policyScore: 0, sentiment: "NEUTRAL", aiEngine: "Range Officer RO" }
        : undefined,
  };
}
