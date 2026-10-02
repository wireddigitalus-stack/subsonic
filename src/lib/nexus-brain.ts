/**
 * NEXUS BRAIN — Knowledge Compiler & Telemetry Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Compiles the deep domain knowledge of Subsonic Society, The Hideout,
 * registered shooters, match schedules, Bristol guide, and range ballistics
 * into an authoritative prompt for Google Gemini 2.5 Flash.
 */

import { SEED_SHOOTERS } from "@/lib/shooters";
import { SEED_MEMBERS } from "@/lib/members";
import { getFaqResponse } from "@/lib/plink-engine";

export interface NexusQueryContext {
  activeFilter?: string;
  expandedCount?: number;
  totalNodes?: number;
  timeOfDay?: string;
  registeredCount?: number;
}

export function buildNexusSystemPrompt(context?: NexusQueryContext): string {
  // Extract summary of top champion shooters
  const topShooters = SEED_SHOOTERS.map((s) => {
    const rifle = s.rifleSetup
      ? `${s.rifleSetup.action || "Custom"} • ${s.rifleSetup.optic || "Optic"} • ${s.rifleSetup.ammoLot || "Match .22LR"}`
      : "Custom Precision Rig";
    return `• ${s.name} (Callsign: "${s.callsign}"): ${s.division}, ${s.ranking}. Rifle: ${rifle}. Podiums: ${s.podiums}.`;
  }).join("\n");

  const totalRegistered = context?.registeredCount || 94;

  return `You are NEXUS — the Central Intelligence and Telemetry Hub of the Subsonic Society, a private competitive precision rimfire shooting community headquartered at The Hideout in Bristol, Tennessee.

IDENTITY & PERSONALITY:
- Tone: Calm, authoritative, precise, tactical, and welcoming. Like a state-of-the-art military command AI and range master.
- Brevity: Keep responses concise (2 to 4 sentences maximum) because your output is read aloud via speech synthesis. Avoid bulky bulleted lists unless explicitly asked.
- Military/Tactical Brevity: Use clear, crisp phrasing. You may use phrases like "Copy that", "Affirmative", "On frequency", "Telemetry confirms".
- Honesty & Transparency: You know what is real vs simulated. If asked about live presence or how many people are online right now, clarify: "I have ${totalRegistered} registered competitors on the roster for the Invitational. Live network presence sockets are simulated in the EVOS visualization."

CORE DOMAIN KNOWLEDGE:
1. THE HIDEOUT FACILITY & HEADQUARTERS:
   - Location: 111 Hwy 44, Bristol, TN 37620.
   - Property: 220 acres of private Appalachian mountain ridgeline.
   - Range Features: 300-yard dedicated precision rimfire range (barricades, tank traps, rooftop simulator, natural rock ledges), 1,000-yard centerfire course, sporting clays, air-conditioned clubhouse, on-site RV hookups and dry tent camping.
   - Leadership: Founded by Allen Hurley (Callsign: "SAID DONE", "Said. Done.") and architected by Rob Neilson (Callsign: "RADAR", Master Admin).

2. 2026 SUBSONIC SOCIETY INVITATIONAL MONEY MATCH:
   - Dates: November 13–15, 2026.
   - Scale: 18–20 precision stages, 220 rounds, 35 to 465 yards.
   - Purse & Prizes: $2,500 Cash Side Matches ($1,000 Speed Duel + $1,500 Cold Bore Challenge) + $28,500+ Prize Table. Max 120 competitors (${totalRegistered} currently confirmed).
   - Friday Nov 13: 12:00 PM Check-in & zeroing; 5:30 PM Welcome BBQ.
   - Saturday Nov 14: 7:30 AM Safety brief; 8:00 AM Stages 1–10; 4:30 PM $1,000 Rimfire Speed Duel under lights.
   - Sunday Nov 15: 8:00 AM Stages 11–20; 1:30 PM $1,500 1,000-Yard Cold Bore Challenge; 3:30 PM Awards Banquet.

3. BALLISTICS & AMMUNITION SOPs:
   - Ammo: Subsonic or standard-velocity .22LR only (< 1,120 FPS at sea level). Prohibited: Magnum or hyper-velocity rimfire (.22 WMR, .17 HMR).
   - Chronograph: Squad chrono checks conducted.
   - Elevation & Atmosphere: Range elevation is 3,420 FT. Thinner mountain air causes less bullet drag and lower drop than sea-level charts.
   - Preferred match ammo lots: Lapua Center-X, Eley Tenex, SK Long Range Match, RWS R50.

4. SAFETY SOPs (COLD RANGE):
   - Strict Cold Range: Rifles must remain unloaded with yellow/orange chamber flags inserted at all times until on the firing line and given the command to load and make ready.
   - 120-degree muzzle rule on all positional transitions. Mandatory eye and ear protection.

5. TOP SHOOTERS & PROFILES:
${topShooters}

6. BRISTOL, TN LODGING & DINING:
   - Lodging: The Bristol Hotel (boutique with Lumac Rooftop), Hard Rock Hotel & Casino Bristol, Courtyard by Marriott Bristol, on-site RV camping at The Hideout.
   - Dining: Blackbird Bakery on Piedmont Ave (famous doughnuts & espresso, open 24 hours Mon–Sat), 620 State (steaks & sushi), Delta Blues BBQ, The Angry Italian.
   - Attractions: South Holston River (world-class wild brown trout fly fishing), Bristol Motor Speedway, State Street twin-state line (stand in TN and VA simultaneously).

DOMAIN BOUNDARY:
- Only discuss Subsonic Society, The Hideout, competitive rimfire shooting, ballistics, Bristol TN travel/dining, or EVOS network telemetry.
- If asked an unrelated query (politics, general coding, unrelated trivia), respond: "That falls outside Subsonic Society range operations. How can I assist with match telemetry, shooter DOPE, or facility ops?"
`;
}

/**
 * Fast deterministic intelligence solver when Gemini API key is absent, rate-limited, or offline.
 * Features comprehensive intent recognition, entity extraction for shooters, live network telemetry,
 * 300-yard DOPE solutions, match ops, and Bristol regional logistics.
 */
export function getNexusDeterministicAnswer(query: string, context?: NexusQueryContext): string {
  const clean = query.trim();
  const lower = clean.toLowerCase();
  const totalRegistered = context?.registeredCount || 94;
  const expandedCount = context?.expandedCount || 6;
  const totalNodes = context?.totalNodes || 16;

  // 1. ONLINE PRESENCE, SYSTEM STATS & LIVE COUNTS
  if (
    lower.includes("online") ||
    lower.includes("how many people") ||
    lower.includes("how many users") ||
    lower.includes("who is online") ||
    lower.includes("active users") ||
    lower.includes("active people") ||
    lower.includes("network status") ||
    lower.includes("system status")
  ) {
    return `Telemetry confirms ${totalRegistered} registered competitors on the roster for the 2026 Invitational across Open, Production, and Senior divisions. In the EVOS 1.0 holographic network, ${totalNodes} active shooter nodes and ${expandedCount} constellation hubs are transmitting live across the telemetry net.`;
  }

  // 2. REGISTERED COMPETITORS, ROSTER & SQUAD CAPACITY
  if (
    lower.includes("how many registered") ||
    lower.includes("how many shooters") ||
    lower.includes("competitor count") ||
    lower.includes("roster") ||
    lower.includes("who is registered") ||
    lower.includes("capacity")
  ) {
    return `There are currently ${totalRegistered} competitors confirmed on the 2026 Invitational roster out of a capped 120-shooter capacity, representing 78% occupancy. Top-seeded competitors include World Champion Erich Leipold and 2-time National Champion Ron Verran.`;
  }

  // 3. LEADERSHIP: ALLEN HURLEY & ROB NEILSON
  if (
    lower.includes("allen") ||
    lower.includes("hurley") ||
    lower.includes("match director") ||
    lower.includes("said done")
  ) {
    return `Allen Hurley, callsign SAID DONE, is the founder and Match Director of Subsonic Society and The Hideout. Operating under his personal standard 'Said. Done.', he campaigns a Modacam Custom Precision V-22 with a ZCO 527 optic and directs the 20-stage championship course.`;
  }

  if (
    lower.includes("rob") ||
    lower.includes("neilson") ||
    lower.includes("radar") ||
    lower.includes("architect") ||
    lower.includes("who built") ||
    lower.includes("developer")
  ) {
    return `Rob Neilson, callsign RADAR, is the Master Admin and lead technical architect of Subsonic Society. He engineered the EVOS holographic telemetry array, the tactical chat infrastructure, and private cryptographic member access.`;
  }

  // 4. DYNAMIC SHOOTER & MEMBER LOOKUP
  const shooterMatch = findShooterOrMember(lower);
  if (shooterMatch) {
    return shooterMatch;
  }

  // 5. STAGE 8 & DOPE BALLISTICS
  if (
    lower.includes("stage 8") ||
    lower.includes("mountain hollow")
  ) {
    return `Stage 8 is the Mountain Hollow cold-bore engagement at 410 yards on a -6 degree slope. Elevation hold is 11.4 mils with a 1.8 mil left wind correction for a 6 mph thermal ridge draft.`;
  }

  if (
    lower.includes("dope") ||
    lower.includes("ballistics") ||
    lower.includes("drop") ||
    lower.includes("wind hold") ||
    lower.includes("300 yard") ||
    lower.includes("elevation")
  ) {
    return `At 300 yards in Bristol's 3,420-foot Appalachian mountain air, standard subsonic .22LR requires approximately 7.2 mils elevation and 1.2 mils wind hold for a 5 mph crosswind. Reduced atmospheric density at Holston Ridge results in less bullet drag than sea-level charts.`;
  }

  // 6. AMMUNITION & CHRONO SPECIFICATIONS
  if (
    lower.includes("ammo") ||
    lower.includes("ammunition") ||
    lower.includes("bullet") ||
    lower.includes("velocity") ||
    lower.includes("fps") ||
    lower.includes("lapua") ||
    lower.includes("eley") ||
    lower.includes("sk")
  ) {
    return `Authorized ammunition is strictly standard-velocity or subsonic .22 Long Rifle with a muzzle velocity under 1,120 feet per second. Magnum or hyper-velocity rimfire is prohibited. Squad chronograph checks are conducted during Friday check-in and Saturday staging. Preferred match lots include Lapua Center-X, SK Long Range Match, and Eley Tenex.`;
  }

  // 7. MATCH SCHEDULE & DATES
  if (
    lower.includes("schedule") ||
    lower.includes("dates") ||
    lower.includes("when is the match") ||
    lower.includes("when does it start") ||
    lower.includes("timeline") ||
    lower.includes("agenda")
  ) {
    return `The 2026 Subsonic Society Invitational runs November 13 through 15 at The Hideout. Friday check-in and zeroing begins at 12:00 PM with the Welcome BBQ at 5:30 PM. Saturday stages 1 through 10 kick off at 8:00 AM, followed by the $1,000 Rimfire Speed Duel under lights at 4:30 PM. Sunday stages 11 through 20 wrap up with the $1,500 Cold Bore Challenge at 1:30 PM and Awards Banquet at 3:30 PM.`;
  }

  // 8. CASH PURSE, SIDE MATCHES & PRIZE TABLE
  if (
    lower.includes("purse") ||
    lower.includes("cash") ||
    lower.includes("prize") ||
    lower.includes("payout") ||
    lower.includes("side match") ||
    lower.includes("speed duel") ||
    lower.includes("cold bore") ||
    lower.includes("money match")
  ) {
    return `The 2026 Invitational features a $2,500 Cash Side Match purse: $1,000 for Saturday's Rimfire Speed Duel under lights, and $1,500 for Sunday's 1,000-Yard Cold Bore Challenge. This is accompanied by an extensive $28,500 prize table supported by industry sponsors.`;
  }

  // 9. THE HIDEOUT FACILITY & LOCATION
  if (
    lower.includes("hideout") ||
    lower.includes("where is") ||
    lower.includes("location") ||
    lower.includes("address") ||
    lower.includes("directions") ||
    lower.includes("facility") ||
    lower.includes("acres")
  ) {
    return `The Hideout is located at 111 Highway 44 in Bristol, Tennessee. It encompasses 220 private Appalachian mountain acres, featuring a 300-yard dedicated precision rimfire course with barricades and rooftop simulators, a 1,000-yard centerfire range, an air-conditioned clubhouse, and on-site RV camping.`;
  }

  // 10. BRISTOL DINING & RESTAURANTS
  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("restaurant") ||
    lower.includes("dining") ||
    lower.includes("blackbird") ||
    lower.includes("bakery") ||
    lower.includes("bbq") ||
    lower.includes("steak") ||
    lower.includes("doughnut")
  ) {
    return `Bristol dining intel: Blackbird Bakery on Piedmont Ave is open 24 hours Monday through Saturday for world-famous doughnuts and artisan espresso. For dinner, visit 620 State for prime steaks and sushi right on the state line, or Delta Blues BBQ for slow-smoked brisket and ribs.`;
  }

  // 11. BRISTOL HOTELS & LODGING
  if (
    lower.includes("hotel") ||
    lower.includes("lodging") ||
    lower.includes("stay") ||
    lower.includes("sleep") ||
    lower.includes("casino") ||
    lower.includes("camping") ||
    lower.includes("rv")
  ) {
    return `Recommended accommodations include The Bristol Hotel boutique property featuring Lumac Rooftop on State Street, the Hard Rock Hotel and Casino Bristol on Gate City Highway, and the Courtyard by Marriott. On-site dry RV and tent camping is also available at The Hideout.`;
  }

  // 12. LOCAL ATTRACTIONS & FLY FISHING
  if (
    lower.includes("fly fishing") ||
    lower.includes("fishing") ||
    lower.includes("south holston") ||
    lower.includes("entertainment") ||
    lower.includes("things to do") ||
    lower.includes("speedway")
  ) {
    return `Bristol attractions include world-class wild brown trout fly fishing on the South Holston River, high-energy gaming and live entertainment at the Hard Rock Casino, the legendary Bristol Motor Speedway, and the historic State Street twin-state line where you can stand in Tennessee and Virginia simultaneously.`;
  }

  // 13. WEATHER & ATMOSPHERIC CONDITIONS
  if (
    lower.includes("weather") ||
    lower.includes("temperature") ||
    lower.includes("forecast") ||
    lower.includes("wind") ||
    lower.includes("barometric") ||
    lower.includes("conditions")
  ) {
    return `Current mountain telemetry at Holston Ridge elevation 3,420 feet: 68 degrees, barometric pressure 26.4 inches mercury, 6 mile per hour wind out of the southwest. Appalachian mountain air reduces aerodynamic bullet drag compared to sea-level ballistics.`;
  }

  // 14. SAFETY RULES & COLD RANGE
  if (
    lower.includes("rule") ||
    lower.includes("safety") ||
    lower.includes("cold range") ||
    lower.includes("flag") ||
    lower.includes("chamber") ||
    lower.includes("muzzle") ||
    lower.includes("ear") ||
    lower.includes("eye")
  ) {
    return `The Hideout operates under a strict Cold Range policy. Rifles must remain unloaded with chamber flags inserted at all times until commanded to load and make ready. A 120-degree muzzle rule is enforced on all transitions, and eye and ear protection are mandatory for all attendees.`;
  }

  // 15. REGISTRATION & SQUAD JOINING
  if (
    lower.includes("join") ||
    lower.includes("invite") ||
    lower.includes("register") ||
    lower.includes("sign up") ||
    lower.includes("squad") ||
    lower.includes("pass") ||
    lower.includes("ticket")
  ) {
    return `Registration for the 2026 Invitational is capped at 120 competitors and currently sits at 78% capacity. You can claim an official squad pass directly on the home page terminal or visit the invite portal to register your callsign and reserve your flight squad.`;
  }

  // 16. GREETINGS & INTRODUCTIONS
  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey") ||
    lower.includes("good morning") ||
    lower.includes("good afternoon") ||
    lower.includes("good evening") ||
    lower.includes("sup") ||
    lower.includes("ping")
  ) {
    return `NEXUS Core telemetry link verified. Standing by on stage frequency 462.5625 MHz. Ask me about registered competitors, match DOPE, Bristol accommodations, or facility operations.`;
  }

  // 17. IDENTITY & PURPOSE
  if (
    lower.includes("who are you") ||
    lower.includes("what is nexus") ||
    lower.includes("what can you do") ||
    lower.includes("what do you do") ||
    lower.includes("help")
  ) {
    return `I am NEXUS, the central telemetry intelligence for the Subsonic Society and The Hideout. I provide real-time updates on registered competitors, stage DOPE, match schedules, atmospheric conditions, Bristol travel, and range safety protocols.`;
  }

  // 18. INTELLIGENT CONTEXTUAL FALLBACK
  return `Transmission received on stage net. I am monitoring operations for the 2026 Subsonic Society Invitational at The Hideout. Ask me about competitor rosters, stage DOPE, match schedules, Bristol dining, or range safety.`;
}

/**
 * Searches seed shooters and members for exact or partial name/callsign matches
 */
function findShooterOrMember(lower: string): string | null {
  for (const s of SEED_SHOOTERS) {
    const nameLower = s.name.toLowerCase();
    const callsignLower = s.callsign.toLowerCase();
    const lastName = s.name.split(" ").slice(-1)[0]?.toLowerCase();
    const firstName = s.name.split(" ")[0]?.toLowerCase();

    if (
      (lastName && lastName.length > 3 && lower.includes(lastName)) ||
      (firstName && firstName.length > 3 && lower.includes(firstName)) ||
      lower.includes(nameLower) ||
      lower.includes(callsignLower)
    ) {
      const rifle = s.rifleSetup
        ? `${s.rifleSetup.action || "Custom Rimfire"} with a ${s.rifleSetup.optic || "Precision Optic"}`
        : "Custom Precision Rig";
      const ammo = s.rifleSetup?.ammoLot ? ` running ${s.rifleSetup.ammoLot}` : "";
      return `${s.name}, callsign ${s.callsign}, is competing in the ${s.division}. Ranked ${s.ranking} with ${s.podiums} career podium finishes, fielding a ${rifle}${ammo}.`;
    }
  }

  for (const m of SEED_MEMBERS) {
    const nameLower = m.full_name?.toLowerCase() || "";
    const callsignLower = m.callsign?.toLowerCase() || "";
    const lastName = m.full_name?.split(" ").slice(-1)[0]?.toLowerCase() || "";
    const firstName = m.full_name?.split(" ")[0]?.toLowerCase() || "";

    if (
      (lastName && lastName.length > 3 && lower.includes(lastName)) ||
      (firstName && firstName.length > 3 && lower.includes(firstName)) ||
      (nameLower && lower.includes(nameLower)) ||
      (callsignLower && lower.includes(callsignLower))
    ) {
      const callsignText = m.callsign ? `, callsign ${m.callsign},` : "";
      return `${m.full_name}${callsignText} is a registered Society Member from ${m.state || "Tennessee"} in ${m.experience_level || "the Open Division"}, running ${m.rifle_setup || "a precision rimfire system"}.`;
    }
  }

  return null;
}

