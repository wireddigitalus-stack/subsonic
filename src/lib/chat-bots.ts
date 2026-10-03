/**
 * Subsonic Society — Chat Bot Engine
 * 
 * Client-side bot engine that spawns 6 realistic shooter personas
 * who auto-chat across all channels with contextual, threaded conversations.
 * Exercises every chat feature: messages, DOPE cards, reactions, channels.
 */

import { ChatMessage, DopeCardData } from "./types";
import { evaluateChatMessage } from "./ai-moderator";
import { recordCommsAbuseAlert } from "./abuse-moderation";

// ──────────────────────────────────────────────────────────────────────────────
// BOT PERSONAS
// ──────────────────────────────────────────────────────────────────────────────

export interface BotPersona {
  id: string;
  name: string;
  callsign: string;
  role: ChatMessage["author"]["role"];
  badgeText: string;
  division: string;
  rifleSetup: string;
  personality: string; // internal descriptor, not shown
  primaryChannels: string[]; // channels this bot favors
  dopeDropRate: number; // 0-1 probability of dropping DOPE vs standard msg
  reactionRate: number; // 0-1 probability of reacting to another bot's message
  isBadActor?: boolean; // designates this bot as an occasional AI moderator stress tester
  violationRate?: number; // 0-1 probability of breaking rules when bad actor mode is on
}

export const BOT_PERSONAS: BotPersona[] = [
  {
    id: "bot-garrett",
    name: "Test Bot — Match Ops",
    callsign: "TEST-OPS",
    role: "MATCH_DIRECTOR",
    badgeText: "TEST BOT",
    division: "Automated Match Director Tester",
    rifleSetup: "Kestrel 5700 Elite Link (QA Rig)",
    personality: "official-formal",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.15,
  },
  {
    id: "bot-wyatt",
    name: "Test Bot — Chat Simulator",
    callsign: "TEST-CHAT",
    role: "PRO_COMPETITOR",
    badgeText: "TEST BOT",
    division: "Chat Simulation & Load Test",
    rifleSetup: "Vudoo V-22 / Bartlein MTU 20\" / ZCO 527",
    personality: "elite-data-driven",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.4,
  },
  {
    id: "bot-kendra",
    name: "Test Bot — DOPE Drops",
    callsign: "TEST-DOPE",
    role: "PRO_COMPETITOR",
    badgeText: "TEST BOT",
    division: "Ballistics & DOPE Card Tester",
    rifleSetup: "RimX / Proof Carbon 22\" / TT525P",
    personality: "technical-analytical",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.35,
  },
  {
    id: "bot-eli",
    name: "Test Bot — Rookie QA",
    callsign: "TEST-ROOKIE",
    role: "MEMBER",
    badgeText: "TEST BOT",
    division: "New Member Simulation",
    rifleSetup: "CZ 457 MTR / Vortex Razor Gen III",
    personality: "enthusiastic-newcomer",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.7,
  },
  {
    id: "bot-marcus",
    name: "Test Bot — Guidelines",
    callsign: "TEST-GUIDELINES",
    role: "PRO_COMPETITOR",
    badgeText: "TEST BOT",
    division: "AI Moderation Stress Tester",
    rifleSetup: "Vudoo Ravage / Krieger 20\" / NF ATACR 7-35",
    personality: "veteran-tactical",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.3,
    isBadActor: true,
    violationRate: 0.15,
  },
  {
    id: "bot-sofia",
    name: "Test Bot — Travel & Lodging",
    callsign: "TEST-TRAVEL",
    role: "MEMBER",
    badgeText: "TEST BOT",
    division: "Travel & Lodging QA",
    rifleSetup: "Bergara B-14R / Bushnell XRS3 6-36",
    personality: "budget-friendly-social",
    primaryChannels: ["invitational"],
    dopeDropRate: 0,
    reactionRate: 0.6,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// SIMULATED GUIDELINE VIOLATIONS — AI Moderator Stress Test Pool
// ──────────────────────────────────────────────────────────────────────────────

export interface BotViolationItem {
  category: "UNSPORTSMANLIKE" | "FIREARM_SALE" | "STRONG_LANGUAGE" | "SPAM";
  content: string;
}

export const BOT_VIOLATIONS: BotViolationItem[] = [
  // 1. Unsportsmanlike conduct / score disputes (triggers Plink HARASSMENT / evaluateChatMessage FLAGGED)
  {
    category: "UNSPORTSMANLIKE",
    content: "Stage 7 RO is pencil whipping the scorebook for Squad 3. Total fraud call, that was a clean hit on steel.",
  },
  {
    category: "UNSPORTSMANLIKE",
    content: "That barricade score was rigged. Everyone saw Keller miss 2 impacts and the RO gave him a clean card. Total cheat.",
  },
  {
    category: "UNSPORTSMANLIKE",
    content: "Stage 4 timer guy is a complete idiot, stole 4 seconds off my split time. Unbelievable trash officiating.",
  },
  // 2. Prohibited commerce / unregulated NFA sales (triggers Plink FIREARM_SALE / evaluateChatMessage REJECTED)
  {
    category: "FIREARM_SALE",
    content: "WTS custom titanium rimfire suppressor adapter cash only no paperwork, dm me behind the pavilion.",
  },
  {
    category: "FIREARM_SALE",
    content: "Selling my spare Vudoo bolt and match ammo cash no ffl required, pm me fast before next stage.",
  },
  {
    category: "FIREARM_SALE",
    content: "Anyone want to buy my rimfire binary trigger pack? Cash only, dm me for price.",
  },
  // 3. Strong language / frustrated vent (triggers Plink STRONG_LANGUAGE / PROFANITY)
  {
    category: "STRONG_LANGUAGE",
    content: "What the fuck was that 18 mph gust on the tank trap? Completely screwed my run, total bullshit.",
  },
  {
    category: "STRONG_LANGUAGE",
    content: "Missed the cold bore plate at 300 yards by an inch, damn it! That stage was pure crap.",
  },
  // 4. Spam / commercial solicitation (triggers Plink COMMERCIAL / SPAM)
  {
    category: "SPAM",
    content: "Win 10,000 rounds of free Eley match ammo! Click here to claim your entry: bit.ly/free-subsonic-ammo",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MESSAGE POOLS — Per channel, contextually appropriate
// ──────────────────────────────────────────────────────────────────────────────

interface MessagePool {
  [channelId: string]: {
    [botId: string]: string[];
  };
}

const MESSAGE_POOLS: MessagePool = {
  "invitational": {
    "bot-garrett": [
      "All competitors: Zero confirmation range opens Friday Nov 13 at 10:00 AM sharp at The Hideout. Chrono station at Pavilion 1.",
      "Reminder: Mandatory safety brief is 07:30 AM Saturday morning under the main pavilion. Check your chamber flags.",
      "The $1,000 Rimfire Speed Duel brackets will be drawn Saturday at 4:00 PM right before the head-to-head showdown.",
      "Sunday afternoon: $1,500 1,000-Yard Cold Bore Challenge on the centerfire range. One shot, cold bore, 1,000 yards on steel.",
      "Full hospitality update: Smoked BBQ dinner Friday at 5:30 PM, hot breakfasts Sat/Sun, and catered lunch Saturday are all included.",
    ],
    "bot-wyatt": [
      "The Bristol Hotel on State Street is where our squad is staging. Lumac Rooftop Bar has killer sunset views over the mountains.",
      "Just tested Lapua Center-X lot 32187 at 3,420 FT elevation. Holding 1,062 fps with an ES of 7 fps. Ready for the long plates.",
      "Stage 4 (340-yard diamond KYL): Add 0.2 MIL when the canyon draft calms down. The thermal lift drops fast after 13:00.",
      "If you need steaks Thursday night, 620 State right on the TN/VA state line is where it's at. Amazing ribeyes.",
    ],
    "bot-kendra": [
      "Blackbird Bakery on Piedmont Ave is open 24 hours Mon–Sat. We are hitting it for doughnuts and espresso before zeroing Friday!",
      "The 220 acres at The Hideout are breathtaking. The ridgeline crosswinds will test your bubble level on every positional stage.",
      "Vivian's Table inside The Bristol Hotel has an incredible Southern dinner menu and bourbon selection if you're staying downtown.",
      "Ask RO if you need the full 12-hotel list or phone numbers — the guide in the Competitor Packet is super thorough.",
    ],
    "bot-eli": [
      "I'm booking a drift boat on the South Holston River Friday morning! Trophy brown trout on dry flies. Anyone want to split the guide?",
      "Stopped by The Pinnacle shopping center off Exit 74 — Bass Pro Shops has plenty of ammo boxes and cleaning gear.",
      "First time at The Hideout and the facilities are world class. Covered pavilions and air-conditioned clubhouse!",
      "Can we ask RO for recommendations on budget hotels near the highway? Quality Inn or Courtyard?",
    ],
    "bot-marcus": [
      "Delta Blues BBQ on State Street has the best slow-smoked brisket in the Tri-Cities. Squad 5 is heading there Saturday night.",
      "Courtyard by Marriott off Exit 74 is only 14 minutes from the range gate. Clean, quiet, and easy gear loading.",
      "Heading to the 1,000-yard centerfire range Sunday for the $1,500 Cold Bore Challenge. Cold bore dial is locked in.",
      "Lost State Distilling downtown has award-winning Tennessee whiskey. Great spot for a distillery tour after check-in Friday.",
    ],
    "bot-sofia": [
      "Hard Rock Hotel & Casino Bristol is where my crew is staying! 20 minutes from The Hideout and the gaming resort is buzzing.",
      "Don't miss walking down State Street — you can literally stand with one foot in Tennessee and one foot in Virginia!",
      "Does the clubhouse have RV hookups available for weekend campers? Looking to bring my rig for match weekend — are there good campgrounds nearby?",
      "Grabbing pizza at The Angry Italian after check-in. Authentic Chicago deep dish in the Appalachian mountains!",
    ],
  },
  "bristol-pro-shootout": {
    "bot-garrett": [
      "All competitors: Stage 7 now COLD. Chamber flags IN. No handling until the RO clears the line.",
      "Attention all squads: Updated stage brief for Stage 12 posted on the board at Pavilion 2. Check your rotation times.",
      "Reminder: Chronograph station closes at 07:00 sharp. If your lot isn't verified, you don't shoot.",
      "Wind station update from Station 3: Gusting to 16 mph from 280°. Adjust your holds accordingly.",
      "All competitors: Stage 4 target at 340 yards has been replaced — new plate is slightly larger. DOPE should still be valid.",
      "Range going HOT in 5 minutes. Final chamber flag check. ROs confirm your squads.",
    ],
    "bot-wyatt": [
      "Just ran Stage 1 clean. The 22-degree downhill angle at 185 yards is real — add 0.3 MIL over your flat-ground DOPE.",
      "Heads up: The mirage on Stage 4 past 300 yards is brutal between 11:00-14:00. Read through it, don't chase it.",
      "Confirmed: Lapua Center-X lot 32187 is holding 1062 fps today. Consistent ES of 8 fps across 20 rounds.",
      "If you're shooting the 465 out to the terminal flashers — flight time is 1.6 seconds. Hold center and commit.",
      "Stage 7 Tank Trap tip: Use the left fork on the barricade. It's more stable and gives you a better angle on the 260-yard plate.",
      "Wind just switched from WNW to W. Adjust your holds — the canyon is channeling it differently now.",
    ],
    "bot-kendra": [
      "My RimX is grouping 0.28 MOA at 100 today with SK Long Range. Tuner set at 3.5 turns from home.",
      "That downdraft off the ridge is eating elevation. I'm adding 0.15 MIL to everything past 250 yards.",
      "Stage 3 rooftop positional — the metal is slick. Bring friction tape or you'll slide mid-string.",
      "Anyone else seeing their ES climb after round 150? My barrel is heat-soaking. Letting it cool between stages.",
    ],
    "bot-marcus": [
      "Just finished Stage 12. The 425-yard reactive is tricky — the wind funnels through the draw and adds 0.4 MIL left.",
      "Squad 5 heads up: the timer on Stage 8 is tight. Get on glass fast, don't waste time on your mag change.",
      "My Krieger is holding zero beautifully. 450 rounds in today and still printing sub-MOA.",
      "The vertical spread past 400 is mostly DA-related. We're sitting at +2,200 FT right now — add 0.2 MIL elevation.",
    ],
    "bot-eli": [
      "This is my first pro match and I'm nervous but excited! Any last-minute tips for the KYL stage?",
      "Just watched GHOST clean Stage 1. That downhill hold adjustment is no joke.",
      "Is it normal for hands to shake on the barricade stages? Asking for a friend... 😅",
      "The atmosphere here is incredible. 94 shooters and everyone is so helpful. Love this community.",
    ],
    "bot-sofia": [
      "Running my B-14R in production class. She's not fancy but she's consistent. 0.45 MOA at 100 today.",
      "First time shooting past 300 with a .22LR. The bullet drop is wild — like watching it fall in slow motion.",
      "Any production class shooters want to compare DOPE for Stage 4? I'm probably way off.",
    ],
  },

  "squad-briefings": {
    "bot-garrett": [
      "Squad rotation update: Squads 1-4 start on Stages 1-4. Squads 5-8 start on Stages 5-8. No exceptions.",
      "All squad leads: Confirm your roster by 06:30 tomorrow. Missing shooters will be reassigned.",
      "Flight B moves to Stage 9 at 10:15. Stay on schedule — we're running tight today.",
    ],
    "bot-wyatt": [
      "Squad 3 check: Everyone good on chamber flags? We start Stage 7 at 08:30 sharp.",
      "Reminder: Extra magazine springs and friction pads. The Tank Trap eats gear.",
      "Squad 3 — regroup at Pavilion 1 after Stage 7. Quick debrief before we rotate.",
    ],
    "bot-marcus": [
      "Squad 5 roll call. Sound off below so I know everyone's checked in.",
      "We hit Stage 12 at 09:45. It's the long-range terminal stage — bring your patience.",
      "Squad 5 debrief: Solid run on Stage 8. Let's keep that momentum going into the afternoon.",
    ],
    "bot-eli": [
      "Squad 3 checking in! DIALED is ready to go. Where do we stage?",
      "Do I need to bring my own stapler for the target pasters? First match, don't judge me.",
    ],
  },

  "match-day-alerts": {
    "bot-garrett": [
      "🚨 MATCH ALERT: Weather delay. Lightning detected within 5 miles. All ranges COLD. Seek shelter immediately.",
      "🚨 ALL CLEAR: Lightning has passed. Ranges going HOT in 10 minutes. Return to your staging areas.",
      "📋 OFFICIAL: Stage 6 is under review due to target malfunction. Affected squads will reshoot at end of day.",
      "🏆 DAY 1 RESULTS: Leader board will be posted at Pavilion 1 by 18:00. No official scores until verified.",
      "⏰ TOMORROW: Gates open at 05:30. Safety brief at 07:15 under Pavilion 1. Don't be late.",
      "🔴 COLD RANGE — All ranges COLD for target reset. Estimated 15 minutes. Stay behind the yellow line.",
    ],
  },

  "ballistics-and-gear": {
    "bot-wyatt": [
      "Lab tested 4 lots of Center-X this week. Lot 32187 is the winner — 8 fps ES, 1062 fps average, 0.31 MOA at 100.",
      "The ZCO 527 tracks perfectly up to 12 MIL. No tracking error. Worth every penny if you're shooting past 400.",
      "Barrel life question: My Bartlein MTU is at 8,500 rounds and still printing. When do you guys rebarrel?",
    ],
    "bot-kendra": [
      "Tuner testing update: The Harrell tuner clamped 1.5\" back tightened our groups from 0.42 to 0.28 MOA with SK Long Range.",
      "Just got my LabRadar data back. SK Long Range lot 4820: 1074 fps avg, ES 11, SD 4.2. Solid for the price point.",
      "For anyone asking about the Proof Carbon barrel — it handles heat better than steel but takes 200 rounds to settle in.",
      "The TT525P is the best glass I've ever looked through. The illumination at 35x is crystal clear even in low light.",
    ],
    "bot-eli": [
      "Is the CZ 457 MTR competitive in production class or should I upgrade to a Vudoo eventually?",
      "Just ordered my first LabRadar. What distance do you guys set it up at for rimfire testing?",
      "What's the best budget ammo for practice? I can't afford Eley Tenex for every range session.",
      "Anyone have experience with the Vortex Razor vs the Nightforce NXS for rimfire PRS? Big price difference.",
    ],
    "bot-marcus": [
      "The Ravage action is so smooth. The bolt throw is shorter than the V-22 and the trigger is phenomenal.",
      "Nightforce ATACR 7-35 review: Glass clarity is incredible, but the turret feel on the ZCO is better. Trade-offs.",
      "Just switched from Eley Match to RWS R50. The R50 is more consistent in cold weather — tighter ES below 45°F.",
    ],
    "bot-sofia": [
      "The Bergara B-14R is the best value in production rimfire right now. Sub-MOA out of the box for under $1K.",
      "Is it worth upgrading my trigger? The stock Bergara trigger is decent but I've heard the Timney is a game changer.",
      "Bushnell XRS3 at 6-36x is insane value. Tracks perfectly and the glass is 90% as good as the big names.",
      "hey plink, what ammo should I use for my first match? Budget-friendly options?",
    ],
  },

  "general-society": {
    "bot-eli": [
      "Anyone driving from Raleigh to Bristol wanting to share gas? Long drive but worth it for this match.",
      "Just booked a cabin near South Holston Lake. Room for 2 more if anyone needs a place to stay.",
      "This community is something else. I joined 3 months ago and already feel like family. 🎯",
      "Is there a social meetup the night before match day? Would love to put faces to callsigns.",
    ],
    "bot-sofia": [
      "First time at Bristol! Flying in from Texas. Any restaurant recommendations near the range?",
      "Who else is running production class? Would love to meet up and compare notes before the match.",
      "Subsonic Society merch is 🔥. Just ordered the tactical cap and the range bag patch.",
      "My husband thinks I'm crazy for flying across the country to shoot .22s at tiny plates. He's not wrong. 😂",
    ],
    "bot-kendra": [
      "Pro tip: The BBQ place on Highway 421 near the range is incredible. Get the brisket.",
      "If anyone needs barrel cleaning supplies at the range, I've got extra BoreTech and patches. Find me at Squad 4.",
    ],
    "bot-marcus": [
      "Been competing for 12 years and Bristol is still my favorite venue. The mountain setting is unbeatable.",
      "Who's bringing a LabRadar to the practice day? We should pool data on the lot testing.",
    ],
  },

  "range-conditions-weather": {
    "bot-garrett": [
      "Station 2 (3,420 FT): Wind 9 gusting 14 mph from 270° WNW. DA: +2,150 FT. Temp: 62°F. Humidity: 45%.",
      "Station 3 (Valley Floor): Wind 6 steady from 260° W. Mirage: Heavy, full value right. DA: +1,950 FT.",
      "UPDATED: Wind shifted to 290° NW gusting 18 mph on the ridge. Stages 4 and 12 will be affected most.",
      "Morning fog expected tomorrow until 09:00. Visibility may limit long-range stages in the first rotation.",
    ],
    "bot-kendra": [
      "Reading mirage at Station 4 — full value right, about 8 mph equivalent. The ridge is channeling it hard.",
      "The DA just jumped to +2,300 FT. That's going to add 0.2 MIL to everything past 350 yards.",
      "Temperature is climbing. Barrel heat management is going to be critical this afternoon.",
    ],
    "bot-marcus": [
      "The crosswind through the mountain notch at Stage 1 is swirling. Don't trust a single wind read — average 3-4.",
      "My Kestrel at the 400-yard line: 12 mph sustained from 275°. Gusts to 17. It's a challenge out there.",
      "Cloud cover rolling in from the west. Should knock the mirage down in about 30 minutes.",
    ],
    "bot-sofia": [
      "How do you guys read mirage? I can see it but I don't know how to translate it to wind holds yet.",
      "The wind here is so different from Texas. These mountain crosswinds are unpredictable.",
    ],
  },

  "ro-disputes-appeals": {
    "bot-garrett": [
      "Dispute process reminder: Film your targets with timestamps. RO decisions are reviewed within 30 minutes.",
      "Stage 6 scoring dispute has been resolved. Competitor credited with the hit. Score adjusted.",
    ],
    "bot-marcus": [
      "Stage 8, target 3 — I'm seeing an edge hit that the RO called a miss. Requesting video review.",
      "The scoring on the KYL stages needs to be definitive. Edge hits on 0.25\" plates are nearly impossible to call live.",
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// DOPE CARD GENERATOR — Realistic ballistic data
// ──────────────────────────────────────────────────────────────────────────────

interface DopePreset {
  distance: string;
  distanceYds: number;
  elevation: string;
  description: string;
}

const DOPE_PRESETS: DopePreset[] = [
  { distance: "85 YDS", distanceYds: 85, elevation: "2.1 MIL", description: "Stage 2 • KYL Near Rack" },
  { distance: "150 YDS", distanceYds: 150, elevation: "3.8 MIL", description: "Stage 2 • KYL Far Rack" },
  { distance: "185 YDS", distanceYds: 185, elevation: "4.7 MIL", description: "Stage 1 • High-Angle Boulder" },
  { distance: "260 YDS", distanceYds: 260, elevation: "6.8 MIL", description: "Stage 3 • Rooftop Gongs" },
  { distance: "340 YDS", distanceYds: 340, elevation: "8.4 MIL", description: "Stage 4 • Diamond KYL Rack" },
  { distance: "400 YDS", distanceYds: 400, elevation: "10.2 MIL", description: "Stage 12 • Terminal Draw" },
  { distance: "425 YDS", distanceYds: 425, elevation: "11.1 MIL", description: "Stage 12 • Reactive Flasher" },
  { distance: "465 YDS", distanceYds: 465, elevation: "12.8 MIL", description: "Stage 4 • Terminal Glide" },
];

const WIND_DIRECTIONS = ["260° W", "270° WNW", "275° WNW", "280° W", "290° NW", "250° WSW"];
const AMMO_TYPES = [
  "Lapua Center-X 40gr (1,062 FPS)",
  "SK Long Range 40gr (1,074 FPS)",
  "Eley Tenex 40gr (1,085 FPS)",
  "RWS R50 40gr (1,070 FPS)",
  "SK Rifle Match 40gr (1,073 FPS)",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

export function generateDopeCard(): DopeCardData {
  const preset = randomItem(DOPE_PRESETS);
  const windSpeed = Math.round(randomBetween(5, 18));
  const windDir = randomItem(WIND_DIRECTIONS);
  const windMils = randomBetween(0.2, 1.8);
  const side = Math.random() > 0.5 ? "L" : "R";
  const da = Math.round(randomBetween(1800, 2400));

  const notes = [
    "Hold center, commit to the shot.",
    `Downdraft causes ${randomBetween(0.1, 0.3)} mil vertical drop.`,
    "Read mirage before every shot — wind is swirling.",
    "Thermal lift off the valley floor — add 0.1 MIL.",
    `Wind funnels through the draw — add ${randomBetween(0.2, 0.5)} MIL ${side === "L" ? "left" : "right"}.`,
    "Let barrel cool 30 seconds between shots at this distance.",
    "Flight time exceeds 1.4 seconds — stay on glass through impact.",
    "Edge of the plate — favor center-left for wind forgiveness.",
  ];

  return {
    targetDistance: preset.distance,
    targetDescription: preset.description,
    elevationMils: preset.elevation,
    windHoldMils: `${side} ${windMils} MIL`,
    windVelocity: `${windSpeed} MPH @ ${windDir}`,
    ammo: randomItem(AMMO_TYPES),
    densityAltitude: `+${da.toLocaleString()} FT`,
    notes: randomItem(notes),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// REACTION ENGINE
// ──────────────────────────────────────────────────────────────────────────────

const REACTION_EMOJIS = ["🎯", "🔥", "⛰️", "💡", "👏", "🏆"];

function pickReactionEmoji(): string {
  // Weighted: 🎯 and 🔥 are more common
  const weighted = ["🎯", "🎯", "🎯", "🔥", "🔥", "⛰️", "💡", "👏", "🏆"];
  return randomItem(weighted);
}

// ──────────────────────────────────────────────────────────────────────────────
// CONVERSATION ENGINE
// ──────────────────────────────────────────────────────────────────────────────

export type BotSpeed = "SLOW" | "NORMAL" | "FAST";

const SPEED_CONFIG: Record<BotSpeed, { minMs: number; maxMs: number }> = {
  SLOW:   { minMs: 45000, maxMs: 90000 },
  NORMAL: { minMs: 15000, maxMs: 45000 },
  FAST:   { minMs: 4000,  maxMs: 12000 },
};

export interface BotEngineCallbacks {
  addMessage: (msg: ChatMessage) => void;
  addReaction: (msgId: string, emoji: string) => void;
  getMessages: () => ChatMessage[];
  getCurrentChannel?: () => string;
}

export interface BotEngineOptions {
  enableBadActor?: boolean;
}

export function createBotMessage(bot: BotPersona, channelId: string, content: string, dopeCard?: DopeCardData): ChatMessage {
  const evaluation = evaluateChatMessage(content, bot.role);
  const isFlagged = evaluation.status === "FLAGGED" || evaluation.status === "REJECTED";

  // If this bot message breaches guidelines, immediately record a live comms abuse alert for Admin
  if (isFlagged && typeof window !== "undefined") {
    const isCritical = evaluation.threatScore > 70 || evaluation.policyScore > 90 || evaluation.status === "REJECTED";
    const category =
      evaluation.policyScore > 90
        ? "ILLEGAL_COMMERCE"
        : evaluation.threatScore > 70
        ? "PHYSICAL_THREAT"
        : /bit\.ly|telegram|whatsapp|crypto|giveaway|win\s+\d+/i.test(content)
        ? "SPAM_SOLICITATION"
        : "UNSPORTSMANLIKE";

    recordCommsAbuseAlert({
      severity: isCritical ? "CRITICAL" : "HIGH",
      category,
      shooterName: bot.name,
      shooterCallsign: bot.callsign,
      shooterRole: bot.role,
      squad: `Bot Fleet • #${channelId}`,
      channel: channelId,
      messageContent: content,
      toxicityScore: evaluation.toxicityScore,
      threatScore: evaluation.threatScore,
      policyScore: evaluation.policyScore,
      status: "ACTIVE",
      aiRationale: evaluation.flagReason || "Autonomous bot stress-testing violation detected by Sentinel.",
      autoActionTaken: isCritical
        ? "Transmission Suppressed • Bad Actor Flagged in Admin Console"
        : "Flagged with Warning Badge • Placed into Match Director Queue",
    });
  }

    const botMessage: ChatMessage = {
    id: `bot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    channelId,
    type: dopeCard ? "DOPE_DROP" : "STANDARD",
    dopeCard,
    author: {
      id: bot.id,
      name: bot.name,
      callsign: bot.callsign,
      role: bot.role,
      badgeText: bot.badgeText,
      division: bot.division,
      rifleSetup: bot.rifleSetup,
    },
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    reactions: [],
    moderationStatus: isFlagged ? "FLAGGED" : "APPROVED",
    aiModerationReport: {
      toxicityScore: evaluation.toxicityScore,
      threatScore: evaluation.threatScore,
      policyScore: evaluation.policyScore,
      sentiment: evaluation.sentiment,
      flagReason: evaluation.flagReason,
      aiEngine: isFlagged ? "Subsonic Sentinel (Flagged)" : "Bot Engine (Simulated)",
    },
  };

  logBotActivity(botMessage);

  return botMessage;
}

/**
 * Creates and starts the bot engine. Returns a cleanup function.
 */
export function startBotEngine(
  speed: BotSpeed,
  callbacks: BotEngineCallbacks,
  options?: BotEngineOptions
): () => void {
  const { minMs, maxMs } = SPEED_CONFIG[speed];
  let active = true;
  const timers: ReturnType<typeof setTimeout>[] = [];
  // Track which messages each bot has used per channel to avoid repeats
  const usedMessages: Record<string, Set<number>> = {};

  function getUnusedMessage(botId: string, channelId: string): string | null {
    const pool = MESSAGE_POOLS[channelId]?.[botId];
    if (!pool || pool.length === 0) return null;

    const key = `${botId}:${channelId}`;
    if (!usedMessages[key]) usedMessages[key] = new Set();

    // Find unused indices
    const available = pool
      .map((_, i) => i)
      .filter((i) => !usedMessages[key].has(i));

    if (available.length === 0) {
      // Reset — all messages used
      usedMessages[key] = new Set();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const idx = randomItem(available);
    usedMessages[key].add(idx);
    return pool[idx];
  }

  function scheduleNext() {
    if (!active) return;
    const delay = Math.round(Math.random() * (maxMs - minMs) + minMs);

    const timer = setTimeout(() => {
      if (!active) return;

      // Pick a random bot
      const bot = randomItem(BOT_PERSONAS);

      // Check if this bot is designated as a bad actor and triggers a guideline violation
      const isBadActorActive = options?.enableBadActor !== false;
      const isViolation = isBadActorActive && bot.isBadActor && Math.random() < (bot.violationRate ?? 0.15);

      if (isViolation) {
        // Target current viewed channel if available so the user sees Plink's live moderation
        const channelId = callbacks.getCurrentChannel ? callbacks.getCurrentChannel() : randomItem(bot.primaryChannels);
        const violation = randomItem(BOT_VIOLATIONS);
        const msg = createBotMessage(bot, channelId, violation.content);
        callbacks.addMessage(msg);

        // Schedule reactions from other bots
        scheduleReactions(msg.id);
      } else {
        // Pick a channel this bot posts in
        const channelId = randomItem(bot.primaryChannels);

        // Decide: DOPE card or standard message?
        const isDopeDrop = Math.random() < bot.dopeDropRate;

        if (isDopeDrop) {
          const dope = generateDopeCard();
          const dopeContent = `Verified DOPE for ${dope.targetDistance} on ${dope.targetDescription || "this stage"}. ${dope.ammo?.split(" (")[0] || "Standard ammo"} holding steady. ${dope.notes || ""}`.trim();
          const msg = createBotMessage(bot, channelId, dopeContent, dope);
          callbacks.addMessage(msg);

          // Schedule reactions from other bots
          scheduleReactions(msg.id);
        } else {
          const content = getUnusedMessage(bot.id, channelId);
          if (content) {
            const msg = createBotMessage(bot, channelId, content);
            callbacks.addMessage(msg);

            // Schedule reactions from other bots
            scheduleReactions(msg.id);

            // Occasionally trigger a threaded response from another bot
            if (Math.random() < 0.3) {
              scheduleResponse(channelId, bot.id);
            }
          }
        }
      }

      // Schedule next message
      scheduleNext();
    }, delay);

    timers.push(timer);
  }

  function scheduleReactions(msgId: string) {
    // 2-4 bots may react within 3-10 seconds
    const reactors = BOT_PERSONAS.filter(() => Math.random() < 0.3);
    reactors.forEach((bot) => {
      if (Math.random() < bot.reactionRate) {
        const delay = Math.round(randomBetween(2000, 8000));
        const timer = setTimeout(() => {
          if (!active) return;
          const emoji = pickReactionEmoji();
          callbacks.addReaction(msgId, emoji);
          recordBotReaction(msgId, emoji);
        }, delay);
        timers.push(timer);
      }
    });
  }

  function scheduleResponse(channelId: string, excludeBotId: string) {
    // Pick a different bot to respond
    const responders = BOT_PERSONAS.filter(
      (b) => b.id !== excludeBotId && b.primaryChannels.includes(channelId)
    );
    if (responders.length === 0) return;

    const responder = randomItem(responders);
    const delay = Math.round(randomBetween(3000, 10000));

    const timer = setTimeout(() => {
      if (!active) return;
      const content = getUnusedMessage(responder.id, channelId);
      if (content) {
        const msg = createBotMessage(responder, channelId, content);
        callbacks.addMessage(msg);
      }
    }, delay);

    timers.push(timer);
  }

  // Burst start: Fire 2-3 messages quickly on first activation
  const burstCount = Math.floor(randomBetween(2, 4));
  for (let i = 0; i < burstCount; i++) {
    const delay = Math.round(randomBetween(1000, 3000)) * (i + 1);
    const timer = setTimeout(() => {
      if (!active) return;
      const bot = BOT_PERSONAS[i % BOT_PERSONAS.length];
      const channelId = randomItem(bot.primaryChannels);
      const content = getUnusedMessage(bot.id, channelId);
      if (content) {
        const msg = createBotMessage(bot, channelId, content);
        callbacks.addMessage(msg);
        scheduleReactions(msg.id);
      }
    }, delay);
    timers.push(timer);
  }

  // Start the regular cycle
  scheduleNext();

  // Return cleanup function
  return () => {
    active = false;
    timers.forEach(clearTimeout);
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// BOT ACTIVITY LOG & TELEMETRY STORE
// ──────────────────────────────────────────────────────────────────────────────

export const BOT_ACTIVITY_STORAGE_KEY = "subsonic_bot_activity_log";
export const BOT_ACTIVITY_EVENT = "subsonic_bot_activity_updated";

export function getBotActivityLog(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOT_ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logBotActivity(msg: ChatMessage): void {
  if (typeof window === "undefined") return;
  try {
    const current = getBotActivityLog();
    const updated = [msg, ...current.filter((m) => m.id !== msg.id)].slice(0, 200);
    localStorage.setItem(BOT_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BOT_ACTIVITY_EVENT, { detail: updated }));
  } catch {
    // fallback
  }
}

export function recordBotReaction(msgId: string, emoji: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getBotActivityLog();
    const updated = current.map((m) => {
      if (m.id !== msgId) return m;
      const existing = m.reactions?.find((r) => r.emoji === emoji);
      if (existing) {
        return {
          ...m,
          reactions: m.reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r),
        };
      }
      return {
        ...m,
        reactions: [...(m.reactions || []), { emoji, count: 1, users: ["bot"] }],
      };
    });
    localStorage.setItem(BOT_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BOT_ACTIVITY_EVENT, { detail: updated }));
  } catch {}
}

export function clearBotActivityLog(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BOT_ACTIVITY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(BOT_ACTIVITY_EVENT, { detail: [] }));
  } catch {}
}

export function subscribeToBotActivity(callback: (messages: ChatMessage[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<ChatMessage[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getBotActivityLog());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === BOT_ACTIVITY_STORAGE_KEY) {
      callback(getBotActivityLog());
    }
  };

  window.addEventListener(BOT_ACTIVITY_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(BOT_ACTIVITY_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// BOT STATS & MANUAL TRIGGER HELPERS
// ──────────────────────────────────────────────────────────────────────────────

export interface BotActivityStat {
  bot: BotPersona;
  messageCount: number;
  dopeCount: number;
  reactionCount: number;
  lastChannel?: string;
  lastTimestamp?: string;
}

export function computeBotStats(messages: ChatMessage[]): {
  totalBotMessages: number;
  totalDopeDrops: number;
  botStats: Record<string, BotActivityStat>;
} {
  const botStats: Record<string, BotActivityStat> = {};
  for (const bot of BOT_PERSONAS) {
    botStats[bot.id] = {
      bot,
      messageCount: 0,
      dopeCount: 0,
      reactionCount: 0,
    };
  }

  let totalBotMessages = 0;
  let totalDopeDrops = 0;

  for (const msg of messages) {
    const authorId = msg.author.id;
    if (botStats[authorId]) {
      totalBotMessages++;
      botStats[authorId].messageCount++;
      if (msg.dopeCard || msg.type === "DOPE_DROP") {
        totalDopeDrops++;
        botStats[authorId].dopeCount++;
      }
      botStats[authorId].lastChannel = msg.channelId;
      botStats[authorId].lastTimestamp = msg.timestamp;
      botStats[authorId].reactionCount += msg.reactions?.reduce((acc, r) => acc + r.count, 0) || 0;
    }
  }

  return { totalBotMessages, totalDopeDrops, botStats };
}

export function triggerSingleBotTransmission(
  botId: string,
  channelId: string,
  callbacks: { addMessage: (msg: ChatMessage) => void },
  forceDope?: boolean,
  forceViolation?: boolean
): ChatMessage | null {
  const bot = BOT_PERSONAS.find((b) => b.id === botId);
  if (!bot) return null;

  let msg: ChatMessage;
  if (forceViolation) {
    const violation = BOT_VIOLATIONS[Math.floor(Math.random() * BOT_VIOLATIONS.length)];
    msg = createBotMessage(bot, channelId, violation.content);
  } else if (forceDope ?? (bot.dopeDropRate > 0.25 || Math.random() < bot.dopeDropRate)) {
    const dope = generateDopeCard();
    const dopeContent = `[DEMO TRANSMISSION] Verified DOPE for ${dope.targetDistance} on ${dope.targetDescription || "this stage"}. ${dope.ammo?.split(" (")[0] || "Standard ammo"} holding steady. ${dope.notes || ""}`.trim();
    msg = createBotMessage(bot, channelId, dopeContent, dope);
  } else {
    const pool = MESSAGE_POOLS[channelId]?.[bot.id] || MESSAGE_POOLS["bristol-pro-shootout"]?.[bot.id] || ["Radio check, station loud and clear on tactical frequency."];
    const content = pool[Math.floor(Math.random() * pool.length)];
    msg = createBotMessage(bot, channelId, content);
  }

  callbacks.addMessage(msg);
  return msg;
}

