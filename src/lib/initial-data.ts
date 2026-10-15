import { MatchEvent, FacebookPostItem, AthleteProfile, ChatMessage } from "./types";

export const INITIAL_MATCHES: MatchEvent[] = [
  {
    id: "subsonic-invitational-2026",
    title: "Subsonic Society Invitational",
    subtitle: "The Premier $7,500 Cash Purse Championship Presented by Modacam Custom Rifles",
    date: "November 13–15, 2026",
    time: "07:00 AM EST Check-in",
    location: "The Hideout, Bristol, TN",
    locationDetails: "111 Hwy 44, Bristol, TN 37620",
    coordinates: {
      lat: 36.5951,
      lng: -82.1887,
    },
    tier: "PRO_SERIES",
    stages: 12,
    roundCount: 220,
    distanceRange: "50 – 300 Yards",
    maxCompetitors: 120,
    registeredCount: 94,
    entryFee: 275,
    prizePool: "$7,500 Total Purse ($5,000 Main Match • $2,500 Cash Side Matches)",
    matchDirector: {
      name: "Allen Hurley",
      callsign: "SUBX",
      email: "ahurley@subsonicsociety.com",
      phone: "",
    },
    description:
      "The Subsonic Society Invitational brings outstanding rimfire competitors together at The Hideout in Bristol, Tennessee for a weekend of serious competition, challenging stages (8 stages Saturday, 4 stages + 2 side stages Sunday), a $7,500 total cash purse ($5,000 Main Match • $2,500 Cash Side Matches), and Saturday lunch and dinner provided.",
    stageBriefs: [
      {
        stageNumber: 1,
        name: "Holston Gap High-Angle Sniper",
        distance: "185 yds – 300 yds",
        targetType: "66% IPSC & Diamond Steel",
        roundCount: 12,
        timeLimit: "90 seconds",
        description: "Engage targets from a natural boulder prop. Crosswind through the mountain notch requires careful wind holds.",
      },
      {
        stageNumber: 2,
        name: "The Bristol KYL Gauntlet",
        distance: "85 yds & 150 yds",
        targetType: "Know-Your-Limits 5-Paddles (2.0\" down to 0.25\")",
        roundCount: 10,
        timeLimit: "75 seconds",
        description: "Clean the near rack before moving to the 150-yard secondary rack.",
      },
      {
        stageNumber: 3,
        name: "Mountain Rooftop Positional",
        distance: "115 yds – 260 yds",
        targetType: "Round Gongs (4\" to 8\")",
        roundCount: 12,
        timeLimit: "90 seconds",
        description: "Fire two shots per target from three positions along a rooftop prop.",
      },
      {
        stageNumber: 4,
        name: "300-Yard Rimfire Precision",
        distance: "200 yds – 300 yds",
        targetType: "Square Reactive Flashers",
        roundCount: 10,
        timeLimit: "100 seconds",
        description: "Precision rimfire engagement out to 300 yards.",
      },
    ],
    status: "SPOTS_FILLING",
    featured: true,
  },
];

export const INITIAL_FACEBOOK_POSTS: FacebookPostItem[] = [
  {
    id: "fb-post-01",
    content:
      "⛰️ THE SUBSONIC SOCIETY INVITATIONAL IS COMING! November 13–15, 2026 at The Hideout in Bristol, TN. Standard velocity .22LR ammo only.",
    publishedAt: "Yesterday at 4:15 PM",
    likesCount: 184,
    commentsCount: 39,
    sharesCount: 22,
    imageUrl: "/assets/subsonic-facebook-cover.jpg",
    externalUrl: "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
    tags: ["#SubsonicSociety", "#BristolTN", "#PrecisionRimfire", "#22LR", "#PRSrimfire"],
  },
  {
    id: "fb-post-02",
    content:
      "🏆 Official 2026 Subsonic Society Invitational awards are finalized! Competitors at The Hideout in Bristol, TN will battle for a guaranteed $7,500 cash purse presented by Modacam Custom Rifles.",
    publishedAt: "3 days ago",
    likesCount: 312,
    commentsCount: 56,
    sharesCount: 41,
    imageUrl: "/images/SS-RWB-LOGO.png",
    externalUrl: "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
    tags: ["#SubsonicSociety", "#ModacamCustomRifles", "#PrecisionRimfire", "#CashPurse"],
  },
  {
    id: "fb-post-03",
    content:
      "🎯 Precision is in our DNA. Looking forward to welcoming competitors to Bristol, Tennessee.",
    publishedAt: "5 days ago",
    likesCount: 147,
    commentsCount: 28,
    sharesCount: 19,
    imageUrl: "/assets/subsonic-facebook-cover.jpg",
    externalUrl: "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
    tags: ["#RimfireBallistics", "#SubsonicData", "#KestrelDOPE", "#PrecisionShooting"],
  },
  {
    id: "fb-post-04",
    content:
      "🔥 Shoutout to our shooters dialing in their setups for the Invitational in Bristol this fall!",
    publishedAt: "1 week ago",
    likesCount: 228,
    commentsCount: 64,
    sharesCount: 15,
    imageUrl: "/assets/subsonic-banner-wide.png",
    externalUrl: "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
    tags: ["#RimfireRifles", "#RimX", "#VudooGunWorks", "#Optics", "#ChassisLife"],
  },
];

export const INITIAL_ATHLETES: AthleteProfile[] = [
  {
    id: "athlete-leipold",
    name: "Erich Leipold",
    division: "Open Rimfire Pro • Team USA",
    ranking: "Team USA 🇺🇸 • Rimfire Challenge World Champion",
    homeRange: "National Tour / Pennsylvania",
    rifleSetup: {
      action: "Zermatt RimX Precision Action",
      barrel: "Bartlein MTU Match Fluted 22\" (1:16 Twist)",
      chassis: "MasterPiece Arms (MPA) BA PMR Pro Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      ammo: "Lapua Midas+ Hand-Sorted Lot",
    },
    quote: "Consistency isn't an accident. It's the byproduct of testing every variable, knowing your DOPE down to the tenth of a mil, and executing with absolute confidence.",
    imageUrl: "/assets/erich-leipold-poster.jpg",
    podiums: 61,
  },
  {
    id: "athlete-verran",
    name: "Ron Verran",
    division: "Open Rimfire Pro • Team USA",
    ranking: "2x PRS National Champion • Team USA 🇺🇸",
    homeRange: "Great Lakes Region / National Tour",
    rifleSetup: {
      action: "Zermatt RimX Precision Rimfire Action",
      barrel: "Bartlein MTU Match Fluted 22\" (1:16 Twist)",
      chassis: "MasterPiece Arms (MPA) Matrix Pro Competition Chassis",
      optic: "Vortex Razor HD Gen III 6-36x56 EBR-7D",
      ammo: "Lapua Center-X / Midas+ Hand-Sorted Lot",
    },
    quote: "It's not luck. It's a process.",
    imageUrl: "/assets/ron-verran-poster.jpg",
    podiums: 52,
  },
  {
    id: "athlete-hurley",
    name: "Allen Hurley",
    division: "Owner Admin / Executive",
    ranking: "Founder • Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    rifleSetup: {
      action: "Modacam Custom Precision V-22 Rimfire",
      barrel: "22\" Custom Fluted Match Contour",
      chassis: "MDT ACC Elite Carbon Inlay Custom",
      optic: "Zero Compromise Optic ZC527",
      ammo: "Lapua Center-X Hand-Sorted",
    },
    quote: "This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation. Said. Done.",
    imageUrl: "/images/SS-RWB-LOGO.png",
    podiums: 12,
  },
];


export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

