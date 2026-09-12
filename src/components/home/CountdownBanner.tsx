"use client";

import React, { useState, useEffect } from "react";
import { Timer, Mountain } from "lucide-react";

export function CountdownBanner({ targetDate = "2026-10-17T08:00:00" }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="ios-glass rounded-2xl p-4 sm:p-5 border border-amber-500/20 shadow-tactical-glow">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Live Countdown
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono flex items-center gap-1">
                <Mountain className="w-3 h-3 text-amber-400" />
                Bristol TN Mountains
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              Appalachian Mountain Rimfire Pro Invitational
            </p>
          </div>
        </div>

        {/* Digit Boxes */}
        <div className="grid grid-cols-4 gap-2 text-center w-full sm:w-auto">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MINS", value: timeLeft.minutes },
            { label: "SECS", value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 min-w-[62px]"
            >
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-[9px] font-mono text-slate-400 tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
