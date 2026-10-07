"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Building2, 
  Radio, 
  Calendar, 
  Clock,
  ArrowRight,
  Key
} from "lucide-react";
import { recordTelemetryEvent } from "@/lib/telemetry";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please fill out your Name, Email, and Message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          category,
          subject,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      recordTelemetryEvent({
        eventType: "action",
        targetElement: "contact_form_submitted",
        targetCategory: "Contact",
        pageRoute: "/contact",
        targetText: `Lead: ${name} | Category: ${category}`,
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Error submitting contact inquiry:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          <span>/</span>
          <span className="text-amber-400">Contact & Inquiries</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Match Directorate Comms</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              CONNECT WITH THE <br />
              <span className="amber-gradient-text">SUBSONIC SOCIETY.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Have an inquiry regarding match squad slots, hosting an Appalachian qualifier, contributing to the prize table, or submitting ammunition for Subsonic DNA chronograph testing? Transmit your dispatch below.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/invite"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-tactical-glow transition-all"
            >
              <Key className="w-4 h-4 fill-black" />
              <span>Claim Invitation Pass</span>
            </Link>
            <Link
              href="/matches"
              className="px-5 py-2.5 rounded-xl ios-glass text-white font-bold text-xs flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>View Match Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Form & Range Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Module */}
        <div className="lg:col-span-8">
          <div className="ios-glass rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 relative overflow-hidden">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-5 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  DISPATCH CONFIRMED & LOGGED
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Thank you, {name}.
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your message has been received by the Subsonic Society match directorate. We typically respond within 24 hours to <strong>{email}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName("");
                      setCompany("");
                      setEmail("");
                      setPhone("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="px-6 py-3 rounded-xl ios-glass text-white text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Send Another Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-mono">
                    <span>⚠</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Wyatt Sterling"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. shooter@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (423) 555-0192"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you with match squads, sponsorships, or range questions?"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-tactical-glow transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-black" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Key Contacts & Facility Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Facility Location Card */}
          <div className="ios-glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">The Hideout Range</h4>
                <p className="text-[11px] font-mono text-amber-400">Bristol, Tennessee</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Perched at 3,420 FT elevation on Holston Mountain. 50-meter zero bay, 18-stage barricade proving grounds, and 465-yard extreme subsonic glide canyon.
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] font-mono">
              <div className="text-slate-400">GPS COORDINATES:</div>
              <div className="text-white font-bold">36.5951° N, 82.1887° W</div>
            </div>
          </div>

          {/* Presenting Sponsor Spotlight Badge */}
          <div className="ios-glass rounded-3xl p-6 border border-amber-500/30 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                TITLE SPONSOR
              </span>
              <span className="text-[10px] font-mono text-slate-400">Custom Chambering</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center">
              <Image
                src="/assets/modacam-logo-dark.png"
                alt="MODACAM Custom Rifles"
                width={200}
                height={45}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modacam Custom Rifles is the presenting partner for the $7,500 Cash Purse Subsonic Society Invitational.
            </p>
            <Link
              href="/partners"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold hover:text-amber-300"
            >
              <span>Explore Partnership Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
