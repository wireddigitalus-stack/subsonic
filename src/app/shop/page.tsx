"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBag, 
  Flame, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Send,
  Coins
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "APPAREL" | "GEAR" | "DECALS";
  price: number;
  badge?: string;
  image: string;
  description: string;
  specs: string[];
  stock: "IN_STOCK" | "LIMITED_EDITION" | "PRE_ORDER";
}

const PRODUCTS_DATA: Product[] = [
  {
    id: "shirt-tech-match-2026",
    name: "Subsonic Society Pro Technical Match Jersey",
    category: "APPAREL",
    price: 48.0,
    badge: "Official Match Jersey",
    image: "/assets/subsonic-banner-trimmed.png",
    description: "High-performance moisture-wicking competition jersey built for all-day Appalachian matches. Antimicrobial stretch weave with Subsonic Society chest emblem and Modacam Custom Rifles sleeve imprint.",
    specs: ["UPF 50+ Sun Protection", "Breathable Mesh Underarm Gussets", "Anti-Snag Barricade Weave", "Sizes: S through 3XL"],
    stock: "PRE_ORDER",
  },
  {
    id: "hat-trucker-charcoal",
    name: "Low-Profile Structured Crosshair Trucker Hat",
    category: "APPAREL",
    price: 32.0,
    badge: "Range Essential",
    image: "/assets/subsonic-logo-round.png",
    description: "Charcoal gray front with breathable black mesh back. Features genuine debossed leather Subsonic Society crest patch and pre-curved visor for optic sight line clearance.",
    specs: ["Genuine Leather Debossed Crest", "Pre-Curved Barricade Visor", "Snapback Adjustable Fit", "Moisture-Wicking Sweatband"],
    stock: "IN_STOCK",
  },
  {
    id: "gear-dope-armband",
    name: "Tactical DOPE Armband & Wet-Erase Card Kit",
    category: "GEAR",
    price: 24.0,
    badge: "Precision Gear",
    image: "/assets/subsonic-facebook-cover.jpg",
    description: "Non-slip neoprene forearm sleeve with clear anti-glare window for elevation dials and wind holds. Includes 3 custom Subsonic Society waterproof DOPE cards and ultra-fine wet-erase pen.",
    specs: ["Anti-Glare Clear PVC Window", "Non-Slip Silicone Grip Band", "3 Pre-Formatted DOPE Cards", "Fits Forearms 9\" to 16\""],
    stock: "IN_STOCK",
  },
  {
    id: "logbook-dna-weatherproof",
    name: "Subsonic DNA Weatherproof Chrono & Match Logbook",
    category: "GEAR",
    price: 22.0,
    image: "/assets/subsonic-competition-mountain.png",
    description: "Rite-in-the-Rain 100-page spiral logbook formatted specifically for 50–400 yard rimfire data truing, lot-testing SD/ES records, and stage notes.",
    specs: ["All-Weather Waterproof Paper", "100 Pre-Formatted Target Grids", "Chrono Telemetry Spreadsheets", "Pocket Sized 4.5\" x 7\""],
    stock: "IN_STOCK",
  },
  {
    id: "decal-tactical-pack",
    name: "Subsonic Society Heavy-Duty Matte Decal 5-Pack",
    category: "DECALS",
    price: 15.0,
    image: "/assets/subsonic-logo-dark.png",
    description: "5-pack of UV-resistant weatherproof matte vinyl decals for rifle cases, ammo cans, and Kestrel weather meters.",
    specs: ["Thick Heavy-Tac Matte Vinyl", "UV & Scratch Resistant", "Die-Cut Custom Shapes", "Made in the USA"],
    stock: "IN_STOCK",
  },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [orderedProduct, setOrderedProduct] = useState<Product | null>(null);
  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderSize, setOrderSize] = useState("L");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const filteredProducts = selectedCategory === "ALL"
    ? PRODUCTS_DATA
    : PRODUCTS_DATA.filter((p) => p.category === selectedCategory);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="relative pt-6 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>OFFICIAL SUBSONIC SOCIETY APPAREL & COLLECTIBLES</span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              COMMUNITY GEAR & APPAREL. <br />
              <span className="amber-gradient-text">BUILT FOR THE FIRING LINE.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Equip yourself with official Subsonic Society moisture-wicking match jerseys, low-profile hats, weatherproof DOPE armbands, and precision range tools.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Match Jersey Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ios-glass rounded-3xl p-6 sm:p-10 border-2 border-amber-500/40 shadow-tactical-glow relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-black/40 to-black/60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative p-4 flex items-center justify-center">
                <Image
                  src="/assets/subsonic-banner-trimmed.png"
                  alt="Subsonic Society Pro Technical Match Jersey"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-mono text-xs font-black uppercase tracking-wider">
                  OFFICIAL MATCH APPAREL
                </span>
                <span className="text-xs font-mono text-slate-400">Pre-Order Open</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Subsonic Society Pro Technical Match Jersey
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                High-performance moisture-wicking competition jersey built for grueling Appalachian matches. Features antimicrobial stretch weave, Subsonic Society crest, and Modacam Custom Rifles presenting sponsor sleeve imprint.
              </p>

              <div className="text-2xl font-mono font-black text-amber-400">
                $48.00 <span className="text-xs text-slate-400 font-normal">/ Sizes S to 3XL</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setOrderedProduct(PRODUCTS_DATA[0]);
                    setOrderSuccess(false);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center gap-2 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 fill-black" />
                  <span>Pre-Order Match Jersey</span>
                </button>

                <div className="text-xs font-mono text-slate-400">
                  ⚡ Pre-order reserve for match day pickup or direct shipping
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 p-1.5 ios-glass rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Gear" },
            { id: "APPAREL", label: "Apparel & Jerseys" },
            { id: "GEAR", label: "Ballistic Range Gear" },
            { id: "DECALS", label: "Decals & Accessories" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-black shadow-tactical-glow"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="ios-glass rounded-3xl p-5 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Product Image Box */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-mono font-bold">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-amber-400 font-mono text-xs font-black">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {product.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Specs */}
                <ul className="space-y-1 text-[11px] text-slate-400 font-mono pt-1">
                  {product.specs.slice(0, 2).map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-amber-400/80 shrink-0" />
                      <span className="truncate">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setOrderedProduct(product);
                    setOrderSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-tactical-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5 fill-black" />
                  <span>Order Now • ${product.price.toFixed(2)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Order Reservation Modal */}
      {orderedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="ios-glass rounded-3xl p-5 sm:p-6 max-w-md w-full border border-white/20 shadow-2xl space-y-5 max-h-[92dvh] overflow-y-auto overscroll-contain ios-scrollbar">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Direct Community Gear Order
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {orderedProduct.name}
                </h3>
                <div className="text-amber-400 font-mono font-bold text-sm mt-0.5">
                  ${orderedProduct.price.toFixed(2)} USD
                </div>
              </div>
              <button
                onClick={() => setOrderedProduct(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Order Reservation Received!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you, marksman! A confirmation dispatch and digital invoice have been sent to <strong>{orderEmail}</strong>. All gear is inspected and packed at The Hideout in Bristol, TN.
                </p>
                <button
                  onClick={() => setOrderedProduct(null)}
                  className="px-6 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:brightness-110"
                >
                  Back to Shop
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="e.g. Wyatt Sterling"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Email Address (for dispatch & tracking)</label>
                  <input
                    type="email"
                    required
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    placeholder="e.g. marksman@subsonicsociety.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {orderedProduct.category === "APPAREL" && (
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Size</label>
                    <select
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="S" className="bg-[#0e131d]">Small (S)</option>
                      <option value="M" className="bg-[#0e131d]">Medium (M)</option>
                      <option value="L" className="bg-[#0e131d]">Large (L)</option>
                      <option value="XL" className="bg-[#0e131d]">Extra Large (XL)</option>
                      <option value="2XL" className="bg-[#0e131d]">2X Large (2XL)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between font-mono">
                  <span className="text-slate-400">Total Due:</span>
                  <span className="text-sm font-bold text-amber-400">
                    ${(orderedProduct.price * orderQuantity).toFixed(2)} USD
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderedProduct(null)}
                    className="flex-1 py-2.5 rounded-xl ios-glass text-slate-300 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-tactical-glow hover:brightness-110 active:scale-95"
                  >
                    Confirm Order
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
