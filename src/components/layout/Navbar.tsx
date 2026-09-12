"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Calendar, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  ExternalLink, 
  Menu, 
  X,
  Target,
  Flame,
  Radio
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/", icon: Target },
    { name: "Event Calendar", href: "/calendar", icon: Calendar },
    { name: "Competitor Chat", href: "/chat", icon: MessageSquare, badge: "AI Shield" },
    { name: "Admin Telemetry", href: "/admin", icon: Activity, badge: "Live" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <nav className="ios-glass rounded-2xl px-4 py-2.5 flex items-center justify-between border border-white/10 shadow-ios-glass">
          {/* Brand Logo */}
          <Link 
            href="/" 
            data-telemetry="nav_brand_logo"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.45)] bg-black/80 flex items-center justify-center shrink-0">
              <Image
                src="/assets/subsonic-coin.jpg"
                alt="Subsonic Society Coin"
                width={44}
                height={44}
                className="object-cover w-full h-full transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-sans">
                  SUBSONIC
                </span>
                <span className="font-bold text-xs sm:text-sm px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SOCIETY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                BRISTOL TN • PRECISION RIMFIRE
              </p>
            </div>
          </Link>

          {/* Dynamic Island: Live Competition Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-300">
              BRISTOL PRO INVITATIONAL:
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              OCTOBER 17-18
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
              465 YARDS
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  data-telemetry={`nav_link_${link.name.toLowerCase().replace(/\s+/g, "_")}`}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white shadow-sm border border-white/15"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                        link.badge === "Live"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Facebook Direct Link */}
            <a
              href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
              target="_blank"
              rel="noopener noreferrer"
              data-telemetry="nav_facebook_cta"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 hover:text-white transition-all shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>FB Feed</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>

            {/* Register Pro Button */}
            <Link
              href="/calendar"
              data-telemetry="nav_register_pro_cta"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
            >
              <Flame className="w-3.5 h-3.5 fill-black" />
              <span>Register Match</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-telemetry="nav_mobile_menu_toggle"
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 ios-glass rounded-2xl p-3 border border-white/10 shadow-2xl flex flex-col gap-1.5 animate-fadeIn">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  data-telemetry={`mobile_nav_${link.name.toLowerCase().replace(/\s+/g, "_")}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-white/15 text-white border border-white/10"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 mt-1 border-t border-white/10 flex gap-2">
              <a
                href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
                target="_blank"
                rel="noopener noreferrer"
                data-telemetry="mobile_nav_facebook_link"
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Facebook Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
