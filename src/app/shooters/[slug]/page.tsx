import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import {
  Trophy,
  Target,
  Crosshair,
  Award,
  Quote,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Camera,
  MapPin,
  ExternalLink,
  MessageSquare,
  Users,
  Radio,
  FileCheck
} from "lucide-react";
import { ShooterProfile } from "@/lib/types";

interface PageProps {
  params: {
    slug: string;
  };
}

// Fallback seed shooters
const SEED_SHOOTERS: ShooterProfile[] = [
  {
    id: "wyatt-sterling",
    name: "Wyatt 'Ghost' Sterling",
    callsign: "GHOST",
    division: "Open Division Pro",
    ranking: "National Rank #4 • Appalachian Cup 1st Place",
    homeRange: "Holston Range, Bristol, TN",
    podiums: 14,
    featuredMatch: "The Subsonic Society Invitational 2026",
    image: "/assets/subsonic-coin.jpg",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "In the Bristol mountains, the wind never blows the same way two seconds in a row. You have to trust your bubble level, watch the trees along the hollow, and commit to the shot.",
    accolades: ["TEAM USA 🇺🇸", "NATIONAL RANK #4", "APPALACHIAN CUP 1ST"],
    sponsors: ["Modacam Custom Rifles", "Vudoo Gun Works", "Lapua", "ZCO", "MDT"],
    rifleSetup: {
      action: "Vudoo Gun Works V-22 (3-Lug Rimfire)",
      barrel: "Bartlein MTU 20\" Match (1:16 Twist)",
      trigger: "Bix'n Andy TacSport PRO (4.2 oz)",
      chassis: "MDT ACC Elite Chassis with Titanium Weights",
      optic: "Zero Compromise Optic ZC527 MPCT3X",
      mount: "Spuhr QDP-4002 0 MOA with Level",
      tuner: "Harrell Precision Custom Rimfire Tuner",
      ammoLot: "Lapua Center-X Lot #32187 (1,062 FPS)",
    },
    interview: [
      {
        question: "How do you read mirage on targets past 300 yards in the Tennessee high country?",
        answer: "I back my magnification down from 25x to around 16x. High mag over-exaggerates boiling heat shimmer and makes the steel dance. By backing off, I can see the horizontal boil direction clearly and hold the true center of the plate."
      },
      {
        question: "What is your pre-match lot testing routine?",
        answer: "I clean down to bare metal with Bore Tech Rimfire Blend, shoot 30 rounds of the test lot to season the wax lubricant in the bore, and then fire three consecutive 10-shot groups through a Garmin Xero chronograph. If the SD is over 6 fps, it becomes practice ammo."
      }
    ],
    createdAt: "2026-08-01T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "kendra-cross",
    name: "Kendra 'Coldbore' Cross",
    callsign: "COLDBORE",
    division: "Open Rimfire Pro",
    ranking: "Southeast Regional Champion • Top Lady Marksman",
    homeRange: "Smoky Mountain Precision, TN",
    podiums: 19,
    featuredMatch: "300X Long Gong Challenge",
    image: "/assets/subsonic-logo-dark.png",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "Subsonic rimfire is pure shooting discipline. Without recoil to mask your flaws, every breath and trigger press is written directly onto the steel plate.",
    accolades: ["TOP LADY MARKSMAN 🥇", "SOUTHEAST CHAMPION", "19 PODIUMS"],
    sponsors: ["Modacam Custom Rifles", "RimX", "Tangent Theta", "Foundation Stocks"],
    rifleSetup: {
      action: "Zermatt RimX Precision Rimfire Action",
      barrel: "Proof Research Competition Contour 22\"",
      trigger: "TriggerTech Diamond Single-Stage (6 oz)",
      chassis: "Foundation Revelation Heavy Stock (Dark Distressed)",
      optic: "Tangent Theta TT525P Gen 3XR",
      mount: "Hawkins Precision Ultra Light Tactical",
      tuner: "Harrell Harmonic Tuner",
      ammoLot: "SK Long Range Match Lot #8821 (1,055 FPS)",
    },
    interview: [
      {
        question: "What is your mindset when shooting in sudden wind shifts?",
        answer: "Trust the DOPE and make decisive calls. A quick, committed hold is ten times better than second-guessing while the wind flag flips."
      }
    ],
    createdAt: "2026-08-15T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "eli-mcallister",
    name: "Eli 'Dialed' McAllister",
    callsign: "DIALED",
    division: "Production Division",
    ranking: "Appalachian Cup Production 1st",
    homeRange: "Tri-Cities Rimfire Club, Bristol, TN",
    podiums: 8,
    featuredMatch: "200X Mountain Match",
    image: "/assets/subsonic-logo-round.png",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "You don't need a $10,000 custom rig to win if you master stage timing, barricade stability, and find a lot of ammunition your factory barrel loves.",
    accolades: ["PRODUCTION CLASS 1ST", "8 PODIUMS", "FACTORY CZ CHAMPION"],
    sponsors: ["Vortex Optics", "MDT", "SK Ammunition"],
    rifleSetup: {
      action: "CZ 457 MTR (Match Target Rifle Factory Tuned)",
      barrel: "Factory 20.5\" Match Chamber Cold Hammer Forged",
      trigger: "Yo-Dave Spring Mod (12 oz)",
      chassis: "MDT XRS Hybrid Chassis",
      optic: "Vortex Venom 5-25x56 FFF EBR-7C",
      mount: "Vortex Pro Series 34mm Medium Rings",
      tuner: "Factory Thread Protector",
      ammoLot: "SK Rifle Match Lot #4491 (1,068 FPS)",
    },
    interview: [
      {
        question: "What advice do you give to shooters entering production division?",
        answer: "Spend 80% of your initial budget on ammunition testing and a solid rear bag. A factory rifle with an ammo lot it loves will outshoot a high-dollar custom rig with random bulk ammo all day long."
      }
    ],
    createdAt: "2026-09-01T12:00:00Z",
    status: "PUBLISHED",
  },
  {
    id: "allen-hurley",
    name: "Allen Hurley",
    callsign: "ALLEN",
    division: "Owner Admin / Executive",
    ranking: "Founder • The Subsonic Society",
    homeRange: "The Hideout, Bristol, TN",
    podiums: 12,
    featuredMatch: "Subsonic Society Invitational Money Match 2026",
    image: "/assets/subsonic-coin.jpg",
    actionPhoto: "/assets/subsonic-coin.jpg",
    quote: "We built The Hideout because rimfire precision deserves a home that doesn't cut corners. Two hundred and twenty acres of Tennessee ridgeline purpose-built for marksmen who take this game seriously. Said. Done.",
    accolades: ["FOUNDER 👑", "MATCH HOST", "EXECUTIVE RO"],
    sponsors: ["Modacam Custom Rifles", "Subsonic Society"],
    rifleSetup: {
      action: "Modacam Custom Precision V-22 Rimfire",
      barrel: "22\" Custom Fluted Match Contour",
      trigger: "TriggerTech Diamond Pro Curved (5 oz)",
      chassis: "MDT ACC Elite Carbon Inlay Custom",
      optic: "Zero Compromise Optic ZC527",
      mount: "Spuhr 36mm Unimount",
      tuner: "Modacam Custom Harmonic Brake",
      ammoLot: "Lapua Center-X Hand-Sorted (1,064 FPS)",
    },
    interview: [
      {
        question: "What was the vision behind The Hideout complex in Bristol?",
        answer: "To bring together the best shooters in the country onto terrain that tests real wind reading and elevation, while providing hospitality, live scoring, and community that the sport has been missing."
      }
    ],
    createdAt: "2026-07-01T12:00:00Z",
    status: "PUBLISHED",
  }
];

function getShooterBySlug(slug: string): ShooterProfile | null {
  const DATA_DIR = path.join(process.cwd(), "data");
  const SHOOTERS_FILE = path.join(DATA_DIR, "shooters.jsonl");

  let allShooters: ShooterProfile[] = [...SEED_SHOOTERS];

  try {
    if (fs.existsSync(SHOOTERS_FILE)) {
      const raw = fs.readFileSync(SHOOTERS_FILE, "utf-8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      const parsed = lines
        .map((l) => {
          try {
            return JSON.parse(l) as ShooterProfile;
          } catch {
            return null;
          }
        })
        .filter((s): s is ShooterProfile => s !== null);

      const map = new Map<string, ShooterProfile>();
      for (const s of SEED_SHOOTERS) map.set(s.id.toLowerCase(), s);
      for (const s of parsed) map.set(s.id.toLowerCase(), s);
      allShooters = Array.from(map.values());
    }
  } catch (err) {
    console.error("Error loading shooters:", err);
  }

  const cleanSlug = slug.toLowerCase().trim();
  return (
    allShooters.find(
      (s) =>
        s.id.toLowerCase() === cleanSlug ||
        s.callsign.toLowerCase() === cleanSlug ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
    ) || null
  );
}

// Generate dynamic metadata for maximum SEO & AI SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const shooter = getShooterBySlug(params.slug);

  if (!shooter) {
    return {
      title: "Marksman Profile Not Found | Subsonic Society",
      description: "The requested competitor profile could not be located in the Subsonic Society marksman database.",
    };
  }

  const pageTitle = `${shooter.name} (${shooter.callsign}) — Pro Marksman Profile | Subsonic Society`;
  const pageDesc = `${shooter.name} [${shooter.callsign}] is a ${shooter.division} competitor with ${shooter.podiums} career podiums. Rifle rig: ${shooter.rifleSetup.action}, ${shooter.rifleSetup.optic}, ${shooter.rifleSetup.chassis}. Home range: ${shooter.homeRange}.`;
  const canonicalUrl = `https://subsonic-omega.vercel.app/shooters/${shooter.id}`;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      shooter.name,
      shooter.callsign,
      shooter.division,
      "Subsonic Society",
      "Precision Rimfire",
      "PRS Rimfire",
      shooter.rifleSetup.action,
      shooter.rifleSetup.optic,
      shooter.homeRange,
      "The Hideout Bristol TN",
      ...shooter.accolades,
      ...shooter.sponsors,
    ],
    authors: [{ name: shooter.name }],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "The Subsonic Society",
      images: [
        {
          url: shooter.image.startsWith("http")
            ? shooter.image
            : `https://subsonic-omega.vercel.app${shooter.image}`,
          width: 1200,
          height: 630,
          alt: `${shooter.name} Marksman Profile`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [
        shooter.image.startsWith("http")
          ? shooter.image
          : `https://subsonic-omega.vercel.app${shooter.image}`,
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ShooterDetailPage({ params }: PageProps) {
  const shooter = getShooterBySlug(params.slug);

  if (!shooter) {
    notFound();
  }

  // Schema.org Person & Athlete Structured Data for Google Knowledge Graph & AI Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: shooter.name,
    alternateName: shooter.callsign,
    description: shooter.quote,
    image: shooter.image.startsWith("http")
      ? shooter.image
      : `https://subsonic-omega.vercel.app${shooter.image}`,
    jobTitle: shooter.division,
    memberOf: {
      "@type": "SportsOrganization",
      name: "The Subsonic Society",
      url: "https://subsonic-omega.vercel.app",
    },
    award: shooter.accolades,
    sponsor: shooter.sponsors.map((sp) => ({
      "@type": "Organization",
      name: sp,
    })),
    knowsAbout: [
      "Precision Rimfire Shooting",
      "Extreme Long Range Subsonic Ballistics",
      shooter.division,
      shooter.rifleSetup.action,
      shooter.rifleSetup.optic,
      shooter.rifleSetup.chassis,
    ],
    workLocation: {
      "@type": "Place",
      name: shooter.homeRange,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bristol",
        addressRegion: "TN",
        addressCountry: "US",
      },
    },
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/shooters" className="hover:text-white transition-colors">Marksmen Directory</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">{shooter.callsign}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/shooters"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Marksmen</span>
            </Link>

            <Link
              href="/chat"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:brightness-110 text-black transition-all flex items-center gap-1.5 shadow-tactical-glow"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-black" />
              <span>Squad Comms</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* HERO DOSSIER CARD */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-amber-500/40 shadow-2xl overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Photo + Identity + Podiums */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Image with Tactical Ring */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-black relative shrink-0">
                <img
                  src={shooter.image}
                  alt={shooter.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity & Badges */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-wider">
                    CALLSIGN: {shooter.callsign}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono">
                    {shooter.division}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED PRO</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  {shooter.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-300 pt-0.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{shooter.ranking}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{shooter.homeRange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Podiums Metric Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center sm:text-right shrink-0 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center sm:justify-end gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Career Podiums</span>
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                {shooter.podiums}
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                Verified Match Finishes
              </div>
            </div>
          </div>

          {/* Accolades Bar */}
          {shooter.accolades && shooter.accolades.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Official Match Accolades & Honours
              </span>
              <div className="flex flex-wrap gap-2">
                {shooter.accolades.map((acc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{acc}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {shooter.quote && (
            <div className="relative p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/10 italic text-slate-200 text-sm sm:text-base leading-relaxed font-serif">
              <Quote className="w-8 h-8 text-amber-500/30 absolute top-4 right-4 pointer-events-none" />
              &ldquo;{shooter.quote}&rdquo;
            </div>
          )}
        </div>

        {/* SECTION 2: VERIFIED EQUIPMENT BLUEPRINT */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Crosshair className="w-4 h-4" />
              <span>Ballistic & Hardware Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
              Competition Rifle Rig Specifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Verified component configuration fielded by {shooter.name} in Appalachian match conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Action</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.action}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Barrel & Twist</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.barrel}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Trigger Pull</span>
              <div className="text-sm font-bold text-amber-400 leading-snug">{shooter.rifleSetup.trigger}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Chassis / Stock</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.chassis}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Optic & Reticle</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.optic}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Scope Mount</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.mount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Harmonic Tuner</span>
              <div className="text-sm font-bold text-white leading-snug">{shooter.rifleSetup.tuner || "Precision Tuner"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Match Ammo & Velocity</span>
              <div className="text-sm font-bold text-emerald-400 leading-snug">{shooter.rifleSetup.ammoLot}</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SPONSORS & FACTORY ALLIANCES */}
        {shooter.sponsors && shooter.sponsors.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                Industry Endorsements
              </div>
              <h3 className="text-lg font-black text-white">Official Factory & Gear Partners</h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {shooter.sponsors.map((sp, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-2 hover:border-amber-400/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sp}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: ACTION PHOTO & TECHNICAL INTERVIEW */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Photo Showcase */}
          {shooter.actionPhoto && (
            <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Rifle Rig in Action</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">The Hideout Bay</span>
              </div>

              <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/10 relative bg-black">
                <img
                  src={shooter.actionPhoto}
                  alt={`${shooter.name} in competition`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Match Strategy & Technical Q&A */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Technical Interview & Wind Strategy</span>
              </div>

              {shooter.interview && shooter.interview.length > 0 ? (
                shooter.interview.map((qa, index) => (
                  <div key={index} className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                    <h4 className="text-xs font-bold text-amber-400 font-mono">
                      Q: {qa.question}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      &ldquo;{qa.answer}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400">
                  Technical interview dossier pending range verification.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <span>MEMBER PROFILE: {shooter.callsign}</span>
              <Link
                href="/chat"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <span>Connect in Squad Comms</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
