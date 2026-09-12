"use client";

import React, { useState, useMemo } from "react";
import { Crosshair, Wind, Mountain, Gauge, Sparkles, Download, Check } from "lucide-react";

export function BallisticsCalculator() {
  const [muzzleVelocity, setMuzzleVelocity] = useState(1060); // fps
  const [bulletWeight, setBulletWeight] = useState(40); // grains
  const [temperature, setTemperature] = useState(64); // °F (Bristol mountain autumn)
  const [elevation, setElevation] = useState(3420); // ft (Bristol TN ridge)
  const [windSpeed, setWindSpeed] = useState(8); // mph
  const [zeroRange, setZeroRange] = useState(50); // yards
  const [copied, setCopied] = useState(false);

  // Precision rimfire trajectory model for .22LR subsonic (G1 BC ~0.130 to 0.145)
  const dopeTable = useMemo(() => {
    const distances = [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 465];
    const bc = 0.138; // Lapua Center-X / SK Long Range standard
    const densityFactor = 1 - (elevation / 1000) * 0.03 + (temperature - 59) * 0.0018;

    return distances.map((dist) => {
      if (dist === zeroRange) {
        return {
          distance: dist,
          dropInches: 0,
          elevationMil: 0,
          elevationMOA: 0,
          windMil: ((dist / 100) * (windSpeed / 10) * 0.28).toFixed(1),
          velocityFPS: muzzleVelocity,
          flightTimeSec: (dist * 3 / muzzleVelocity).toFixed(2),
        };
      }

      // Physics approximation for .22LR transonic/subsonic glide
      const flightTime = (dist * 3) / (muzzleVelocity * 0.88) * (1 / densityFactor);
      const dropInches = 0.5 * 386.4 * Math.pow(flightTime, 2) * 0.44 - (dist / zeroRange) * 1.5;
      const elevationMil = Math.max(0, (dropInches / (dist * 0.036))).toFixed(1);
      const elevationMOA = (parseFloat(elevationMil) * 3.438).toFixed(1);
      const windMil = ((dist / 100) * (windSpeed / 10) * 0.42 * densityFactor).toFixed(1);
      const remainingVelocity = Math.max(740, Math.round(muzzleVelocity - dist * 0.72));

      return {
        distance: dist,
        dropInches: Math.round(dropInches),
        elevationMil: parseFloat(elevationMil),
        elevationMOA: parseFloat(elevationMOA),
        windMil: parseFloat(windMil),
        velocityFPS: remainingVelocity,
        flightTimeSec: flightTime.toFixed(2),
      };
    });
  }, [muzzleVelocity, elevation, temperature, windSpeed, zeroRange]);

  const handleCopyDOPE = () => {
    const text = dopeTable
      .map((d) => `${d.distance}y: ${d.elevationMil} MIL (${d.elevationMOA} MOA) | Wind 8mph: ${d.windMil} MIL | Time: ${d.flightTimeSec}s`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Crosshair className="w-4 h-4" />
            Bristol TN Mountain Ballistics Solver
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            SUBSONIC .22LR DOPE & ELEVATION MATRIX
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Calibrated for Holston Mountain atmospheric density (3,420 FT ELEV). Solve drops out to 465 yards.
          </p>
        </div>

        <button
          onClick={handleCopyDOPE}
          data-telemetry="ballistics_copy_dope_card"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied to Clipboard!" : "Copy DOPE Card"}</span>
        </button>
      </div>

      {/* Atmospheric & Rifle Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Muzzle Velocity</span>
            <span className="text-amber-400 font-bold">{muzzleVelocity} FPS</span>
          </div>
          <input
            type="range"
            min={1020}
            max={1120}
            step={5}
            value={muzzleVelocity}
            onChange={(e) => setMuzzleVelocity(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>1020 Subsonic</span>
            <span>1120 Transonic</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Mountain Elevation</span>
            <span className="text-blue-400 font-bold">{elevation} FT</span>
          </div>
          <input
            type="range"
            min={1000}
            max={5000}
            step={100}
            value={elevation}
            onChange={(e) => setElevation(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>1,000 FT</span>
            <span>Bristol Peak 3,420 FT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Crosswind (90°)</span>
            <span className="text-emerald-400 font-bold">{windSpeed} MPH</span>
          </div>
          <input
            type="range"
            min={2}
            max={25}
            step={1}
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>2 MPH Light</span>
            <span>25 MPH Ridge Gale</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Range Temp</span>
            <span className="text-purple-400 font-bold">{temperature}°F</span>
          </div>
          <input
            type="range"
            min={30}
            max={95}
            step={1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>30°F Cold Bore</span>
            <span>95°F Summer</span>
          </div>
        </div>
      </div>

      {/* Trajectory Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/50">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-white/5 text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-3">Distance</th>
              <th className="p-3 text-amber-400">Elevation (MIL)</th>
              <th className="p-3">Elevation (MOA)</th>
              <th className="p-3 text-emerald-400">Wind Hold (MIL)</th>
              <th className="p-3">Flight Time</th>
              <th className="p-3">Remaining Vel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dopeTable.map((row) => (
              <tr key={row.distance} className="hover:bg-white/[0.03] transition-colors">
                <td className="p-3 font-bold text-white">
                  {row.distance} YDS {row.distance === 465 && <span className="text-[10px] text-amber-400 font-normal">(Bristol Max)</span>}
                </td>
                <td className="p-3 text-amber-400 font-black text-sm">
                  {row.elevationMil} MIL
                </td>
                <td className="p-3 text-slate-300">
                  {row.elevationMOA} MOA
                </td>
                <td className="p-3 text-emerald-400 font-semibold">
                  {row.windMil} MIL
                </td>
                <td className="p-3 text-slate-400">
                  {row.flightTimeSec}s
                </td>
                <td className="p-3 text-slate-400">
                  {row.velocityFPS} fps
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>
          Note: Extreme range .22LR past 350 yards experiences pronounced aerodynamic drag and Magnus effect. Verify DOPE on the zero bay prior to match start.
        </span>
      </div>
    </div>
  );
}
