"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { Download, ShieldCheck, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";

export interface MemberCredentialCardProps {
  memberId: string;
  fullName: string;
  callsign: string;
  state?: string;
  experienceLevel?: string;
  rifleSetup?: string;
  accessLevel?: string;
  issuedDate?: string;
  showDownload?: boolean;
}

export function MemberCredentialCard({
  memberId,
  fullName,
  callsign,
  state = "TN",
  experienceLevel = "Competitor",
  rifleSetup,
  accessLevel = "CHAT ACCESS",
  issuedDate = "OCTOBER 2026",
  showDownload = true,
}: MemberCredentialCardProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [verifyUrl, setVerifyUrl] = useState<string>("");

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://subsonicsociety.com";
    const url = `${origin}/verify?id=${encodeURIComponent(memberId)}&callsign=${encodeURIComponent(callsign)}&name=${encodeURIComponent(fullName)}`;
    setVerifyUrl(url);

    // Generate real, high-resolution scannable QR Code
    QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      color: {
        dark: "#05070B",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((dataUri) => setQrDataUrl(dataUri))
      .catch((err) => console.error("QR Code Generation Error:", err));

    // Generate real Code 128 Barcode
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, memberId || "SS-2026-0000", {
          format: "CODE128",
          width: 1.6,
          height: 38,
          displayValue: false,
          background: "transparent",
          lineColor: "#cbd5e1",
          margin: 0,
        });
      } catch (e) {
        console.warn("Barcode rendering fallback:", e);
      }
    }
  }, [memberId, callsign, fullName]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto overflow-hidden">
      {/* Apple Wallet Style Glassmorphic Pass */}
      <div 
        data-credential-card="true"
        className="ios-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 border-2 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.22)] relative overflow-hidden bg-gradient-to-br from-[#07090e] via-[#0d141e] to-black space-y-4 sm:space-y-5 text-left"
      >
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: Emblem & Society Brand */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.35)] relative bg-black shrink-0">
              <Image
                src="/images/SS-RWB-LOGO.png"
                alt="Subsonic Emblem"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>OFFICIAL DIGITAL CREDENTIAL</span>
              </div>
              <div className="font-black text-sm text-white tracking-wider">
                SUBSONIC SOCIETY
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED</span>
          </span>
        </div>

        {/* Member Callsign & Core Data */}
        {(() => {
          const isMasterOwner = memberId === "SS-2026-0001" || callsign === "RADAR" || (fullName && fullName.toLowerCase().includes("neilson"));
          return (
            <div className="space-y-4 relative z-10">
              <div className="bg-black/40 rounded-2xl p-3 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                    {isMasterOwner ? "SYSTEMS CALLSIGN" : "TACTICAL CALLSIGN"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-wider">
                    [{callsign || (isMasterOwner ? "RADAR" : "MARKSMAN")}]
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                    SERIAL NUMBER
                  </span>
                  <div className="text-sm font-bold font-mono text-amber-400">
                    {memberId}
                  </div>
                </div>
              </div>

              {/* Grid Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    {isMasterOwner ? "SYSTEMS ARCHITECT" : "MARKSMAN"}
                  </span>
                  <span className="font-bold text-white truncate block">{fullName || "Verified Member"}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-slate-400 block uppercase">REGION / STATE</span>
                  <span className="font-bold text-white">{state}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-slate-400 block uppercase">ACCESS LEVEL</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isMasterOwner ? "MASTER ADMIN" : accessLevel}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-slate-400 block uppercase">ISSUED</span>
                  <span className="font-bold text-slate-300">{issuedDate}</span>
                </div>
              </div>

              {rifleSetup && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                    {isMasterOwner ? "INFRASTRUCTURE & TECH STACK" : "REGISTERED RIG"}
                  </span>
                  <span className="text-slate-200 truncate block font-bold">{rifleSetup}</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Real Functional Barcode (Code 128) & Scannable QR Code */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
          {/* Functional 1D Barcode */}
          <div className="space-y-1 flex-1 overflow-hidden">
            <div className="h-10 flex items-center justify-start max-w-[140px] sm:max-w-[210px] overflow-hidden">
              <svg ref={barcodeRef} className="w-full h-full" />
            </div>
            <div className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
              <span>CODE 128:</span>
              <strong className="text-slate-300">{memberId}</strong>
            </div>
          </div>

          {/* Real Functional 2D QR Code */}
          <div className="flex flex-col items-center shrink-0">
            <div 
              title="Scan with phone camera to verify credentials"
              className="p-1.5 rounded-xl bg-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform hover:scale-105"
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Verification Code for ${memberId}`}
                  width={68}
                  height={68}
                  className="rounded-md w-[68px] h-[68px] object-contain block"
                />
              ) : (
                <div className="w-[68px] h-[68px] bg-white flex items-center justify-center">
                  <span className="text-[8px] font-mono text-black font-bold">QR SYNC</span>
                </div>
              )}
            </div>
            <span className="text-[8px] font-mono text-emerald-400 font-bold mt-1 tracking-tight">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        {/* Footer Elevation & Anti-Counterfeit Hash */}
        <div className="pt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between border-t border-white/5">
          <span>HOLSTON RANGE • 3,420 FT</span>
          <span className="text-emerald-400/80">VERIFICATION ACTIVE</span>
        </div>
      </div>

      {/* Action Buttons */}
      {showDownload && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Save / Print Digital Pass</span>
          </button>

          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-emerald-400 font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
              title="Test QR Verification Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify Link</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
