"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PacketWelcomeBanner } from "@/components/packet/PacketWelcomeBanner";
import {
  ExternalLink,
  MapPin,
  Calendar,
  Phone,
  Utensils,
  Hotel,
  Compass,
  Fish,
  Sparkles,
  ChevronRight,
  Target,
  Trophy,
  Car,
  Share2,
  Download,
} from "lucide-react";

interface HotelItem {
  name: string;
  city: string;
  phone: string;
  distance: string;
  website: string;
}

const HOTELS_DATA: HotelItem[] = [
  {
    name: "Fairfield Inn & Suites by Marriott",
    city: "Bristol, TN",
    phone: "423-574-4500",
    distance: "~10-15 min drive",
    website: "https://www.marriott.com/en-us/hotels/trifb-fairfield-inn-and-suites-bristol/overview/",
  },
  {
    name: "Hampton Inn Bristol",
    city: "Bristol, TN",
    phone: "423-764-3600",
    distance: "~10-15 min drive",
    website: "https://www.hilton.com/en/hotels/britnhx-hampton-bristol/",
  },
  {
    name: "Quality Inn Bristol Pinnacle Area",
    city: "Bristol, TN",
    phone: "423-797-4822",
    distance: "~10-15 min drive",
    website: "https://www.choicehotels.com/tennessee/bristol/quality-inn-hotels",
  },
  {
    name: "The Bristol Hotel",
    city: "Bristol, VA",
    phone: "276-696-3535",
    distance: "~10-15 min drive",
    website: "https://www.bristolhotelva.com",
  },
  {
    name: "The Sessions Hotel",
    city: "Bristol, VA",
    phone: "276-285-5040",
    distance: "~10-15 min drive",
    website: "https://www.marriott.com/en-us/hotels/tritx-the-sessions-hotel-bristol-a-tribute-portfolio-hotel/overview/",
  },
  {
    name: "Hard Rock Hotel & Casino Bristol",
    city: "Bristol, VA",
    phone: "844-490-7625",
    distance: "~10-15 min drive",
    website: "https://casino.hardrock.com/bristol",
  },
  {
    name: "Delta Hotels by Marriott Bristol",
    city: "Bristol, VA",
    phone: "276-466-4100",
    distance: "~10-15 min drive",
    website: "https://www.marriott.com/en-us/hotels/tride-delta-hotels-bristol/overview/",
  },
  {
    name: "Courtyard by Marriott Bristol",
    city: "Bristol, VA",
    phone: "276-591-4400",
    distance: "~10-15 min drive",
    website: "https://www.marriott.com/en-us/hotels/tricy-courtyard-bristol/overview/",
  },
  {
    name: "Hilton Garden Inn Bristol",
    city: "Bristol, VA",
    phone: "276-644-4000",
    distance: "~10-15 min drive",
    website: "https://www.hilton.com/en/hotels/trigigi-hilton-garden-inn-bristol/",
  },
  {
    name: "The Martha Washington Inn & Spa",
    city: "Abingdon, VA",
    phone: "276-628-3161",
    distance: "~11 mi",
    website: "https://www.themartha.com",
  },
  {
    name: "Hampton Inn Abingdon",
    city: "Abingdon, VA",
    phone: "276-619-4600",
    distance: "~12 mi",
    website: "https://www.hilton.com/en/hotels/abgva-hampton-abingdon/",
  },
  {
    name: "Fairfield Inn & Suites Abingdon",
    city: "Abingdon, VA",
    phone: "276-619-5501",
    distance: "~12 mi",
    website: "https://www.marriott.com/en-us/hotels/trifa-fairfield-inn-and-suites-abingdon/overview/",
  },
];

interface DiningItem {
  name: string;
  description: string;
}

const DINING_DATA: DiningItem[] = [
  {
    name: "State Line Bar & Grill",
    description: "American favorites, drinks and a downtown Bristol atmosphere.",
  },
  {
    name: "Tin Roof",
    description: "Food, drinks and live entertainment in the downtown district.",
  },
  {
    name: "Scratch Kitchen",
    description: "A local downtown option for fresh, casual dining.",
  },
  {
    name: "Machiavelli's",
    description: "Pizza, pasta and Italian comfort food.",
  },
  {
    name: "Subculture Subs",
    description: "Downtown sandwiches and casual fare.",
  },
  {
    name: "The Bistro",
    description: "A downtown dining option close to State Street.",
  },
  {
    name: "Borderline Billiards",
    description: "Billiards, food, drinks and a casual evening hangout.",
  },
  {
    name: "620 State",
    description: "Sushi, steaks, burgers and Asian-American favorites.",
  },
  {
    name: "Southern Craft BBQ",
    description: "Barbecue at The Sessions Hotel complex.",
  },
  {
    name: "Vivian's Table",
    description: "Appalachian-inspired dining at The Bristol Hotel.",
  },
  {
    name: "Blackbird Bakery",
    description: "Doughnuts, pastries, cakes and desserts.",
  },
  {
    name: "The Southern Churn",
    description: "Ice cream, fudge and old-fashioned sweets.",
  },
  {
    name: "Public House",
    description: "Downtown Bristol dining and tavern fare on State Street.",
  },
];

interface AttractionItem {
  title: string;
  summary: string;
}

const ATTRACTIONS_DATA: AttractionItem[] = [
  {
    title: "Stand in Two States at Once",
    summary:
      "Walk State Street and put one foot in Tennessee and the other in Virginia beneath the iconic Bristol sign.",
  },
  {
    title: "Birthplace of Country Music Museum",
    summary:
      "Learn the story of the 1927 Bristol Sessions and Bristol's role in country music.",
  },
  {
    title: "Bristol Motor Speedway",
    summary:
      'The legendary "Last Great Colosseum" and one of America\'s most recognizable motorsports venues.',
  },
  {
    title: "Bristol Dragway - Thunder Valley",
    summary:
      "Iconic drag racing venue in a mountain setting beside Bristol Motor Speedway.",
  },
  {
    title: "Hard Rock Hotel & Casino Bristol",
    summary:
      "Casino gaming, dining, concerts, hotel, spa and entertainment.",
  },
  {
    title: "Historic Downtown Bristol",
    summary:
      "Restaurants, shops, breweries, live music, Paramount Bristol, Bristol Train Station and State Street.",
  },
  {
    title: "South Holston Lake & Dam",
    summary:
      "Mountain scenery, boating, fishing and outdoor recreation.",
  },
  {
    title: "Bristol Caverns",
    summary:
      "Guided underground tours through impressive formations and passages.",
  },
  {
    title: "Steele Creek Park",
    summary:
      "More than 2,000 acres of trails, lake activities and recreation in Bristol, Tennessee.",
  },
  {
    title: "Sugar Hollow Park",
    summary:
      "Trails, sports fields and outdoor recreation in Bristol, Virginia.",
  },
  {
    title: "The Pinnacle",
    summary:
      "Large shopping, dining and entertainment district near I-81.",
  },
  {
    title: "Appalachian Trail / Damascus",
    summary:
      "Nearby access to Appalachian hiking country and the trail community of Damascus, Virginia.",
  },
  {
    title: "Kettlefoot Rod & Gun Club",
    summary:
      "Southwest Virginia shooting-sports club just outside Bristol, hosting rimfire, PRS, pistol, shotgun and other competitive disciplines. 21101 Kettlefoot Rd, Bristol, VA.",
  },
  {
    title: "Historic Abingdon, Virginia",
    summary:
      "Barter Theatre, Virginia Creeper Trail access, restaurants, shops and The Martha Washington Inn & Spa.",
  },
];

export default function CompetitorPacketPage() {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28">
      {/* Post-registration welcome (only when ?welcome=CALLSIGN) */}
      <PacketWelcomeBanner />

      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <span className="text-amber-400 font-bold">The 2026 Invitational</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/documents/invitational-competitor-packet.pdf"
              download="Subsonic-Society-2026-Competitor-Packet.pdf"
              className="px-3.5 py-2 rounded-lg text-sm font-black bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Packet</span>
            </a>
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

      {/* Hero Section — Matches Page 1 of PDF + Allen's Exact Updates */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/10">
        <div className="absolute inset-0 bg-carbon-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-black tracking-wider uppercase bg-amber-500 text-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-4 h-4 fill-black" />
              Presented by Modacam Custom Rifles
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono tracking-wider uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
              November 13–15, 2026 | The Hideout | Bristol, Tennessee
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-heading">
                Subsonic Society Invitational <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  Money Match — 2026 Competitor Packet
                </span>
              </h1>
              <p className="max-w-3xl text-base sm:text-lg text-slate-200 leading-relaxed font-sans">
                Presented by Modacam Custom Rifles • November 13–15, 2026 | The Hideout | Bristol, Tennessee
              </p>
            </div>

            <a
              href="/documents/invitational-competitor-packet.pdf"
              download="Subsonic-Society-2026-Competitor-Packet.pdf"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Packet</span>
            </a>
          </div>

          {/* Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                Match Dates
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-1">November 13–15, 2026</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                Match Property
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-1">111 Hwy 44</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">Bristol, TN</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Host
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-1">Subsonic Society</div>
              <div className="text-xs sm:text-sm text-emerald-400 font-medium mt-0.5">
                Founder: Allen Hurley
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Match Format
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">12 Main Event Stages</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Followed by 2 Side Matches
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jump Navigation */}
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono">
            <a
              href="#welcome"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Welcome
            </a>
            <a
              href="#bristol"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Bristol TN/VA
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
              Where to Stay
            </a>
            <a
              href="#dining"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Places to Eat
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
              Trout Fishing
            </a>
            <a
              href="#notes"
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-200 border border-white/5 hover:border-amber-500/30 transition-all text-center flex items-center justify-center font-semibold"
            >
              Quick Notes
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* SECTION 1: Welcome to the Invitational (Verbatim from Page 1 of PDF) */}
        <section id="welcome" className="scroll-mt-24 space-y-6">
          <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden">
            <div className="space-y-6 relative z-10 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Welcome to the Invitational
              </h2>

              <div className="border-l-2 border-amber-500/50 pl-4 sm:pl-6 space-y-4 text-slate-100 text-base sm:text-lg leading-relaxed font-serif">
                <p className="font-bold text-white not-italic">Competitors,</p>
                <p>
                  On behalf of Subsonic Society, welcome to Bristol and thank you for accepting the Invitational Challenge. This match was created to bring outstanding rimfire competitors together, remove the ordinary barriers, raise the level of competition and build an experience worthy of the shooters who earned an invitation.
                </p>
                <p>
                  You are part of a limited field coming to The Hideout for a weekend of serious competition, great people and a little fun along the way. We have worked hard to make the Invitational different - challenging stages, a meaningful cash purse, dedicated staff and spotters, hospitality, and an atmosphere where the competitors are the focus. We are proud to have Modacam Custom Rifles as the presenting sponsor of the Subsonic Society Invitational Money Match.
                </p>
                <p>
                  Bristol is home for us, and I want you and anyone traveling with you to enjoy it while you are here. This packet gives you a quick guide to the match weekend, lodging, downtown dining and some of the things that make Bristol, Tennessee and Bristol, Virginia special.
                </p>
                <p>
                  Most importantly, thank you for accepting the challenge and helping us build something special. We look forward to welcoming you to Bristol and seeing you on the range.
                </p>
              </div>

              <div className="pt-3 space-y-1 border-t border-white/10 text-sm sm:text-base">
                <div className="font-bold text-amber-400">Said. Done.</div>
                <div className="font-bold text-white">Allen Hurley</div>
                <div className="text-slate-300">Founder, Subsonic Society</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Welcome to Bristol, Tennessee & Bristol, Virginia (Verbatim from Page 2 of PDF) */}
        <section id="bristol" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Welcome to Bristol, Tennessee &amp; Bristol, Virginia
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-4xl">
            <p>
              Bristol is a true two-state city in the Appalachian Mountains. Historic State Street follows the Tennessee-Virginia line through downtown, giving visitors the unusual opportunity to stand with one foot in Tennessee and one foot in Virginia at the same time beneath the iconic Bristol sign. Downtown blends local restaurants, live music, shops, historic architecture and Bristol&apos;s nationally recognized music heritage.
            </p>
            <p>
              The area is also known for motorsports, outdoor recreation and entertainment - from Bristol Motor Speedway and Bristol Dragway to Hard Rock Hotel &amp; Casino Bristol, South Holston Lake and the South Holston River. Bristol is the official Birthplace of Country Music, and the downtown museum tells the story of the historic 1927 Bristol Sessions.
            </p>
          </div>
        </section>

        {/* SECTION 3: Invitational Weekend Schedule */}
        <section id="schedule" className="scroll-mt-24 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Invitational Weekend Schedule
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Schedule is subject to change. Final adjustments will be communicated to competitors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-black text-white">Friday — Nov. 13</h3>
              </div>
              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200">
                <li>Range open 12–5</li>
                <li>Registration and sight in only</li>
              </ul>
            </div>

            {/* Saturday */}
            <div className="rounded-2xl bg-white/[0.02] border border-amber-500/30 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Saturday — Nov. 14</h3>
                <span className="px-2.5 py-1 rounded bg-amber-500 text-black text-xs font-black uppercase font-mono">
                  Main Event
                </span>
              </div>
              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200">
                <li>Open 7am</li>
                <li>Registration and sight in until 8:30</li>
                <li>Shooter brief 8:30</li>
                <li>First shot 9am</li>
                <li className="font-bold text-amber-400">8 stages (Main Event) — lunch and dinner provided</li>
              </ul>
            </div>

            {/* Sunday */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Sunday — Nov. 15</h3>
                <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold">
                  Main Event + Side Matches
                </span>
              </div>
              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200">
                <li>Open 7am</li>
                <li>7–8:30 sight in</li>
                <li>Shooter brief 8:30</li>
                <li>First shot 9am</li>
                <li className="font-bold text-amber-400">4 stages (Main Event)</li>
                <li className="font-bold text-emerald-400">2 side matches following the main event</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: Where to Stay (Verbatim from Page 3 of PDF) */}
        <section id="hotels" className="scroll-mt-24 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Where to Stay
            </h2>
            <p className="text-base text-slate-200 max-w-4xl leading-relaxed">
              Match property: 111 Hwy 44, Bristol, TN. Additional directions and arrival details will be sent to competitors before match weekend. All listed hotels are generally about a 10-15 minute drive to The Hideout. There are also many Airbnb and VRBO rentals close to the range and throughout the Bristol area, so check Airbnb and VRBO for current availability - especially for groups, cabins, extra parking or longer stays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOTELS_DATA.map((h, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-300">
                    <span>{h.city}</span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Car className="w-3.5 h-3.5" />
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
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{h.phone}</span>
                  </a>

                  <a
                    href={h.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/25 text-xs sm:text-sm font-mono font-bold transition-all"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
            <strong className="text-white">LODGING NOTE:</strong> All listed hotels are generally a 10-15 minute drive to The Hideout. Downtown Bristol hotels are especially convenient to the restaurants, shops and entertainment along State Street. Airbnb and VRBO also have many nearby homes, cabins and group rentals - check both for availability.
          </p>
        </section>

        {/* SECTION 5: Downtown Bristol - Places to Eat (Verbatim from Page 3 of PDF + Public House) */}
        <section id="dining" className="scroll-mt-24 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Downtown Bristol - Places to Eat
            </h2>
            <p className="text-base text-slate-200 max-w-4xl leading-relaxed">
              Downtown Bristol is walkable on both sides of the Tennessee-Virginia state line and has plenty of good places to eat, drink and relax after the match. The downtown Bristol hotels are especially convenient to the restaurants, shops and nightlife. Hours and reservations can change, so check before heading out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DINING_DATA.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5"
              >
                <h4 className="text-lg font-bold text-white">{item.name}</h4>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Bristol Attractions & Things to Do (Verbatim from Page 4 of PDF) */}
        <section id="attractions" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Bristol Attractions &amp; Things to Do
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ATTRACTIONS_DATA.map((att, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5"
              >
                <h4 className="text-lg font-bold text-white">{att.title}</h4>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {att.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: Worth an Extra Day: South Holston River Trout Fishing (Verbatim from Page 4 of PDF) */}
        <section id="fishing" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Worth an Extra Day: South Holston River Trout Fishing
          </h2>
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 max-w-4xl">
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
              <strong className="text-white">
                The South Holston River is one of the region&apos;s premier trout fisheries and is widely regarded among the best fly-fishing waters in the East.
              </strong>{" "}
              Cold water released from South Holston Dam supports strong brown and rainbow trout populations, and local guides offer half-day and full-day trips. During the Invitational dates, designated spawning sections may be seasonally closed, so check current Tennessee fishing regulations and TVA generation schedules before fishing.
            </p>
          </div>
        </section>

        {/* SECTION 8: Quick Notes for Competitors & Event Info (Verbatim from Page 4 of PDF + Allen's Exact Updates) */}
        <section id="notes" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Quick Notes for Competitors
          </h2>

          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 max-w-4xl text-sm sm:text-base text-slate-200">
            <ul className="list-disc pl-5 space-y-2.5 leading-relaxed">
              <li>
                Historic downtown Bristol is an easy place to combine dinner, shopping and sightseeing in one stop.
              </li>
              <li>
                Bristol spans two states, so your hotel, dinner and evening entertainment may move you back and forth between Tennessee and Virginia.
              </li>
              <li>
                Additional directions to 111 Hwy 44 and competitor arrival instructions will be sent before match weekend.
              </li>
              <li>
                Plan to spend Saturday evening at The Hideout, and leave room in your Sunday schedule for the two cash side matches after the main event.
              </li>
              <li>
                For sightseeing or fishing plans, confirm seasonal hours, reservations and operating schedules before leaving the hotel.
              </li>
              <li>50 yard, 100 yard, and 200 yard zero available.</li>
              <li>Eye and ear protection is recommended at all times.</li>
            </ul>
          </div>

          <div className="pt-2 text-center sm:text-left">
            <p className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400">
              COME FOR THE MATCH. STAY FOR THE EXPERIENCE. DISCOVER BRISTOL.
            </p>
          </div>

          {/* Event Director Contact */}
          <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="text-xs sm:text-sm font-mono text-slate-300 uppercase tracking-wider font-semibold">
                Event Director
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Allen Hurley • Subsonic Society
              </div>
              <div className="text-sm sm:text-base text-slate-300">
                111 Hwy 44, Bristol, TN 37620
              </div>
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
