"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  Trophy,
  Radio
} from "lucide-react";
import { 
  getCommsStatus, 
  subscribeToCommsStatus, 
  CommsStatusState,
  setCommsAlertLevel,
} from "@/lib/comms-status";

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function MobileTabs() {
  const pathname = usePathname();
  const [commsStatus, setCommsStatusState] = useState<CommsStatusState>(getCommsStatus());

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Subscribe to real-time comms alert level & message status
    const unsubscribe = subscribeToCommsStatus((status) => {
      setCommsStatusState(status);
    });

    let userCallsign = "";
    try {
      const rawShooter = localStorage.getItem("subsonic_shooter_profile");
      const rawMember = localStorage.getItem("subsonic_member_profile");
      const p = rawShooter ? JSON.parse(rawShooter) : rawMember ? JSON.parse(rawMember) : null;
      if (p && p.callsign) {
        userCallsign = p.callsign;
      }
    } catch {
      // ignore
    }

    // Server-backed unread comms poll for real cross-device mobile alerts
    const checkServerUnread = async () => {
      // Don't poll if actively viewing chat screen
      if (window.location.pathname.startsWith("/chat")) return;

      try {
        const lastRead = localStorage.getItem("subsonic_last_read_chat") || "0";
        const url = `/api/chat/messages?pollUnread=true&since=${lastRead}${userCallsign ? `&excludeCallsign=${encodeURIComponent(userCallsign)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.hasUnread) {
            setCommsAlertLevel("green", "New Transmission", `From ${data.latestAuthor || "Squad"}`);
          }
        }
      } catch {
        // network silent
      }
    };

    checkServerUnread();
    const pollInterval = setInterval(checkServerUnread, 4000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [pathname]);

  // Hide floating bottom sheet on chat screen so it doesn't obstruct keyboard and message input
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return null;

  const tabs: TabItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Shooters", href: "/shooters", icon: Trophy },
    { name: "FB Feed", href: "/#facebook-feed", icon: Radio },
  ];

  // Visual configuration for color-coded pulsing beacon
  const alertConfig = commsStatus.level !== "none" ? {
    red: {
      core: "bg-red-500 shadow-[0_0_8px_#EF4444]",
      ping: "bg-red-500",
      label: "Red Alert Notice: Safety / Weather Hold",
    },
    amber: {
      core: "bg-amber-400 shadow-[0_0_8px_#F59E0B]",
      ping: "bg-amber-400",
      label: "Attention Notice: Priority Match Briefing",
    },
    green: {
      core: "bg-emerald-400 shadow-[0_0_8px_#10B981]",
      ping: "bg-emerald-400",
      label: "New Messages: Live Stage Net Chatter",
    },
  }[commsStatus.level] : null;

  return (
    <div 
      data-section="mobile-tabs" 
      className="md:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-50 pointer-events-auto"
    >
      <div className="ios-bottom-sheet rounded-3xl p-1.5 px-3 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href.startsWith("/#") && pathname === "/" && typeof window !== "undefined" && window.location.hash === tab.href.slice(1));
          const Icon = tab.icon;
          const isChat = tab.href === "/chat";

          return (
            <Link
              key={tab.name}
              href={tab.href}
              data-telemetry={`mobile_bottom_tab_${tab.name.toLowerCase().replace(/\s+/g, "_")}`}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active pill glow */}
              {isActive && (
                <div className="absolute inset-0 bg-white/10 rounded-2xl -z-10 shadow-inner border border-white/10" />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 text-amber-400" : ""}`} />
                
                {/* Standard Tab Count Badge */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 text-[8px] font-mono font-bold bg-amber-500 text-black px-1 rounded-full leading-tight">
                    {tab.badge}
                  </span>
                )}

                {/* Live Color-Coded Pulsing Beacon for Chat */}
                {isChat && alertConfig && (
                  <span 
                    className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                    title={commsStatus.noticeTitle || alertConfig.label}
                    aria-label={alertConfig.label}
                  >
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-80 ${alertConfig.ping}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-black/90 ${alertConfig.core}`} />
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
