"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  MessageSquare, 
  BarChart3, 
  Radio
} from "lucide-react";

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function MobileTabs() {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "FB Feed", href: "/#facebook-feed", icon: Radio },
    { name: "Admin", href: "/admin", icon: BarChart3 },
  ];

  return (
    <div 
      data-section="mobile-tabs" 
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto"
    >
      <div className="ios-bottom-sheet rounded-3xl p-1.5 px-3 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href.startsWith("/#") && pathname === "/" && typeof window !== "undefined" && window.location.hash === tab.href.slice(1));
          const Icon = tab.icon;

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
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 text-[8px] font-mono font-bold bg-amber-500 text-black px-1 rounded-full leading-tight">
                    {tab.badge}
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
