import { MatchEvent, FacebookPostItem, AthleteProfile, ChatMessage } from "./types";

export const INITIAL_MATCHES: MatchEvent[] = [];

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
      "🏆 Official 2026 Subsonic Society Invitational Money Match presented by Modacam Custom Rifles! November 13–15, 2026 in Bristol, TN.",
    publishedAt: "3 days ago",
    likesCount: 312,
    commentsCount: 56,
    sharesCount: 41,
    imageUrl: "/images/SS-RWB-LOGO.png",
    externalUrl: "https://www.facebook.com/p/Subsonic-Society-61578052196057/",
    tags: ["#SubsonicSociety", "#ModacamCustomRifles", "#PrecisionRimfire"],
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
    quote: "This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation.",
    imageUrl: "/images/SS-RWB-LOGO.png",
    podiums: 12,
  },
];


export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

