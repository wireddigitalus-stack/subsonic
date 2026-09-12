import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Radio, 
  MapPin, 
  Mountain, 
  Target, 
  ExternalLink, 
  Shield, 
  Cpu
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/70 backdrop-blur-xl mt-24 pb-20 md:pb-12 pt-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-black/60 flex items-center justify-center shrink-0">
                <Image
                  src="/assets/subsonic-coin.jpg"
                  alt="Subsonic Society Coin"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                SUBSONIC <span className="text-amber-400">SOCIETY</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Subsonic Society is a precision rimfire shooting media and community platform. We cover competitions, highlight athletes, discuss equipment, showcase venues and performance within the growing rimfire shooting sports world.
            </p>

            {/* Mountain Specs Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>Bristol, TN Ridge (3,420 FT ELEV)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>36.5951° N, 82.1887° W</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation & Competition */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Competition Hub
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/calendar"
                  data-telemetry="footer_link_calendar"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bristol Pro Shootout</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  data-telemetry="footer_link_schedule"
                  className="hover:text-white transition-colors"
                >
                  2026 Match Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  data-telemetry="footer_link_chat"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI-Moderated Comms</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  data-telemetry="footer_link_admin"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetry Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social & Facebook Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Community Media
            </h4>
            <p className="text-xs text-slate-400">
              Follow our official media feed for stage footage, match scores, and rimfire ballistics breakdowns.
            </p>
            <a
              href="https://www.facebook.com/p/Subsonic-Society-61578052196057/"
              target="_blank"
              rel="noopener noreferrer"
              data-telemetry="footer_link_facebook"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 hover:text-white text-xs font-semibold transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Subsonic Society Facebook</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>

            <div className="pt-2 text-[11px] text-slate-500">
              Strictly non-transactional sporting community adhering to all federal and state regulations.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Subsonic Society. All rights reserved. Built for Precision Rimfire Competitors.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              TELEMETRY LOGGING ACTIVE
            </span>
            <Link href="/admin" className="hover:text-slate-200">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
