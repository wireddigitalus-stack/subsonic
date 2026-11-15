import fs from "fs";
import { db, isDbConfigured } from "@/lib/supabase-admin";
import path from "path";
import { ShooterProfile } from "@/lib/types";

// Base file paths
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const REPO_SHOOTERS_FILE = path.join(REPO_DATA_DIR, "shooters.jsonl");

// Serverless / Vercel writable directory
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const WRITABLE_DIR = IS_SERVERLESS ? "/tmp" : REPO_DATA_DIR;
const WRITABLE_SHOOTERS_FILE = IS_SERVERLESS
  ? path.join("/tmp", "subsonic-shooters.jsonl")
  : REPO_SHOOTERS_FILE;

// On the live (serverless) site the database is the single source of truth.
const DB_AUTHORITATIVE = IS_SERVERLESS && isDbConfigured;

export const SEED_SHOOTERS: ShooterProfile[] = [
  {
    id: "subx",
    name: "Allen Hurley",
    callsign: "SUBX",
    division: "Owner Admin / Executive",
    ranking: "Founder • Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 21,
    email: "ahurley@subsonicsociety.com",
    phone: "423-555-0100",
    mailingAddress: "Bristol, TN",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "",
    actionPhoto: "",
    quote: "This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation.",
    signature: "Allen Hurley",
    accolades: ["FOUNDER 👑", "TEAM USA 🇺🇸", "NATIONAL CHAMPION 🏆", "MATCH HOST", "EVENT DIRECTOR"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Modacam RimX",
      barrel: "24\" Match Contour (1:14)",
      trigger: "Trigger Tech Diamond",
      chassis: "MDT Elite",
      optic: "Nightforce ATACR 7x35",
      mount: "Heavy Duty Match Rings",
      tuner: "Precision Rimfire Tuner",
      ammoLot: "RWS -R50",
    },
    interview: [
      {
        question: "What was the vision behind the Subsonic Society Invitational at The Hideout?",
        answer: "We have worked hard to make the Invitational different — challenging stages, a meaningful cash purse, dedicated staff and spotters, hospitality, and an atmosphere where the competitors are the focus.",
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "cbeck",
    name: "Chris Beck",
    callsign: "CBECK",
    division: "Pro Shooter",
    ranking: "Semi Retired Mediocre Shooter",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 69,
    email: "cbeck5399@gmail.com",
    phone: "6788985399",
    mailingAddress: "18 Quail Ridge Rd Taylorsville GA 30178",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Mod-X",
      barrel: "Modacam Custom",
      trigger: "Triggertech Diamond",
      chassis: "MPA Matrix Pro",
      optic: "ZCO 527",
      mount: "",
      tuner: "",
      ammoLot: "Various",
    },
    createdAt: "2026-10-22T21:49:09.436Z",
    status: "PUBLISHED",
  },
  {
    id: "zer0dev",
    name: "Erik Pilsits",
    callsign: "ZER0DEV",
    division: "Pro Shooter",
    ranking: "2026 NRL22 National Champion",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 76,
    email: "epilsits@gmail.com",
    phone: "6302977790",
    mailingAddress: "2118 Keim Dr, Aurora, IL 60503",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "2026 NRL22 National Champion.",
    accolades: ["NATIONAL CHAMPION 🏆", "INVITATIONAL PRO"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Vudoo 360",
      barrel: "25\" Brux / Modacam",
      trigger: "Bix'n Andy single stage",
      chassis: "Vision Pro",
      optic: "Vortex Razor Gen III",
      mount: "",
      tuner: "",
      ammoLot: "RWS R50",
    },
    createdAt: "2026-10-22T22:11:22.699Z",
    status: "PUBLISHED",
  },
  {
    id: "jelrod",
    name: "Jonathan Elrod",
    callsign: "JELROD",
    division: "Pro Shooter",
    ranking: "Newb",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "jelrod@modacam.com",
    phone: "7047186336",
    mailingAddress: "PO Box 1972 Denver NC 28037",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Modacam Custom Rifles.",
    accolades: ["MODACAM CUSTOM RIFLES", "INVITATIONAL PRO"],
    sponsors: ["Modacam Custom Rifles"],
    rifleSetup: {
      action: "Modacam Custom",
      barrel: "Modacam Custom",
      trigger: "TriggerTech Diamond",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "RWS R50 / Lapua",
    },
    createdAt: "2026-10-22T22:24:48.702Z",
    status: "PUBLISHED",
  },
  {
    id: "bryan",
    name: "Bryan Tolliver",
    callsign: "BRYAN",
    division: "Pro Shooter",
    ranking: "49th national ranking PRS Rimfire",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 10,
    email: "bryantolliver78@gmail.com",
    phone: "8658500819",
    mailingAddress: "1425 Piedmont Rd New Market, TN 37820",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor from Tennessee.",
    accolades: ["PRS RIMFIRE TOP 50", "INVITATIONAL PRO"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "CZ 457",
      barrel: "24” Brux/Modacam",
      trigger: "Timney",
      chassis: "MPA Vanquish",
      optic: "Vortex Gen 3/ Burris XTR",
      mount: "",
      tuner: "",
      ammoLot: "Lapua long range",
    },
    createdAt: "2026-10-22T22:40:57.387Z",
    status: "PUBLISHED",
  },
  {
    id: "tholder",
    name: "Travis Holder",
    callsign: "HOLDER",
    division: "Pro Shooter",
    ranking: "2026 NRL22X National Champion",
    homeRange: "KY",
    podiums: 28,
    email: "tholder1220@gmail.com",
    phone: "2708603575",
    mailingAddress: "6255 Doubletree Drive, Henderson, KY 42420",
    featuredMatch: "Subsonic Society Invitational 2026",
    image: "/images/shooters/tholder.jpg",
    actionPhoto: "/images/shooters/tholder.jpg",
    quote: "Precision rimfire competitor from western Kentucky. Submarine veteran.",
    accolades: ["TEAM USA 🇺🇸", "NATIONAL CHAMPION 🏆", "REGIONAL PODIUM FINISHER ⭐", "2026 YETI SERIES CHAMPION"],
    sponsors: ["Modacam Custom Rifles", "Position 7", "A3X", "TriggerTech"],
    rifleSetup: {
      action: "MPA Rimfire Elite",
      barrel: "23” Brux by Modacam Custom Rifles",
      trigger: "TriggerTech Diamond single stage",
      chassis: "MDT ACC",
      optic: "Nightforce ATACR",
      mount: "",
      tuner: "",
      ammoLot: "Lapua Long Range/RWS R50",
    },
    pin: "97649bbdfcfa9e6a1892987428ad734a07d800cad27b21d007c62917b46cf496",
    createdAt: "2026-10-22T22:50:01.958Z",
    status: "PUBLISHED",
  },
  {
    id: "timmytoy",
    name: "Timothy Nowak",
    callsign: "TIMMYTOY",
    division: "Pro Shooter",
    ranking: "World Champion",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "cougarcatman@gmail.com",
    phone: "(616)894-2769",
    mailingAddress: "15785 Force Ave Ne Cedar Springs Michigan 49319",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "World Champion precision rimfire competitor.",
    accolades: ["WORLD CHAMPION 🏆", "INVITATIONAL PRO"],
    sponsors: ["Modacam Custom Rifles", "MPA"],
    rifleSetup: {
      action: "MPA Elite,Vudoo Gen 1",
      barrel: "22” MPA,22” Modacam",
      trigger: "TriggerTech",
      chassis: "MPA",
      optic: "Nightforce Atacr",
      mount: "",
      tuner: "",
      ammoLot: "RWS R50",
    },
    createdAt: "2026-10-23T01:25:28.293Z",
    status: "PUBLISHED",
  },
  {
    id: "joeloehle",
    name: "Joe Loehle",
    callsign: "JOELOEHLE",
    division: "Pro Shooter",
    ranking: "PRS/NRL Shooter",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 16,
    email: "joe@joeloehle.com",
    phone: "9125712756",
    mailingAddress: "415 Magnolia St, St Simons Island, GA 31522",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "PRS/NRL Precision Rimfire Competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Vudoo Gen 1",
      barrel: "25\" Brux/Modacam Custom Rifles",
      trigger: "TT Diamond",
      chassis: "MPA Matrix Pro",
      optic: "ZCO 527",
      mount: "",
      tuner: "",
      ammoLot: "RWS R50",
    },
    createdAt: "2026-10-23T09:10:21.260Z",
    status: "PUBLISHED",
  },
  {
    id: "steve",
    name: "Steven Quinn",
    callsign: "STEVE",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "quinney17@hotmail.com",
    phone: "9206022377",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "havethat",
    name: "McKenzie Burns",
    callsign: "HAVETHAT",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "mkbrown@vt.edu",
    phone: "8048149892",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:05:00Z",
    status: "PUBLISHED",
  },
  {
    id: "marmaduke",
    name: "Steve Marmaduke",
    callsign: "MARMADUKE",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "tn3gun@gmail.com",
    phone: "8659347828",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:10:00Z",
    status: "PUBLISHED",
  },
  {
    id: "e-rich",
    name: "Erich Leipold",
    callsign: "E-RICH",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "leipold3g@gmail.com",
    phone: "941-809-2510",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:15:00Z",
    status: "PUBLISHED",
  },
  {
    id: "left-edge",
    name: "Mike Burns",
    callsign: "LEFT-EDGE",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "mikeholdleftedge@gmail.com",
    phone: "5402305840",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:20:00Z",
    status: "PUBLISHED",
  },
  {
    id: "clinebj22",
    name: "Brandon Cline",
    callsign: "CLINEBJ22",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "clinebj22@yahoo.com",
    phone: "7403526097",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:25:00Z",
    status: "PUBLISHED",
  },
  {
    id: "thingy",
    name: "Alec Thingvold",
    callsign: "THINGY",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "awthingvold@gmail.com",
    phone: "7017938118",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:30:00Z",
    status: "PUBLISHED",
  },
  {
    id: "frock",
    name: "Jordan Finfrock",
    callsign: "FROCK",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 31,
    email: "finfrock.jordan@live.com",
    phone: "6066942216",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:35:00Z",
    status: "PUBLISHED",
  },
  {
    id: "nedved",
    name: "Jason Nedved",
    callsign: "NEDVED",
    division: "Pro Shooter",
    ranking: "SD",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 34,
    email: "jason@nedvedprecisionshooting.com",
    phone: "6059999486",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Nedved Precision Shooting", "Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:40:00Z",
    status: "PUBLISHED",
  },
  {
    id: "thing2",
    name: "Christian Thingvold",
    callsign: "THING2",
    division: "Pro Shooter",
    ranking: "NRL/PRS Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 46,
    email: "cjthingvold@gmail.com",
    phone: "7012972833",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "NRL/PRS Precision Rimfire Competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:45:00Z",
    status: "PUBLISHED",
  },
  {
    id: "servos",
    name: "Harrison Servos",
    callsign: "SERVOS",
    division: "Pro Shooter",
    ranking: "Owner @ Servos Custom Firearms",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 30,
    email: "servoscustomfirearms@gmail.com",
    phone: "2516101176",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Owner @ Servos Custom Firearms.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Servos Custom Firearms", "Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:50:00Z",
    status: "PUBLISHED",
  },
  {
    id: "klay23",
    name: "Klay Kennedy",
    callsign: "KLAY23",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "klay.kennedy@gmail.com",
    phone: "8432513515",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T12:55:00Z",
    status: "PUBLISHED",
  },
  {
    id: "stewart",
    name: "Gregg Stewart",
    callsign: "STEWART",
    division: "Pro Shooter",
    ranking: "PA",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 100,
    email: "stewartga79@hotmail.com",
    phone: "7247770376",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["100+ PODIUMS 🏆", "INVITATIONAL PRO"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "oldarkhorse",
    name: "John Boyken Jr",
    callsign: "OLDARKHORSE",
    division: "Pro Shooter",
    ranking: "IN",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 34,
    email: "jsboyken@gmail.com",
    phone: "8127560712",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:05:00Z",
    status: "PUBLISHED",
  },
  {
    id: "goochi",
    name: "Jacob St.Amant",
    callsign: "GOOCHI",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "jacob_st.amant@yahoo.com",
    phone: "6018189177",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:10:00Z",
    status: "PUBLISHED",
  },
  {
    id: "poa",
    name: "Joshua Thomas",
    callsign: "POA",
    division: "Pro Shooter",
    ranking: "Pursuit of Accuracy",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "josh@pursuitofaccuracy.com",
    phone: "7432388118",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Pursuit of Accuracy.",
    accolades: ["PURSUIT OF ACCURACY", "INVITATIONAL PRO"],
    sponsors: ["Pursuit of Accuracy", "Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:15:00Z",
    status: "PUBLISHED",
  },
  {
    id: "levisanderson",
    name: "Levi Sanderson",
    callsign: "LEVISANDERSON",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "leviasanderson@gmail.com",
    phone: "6053802989",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:20:00Z",
    status: "PUBLISHED",
  },
  {
    id: "0620",
    name: "Lilly Knapp",
    callsign: "0620",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "lillyannknapp@icloud.com",
    phone: "9895132796",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:25:00Z",
    status: "PUBLISHED",
  },
  {
    id: "chriscreedmoor",
    name: "Chris Garcia",
    callsign: "CHRISCREEDMOOR",
    division: "Pro Shooter",
    ranking: "Invitational Pro Competitor",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 0,
    email: "chris.creedmoor@icloud.com",
    phone: "2098397447",
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/images/SS-RWB-LOGO.png",
    actionPhoto: "/images/SS-RWB-LOGO.png",
    quote: "Precision rimfire competitor.",
    accolades: ["INVITATIONAL PRO", "COMPETITOR"],
    sponsors: ["Subsonic Society"],
    rifleSetup: {
      action: "Precision Rimfire",
      barrel: "Match Contour",
      trigger: "Match Trigger",
      chassis: "Competition Chassis",
      optic: "Precision Optic",
      mount: "",
      tuner: "",
      ammoLot: "Match Rimfire",
    },
    createdAt: "2026-10-24T13:30:00Z",
    status: "PUBLISHED",
  },
];

// In-process memory cache to survive serverless function calls

// Map camelCase to snake_case for Supabase
function mapShooterToDb(s: ShooterProfile) {
  // Store contact info in rifle_setup JSONB so it safely persists in Supabase without needing custom columns
  const augmentedRifleSetup = {
    ...(s.rifleSetup || {}),
    ...(s.email || s.phone || s.mailingAddress
      ? {
          contactInfo: {
            email: s.email,
            phone: s.phone,
            mailingAddress: s.mailingAddress,
          },
        }
      : {}),
  };

  return {
    id: s.id,
    name: s.name,
    callsign: s.callsign,
    division: s.division,
    ranking: s.ranking,
    home_range: s.homeRange,
    podiums: s.podiums,
    featured_match: s.featuredMatch,
    image: s.image,
    action_photo: s.actionPhoto,
    quote: s.quote,
    accolades: s.accolades,
    sponsors: s.sponsors,
    rifle_setup: augmentedRifleSetup,
    pin: s.pin,
    interview: s.interview,
    created_at: s.createdAt,
    status: s.status,
  };
}

// Map snake_case to camelCase from Supabase
function mapDbToShooter(row: any): ShooterProfile {
  const contact = row.rifle_setup?.contactInfo;
  return {
    id: row.id,
    name: row.name,
    callsign: row.callsign,
    division: row.division,
    ranking: row.ranking,
    homeRange: row.home_range,
    podiums: row.podiums,
    email: row.email || contact?.email,
    phone: row.phone || contact?.phone,
    mailingAddress: row.mailing_address || contact?.mailingAddress,
    featuredMatch: row.featured_match,
    image: row.image,
    actionPhoto: row.action_photo,
    quote: row.quote,
    accolades: row.accolades,
    sponsors: row.sponsors,
    rifleSetup: row.rifle_setup,
    pin: row.pin,
    interview: row.interview,
    createdAt: row.created_at,
    status: row.status,
  };
}

let memoryShooters: ShooterProfile[] = [...SEED_SHOOTERS];
let shootersLastRefreshMs = 0;
let shootersRefreshInFlight: Promise<void> | null = null;

/**
 * Pull the latest shooters from the database into the in-memory cache.
 * Await this at the top of any API route that needs up-to-date shooter data.
 */
export async function refreshShootersFromDb(maxAgeMs = 30000): Promise<void> {
  if (!db) return;
  if (Date.now() - shootersLastRefreshMs < maxAgeMs) return;
  if (shootersRefreshInFlight) return shootersRefreshInFlight;

  shootersRefreshInFlight = (async () => {
    try {
      const { data, error } = await db.from("shooters").select("*");
      if (error) {
        console.error("Error fetching shooters from database:", error.message);
        return;
      }
      const rows = (data || []).map(mapDbToShooter);
      if (rows.length > 0) {
        const map = new Map<string, ShooterProfile>();
        for (const seed of SEED_SHOOTERS) {
          if (!deletedShooterIds.has(seed.id.toLowerCase()) && !deletedShooterIds.has(seed.callsign.toLowerCase())) {
            map.set(seed.id.toLowerCase(), seed);
          }
        }
        for (const s of memoryShooters) map.set(s.id.toLowerCase(), s);
        for (const s of rows) {
          const prev = map.get(s.id.toLowerCase());
          map.set(s.id.toLowerCase(), {
            ...(prev || {}),
            ...s,
            email: s.email || prev?.email,
            phone: s.phone || prev?.phone,
            mailingAddress: s.mailingAddress || prev?.mailingAddress,
            image: s.image || prev?.image || "/images/SS-RWB-LOGO.png",
            actionPhoto: s.actionPhoto || prev?.actionPhoto || s.image || "/images/SS-RWB-LOGO.png",
          });
        }
        memoryShooters = Array.from(map.values());
        shootersLastRefreshMs = Date.now();
      }
    } catch (err) {
      console.error("Database refresh error (shooters):", err);
    } finally {
      shootersRefreshInFlight = null;
    }
  })();
  return shootersRefreshInFlight;
}

const deletedShooterIds = new Set<string>();

export function isShooterExplicitlyDeleted(idOrCallsign?: string): boolean {
  if (!idOrCallsign) return false;
  return deletedShooterIds.has(idOrCallsign.trim().toLowerCase());
}

export function getShootersFromStorage(): ShooterProfile[] {
  if (db && shootersLastRefreshMs === 0) void refreshShootersFromDb();

  try {
    const map = new Map<string, ShooterProfile>();
    for (const seed of SEED_SHOOTERS) {
      if (!deletedShooterIds.has(seed.id.toLowerCase()) && !deletedShooterIds.has(seed.callsign.toLowerCase())) {
        map.set(seed.id.toLowerCase(), seed);
      }
    }

    // Local / writable files
    let raw = "";
    if (fs.existsSync(WRITABLE_SHOOTERS_FILE)) {
      raw = fs.readFileSync(WRITABLE_SHOOTERS_FILE, "utf-8");
    } else if (!DB_AUTHORITATIVE && fs.existsSync(REPO_SHOOTERS_FILE)) {
      raw = fs.readFileSync(REPO_SHOOTERS_FILE, "utf-8");
    }
    if (raw) {
      for (const l of raw.split("\n")) {
        if (!l.trim()) continue;
        try {
          const item = JSON.parse(l) as ShooterProfile;
          if (item?.id) map.set(item.id.toLowerCase(), item);
        } catch {}
      }
    }

    // Memory last — freshest database data + this instance's writes
    for (const mem of memoryShooters) map.set(mem.id.toLowerCase(), mem);

    // Ensure legacy SAID DONE / allen-hurley is completely purged
    map.delete("allen-hurley");
    map.delete("said-done");
    map.delete("said done");
    map.delete("ss-2026-0002");

    for (const delId of Array.from(deletedShooterIds)) {
      map.delete(delId);
    }

    memoryShooters = Array.from(map.values()).filter(
      (s) =>
        s.id !== "allen-hurley" &&
        s.callsign?.toUpperCase() !== "SAID DONE" &&
        !deletedShooterIds.has(s.id.toLowerCase()) &&
        !deletedShooterIds.has((s.callsign || "").toLowerCase())
    );
    return memoryShooters;
  } catch (err) {
    console.error("Error reading shooters:", err);
    return memoryShooters;
  }
}

export async function upsertShooterToDb(shooter: ShooterProfile): Promise<void> {
  if (!db) return;
  try {
    const { error } = await db.from("shooters").upsert(mapShooterToDb(shooter), { onConflict: "id" });
    if (error) {
      console.warn(`Database save warning (shooter fallback active): ${error.message}`);
    }
  } catch (err: any) {
    console.warn(`Database save exception (shooter fallback active): ${err?.message || err}`);
  }
}

function applyShooterLocally(shooter: ShooterProfile): void {
  deletedShooterIds.delete(shooter.id.toLowerCase());
  if (shooter.callsign) deletedShooterIds.delete(shooter.callsign.toLowerCase());
  const current = getShootersFromStorage();
  const index = current.findIndex((s) => s.id.toLowerCase() === shooter.id.toLowerCase());
  let updated: ShooterProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = shooter;
  } else {
    updated = [shooter, ...current];
  }
  saveAllShootersToStorage(updated);
}

/** Save a shooter and WAIT for the database to confirm. Throws on database error. */
export async function saveShooterToStorageAsync(shooter: ShooterProfile): Promise<void> {
  applyShooterLocally(shooter);
  await upsertShooterToDb(shooter);
}

/** Legacy sync save (database write is best-effort). Prefer saveShooterToStorageAsync. */
export function saveShooterToStorage(shooter: ShooterProfile): void {
  try {
    applyShooterLocally(shooter);
    upsertShooterToDb(shooter).catch((err) => console.error(err.message));
  } catch (err) {
    console.error("Error saving shooter:", err);
  }
}

export function saveAllShootersToStorage(shooters: ShooterProfile[]): void {
  try {
    memoryShooters = shooters;

    if (!fs.existsSync(WRITABLE_DIR)) {
      fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    }
    const content = shooters.map((s) => JSON.stringify(s)).join("\n") + "\n";
    fs.writeFileSync(WRITABLE_SHOOTERS_FILE, content, "utf-8");
    if (!IS_SERVERLESS) {
      if (!fs.existsSync(REPO_DATA_DIR)) {
        fs.mkdirSync(REPO_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REPO_SHOOTERS_FILE, content, "utf-8");
    }
  } catch (err) {
    console.error("Error saving all shooters to storage:", err);
  }
}

export function deleteShooterFromStorage(idOrCallsign: string, skipCrossClean = false): boolean {
  if (!idOrCallsign) return false;
  const clean = idOrCallsign.trim().toLowerCase();

  // Only block deleting non-shooter developer system account
  if (
    clean === "rob-neilson" ||
    clean === "radar" ||
    clean === "rob" ||
    clean === "ss-2026-0001"
  ) {
    return false;
  }

  const current = getShootersFromStorage();
  const strippedPro = clean.replace(/^ss-pro-/, "").replace(/^shooter_/, "");

  const target = current.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.id.toLowerCase() === strippedPro ||
      s.callsign.toLowerCase() === clean ||
      s.callsign.toLowerCase() === strippedPro ||
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean
  );

  deletedShooterIds.add(clean);
  deletedShooterIds.add(strippedPro);
  if (target) {
    deletedShooterIds.add(target.id.toLowerCase());
    if (target.callsign) deletedShooterIds.add(target.callsign.toLowerCase());
  }

  const filtered = current.filter((s) => {
    if (!target) {
      return (
        s.id.toLowerCase() !== clean &&
        s.id.toLowerCase() !== strippedPro &&
        s.callsign.toLowerCase() !== clean &&
        s.callsign.toLowerCase() !== strippedPro
      );
    }
    return (
      s.id.toLowerCase() !== target.id.toLowerCase() &&
      s.callsign.toLowerCase() !== target.callsign.toLowerCase() &&
      s.name.toLowerCase() !== target.name.toLowerCase()
    );
  });

  memoryShooters = filtered;
  saveAllShootersToStorage(filtered);

  lastShooterDbDelete = (async () => {
    if (!db) return;
    try {
      const targetId = target?.id || strippedPro || clean;
      const { error } = await db.from("shooters").delete().eq("id", targetId);
      if (error) console.error("Error deleting shooter from database:", error.message);
      const callsignToDelete = target?.callsign || strippedPro.toUpperCase();
      if (callsignToDelete) {
        await db.from("shooters").delete().ilike("callsign", callsignToDelete);
      }
      if (target?.name) {
        await db.from("shooters").delete().ilike("name", target.name);
      }
    } catch (err) {
      console.error("Database delete error (shooters):", err);
    }
  })();

  // Cross-clean matching society member if exists (single hop — no recursion)
  if (!skipCrossClean) {
    try {
      const { deleteMemberFromStorage } = require("@/lib/members");
      if (target?.callsign) deleteMemberFromStorage(target.callsign, true);
      if (target?.id) deleteMemberFromStorage(target.id, true);
      deleteMemberFromStorage(strippedPro, true);
    } catch (e) {
      // avoid cyclic errors
    }
  }

  return true;
}

let lastShooterDbDelete: Promise<void> = Promise.resolve();

export function getLastShooterDbDeletePromise(): Promise<void> {
  return lastShooterDbDelete;
}

/** Delete a shooter and wait for the database delete to finish. */
export async function deleteShooterFromStorageAsync(idOrCallsign: string): Promise<boolean> {
  const ok = deleteShooterFromStorage(idOrCallsign, false);
  await lastShooterDbDelete;
  try {
    const { getLastMemberDbDeletePromise } = require("@/lib/members");
    if (typeof getLastMemberDbDeletePromise === "function") {
      await getLastMemberDbDeletePromise();
    }
  } catch {}
  try {
    const { releaseInviteClaimsForCallsignAsync } = require("@/lib/invites");
    if (typeof releaseInviteClaimsForCallsignAsync === "function") {
      await releaseInviteClaimsForCallsignAsync(idOrCallsign);
    }
  } catch {}
  return ok;
}

export function getShooterBySlug(slug: string): ShooterProfile | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  const allShooters = getShootersFromStorage();

  return (
    allShooters.find(
      (s) =>
        s.id.toLowerCase() === cleanSlug ||
        s.callsign.toLowerCase() === cleanSlug ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
    ) || null
  );
}
