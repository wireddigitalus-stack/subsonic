"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PacketWelcomeBanner } from "@/components/packet/PacketWelcomeBanner";
import {
  FileText,
  Download,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Utensils,
  Hotel,
  Compass,
  Fish,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Coffee,
  Navigation,
  Car,
  Search,
  Filter,
  Share2,
  Printer
} from "lucide-react";

interface HotelItem {
  name: string;
  distance: string;
  phone: string;
  rate: "$" | "$$" | "$$$";
  category: "luxury" | "standard" | "budget";
  notes?: string;
  website: string;
}

const HOTELS_DATA: HotelItem[] = [
  {
    name: "The Bristol Hotel (Historic Downtown)",
    distance: "12 miles / 18 min",
    phone: "(276) 696-3737",
    rate: "$$$",
    category: "luxury",
    notes: "Boutique historic property with Lumac Rooftop Bar & Vivian's Table.",
    website: "https://www.bristolhotelva.com"
  },
  {
    name: "Courtyard by Marriott Bristol",
    distance: "9 miles / 14 min",
    phone: "(276) 591-4400",
    rate: "$$",
    category: "standard",
    notes: "Convenient access off I-81 Exit 74, near The Pinnacle.",
    website: "https://www.marriott.com/en-us/hotels/tricy-courtyard-bristol/overview/"
  },
  {
    name: "Fairfield Inn & Suites Bristol",
    distance: "9 miles / 14 min",
    phone: "(276) 669-8088",
    rate: "$$",
    category: "standard",
    notes: "Modern rooms, complimentary breakfast, close to shopping.",
    website: "https://www.marriott.com/en-us/hotels/trifb-fairfield-inn-and-suites-bristol/overview/"
  },
  {
    name: "Hilton Garden Inn Bristol",
    distance: "11 miles / 16 min",
    phone: "(276) 644-4000",
    rate: "$$",
    category: "standard",
    notes: "Full-service hotel with restaurant and fitness center.",
    website: "https://www.hilton.com/en/hotels/trigigi-hilton-garden-inn-bristol/"
  },
  {
    name: "Hard Rock Hotel & Casino Bristol",
    distance: "13 miles / 20 min",
    phone: "(276) 244-4444",
    rate: "$$$",
    category: "luxury",
    notes: "Full resort casino gaming, entertainment, and multiple restaurants.",
    website: "https://casino.hardrock.com/bristol"
  },
  {
    name: "Hampton Inn Bristol",
    distance: "10 miles / 15 min",
    phone: "(423) 764-3600",
    rate: "$$",
    category: "standard",
    notes: "Hot breakfast included, quiet location off highway.",
    website: "https://www.hilton.com/en/hotels/britnhx-hampton-bristol/"
  },
  {
    name: "Holiday Inn & Suites Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 466-4100",
    rate: "$$",
    category: "standard",
    notes: "Spacious suites with on-site dining and lounge.",
    website: "https://www.ihg.com/holidayinn/hotels/us/en/bristol/tricv/hoteldetail"
  },
  {
    name: "Quality Inn & Suites Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 669-7171",
    rate: "$",
    category: "budget",
    notes: "Budget-friendly option with quick highway access.",
    website: "https://www.choicehotels.com/virginia/bristol/quality-inn-hotels/va553"
  },
  {
    name: "Days Inn by Wyndham Bristol",
    distance: "11 miles / 16 min",
    phone: "(276) 466-6060",
    rate: "$",
    category: "budget",
    notes: "Affordable lodging option near dining corridors.",
    website: "https://www.wyndhamhotels.com/days-inn/bristol-virginia/days-inn-bristol/overview"
  },
  {
    name: "Extended Stay America Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 645-0010",
    rate: "$",
    category: "budget",
    notes: "Kitchenette units ideal for shooters carrying gear boxes.",
    website: "https://www.extendedstayamerica.com/hotels/va/bristol"
  },
  {
    name: "Red Roof Inn Bristol",
    distance: "11 miles / 17 min",
    phone: "(276) 669-1151",
    rate: "$",
    category: "budget",
    notes: "Pet-friendly, economical rooms near interstate.",
    website: "https://www.redroof.com/property/va/bristol/RRI1076"
  },
  {
    name: "Country Inn & Suites Abingdon (Alternative)",
    distance: "18 miles / 24 min",
    phone: "(276) 676-2822",
    rate: "$$",
    category: "standard",
    notes: "Historic Abingdon charm, Creeper Trail access, 18 miles north.",
    website: "https://www.choicehotels.com/virginia/abingdon/country-inn-hotels/va724"
  }
];

interface DiningItem {
  name: string;
  address: string;
  tag: string;
  description: string;
  type: "bakery" | "bbq" | "craft" | "upscale" | "comfort";
}

const DINING_DATA: DiningItem[] = [
  {
    name: "Blackbird Bakery",
    address: "56 Piedmont Ave, Bristol, VA",
    tag: "Open 24 Hours (Mon–Sat)",
    description: "Bristol's landmark bakery. World-class doughnuts, pastries, espresso, artisan desserts. A mandatory morning or late-night stop.",
    type: "bakery"
  },
  {
    name: "620 State",
    address: "620 State St, Bristol, TN",
    tag: "Asian-Fusion & Steaks",
    description: "Sushi, hand-cut steaks, craft cocktails, and vibrant atmosphere positioned right on the historic state line.",
    type: "upscale"
  },
  {
    name: "Lumac Rooftop Bar (The Bristol Hotel)",
    address: "510 State St, Bristol, VA",
    tag: "Panoramic Mountain Views",
    description: "Rooftop craft cocktails, small plates, and panoramic sunset views over the Appalachian mountains.",
    type: "craft"
  },
  {
    name: "Vivian's Table",
    address: "510 State St (Inside Bristol Hotel)",
    tag: "High-End Southern",
    description: "Refined Southern cuisine with locally sourced ingredients, top-tier ribeyes, and an exceptional bourbon selection.",
    type: "upscale"
  },
  {
    name: "Delta Blues BBQ",
    address: "724 State St, Bristol, TN",
    tag: "Memphis-Style BBQ",
    description: "Slow-smoked ribs, brisket, pulled pork, and traditional southern sides. Features live blues music on weekends.",
    type: "bbq"
  },
  {
    name: "State Street Brewing",
    address: "801 State St, Bristol, VA",
    tag: "Local Craft Brewery",
    description: "Downtown craft taproom with rotating small-batch beers brewed on-site. Laid-back post-match community spot.",
    type: "craft"
  },
  {
    name: "Lost State Distilling",
    address: "295 4th St, Bristol, TN",
    tag: "Small-Batch Spirits",
    description: "Award-winning craft bourbon, Tennessee whiskey, rye, gin, and rum with on-site tastings and distillery tours.",
    type: "craft"
  },
  {
    name: "Bloom Café & Listening Room",
    address: "601 State St, Bristol, VA",
    tag: "Artisan Coffee & Breakfast",
    description: "Craft espresso, wholesome scratch breakfast, light lunch, and live acoustic music. Great pre-match morning spot.",
    type: "bakery"
  },
  {
    name: "Cootie Brown's",
    address: "118 Volunteer Pkwy, Bristol, TN",
    tag: "Eclectic Southern",
    description: "Famous Jamaican jerk chicken, tamales, craft burgers, and legendary signature Key Lime Pie. Beloved regional staple.",
    type: "comfort"
  },
  {
    name: "Public House Bristol",
    address: "629 State St, Bristol, VA",
    tag: "Chef-Driven American Tavern",
    description: "Elevated tavern burgers, steaks, seafood, smoked pastrami & hot honey chicken sandwiches, craft cocktails, and local draft beers right on historic State Street.",
    type: "comfort"
  }
];

interface AttractionItem {
  title: string;
  location: string;
  badge: string;
  summary: string;
}

const ATTRACTIONS_DATA: AttractionItem[] = [
  {
    title: "Historic Downtown & State Street",
    location: "State St, Bristol, TN/VA",
    badge: "Walk the Two-State Line",
    summary: "Walk the literal center line where brass markers divide Tennessee and Virginia. Explore independent boutiques, galleries, and craft breweries on both sides of the street."
  },
  {
    title: "Birthplace of Country Music Museum",
    location: "520 State St, Bristol, VA",
    badge: "Smithsonian Affiliate",
    summary: "World-class interactive museum celebrating the legendary 1927 Bristol Sessions—what Johnny Cash recognized as 'the single most important event in the history of country music.'"
  },
  {
    title: "Bristol Motor Speedway & Dragway",
    location: "151 Speedway Dr, Bristol, TN",
    badge: "The Last Great Colosseum",
    summary: "Iconic half-mile high-banked concrete short track with seating for 146,000+ spectators. Driving tours and dragway exhibits available."
  },
  {
    title: "Hard Rock Hotel & Casino Bristol",
    location: "500 Gate City Hwy, Bristol, VA",
    badge: "24/7 Gaming Resort",
    summary: "Full resort gaming with table games, slots, Caesars sportsbook, live stage performances, and upscale dining."
  },
  {
    title: "The Pinnacle Shopping Center",
    location: "I-81 Exit 74, Bristol, VA",
    badge: "Bass Pro Shops & Retail",
    summary: "Massive outdoor shopping complex featuring Bass Pro Shops, sporting goods, restaurants, and entertainment."
  },
  {
    title: "Appalachian Trail & Backbone Rock",
    location: "Shady Valley & Damascus corridors",
    badge: "Hiker's Paradise",
    summary: "Scenic trailheads 20–30 minutes away, including 'The Shortest Tunnel in the World' at Backbone Rock and the South Holston Dam overlook."
  },
  {
    title: "Steele Creek Park",
    location: "4022 Broad St, Bristol, TN",
    badge: "2,200-Acre Nature Reserve",
    summary: "Expansive municipal park with a 54-acre lake, mountain biking paths, hiking trails, disc golf, and nature center."
  },
  {
    title: "Bristol Caverns & Appalachian Caverns",
    location: "Bristol & Blountville, TN",
    badge: "Subterranean Wonder",
    summary: "Ancient underground cavern systems with paved illuminated paths traversing massive stalactites, stalagmites, and subterranean rivers."
  },
  {
    title: "Historic Abingdon & Barter Theatre",
    location: "Abingdon, VA (15 min north)",
    badge: "Virginia Creeper Trail",
    summary: "Quaint historic brick town featuring The Barter Theatre (The State Theatre of Virginia), 34-mile Creeper bike trail, and antique shops."
  },
  {
    title: "South Holston Lake",
    location: "Cherokee National Forest Basin",
    badge: "7,580-Acre TVA Reservoir",
    summary: "Stunning mountain-ringed reservoir perfect for boating, paddle boarding, scenic drives, and shoreline exploration."
  }
];

export default function CompetitorPacketPage() {
  const [hotelFilter, setHotelFilter] = useState<string>("ALL");
  const [diningFilter, setDiningFilter] = useState<string>("ALL");
  const [copiedLink, setCopiedLink] = useState(false);

  const PDF_URL = "/documents/2026-Subsonic-Society-Invitational-Competitor-Packet.pdf";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredHotels = HOTELS_DATA.filter((h) => {
    if (hotelFilter === "ALL") return true;
    return h.category === hotelFilter;
  });

  const filteredDining = DINING_DATA.filter((d) => {
    if (diningFilter === "ALL") return true;
    return d.type === diningFilter;
  });

  return (
    <div className="min-h-screen text-slate-100 pb-28">
      {/* Post-registration welcome (only when ?welcome=CALLSIGN) */}
      <PacketWelcomeBanner />

      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <span className="text-amber-400 font-bold">The 2026 Invitational</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? "Link Copied!" : "Share Guide"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/10">
        <div className="absolute inset-0 bg-carbon-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-black tracking-wider uppercase bg-amber-500 text-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-4 h-4 fill-black" />
              $7,500 Total Cash Prizes
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-slate-200">
              Presented by Modacam Custom Rifles
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-wider uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
              The Hideout • Bristol, TN
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading">
              Subsonic Society Invitational <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                Money Match Competitor Packet
              </span>
            </h1>
            <p className="max-w-3xl text-base sm:text-lg text-slate-200 leading-relaxed font-sans">
              Founder Allen Hurley’s welcome address, weekend schedule,{" "}
              <strong className="text-amber-400 font-bold">$7,500 total cash prizes ($5,000 main match + $2,500 side matches)</strong>,{" "}
              <strong className="text-emerald-400 font-bold">Saturday lunch &amp; dinner provided</strong>,{" "}
              recommended hotels, Bristol dining, and South Holston fly-fishing guide.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                Match Dates
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-1">Nov 13–15, 2026</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">Fri Check-In • Sat–Sun Match</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                Location
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-1">The Hideout</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">111 Hwy 44, Bristol, TN 37620</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.08)]">
              <div className="text-xs sm:text-sm font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Hospitality
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">Saturday Lunch &amp; Dinner</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">Provided Saturday</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.08)]">
              <div className="text-xs sm:text-sm font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Cash Prizes
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">$7,500 Total Cash Prizes</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">$5,000 Main Match • $2,500 Side Matches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Jump Navigation Clean Stacked Panel */}
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto space-y-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Match Packet Sections</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono">
            <a
              href="#welcome"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Welcome
            </a>
            <a
              href="#schedule"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Schedule
            </a>
            <a
              href="#hotels"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Lodging
            </a>
            <a
              href="#dining"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Bristol Dining
            </a>
            <a
              href="#attractions"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Attractions
            </a>
            <a
              href="#fishing"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Fly Fishing
            </a>
            <a
              href="#rules"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold col-span-2 sm:col-span-1"
            >
              Info &amp; Contact
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        
        {/* SECTION 1: Welcome Address from Allen Hurley */}
        <section id="welcome" className="scroll-mt-24 space-y-6">
          <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-6 right-6 opacity-10 font-black text-7xl select-none text-amber-500">
              SS
            </div>

            <div className="space-y-6 relative z-10 max-w-4xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono text-base">
                  AH
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold">Welcome to the Invitational</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Allen Hurley — Subsonic Society</h3>
                </div>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 sm:pl-6 space-y-4 text-slate-100 text-base sm:text-lg leading-relaxed font-serif">
                <p className="font-bold text-white not-italic">Competitors,</p>
                <p>
                  On behalf of Subsonic Society, welcome to Bristol and thank you for accepting the Invitational Challenge. This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation.
                </p>
                <p>
                  You are part of a limited field coming to The Hideout for a weekend of serious competition, great people and a little fun along the way. We have worked hard to make the Invitational different — challenging stages, a meaningful cash purse, dedicated staff and spotters, hospitality, and an atmosphere where the competitors are the focus. We are proud to have Modacam Custom Rifles as the presenting sponsor of the Subsonic Society Invitational Money Match.
                </p>
                <p>
                  Bristol is home for us, and I want you and anyone traveling with you to enjoy it while you are here. This packet gives you a quick guide to the match weekend, lodging, downtown dining and some of the things that make Bristol, Tennessee and Bristol, Virginia special.
                </p>
                <p>
                  Most importantly, thank you for accepting the challenge and helping us build something special. We look forward to welcoming you to Bristol and seeing you on the range.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                <div className="font-mono text-sm sm:text-base text-slate-300">
                  <span className="text-white font-bold">Allen Hurley</span> • Founder, Subsonic Society
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase">
                  <span>SAID. DONE.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Schedule */}
        <section id="schedule" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Weekend Schedule — November 13–15, 2026
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Friday</h3>
              </div>

              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 font-sans">
                <li>Range open 12–5</li>
                <li>Registration and sight in only</li>
              </ul>
            </div>

            {/* Saturday */}
            <div className="rounded-2xl bg-white/[0.02] border border-amber-500/30 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Saturday</h3>
                <span className="px-2.5 py-1 rounded bg-amber-500 text-black text-xs font-black uppercase font-mono">$5,000 Main Match</span>
              </div>

              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 font-sans">
                <li>Open 7am</li>
                <li>Registration and sight in until 8:30</li>
                <li>Shooter brief 8:30</li>
                <li>First shot 9am</li>
                <li className="font-bold text-amber-400">8 stages — lunch and dinner provided</li>
              </ul>
            </div>

            {/* Sunday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Sunday</h3>
                <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold">$2,500 Side Matches</span>
              </div>

              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 font-sans">
                <li>Open 7am</li>
                <li>7–8:30 sight in</li>
                <li>Shooter brief 8:30</li>
                <li>First shot 9am</li>
                <li className="font-bold text-emerald-400">4 stages • 2 stages</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 5: Recommended Hotels & Lodging Directory */}
        <section id="hotels" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-blue-400 font-bold">
                <Hotel className="w-4 h-4" />
                <span>Accommodations Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
                Bristol & Area Recommended Hotels
              </h2>
              <p className="text-base text-slate-300 max-w-2xl">
                12 vetted partner hotels within 9 to 18 minutes of The Hideout range gate. 
                Use the direct web links below to reserve online or tap to call front desks. Book early — November is high season in the Tri-Cities region.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono">
              <button
                onClick={() => setHotelFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  hotelFilter === "ALL" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                All (12)
              </button>
              <button
                onClick={() => setHotelFilter("luxury")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  hotelFilter === "luxury" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                $$$ Luxury
              </button>
              <button
                onClick={() => setHotelFilter("standard")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  hotelFilter === "standard" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                $$ Midscale
              </button>
              <button
                onClick={() => setHotelFilter("budget")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  hotelFilter === "budget" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                $ Budget
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map((h, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-black text-amber-400 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {h.rate}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-slate-300 flex items-center gap-1.5 font-medium">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      {h.distance}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white leading-snug">
                    <a
                      href={h.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors inline-block"
                    >
                      {h.name}
                    </a>
                  </h4>
                  {h.notes && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">{h.notes}</p>
                  )}
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-1"
                    title={`Call ${h.name}`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{h.phone}</span>
                  </a>

                  <a
                    href={h.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/25 text-xs sm:text-sm font-mono font-bold transition-all shadow-sm group"
                  >
                    <span>Book Online</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Downtown Bristol Dining Guide */}
        <section id="dining" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold">
                <Utensils className="w-4 h-4" />
                <span>Culinary Intel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
                Where to Eat in Bristol — 10 Local Landmarks
              </h2>
              <p className="text-base text-slate-300 max-w-2xl">
                From the 24-hour legendary Blackbird Bakery to rooftop bourbon lounges and Memphis-style smoked ribs.
              </p>
            </div>

            {/* Dining Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono overflow-x-auto">
              <button
                onClick={() => setDiningFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "ALL" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                All Spots (10)
              </button>
              <button
                onClick={() => setDiningFilter("bakery")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "bakery" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Bakery & Coffee
              </button>
              <button
                onClick={() => setDiningFilter("upscale")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "upscale" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Steaks & Dining
              </button>
              <button
                onClick={() => setDiningFilter("bbq")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "bbq" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Smoked BBQ
              </button>
              <button
                onClick={() => setDiningFilter("craft")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "craft" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Craft & Rooftops
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDining.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white">{item.name}</h4>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">{item.description}</p>
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-sm text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${item.name} ${item.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs sm:text-sm font-bold"
                  >
                    <span>Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: What to Do in Bristol — Attractions & Activities */}
        <section id="attractions" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-purple-400 font-bold">
              <Compass className="w-4 h-4" />
              <span>Explore Bristol, TN / VA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Attractions & Activities for Competitors & Families
            </h2>
            <p className="text-base text-slate-300 max-w-3xl">
              From the high-banks of Bristol Motor Speedway to Smithsonian country music roots and subterranean cavern rivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ATTRACTIONS_DATA.map((att, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {att.badge}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-slate-300 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {att.location}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{att.title}</h4>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">{att.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: South Holston River Fly-Fishing Spotlight */}
        <section id="fishing" className="scroll-mt-24 space-y-6">
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-black to-zinc-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Fish className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold">World-Class Tailwater Fishery</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">South Holston River Trophy Trout</h3>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed">
                <p>
                  The South Holston River is one of the region&apos;s premier trout fisheries and is widely regarded among the best fly-fishing waters in the East. Cold water released from South Holston Dam supports strong brown and rainbow trout populations, and local guides offer half-day and full-day trips.
                </p>
                <p className="text-amber-300 font-semibold">
                  During the Invitational dates, designated spawning sections may be seasonally closed, so check current Tennessee fishing regulations and TVA generation schedules before fishing.
                </p>
              </div>

              {/* Guide Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-sm sm:text-base font-bold text-white">South Holston River Fly Shop</div>
                  <div className="text-xs sm:text-sm text-slate-300 font-mono">6384 US-421, Bristol, TN 37620</div>
                  <a
                    href="tel:4238782822"
                    className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>(423) 878-2822</span>
                  </a>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-sm sm:text-base font-bold text-white">Mahoney&apos;s Outfitters (Fly Shop)</div>
                  <div className="text-xs sm:text-sm text-slate-300 font-mono">830 E Oakland Ave, Johnson City, TN</div>
                  <a
                    href="tel:4232825413"
                    className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>(423) 282-5413</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: Event Info, Waiver & Contact */}
        <section id="rules" className="scroll-mt-24 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-base sm:text-lg font-bold text-amber-400">
                Zero Range
              </h4>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                50 yard, 100 yard, and 200 yard zero available.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-base sm:text-lg font-bold text-amber-400">
                Eye &amp; Ear Protection
              </h4>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Eye and ear protection is recommended at all times.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-base sm:text-lg font-bold text-amber-400">
                Terms &amp; Event Waiver
              </h4>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Restriction on firearm sales on this platform. Everything else including waiver will be done day of event.
              </p>
            </div>
          </div>

          {/* Event Director Signoff Footer Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="text-xs sm:text-sm font-mono text-slate-300 uppercase tracking-wider font-semibold">Event Director Contact</div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5">Allen Hurley • Subsonic Society</div>
              <div className="text-sm sm:text-base text-slate-300">The Hideout • 111 Hwy 44, Bristol, TN 37620</div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="mailto:ahurley@subsonicsociety.com"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center justify-center gap-2 shadow-tactical-glow"
              >
                <span>Contact Subsonic</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
