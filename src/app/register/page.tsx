"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Flame,
  Target,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Printer,
  Download,
  Share2,
  CreditCard,
  Apple,
  Award,
  Sparkles,
  ChevronRight,
  Crosshair,
  User,
  Users,
  Phone,
  Mail,
  Sliders,
  Check,
  Radio,
  FileText
} from "lucide-react";
import { INITIAL_MATCHES } from "@/lib/initial-data";
import { MatchEvent } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { recordTelemetryEvent } from "@/lib/telemetry";

const DIVISIONS = [
  {
    id: "OPEN",
    name: "Open Division Pro",
    fee: 275,
    badge: "OPEN PRO",
    desc: "Unlimited custom rimfire rigs, any optic, weight, or chassis configuration.",
    popular: true,
  },
  {
    id: "PRODUCTION",
    name: "Production Division",
    fee: 275,
    badge: "PRODUCTION",
    desc: "Factory rifle & optic combined MSRP under $1,200. Pure fundamentals test.",
    popular: false,
  },
  {
    id: "SENIOR",
    name: "Senior Division (55+)",
    fee: 275,
    badge: "SENIOR 55+",
    desc: "Master class shooters age 55 and older across all course stages.",
    popular: false,
  },
  {
    id: "LADIES",
    name: "Ladies Rimfire Pro",
    fee: 275,
    badge: "LADIES PRO",
    desc: "Competitive women's championship division for the Appalachian Cup.",
    popular: false,
  },
  {
    id: "YOUTH",
    name: "Junior / Youth Division",
    fee: 195,
    badge: "JUNIOR",
    desc: "Shooters under age 18 accompanied by an adult coach or parent.",
    popular: false,
  },
];

const ADDONS = [
  {
    id: "logbook",
    title: "Weatherproof DOPE & Match Logbook",
    desc: "Rite-in-the-Rain all-weather match journal with pre-formatted 50-400 yard DOPE grids.",
    price: 22,
  },
  {
    id: "jersey",
    title: "Subsonic Technical Competition Jersey",
    desc: "Breathable UPF 50+ match jersey with official society emblem and division patch.",
    price: 45,
  },
  {
    id: "chrono",
    title: "Official Doppler Radar Truing Slot",
    desc: "Pre-match LabRadar chronograph muzzle velocity trueing and standard deviation card.",
    price: 20,
  },
];

const SQUADS = [
  { id: "squad-1", name: "Squad 1", flight: "Morning (07:30 AM)", capacity: 10, filled: 9, lead: "Wyatt Sterling (Ghost)" },
  { id: "squad-2", name: "Squad 2", flight: "Morning (07:30 AM)", capacity: 10, filled: 8, lead: "Dustin Cole (Zero)" },
  { id: "squad-3", name: "Squad 3", flight: "Morning (07:30 AM)", capacity: 10, filled: 6, lead: "Eli McAllister (Dialed)" },
  { id: "squad-4", name: "Squad 4", flight: "Morning (07:30 AM)", capacity: 10, filled: 7, lead: "Kendra Cross (Coldbore)" },
  { id: "squad-5", name: "Squad 5", flight: "Afternoon (12:00 PM)", capacity: 10, filled: 8, lead: "Garrett Vance (MD)" },
  { id: "squad-6", name: "Squad 6", flight: "Afternoon (12:00 PM)", capacity: 10, filled: 5, lead: "Mason Brooks (Dope)" },
  { id: "squad-7", name: "Squad 7", flight: "Afternoon (12:00 PM)", capacity: 10, filled: 6, lead: "Sarah Jenkins (Apex)" },
  { id: "squad-8", name: "Squad 8", flight: "Afternoon (12:00 PM)", capacity: 10, filled: 4, lead: "Tyler Ross (Trigger)" },
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const matchIdParam = searchParams.get("match") || "match-001";

  const [selectedMatch, setSelectedMatch] = useState<MatchEvent>(
    INITIAL_MATCHES.find((m) => m.id === matchIdParam) || INITIAL_MATCHES[0]
  );
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0].id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Shooter Info
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cityState, setCityState] = useState("");
  const [sanctionId, setSanctionId] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Rifle Spec
  const [rifleModel, setRifleModel] = useState("Vudoo V-22 / Bartlein MTU");
  const [optic, setOptic] = useState("Zero Compromise ZC527 5-27x56");
  const [ammoLot, setAmmoLot] = useState("Lapua Center-X (1,062 FPS)");
  const [muzzleDevice, setMuzzleDevice] = useState("Harrell Tuner / Dead Air Mask");

  // Squadding
  const [selectedSquad, setSelectedSquad] = useState("squad-3");
  const [flightPreference, setFlightPreference] = useState("MORNING");
  const [squaddingPartner, setSquaddingPartner] = useState("");
  const [shirtSize, setShirtSize] = useState("L");

  // Agreements
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [coldRangeAgreed, setColdRangeAgreed] = useState(false);

  // Submitting / Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationReceipt, setRegistrationReceipt] = useState<any | null>(null);

  // Load saved profile if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("subsonic_shooter_profile");
        if (saved) {
          const profile = JSON.parse(saved);
          if (profile.name) setName(profile.name);
          if (profile.callsign) setCallsign(profile.callsign);
          if (profile.rifleSetup) setRifleModel(profile.rifleSetup);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  // Update match when param changes
  useEffect(() => {
    const match = INITIAL_MATCHES.find((m) => m.id === matchIdParam);
    if (match) setSelectedMatch(match);
  }, [matchIdParam]);

  // Pricing calculations
  const divisionPrice = DIVISIONS.find((d) => d.id === selectedDivision)?.fee || 275;
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const item = ADDONS.find((a) => a.id === addonId);
    return acc + (item ? item.price : 0);
  }, 0);
  const totalPrice = divisionPrice + addonsTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      if (!name || !email) {
        alert("Please enter competitor name and email address.");
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 4) {
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCompleteRegistration = async (paymentMethod = "APPLE_PAY") => {
    if (!waiverAgreed || !coldRangeAgreed) {
      alert("Please accept the Range Safety & Cold Range liability waivers to confirm registration.");
      return;
    }

    setIsSubmitting(true);

    const ticketNumber = `SS-2026-${selectedMatch.location.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const squadInfo = SQUADS.find((s) => s.id === selectedSquad);

    const registrationData = {
      id: "reg_" + Date.now().toString(36),
      ticketNumber,
      matchId: selectedMatch.id,
      matchTitle: selectedMatch.title,
      matchDate: selectedMatch.date,
      location: selectedMatch.location,
      competitorName: name,
      competitorCallsign: callsign || "PRO",
      competitorEmail: email,
      competitorPhone: phone,
      division: selectedDivision,
      squadName: squadInfo?.name || "Squad 1",
      flight: squadInfo?.flight || "Morning Flight",
      rifleModel,
      optic,
      ammoLot,
      shirtSize,
      addons: selectedAddons,
      totalAmount: totalPrice,
      paymentMethod,
      registeredAt: new Date().toISOString(),
    };

    // 1. Record telemetry
    recordTelemetryEvent({
      eventType: "action",
      targetElement: "competitor_registration_complete",
      targetCategory: "Registration",
      pageRoute: "/register",
      targetText: `Match: ${selectedMatch.id} | Shooter: ${name} | Total: $${totalPrice}`,
    });

    // 2. Persist to server API and durable JSONL storage
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: registrationData.ticketNumber,
          matchId: selectedMatch.id,
          matchTitle: selectedMatch.title,
          competitorName: name,
          competitorCallsign: callsign,
          competitorEmail: email,
          competitorPhone: phone,
          rifleDivision: selectedDivision,
          squadName: squadInfo?.name || "Squad 1",
          squadFlight: squadInfo?.flight || "Morning",
          rifleModel: rifleModel,
          optic: optic,
          ammoLot: ammoLot,
          addons: selectedAddons,
          totalPrice: totalPrice,
          paymentStatus: "PAID",
        }),
      });
    } catch (apiErr) {
      console.warn("API registration persist warning:", apiErr);
    }

    // 3. Persist to Supabase Database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("registrations").insert([
          {
            match_id: selectedMatch.id,
            competitor_name: name,
            competitor_email: email,
            rifle_division: selectedDivision,
            squad_flight: `${squadInfo?.name} (${squadInfo?.flight})`,
            rifle_model: `${rifleModel} | ${optic} | ${ammoLot}`,
          },
        ]);

        // Increment registered count in matches table if exists
        await supabase
          .from("matches")
          .update({ registered_count: selectedMatch.registeredCount + 1 })
          .eq("id", selectedMatch.id);
      } catch (err) {
        console.warn("Supabase registration persist note:", err);
      }
    }

    // 3. Save to localStorage for instant offline access
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("subsonic_competitor_registrations") || "[]");
        localStorage.setItem("subsonic_competitor_registrations", JSON.stringify([registrationData, ...existing]));
      } catch {
        // Fallback
      }
    }

    setIsSubmitting(false);
    setRegistrationReceipt(registrationData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportICS = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Subsonic Society//Competitor Registration Ticket//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${selectedMatch.title}`,
      `DESCRIPTION:Official Competitor Pass: ${registrationReceipt?.ticketNumber}\\nCompetitor: ${name} [${callsign}]\\nSquad: ${registrationReceipt?.squadName}\\nStages: 18\\nRange Location: ${selectedMatch.locationDetails}`,
      `LOCATION:${selectedMatch.locationDetails}`,
      "DTSTART:20261017T120000Z",
      "DTEND:20261018T220000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Subsonic-Pass-${registrationReceipt?.ticketNumber || "Ticket"}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div data-section="registration" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <span>/</span>
        <Link href="/calendar" className="hover:text-amber-400">Competitions</Link>
        <span>/</span>
        <span className="text-amber-400">Official Match Registration</span>
      </div>

      {/* SUCCESS CONFIRMATION RECEIPT SCREEN */}
      {registrationReceipt ? (
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-emerald-500/40 shadow-tactical-glow space-y-8 animate-fadeIn">
          {/* Top Success Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              OFFICIAL ENTRY CONFIRMED & SQUAD RESERVED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              YOU&apos;RE ON THE SQUAD LINE, COMPETITOR!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Your registration is locked in for the <strong>{registrationReceipt.matchTitle}</strong>. An official confirmation email with range coordinates and check-in times has been routed to <strong>{registrationReceipt.competitorEmail}</strong>.
            </p>
          </div>

          {/* OFFICIAL DIGITAL COMPETITOR BADGE / CREDENTIAL PASS */}
          <div className="max-w-xl mx-auto rounded-3xl bg-gradient-to-b from-[#121622] to-black border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Credential Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
                  SS
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white tracking-wider">SUBSONIC SOCIETY</div>
                  <div className="text-[10px] font-mono text-amber-400">OFFICIAL COMPETITOR CREDENTIAL</div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-400">PASS NO.</div>
                <div className="text-xs font-bold text-emerald-400">{registrationReceipt.ticketNumber}</div>
              </div>
            </div>

            {/* Competitor & Rig Details */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">COMPETITOR</span>
                <div className="font-bold text-white text-sm">{registrationReceipt.competitorName}</div>
                <div className="text-amber-400 font-bold text-xs">[{registrationReceipt.competitorCallsign}]</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase">DIVISION</span>
                <div className="text-xs font-bold text-white">{registrationReceipt.division}</div>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                  VERIFIED
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase">SQUAD ASSIGNMENT</span>
                <div className="font-bold text-cyan-300">{registrationReceipt.squadName}</div>
                <div className="text-[10px] text-slate-400">{registrationReceipt.flight}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase">MATCH LOCATION</span>
                <div className="text-white text-xs font-semibold">{selectedMatch.location}</div>
                <div className="text-[10px] text-slate-400">Elev: 3,420 FT</div>
              </div>
            </div>

            {/* Scannable Range Check-In QR Graphic */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  RANGE CHECK-IN QR
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Present at Pavilion 1 Chrono Station on match morning for rifle tag and squadding bib.
                </p>
              </div>

              {/* Simulated High-Tech Vector QR Graphic */}
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                  <Target className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-center text-slate-500">
              Total Entry Paid: ${registrationReceipt.totalAmount}.00 via {registrationReceipt.paymentMethod} • Non-Transferable
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportICS}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 border border-white/10 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Add to Apple / Google Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 border border-white/10 transition-all"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print Badge & Receipt</span>
            </button>

            <Link
              href="/chat"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Enter Squad Comms (#bristol-pro-shootout)</span>
            </Link>
          </div>
        </div>
      ) : (
        /* REGISTRATION MULTI-STEP WIZARD */
        <div className="space-y-6">
          {/* Top Wizard Steps Bar */}
          <div className="ios-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {[
              { num: 1, label: "Match & Division" },
              { num: 2, label: "Shooter Profile" },
              { num: 3, label: "Rifle Rig Spec" },
              { num: 4, label: "Squad Slotting" },
              { num: 5, label: "Review & Confirm" },
            ].map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
                    isCurrent
                      ? "bg-amber-500 text-black font-bold shadow-tactical-glow"
                      : isPast
                      ? "text-emerald-400 hover:text-emerald-300"
                      : "text-slate-500 pointer-events-none"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-black text-amber-400"
                      : isPast
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-white/5 text-slate-500"
                  }`}>
                    {isPast ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Current Step Content Container */}
          <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-tactical-glow space-y-8">
            {/* STEP 1: MATCH SELECTION & DIVISION */}
            {currentStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Step 1 of 5: Select Match & Division
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    CHOOSE YOUR SANCTIONED SHOOTOUT
                  </h2>
                  <p className="text-sm text-slate-300">
                    Pick your match event and select your precision rimfire rifle division.
                  </p>
                </div>

                {/* Match Cards Switcher */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {INITIAL_MATCHES.map((match) => {
                    const isSelected = selectedMatch.id === match.id;
                    return (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 shadow-tactical-glow text-white"
                            : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            {match.tier.replace("_", " ")}
                          </span>
                          <span className="text-sm font-extrabold text-white font-mono">
                            ${match.entryFee}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white line-clamp-2">{match.title}</h4>
                        <div className="text-xs text-slate-400 space-y-1 font-mono">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            <span>{match.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>{match.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Target className="w-3 h-3" />
                            <span>{match.stages} Stages • {match.roundCount} Rounds</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Division Selection Grid */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                    Choose Competition Division
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DIVISIONS.map((div) => {
                      const isSelected = selectedDivision === div.id;
                      return (
                        <div
                          key={div.id}
                          onClick={() => setSelectedDivision(div.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-400 text-white shadow-tactical-glow"
                              : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-mono font-bold text-sm flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${isSelected ? "bg-amber-400" : "bg-white/20"}`} />
                              <span>{div.name}</span>
                            </div>
                            <span className="font-mono font-bold text-xs text-amber-400">
                              ${div.fee}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {div.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Match Merchandise & Chrono Add-ons */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                    Optional Match Merchandise & Chrono Add-ons
                  </label>
                  <div className="space-y-2.5">
                    {ADDONS.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isChecked
                              ? "bg-amber-500/10 border-amber-500/40 text-white"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              isChecked ? "bg-amber-500 text-black border-amber-400" : "border-white/20"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white font-mono">{addon.title}</div>
                              <div className="text-[11px] text-slate-400">{addon.desc}</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-xs text-amber-400 shrink-0">
                            +${addon.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Footer & Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="font-mono">
                    <span className="text-xs text-slate-400">Estimated Total: </span>
                    <strong className="text-lg text-amber-400 font-bold">${totalPrice}.00</strong>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-tactical-glow flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Shooter Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SHOOTER PROFILE CREDENTIALS */}
            {currentStep === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Step 2 of 5: Competitor Identification
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    COMPETITOR CREDENTIALS & CALLSIGN
                  </h2>
                  <p className="text-sm text-slate-300">
                    Your official badge name, tactical callsign, and emergency contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Full Legal Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Wyatt Sterling"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-amber-400 font-bold">Tactical Callsign</label>
                    <input
                      type="text"
                      value={callsign}
                      onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                      placeholder="e.g. GHOST-22"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Email Address (for ticket & DOPE) *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="shooter@subsonicsociety.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Mobile Phone (Live Match Alerts) *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(423) 555-0199"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">City, State / Home Range</label>
                    <input
                      type="text"
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      placeholder="e.g. Bristol, TN / Holston Mountain Club"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">PRS / NRL22 Shooter ID (Optional)</label>
                    <input
                      type="text"
                      value={sanctionId}
                      onChange={(e) => setSanctionId(e.target.value)}
                      placeholder="e.g. PRS-2026-8812"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Emergency Contact Name & Phone</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Sarah Sterling - (423) 555-0182"
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Step 2 Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-tactical-glow"
                  >
                    <span>Proceed to Rifle Spec</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: RIFLE RIG & BALLISTIC SPEC */}
            {currentStep === 3 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Step 3 of 5: Rifle Rig & Ballistics Verification
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    EQUIPMENT & CHRONOGRAPH SPEC
                  </h2>
                  <p className="text-sm text-slate-300">
                    Logged for stage safety limits, DOPE tracking, and official match equipment breakdown.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Action & Chassis Platform *</label>
                    <input
                      type="text"
                      value={rifleModel}
                      onChange={(e) => setRifleModel(e.target.value)}
                      placeholder="e.g. Vudoo V-22 / MDT ACC Elite"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Optic Model & Reticle *</label>
                    <input
                      type="text"
                      value={optic}
                      onChange={(e) => setOptic(e.target.value)}
                      placeholder="e.g. ZCO ZC527 MPCT3X 5-27x56"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Match Ammunition & Avg Velocity *</label>
                    <input
                      type="text"
                      value={ammoLot}
                      onChange={(e) => setAmmoLot(e.target.value)}
                      placeholder="e.g. Lapua Center-X (1,062 FPS)"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Muzzle Device / Suppressor</label>
                    <input
                      type="text"
                      value={muzzleDevice}
                      onChange={(e) => setMuzzleDevice(e.target.value)}
                      placeholder="e.g. Harrell Tuner / Dead Air Mask"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <strong className="text-white">Subsonic Velocity Compliance:</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All ammunition will undergo mandatory Doppler Chronograph inspection under Pavilion 1 from 06:00 to 07:00 AM on match morning. Standard subsonic velocities only (maximum 1,120 FPS at 68°F).
                    </p>
                  </div>
                </div>

                {/* Step 3 Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-tactical-glow"
                  >
                    <span>Proceed to Squad Slotting</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SQUAD & FLIGHT SLOTTING */}
            {currentStep === 4 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Step 4 of 5: Squad & Flight Reservation
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    CHOOSE YOUR SQUAD & TIME SLOT
                  </h2>
                  <p className="text-sm text-slate-300">
                    Shoot alongside friends, team members, or squad mentors across the 18 stages.
                  </p>
                </div>

                {/* Squad Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SQUADS.map((squad) => {
                    const isSelected = selectedSquad === squad.id;
                    const spotsLeft = squad.capacity - squad.filled;
                    return (
                      <div
                        key={squad.id}
                        onClick={() => setSelectedSquad(squad.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-white shadow-tactical-glow scale-[1.02]"
                            : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-white">{squad.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            spotsLeft <= 2 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {spotsLeft} SPOTS LEFT
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Flight: <strong className="text-slate-200">{squad.flight}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Squad Lead: {squad.lead}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Preferred Squad Partner / Benchmate</label>
                    <input
                      type="text"
                      value={squaddingPartner}
                      onChange={(e) => setSquaddingPartner(e.target.value)}
                      placeholder="e.g. Kendra Cross (to shoot in same rotation)"
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Technical Jersey Size *</label>
                    <select
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">X-Large (XL)</option>
                      <option value="2XL">2X-Large (2XL)</option>
                      <option value="3XL">3X-Large (3XL)</option>
                    </select>
                  </div>
                </div>

                {/* Step 4 Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-tactical-glow"
                  >
                    <span>Proceed to Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: REVIEW, SAFETY WAIVER & INSTANT CHECKOUT */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Step 5 of 5: Safety Waiver & Checkout
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    FINAL ORDER REVIEW & CONFIRMATION
                  </h2>
                  <p className="text-sm text-slate-300">
                    Review your squad assignment, complete range safety acknowledgment, and confirm your ticket.
                  </p>
                </div>

                {/* Order Summary Box */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                      <div className="font-bold text-white text-sm">{selectedMatch.title}</div>
                      <div className="text-slate-400">{selectedMatch.date} • {selectedMatch.location}</div>
                    </div>
                    <span className="font-extrabold text-amber-400 text-base">${divisionPrice}.00</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500">COMPETITOR</span>
                      <div className="text-white font-bold">{name} [{callsign || "PRO"}]</div>
                    </div>
                    <div>
                      <span className="text-slate-500">DIVISION</span>
                      <div className="text-white font-bold">{selectedDivision}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">SQUAD</span>
                      <div className="text-cyan-300 font-bold">{SQUADS.find((s) => s.id === selectedSquad)?.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">JERSEY SIZE</span>
                      <div className="text-white font-bold">{shirtSize}</div>
                    </div>
                  </div>

                  {selectedAddons.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-slate-500 uppercase text-[10px]">SELECTED MERCHANDISE:</span>
                      {selectedAddons.map((addonId) => {
                        const item = ADDONS.find((a) => a.id === addonId);
                        return (
                          <div key={addonId} className="flex justify-between text-slate-300 text-[11px]">
                            <span>• {item?.title}</span>
                            <span className="text-amber-400">+${item?.price}.00</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-white/10 text-sm font-bold">
                    <span className="text-white">TOTAL REGISTRATION FEE:</span>
                    <span className="text-amber-400 text-lg">${totalPrice}.00</span>
                  </div>
                </div>

                {/* Safety & Liability Waivers */}
                <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-xs font-mono uppercase text-slate-300 font-bold block">
                    Mandatory Range Safety Protocols
                  </span>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={coldRangeAgreed}
                      onChange={(e) => setColdRangeAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-0 bg-black/60"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      <strong>Cold Range & Chamber Flag Rule:</strong> I agree that all rifles must have an illuminated chamber flag inserted at all times until instructed by the Range Officer on the firing line.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waiverAgreed}
                      onChange={(e) => setWaiverAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-0 bg-black/60"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      <strong>Liability & Media Waiver:</strong> I release Subsonic Society, match officials, and venue landowners from all liability and grant permission for competitive score broadcasting and event media recording.
                    </span>
                  </label>
                </div>

                {/* One-Click Instant Checkout Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting || !waiverAgreed || !coldRangeAgreed}
                    onClick={() => handleCompleteRegistration("APPLE_PAY")}
                    className="w-full py-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin">⏳ Reserving Squad Slot...</span>
                    ) : (
                      <>
                        <Apple className="w-5 h-5 fill-black" />
                        <span>Pay ${totalPrice}.00 with Apple Pay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !waiverAgreed || !coldRangeAgreed}
                    onClick={() => handleCompleteRegistration("CREDIT_CARD")}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-tactical-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin">⏳ Reserving Squad Slot...</span>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Confirm Squad Entry with Card (${totalPrice}.00)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Squads</span>
                  </button>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    256-Bit Encrypted Competitor Entry
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-24 text-center font-mono text-amber-400 space-y-2">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <div className="text-xs uppercase tracking-wider">INITIALIZING COMPETITOR REGISTRATION PORTAL...</div>
        </div>
      }
    >
      <RegisterContent />
    </React.Suspense>
  );
}
