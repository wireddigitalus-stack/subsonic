"use client";

import React, { useState } from "react";
import Link from "next/link";
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
}

const HOTELS_DATA: HotelItem[] = [
  {
    name: "The Bristol Hotel (Historic Downtown)",
    distance: "12 miles / 18 min",
    phone: "(276) 696-3737",
    rate: "$$$",
    category: "luxury",
    notes: "Boutique historic property with Lumac Rooftop Bar & Vivian's Table."
  },
  {
    name: "Courtyard by Marriott Bristol",
    distance: "9 miles / 14 min",
    phone: "(276) 591-4400",
    rate: "$$",
    category: "standard",
    notes: "Convenient access off I-81 Exit 74, near The Pinnacle."
  },
  {
    name: "Fairfield Inn & Suites Bristol",
    distance: "9 miles / 14 min",
    phone: "(276) 669-8088",
    rate: "$$",
    category: "standard",
    notes: "Modern rooms, complimentary breakfast, close to shopping."
  },
  {
    name: "Hilton Garden Inn Bristol",
    distance: "11 miles / 16 min",
    phone: "(276) 644-4444",
    rate: "$$",
    category: "standard",
    notes: "Full-service hotel with restaurant and fitness center."
  },
  {
    name: "Hard Rock Hotel & Casino Bristol",
    distance: "13 miles / 20 min",
    phone: "(276) 244-4444",
    rate: "$$$",
    category: "luxury",
    notes: "Full resort casino gaming, entertainment, and multiple restaurants."
  },
  {
    name: "Hampton Inn Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 764-3600",
    rate: "$$",
    category: "standard",
    notes: "Hot breakfast included, quiet location off highway."
  },
  {
    name: "Holiday Inn & Suites Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 466-4100",
    rate: "$$",
    category: "standard",
    notes: "Spacious suites with on-site dining and lounge."
  },
  {
    name: "Quality Inn & Suites Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 669-7171",
    rate: "$",
    category: "budget",
    notes: "Budget-friendly option with quick highway access."
  },
  {
    name: "Days Inn by Wyndham Bristol",
    distance: "11 miles / 16 min",
    phone: "(276) 466-6060",
    rate: "$",
    category: "budget",
    notes: "Affordable lodging option near dining corridors."
  },
  {
    name: "Extended Stay America Bristol",
    distance: "10 miles / 15 min",
    phone: "(276) 645-0010",
    rate: "$",
    category: "budget",
    notes: "Kitchenette units ideal for shooters carrying gear boxes."
  },
  {
    name: "Red Roof Inn Bristol",
    distance: "11 miles / 17 min",
    phone: "(276) 669-1151",
    rate: "$",
    category: "budget",
    notes: "Pet-friendly, economical rooms near interstate."
  },
  {
    name: "Country Inn & Suites Abingdon (Alternative)",
    distance: "18 miles / 24 min",
    phone: "(276) 676-2822",
    rate: "$$",
    category: "standard",
    notes: "Historic Abingdon charm, Creeper Trail access, 18 miles north."
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
    name: "Michael Waltrip Brewing Co.",
    address: "221 Moore St, Bristol, VA",
    tag: "NASCAR Heritage & Taproom",
    description: "NASCAR-inspired craft brewery with huge beer selections, hearty food menu, and outdoor patio.",
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
    name: "The Angry Italian",
    address: "714 State St, Bristol, TN",
    tag: "Chicago Deep Dish",
    description: "Authentic Chicago-style deep-dish pizza, Italian beef sandwiches, and hearty pasta portions for hungry squads.",
    type: "comfort"
  },
  {
    name: "Cootie Brown's",
    address: "118 Volunteer Pkwy, Bristol, TN",
    tag: "Eclectic Southern",
    description: "Famous Jamaican jerk chicken, tamales, craft burgers, and legendary signature Key Lime Pie. Beloved regional staple.",
    type: "comfort"
  },
  {
    name: "Quaker Steak & Lube",
    address: "629 Linden Dr, Bristol, VA",
    tag: "Wings & Squad Tables",
    description: "Motor-sports-themed wing joint with jumbo wings, burgers, and draft beer. Perfect for large squads and families.",
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
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/matches" className="hover:text-white transition-colors">Matches</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">2026 Competitor Packet</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share Guide"}</span>
            </button>
            <a
              href={PDF_URL}
              download="2026-Subsonic-Society-Invitational-Competitor-Packet.pdf"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center gap-2 shadow-tactical-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF (246 KB)</span>
            </a>
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
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Official Match Dossier
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-slate-300">
              Presented by Modacam Custom Rifles
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
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
            <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              Everything you need for the championship weekend: Founder Allen Hurley’s welcome address, 
              full 3-day schedule, $2,500 cash side matches, 220-acre facility amenities, 12 recommended hotels, 
              and the complete Bristol dining & South Holston fly-fishing guide.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Match Dates
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-1">Nov 13–15, 2026</div>
              <div className="text-[11px] text-slate-400">Fri Check-In • Sat–Sun Match</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Location
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-1">The Hideout</div>
              <div className="text-[11px] text-slate-400">111 Hwy 44, Bristol, TN 37620</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Hospitality
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">All Meals Included</div>
              <div className="text-[11px] text-slate-400">Breakfasts, Lunch & Smoked BBQ</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                Cash Side Matches
              </div>
              <div className="text-base sm:text-lg font-black text-purple-300 mt-1">$2,500 Purse</div>
              <div className="text-[11px] text-slate-400">1,000Y Cold Bore & Speed Duel</div>
            </div>
          </div>

          {/* Quick PDF Action Hero Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Official Printable Competitor Packet (PDF)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">4 Pages • 246 KB</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full original document as distributed by Allen Hurley & Modacam Custom Rifles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Tab</span>
              </a>
              <a
                href={PDF_URL}
                download="2026-Subsonic-Society-Invitational-Competitor-Packet.pdf"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black shadow-tactical-glow transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Jump Navigation Sticky Strip */}
      <div className="sticky top-12 z-30 bg-black/85 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 overflow-x-auto ios-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 text-xs font-mono whitespace-nowrap">
          <span className="text-[11px] text-slate-500 uppercase tracking-widest mr-1">Jump to:</span>
          <a href="#welcome" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Allen&apos;s Welcome
          </a>
          <a href="#facility" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            The Hideout 220 Acres
          </a>
          <a href="#schedule" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Weekend Schedule
          </a>
          <a href="#hospitality" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Food & Hospitality
          </a>
          <a href="#hotels" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Lodging Directory (12)
          </a>
          <a href="#dining" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Bristol Dining Guide (12)
          </a>
          <a href="#attractions" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Attractions (10)
          </a>
          <a href="#fishing" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Trout Fly Fishing
          </a>
          <a href="#rules" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors">
            Range SOP & Weather
          </a>
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono">
                  AH
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Founder&apos;s Welcome</div>
                  <h3 className="text-lg font-black text-white">Allen Hurley — Subsonic Society</h3>
                </div>
              </div>

              <div className="border-l-2 border-amber-500/50 pl-4 sm:pl-6 space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed font-serif italic">
                <p>
                  &ldquo;Welcome to The Hideout. We built this place because we believe rimfire precision 
                  deserves a home that doesn&apos;t cut corners. Two hundred and twenty acres of Tennessee ridgeline, 
                  purpose-built from the ground up for shooters who take this game seriously.&rdquo;
                </p>
                <p>
                  &ldquo;This match isn&apos;t just about steel and scorecards. It&apos;s about bringing together 
                  the people who push this sport forward — competitors, builders, families, and the community 
                  that makes it all possible. Every stage has been designed to challenge you, every detail considered 
                  to give you the best weekend of shooting you&apos;ll find anywhere.&rdquo;
                </p>
                <p>
                  &ldquo;Take care of the property, look out for the person next to you, and leave it better than you found it. 
                  We&apos;re proud to have you here.&rdquo;
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                <div className="font-mono text-xs text-slate-400">
                  <span className="text-white font-bold">Allen Hurley</span> • Founder, Subsonic Society
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold tracking-widest uppercase">
                  <span>SAID. DONE.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: The Hideout 220-Acre Multi-Discipline Facility */}
        <section id="facility" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Range & Property Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              The Hideout — 220 Acres Purpose-Built for Shooters
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl">
              111 Hwy 44, Bristol, TN 37620. A premier multi-discipline shooting and outdoor compound 
              featuring elevation, natural wind channels, and state-of-the-art competitor infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">1,000-Yard Centerfire Rifle Range</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full 1,000-yard capability across deep Appalachian draws, used for the Sunday $1,500 Cold Bore Challenge and long-range ballistic testing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">300-Yard Dedicated Precision Rimfire Range</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subsonic-optimized steel arrays, custom barricades, props, tank traps, spools, and natural rock ledges engineered specifically for rimfire precision.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fully Enclosed 10-Bay Pistol Pit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated bermed defensive and speed pits designed for dynamic multi-target transitions, steel challenge, and tactical training.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">20&apos; x 20&apos; Stone Fire Pit Gathering Area</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Central community gathering hub for the Saturday evening smoked BBQ dinner, fireside match stories, and post-match camaraderie.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Coffee className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">60&apos; x 40&apos; Covered Pavilion & Kitchen</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full commercial on-site kitchen, covered dining seating for the entire roster, and real-time electronic match scoring displays.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Dirt Track, RV Hookups & Camping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                1/4-mile dirt flat track & supercross rhythm section, dedicated RV hookup spaces, and scenic dry camping zones nestled into the Tennessee hillside.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Master Weekend Schedule */}
        <section id="schedule" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Official 3-Day Itinerary</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Match Weekend Schedule — November 13–15, 2026
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl">
              Strict timelines ensure maximum trigger time, professional squad rotations, and evening hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Day 1 • Arrival</div>
                  <h3 className="text-base font-bold text-white">Friday, Nov 13</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">Zero & Social</span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">12:00 – 5:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Competitor Check-In:</span> Swag bags, squadding packets & match badges at Pavilion.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">1:00 – 4:30 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-amber-400">Zero Ranges Open:</span> Rimfire & centerfire bays available for verification and chrono check.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">5:00 – 7:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Welcome Reception:</span> Food, refreshments, and competitor social at the main Pavilion.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <div className="font-mono text-amber-400 shrink-0 w-24 font-bold">6:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-bold text-amber-400">Mandatory Safety Briefing:</span> Early session for Friday arrivals. Required for all competitors.
                  </div>
                </div>
              </div>
            </div>

            {/* Saturday */}
            <div className="rounded-2xl bg-white/[0.02] border border-amber-500/30 p-5 space-y-4 shadow-lg shadow-amber-500/5">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Day 2 • 14 Stages</div>
                  <h3 className="text-base font-bold text-white">Saturday, Nov 14</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase font-mono">Main Match</span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">6:30 AM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Gates Open:</span> Hot breakfast & fresh coffee served at the Pavilion.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <div className="font-mono text-amber-400 shrink-0 w-24 font-bold">7:15 AM</div>
                  <div className="text-slate-200">
                    <span className="font-bold text-amber-400">Safety Briefing:</span> Final session for Saturday morning arrivals.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">8:00 AM – 12:00</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Stages 1–8:</span> First flight of precision barricade & distance stages.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">12:00 – 1:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Catered Lunch:</span> Provided on-site at Pavilion.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">1:00 – 4:30 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Stages 9–14:</span> Afternoon rotation across mountain steel arrays.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">5:30 – 8:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-amber-400">Smoked BBQ Feast & Fire Pit:</span> Competitor dinner at the 20x20 stone fire pit.
                  </div>
                </div>
              </div>
            </div>

            {/* Sunday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Day 3 • Finals & Cash</div>
                  <h3 className="text-base font-bold text-white">Sunday, Nov 15</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono">$2.5K Side Cash</span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">7:00 AM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Gates Open:</span> Coffee & light breakfast at Pavilion.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">8:00 – 11:30 AM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-white">Stages 15–18:</span> Final championship course stages.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <div className="font-mono text-emerald-400 shrink-0 w-24 font-bold">12:00 PM</div>
                  <div className="text-slate-200">
                    <span className="font-bold text-emerald-400">Cash Side Matches ($2,500 Purse):</span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-300">
                      <li>$1,500 1,000-Yard Cold Bore Challenge</li>
                      <li>$1,000 Rimfire Speed Steel Duel</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">1:30 PM</div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-amber-400">Awards Ceremony:</span> Trophy presentations, prize table & cash purse checks.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="font-mono text-slate-400 shrink-0 w-24">2:30 PM</div>
                  <div className="text-slate-200 text-slate-400">
                    Range closes & competitor departure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Food & Hospitality */}
        <section id="hospitality" className="scroll-mt-24 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <Utensils className="w-3.5 h-3.5" />
                <span>Competitor Hospitality Included</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                All Weekend Meals Covered With Competitor Registration
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enjoy hot breakfasts each morning, full catered lunches between stage rotations, 
                and Saturday night&apos;s slow-smoked mountain BBQ feast at the 20x20 stone fire pit.
              </p>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Family & Spectators: $15/day meal band available at Pavilion check-in.</span>
              </div>
            </div>

            <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
              <div className="text-slate-400">HOSPITALITY PASS</div>
              <div className="text-base font-bold text-emerald-400">FULL INCLUSION</div>
              <div className="text-slate-400 text-[11px] leading-tight">
                • Friday Evening Social<br />
                • Sat & Sun Breakfasts<br />
                • Saturday Catered Lunch<br />
                • Smoked BBQ Pit Dinner
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Recommended Hotels & Lodging Directory */}
        <section id="hotels" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400">
                <Hotel className="w-3.5 h-3.5" />
                <span>Accommodations Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
                Bristol & Area Recommended Hotels
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                12 vetted partner hotels within 9 to 18 minutes of The Hideout range gate. 
                Book early — November is high season in the Tri-Cities region.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setHotelFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  hotelFilter === "ALL" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                All (12)
              </button>
              <button
                onClick={() => setHotelFilter("luxury")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  hotelFilter === "luxury" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                $$$ Luxury
              </button>
              <button
                onClick={() => setHotelFilter("standard")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  hotelFilter === "standard" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                $$ Midscale
              </button>
              <button
                onClick={() => setHotelFilter("budget")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
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
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {h.rate}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Car className="w-3 h-3 text-blue-400" />
                      {h.distance}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">{h.name}</h4>
                  {h.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed">{h.notes}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{h.phone}</span>
                  </a>
                  <span className="text-[11px] text-slate-500 font-mono">1-Tap Dial</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Downtown Bristol Dining Guide */}
        <section id="dining" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <Utensils className="w-3.5 h-3.5" />
                <span>Culinary Intel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
                Where to Eat in Bristol — 12 Local Landmarks
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                From the 24-hour legendary Blackbird Bakery to rooftop bourbon lounges and Memphis-style smoked ribs.
              </p>
            </div>

            {/* Dining Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setDiningFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "ALL" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                All Spots (12)
              </button>
              <button
                onClick={() => setDiningFilter("bakery")}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "bakery" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Bakery & Coffee
              </button>
              <button
                onClick={() => setDiningFilter("upscale")}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "upscale" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Steaks & Dining
              </button>
              <button
                onClick={() => setDiningFilter("bbq")}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  diningFilter === "bbq" ? "bg-amber-500 text-black font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Smoked BBQ
              </button>
              <button
                onClick={() => setDiningFilter("craft")}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
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
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${item.name} ${item.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                  >
                    <span>Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: What to Do in Bristol — Attractions & Activities */}
        <section id="attractions" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Bristol, TN / VA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Attractions & Activities for Competitors & Families
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl">
              From the high-banks of Bristol Motor Speedway to Smithsonian country music roots and subterranean cavern rivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ATTRACTIONS_DATA.map((att, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {att.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {att.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{att.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{att.summary}</p>
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
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Fish className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">World-Class Tailwater Fishery</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">South Holston River Trophy Trout</h3>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  The South Holston River is nationally recognized as one of the premier tailwater trout fisheries 
                  in the entire United States. Holding between <strong className="text-white">5,000 to 6,000 wild trout per mile</strong> (predominantly wild brown trout), 
                  trophy specimens surpassing the 20-inch mark are caught regularly.
                </p>
                <p className="text-amber-300 font-semibold">
                  ⚠️ Pro Tip: Mid-November coincides with the prime brown trout spawning run. 
                  Shooters looking to book half-day or full-day drift boat float trips should reserve guide boats immediately.
                </p>
              </div>

              {/* Guide Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white">South Holston River Fly Shop</div>
                  <div className="text-xs text-slate-400">6384 US-421, Bristol, TN 37620</div>
                  <a
                    href="tel:4238782822"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>(423) 878-2822</span>
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white">Mahoney&apos;s Outfitters (Fly Shop)</div>
                  <div className="text-xs text-slate-400">830 E Oakland Ave, Johnson City, TN</div>
                  <a
                    href="tel:4232825413"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>(423) 282-5413</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: Competitor Quick Notes, Range Rules & Weather */}
        <section id="rules" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Standard Operating Procedures</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Competitor Quick Notes & Safety Protocols
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl">
              Strict cold-range guidelines are enforced across all 220 acres of The Hideout facility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Strict Cold Range Policy
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Hideout operates strictly as a cold range at all times. All firearms must remain completely unloaded, 
                magazines removed, and cased or secured in an approved carrier with an <strong className="text-white">open bolt and chamber flag inserted</strong>. 
                Handling of firearms is only permitted on the firing line under direct Range Officer commands or inside designated Safe Areas (no ammunition permitted in safe areas).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Zero Range Protocols
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                50-yard, 100-yard, and 200-yard zero bays will be hot on Friday from 1:00 PM to 4:30 PM. 
                Limited zero access will be available Saturday morning from 6:30 AM to 7:30 AM before the mandatory safety briefing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Eye & Ear Protection
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eye and hearing protection are mandatory at all times forward of the Pavilion parking perimeter whenever any range is active. 
                This applies to all competitors, match staff, ROs, and spectators.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                November Weather & Gear Recommendations
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mid-November in Bristol typically experiences morning lows in the 30s–40s°F and daytime highs in the 50s–60s°F. 
                Ridge winds along the mountain draws can shift quickly. Competitors are strongly advised to dress in layers and carry windproof outer garments.
              </p>
            </div>
          </div>

          {/* Match Director Signoff Footer Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Match Director Contact</div>
              <div className="text-base font-bold text-white">Allen Hurley • Subsonic Society</div>
              <div className="text-xs text-slate-400">The Hideout • 111 Hwy 44, Bristol, TN 37620</div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={PDF_URL}
                download="2026-Subsonic-Society-Invitational-Competitor-Packet.pdf"
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center gap-2 shadow-tactical-glow"
              >
                <Download className="w-4 h-4" />
                <span>Download Official 4-Page PDF (246 KB)</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
