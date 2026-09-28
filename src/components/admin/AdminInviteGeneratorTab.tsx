"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Copy,
  CheckCircle2,
  Sparkles,
  Users,
  Trophy,
  Share2,
  RefreshCw,
  Search,
  Filter,
  PlusCircle,
  Clock,
  ShieldCheck,
  Check,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  ExternalLink,
  Ban,
  Trash2
} from "lucide-react";
import { SocietyInvite, InviteTier } from "@/lib/types";

export function AdminInviteGeneratorTab() {
  const [invites, setInvites] = useState<SocietyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // Form State
  const [tier, setTier] = useState<InviteTier>("PRO");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [maxUses, setMaxUses] = useState<number>(1);
  const [customCode, setCustomCode] = useState("");
  const [note, setNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Recently Generated Invite Banner / Modal
  const [recentlyGenerated, setRecentlyGenerated] = useState<{
    invite: SocietyInvite;
    inviteUrl: string;
    smsText: string;
  } | null>(null);

  // Copy feedback tracking
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invites");
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch (err) {
      console.error("Failed loading invites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCopy = (text: string, actionId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedAction(actionId);
      setTimeout(() => setCopiedAction(null), 2500);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          recipientName,
          recipientEmail,
          recipientPhone,
          maxUses: Number(maxUses) || 1,
          customCode: customCode.trim() || undefined,
          note,
          createdBy: "ALLEN",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed generating invite");
      }

      const data = await res.json();
      setRecentlyGenerated(data);
      // Reset form fields
      setRecipientName("");
      setRecipientEmail("");
      setRecipientPhone("");
      setCustomCode("");
      setNote("");
      setMaxUses(1);
      // Reload invites list
      fetchInvites();
    } catch (err: any) {
      alert(err.message || "Error generating invite code");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredInvites = invites.filter((inv) => {
    const matchesTier = tierFilter === "ALL" || inv.tier === tierFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.code.toLowerCase().includes(q) ||
      (inv.recipientName && inv.recipientName.toLowerCase().includes(q)) ||
      (inv.note && inv.note.toLowerCase().includes(q)) ||
      (inv.claimedBy && inv.claimedBy.some((c) => c.toLowerCase().includes(q)));
    return matchesTier && matchesSearch;
  });

  const totalClaims = invites.reduce((acc, i) => acc + (i.usedCount || 0), 0);
  const activeCount = invites.filter((i) => i.status === "ACTIVE").length;
  const proCount = invites.filter((i) => i.tier === "PRO").length;
  const memberCount = invites.filter((i) => i.tier === "MEMBER").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Invitation-Only Access & VIP Generator
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Generate single-use or multi-use invitation keys for Pro Competitors and Society Members. 
              1-click copy formatted text messages or emails ready to send.
            </p>
          </div>

          <button
            onClick={fetchInvites}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Codes</span>
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Invites</span>
            <span className="text-2xl font-mono font-black text-white">{invites.length}</span>
            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">In System</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Active Codes</span>
            <span className="text-2xl font-mono font-black text-emerald-400">{activeCount}</span>
            <span className="text-[10px] font-mono text-emerald-400/80 block mt-0.5">Ready to Claim</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Pro VIP Invites</span>
            <span className="text-2xl font-mono font-black text-amber-400">{proCount}</span>
            <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">Competitor Dossiers</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Claimed</span>
            <span className="text-2xl font-mono font-black text-cyan-400">{totalClaims}</span>
            <span className="text-[10px] font-mono text-cyan-400/80 block mt-0.5">Members Activated</span>
          </div>
        </div>
      </div>

      {/* GENERATOR FORM & RECENTLY GENERATED CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Generator Form (7 cols) */}
        <div className="lg:col-span-7 ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Create New Invitation Code
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Tier Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Invitation Tier *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTier("PRO")}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    tier === "PRO"
                      ? "bg-amber-500/15 border-amber-500/50 shadow-tactical-glow text-white"
                      : "bg-black/30 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-400 uppercase">
                      PRO COMPETITOR VIP
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Unlocks full marksman dossier, rifle blueprint, photo compressor & auto-publishes to /shooters/[callsign].
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTier("MEMBER")}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    tier === "MEMBER"
                      ? "bg-blue-500/15 border-blue-500/50 shadow-tactical-glow text-white"
                      : "bg-black/30 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-blue-400 uppercase">
                      STANDARD MEMBER
                    </span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Issues digital member badge, creates callsign & PIN, and unlocks private chat comms.
                  </p>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Trevor Vance"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Max Allowed Claims
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Custom Code (Optional)
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder={`Leave blank for auto (${tier === "PRO" ? "SS-PRO-XXXX" : "SS-MBR-XXXX"})`}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono uppercase text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Internal Note / Squad Reference
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Invitational Squad 3 invite sent via SMS"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-tactical-glow flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Generating Code & Templates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Generate {tier === "PRO" ? "Pro VIP" : "Member"} Invitation Key</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Recently Generated Card & 1-Click Copy Templates (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {recentlyGenerated ? (
            <div className="ios-glass rounded-3xl p-6 border-2 border-emerald-500/50 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                  INVITE READY TO DISPATCH
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {recentlyGenerated.invite.tier === "PRO" ? "VIP Competitor" : "Member"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  ACCESS CODE
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                  {recentlyGenerated.invite.code}
                </div>
                {recentlyGenerated.invite.recipientName && (
                  <div className="text-xs text-slate-300 font-sans font-semibold">
                    Issued to: {recentlyGenerated.invite.recipientName}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopy(recentlyGenerated.smsText, "sms-recent")}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-tactical-glow transition-all"
                >
                  {copiedAction === "sms-recent" ? (
                    <>
                      <Check className="w-4 h-4 text-black" />
                      <span>SMS Text Copied!</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Copy 1-Click SMS / Text Message</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(recentlyGenerated.inviteUrl, "url-recent")}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copiedAction === "url-recent" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Direct Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Copy Direct URL Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(recentlyGenerated.invite.code, "code-recent")}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  {copiedAction === "code-recent" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code Only ({recentlyGenerated.invite.code})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview of the SMS Text */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  SMS Message Preview
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed select-all">
                  {recentlyGenerated.smsText}
                </p>
              </div>
            </div>
          ) : (
            <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Ready to Invite</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fill in the recipient details on the left and hit generate. 
                  Formatted text messages and links will appear here instantly for copy and pasting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE & PAST INVITES TABLE */}
      <div className="ios-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white">
              All Generated Invitation Codes ({filteredInvites.length})
            </h3>
            <p className="text-xs text-slate-400">
              Track code redemption status, claims, and remaining quota.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code or recipient..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Tiers</option>
              <option value="PRO">Pro VIP Only</option>
              <option value="MEMBER">Members Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Recipient / Note</th>
                <th className="py-3 px-3">Usage</th>
                <th className="py-3 px-3">Claimed By</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvites.map((inv) => {
                const isPro = inv.tier === "PRO";
                const isExhausted = inv.status === "EXHAUSTED" || inv.usedCount >= inv.maxUses;
                const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://subsonic-omega.vercel.app";
                const inviteUrl = isPro
                  ? `${baseUrl}/invite/pro?code=${inv.code}`
                  : `${baseUrl}/invite?code=${inv.code}`;
                const smsText = isPro
                  ? `You're invited as a VIP Pro Competitor to The Subsonic Society! Your invite code is: ${inv.code}. Build your marksman dossier here: ${inviteUrl}`
                  : `You're invited to join The Subsonic Society! Your access code is: ${inv.code}. Set up your profile here: ${inviteUrl}`;

                const copyIdSms = `table-sms-${inv.id}`;
                const copyIdUrl = `table-url-${inv.id}`;

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {inv.code}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isPro
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {isPro ? "PRO VIP" : "MEMBER"}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-[200px] truncate">
                      <div className="font-semibold text-white truncate">
                        {inv.recipientName || "Open Invite"}
                      </div>
                      {inv.note && (
                        <div className="text-[10px] text-slate-400 truncate">{inv.note}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <span className={isExhausted ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                        {inv.usedCount}
                      </span>
                      <span className="text-slate-500"> / {inv.maxUses}</span>
                    </td>

                    <td className="py-3 px-3 max-w-[150px] truncate font-mono text-[11px] text-slate-300">
                      {inv.claimedBy && inv.claimedBy.length > 0 ? (
                        inv.claimedBy.join(", ")
                      ) : (
                        <span className="text-slate-600">Unclaimed</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(smsText, copyIdSms)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                          title="Copy SMS text"
                        >
                          {copiedAction === copyIdSms ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Smartphone className="w-3 h-3" />
                          )}
                          <span>SMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(inviteUrl, copyIdUrl)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                          title="Copy direct URL"
                        >
                          {copiedAction === copyIdUrl ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
