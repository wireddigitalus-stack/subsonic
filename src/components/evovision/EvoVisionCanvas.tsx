"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { EvoNode, EvoLink, EVO_NODES, EVO_LINKS, EVO_CLUSTERS } from "@/lib/evovision-data";

interface EvoVisionCanvasProps {
  selectedNode: EvoNode | null;
  onSelectNode: (node: EvoNode | null) => void;
  activeFilter?: string | null;
}

interface Particle {
  linkId: string;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
}

export function EvoVisionCanvas({
  selectedNode,
  onSelectNode,
  activeFilter,
}: EvoVisionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera viewport transform
  const cameraRef = useRef({
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
    isPanning: false,
    startX: 0,
    startY: 0,
  });

  const [hoveredNode, setHoveredNode] = useState<EvoNode | null>(null);

  // Background stars cache
  const starsRef = useRef<Star[]>([]);
  // Travelling energy packets
  const particlesRef = useRef<Particle[]>([]);

  // Node position map for quick lookup
  const nodeMap = useRef<Map<string, EvoNode>>(new Map());
  useEffect(() => {
    nodeMap.current.clear();
    EVO_NODES.forEach((n) => nodeMap.current.set(n.id, n));
  }, []);

  // Initialize stars and link particles
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 1600,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    starsRef.current = stars;

    // Create 2 travelling pulses per link
    const particles: Particle[] = [];
    EVO_LINKS.forEach((link) => {
      particles.push({
        linkId: link.id,
        progress: Math.random(),
        speed: (link.pulseSpeed || 1) * (0.003 + Math.random() * 0.003),
        color: link.color,
        size: Math.random() * 2 + 2,
      });
      particles.push({
        linkId: link.id,
        progress: Math.random(),
        speed: (link.pulseSpeed || 1) * (0.003 + Math.random() * 0.003),
        color: link.color,
        size: Math.random() * 2 + 2,
      });
    });
    particlesRef.current = particles;
  }, []);

  // Smooth camera tween when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      cameraRef.current.targetX = -selectedNode.x;
      cameraRef.current.targetY = -selectedNode.y;
      cameraRef.current.targetZoom = selectedNode.cluster === "HUB" ? 1.05 : 1.35;
    }
  }, [selectedNode]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += 0.016;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Smooth camera interpolation
      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * 0.08;
      cam.y += (cam.targetY - cam.y) * 0.08;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Deep cyber cosmic gradient background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#080F1E");
      bgGrad.addColorStop(0.5, "#040813");
      bgGrad.addColorStop(1, "#020409");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply camera transform centered in viewport
      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(cam.x, cam.y);

      // ─── 1. Background Stardust Particles ──────────────────────────
      starsRef.current.forEach((star) => {
        const currentAlpha =
          star.alpha + Math.sin(time * 2 + star.pulseSpeed * 100) * 0.2;
        ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0.1, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 2. Orbiting Stardust Rings Around Center Hub ──────────────
      const ringRadius = 140;
      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * Math.PI * 2 + time * 0.2;
        const rad = ringRadius + Math.sin(angle * 3 + time) * 12;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        const pAlpha = 0.2 + (Math.sin(angle * 2 + time * 3) + 1) * 0.25;
        ctx.fillStyle = `rgba(6, 182, 212, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── 3. Organic Synaptic Links (Curved Beziers) ────────────────
      EVO_LINKS.forEach((link) => {
        const src = nodeMap.current.get(link.sourceId);
        const tgt = nodeMap.current.get(link.targetId);
        if (!src || !tgt) return;

        // Is this link dimmed by filter?
        const isDimmed =
          activeFilter &&
          src.cluster !== activeFilter &&
          tgt.cluster !== activeFilter;

        // Control point for smooth organic curve
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dy + dy * dy);
        const normX = -dy / (dist || 1);
        const normY = dx / (dist || 1);
        const curveFactor = (link.curvature || 0.08) * 80;
        const cpX = midX + normX * curveFactor;
        const cpY = midY + normY * curveFactor;

        // Outer glow path
        ctx.strokeStyle = link.color;
        ctx.globalAlpha = isDimmed ? 0.08 : 0.25;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y);
        ctx.stroke();

        // Inner core path
        ctx.strokeStyle = "#FFFFFF";
        ctx.globalAlpha = isDimmed ? 0.04 : 0.6;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y);
        ctx.stroke();

        // Latency pill text along the link
        if (link.latencyLabel && !isDimmed) {
          ctx.globalAlpha = 0.75;
          ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = link.color;
          ctx.textAlign = "center";
          ctx.fillText(link.latencyLabel, cpX, cpY - 4);
        }
      });

      // ─── 4. Travelling Energy Pulse Packets ─────────────────────────
      particlesRef.current.forEach((p) => {
        const link = EVO_LINKS.find((l) => l.id === p.linkId);
        if (!link) return;
        const src = nodeMap.current.get(link.sourceId);
        const tgt = nodeMap.current.get(link.targetId);
        if (!src || !tgt) return;

        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const t = p.progress;
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dy + dy * dy);
        const normX = -dy / (dist || 1);
        const normY = dx / (dist || 1);
        const curveFactor = (link.curvature || 0.08) * 80;
        const cpX = midX + normX * curveFactor;
        const cpY = midY + normY * curveFactor;

        // Quadratic Bezier formula B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
        const bx = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * cpX + t * t * tgt.x;
        const by = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * cpY + t * t * tgt.y;

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx, by, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ─── 5. Bioluminescent Nodes ───────────────────────────────────
      EVO_NODES.forEach((node) => {
        const isDimmed = activeFilter && node.cluster !== activeFilter && node.id !== "hub-main";
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        ctx.globalAlpha = isDimmed ? 0.2 : 1;

        // Multi-layer glowing halo
        const haloGrad = ctx.createRadialGradient(
          node.x,
          node.y,
          node.radius * 0.4,
          node.x,
          node.y,
          node.radius * (isSelected ? 2.4 : isHovered ? 2.0 : 1.7)
        );
        haloGrad.addColorStop(0, node.glowColor);
        haloGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node Inner Sphere Body
        const bodyGrad = ctx.createRadialGradient(
          node.x - node.radius * 0.35,
          node.y - node.radius * 0.35,
          node.radius * 0.1,
          node.x,
          node.y,
          node.radius
        );

        if (node.id === "hub-main") {
          // Iridescent swirling chromatic sphere for Center Hub
          bodyGrad.addColorStop(0, "#E0F2FE");
          bodyGrad.addColorStop(0.35, "#38BDF8");
          bodyGrad.addColorStop(0.7, "#0284C7");
          bodyGrad.addColorStop(1, "#082F49");
        } else if (node.cluster === "MODS") {
          bodyGrad.addColorStop(0, "#FFE4E6");
          bodyGrad.addColorStop(0.4, "#F43F5E");
          bodyGrad.addColorStop(0.8, "#9F1239");
          bodyGrad.addColorStop(1, "#4C0519");
        } else if (node.cluster === "BOTS") {
          bodyGrad.addColorStop(0, "#FEF3C7");
          bodyGrad.addColorStop(0.4, node.status === "ALERT" ? "#EF4444" : "#F59E0B");
          bodyGrad.addColorStop(0.8, node.status === "ALERT" ? "#991B1B" : "#B45309");
          bodyGrad.addColorStop(1, "#451A03");
        } else {
          bodyGrad.addColorStop(0, "#CFFAFE");
          bodyGrad.addColorStop(0.4, node.color);
          bodyGrad.addColorStop(0.8, "#0369A1");
          bodyGrad.addColorStop(1, "#082F49");
        }

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // High-gloss specular highlight (glass ring rim)
        ctx.strokeStyle = isSelected ? "#FFFFFF" : node.color;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSelected ? 18 : 8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center callsign/symbol inside orb
        if (node.radius >= 18) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font =
            node.radius >= 40
              ? "900 13px ui-monospace, monospace"
              : node.radius >= 26
              ? "bold 10px ui-monospace, monospace"
              : "bold 8px ui-monospace, monospace";
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#000000";
          ctx.shadowBlur = 6;
          const orbText = node.callsign
            ? node.callsign.slice(0, 6)
            : node.label.slice(0, 3).toUpperCase();
          ctx.fillText(orbText, node.x, node.y);
          ctx.textBaseline = "alphabetic";
          ctx.shadowBlur = 0;
        }

        // Selection pulsing ring
        if (isSelected) {
          const pulseR = node.radius + 6 + Math.sin(time * 6) * 3;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Mini sparkline graph on nodes with sparkline metrics
        if (node.metrics?.sparkline && node.metrics.sparkline.length > 0) {
          const spk = node.metrics.sparkline;
          const spkW = node.radius * 1.8;
          const spkH = 14;
          const spkX = node.x - spkW / 2;
          const spkY = node.y + node.radius + 24;

          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          spk.forEach((val, idx) => {
            const px = spkX + (idx / (spk.length - 1)) * spkW;
            const py = spkY + spkH - (val / 100) * spkH;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        // Node Label Typography
        ctx.textAlign = "center";
        const isMajorCluster = node.radius >= 40;
        ctx.font = isMajorCluster
          ? "bold 13px ui-monospace, monospace"
          : "bold 10px ui-monospace, monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
        ctx.shadowBlur = 0;

        if (node.sublabel) {
          ctx.font = "9px ui-monospace, monospace";
          ctx.fillStyle = node.color;
          ctx.fillText(node.sublabel, node.x, node.y + node.radius + 25);
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeFilter, selectedNode, hoveredNode]);

  // Pointer drag to Pan
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    cameraRef.current.isPanning = true;
    cameraRef.current.startX = e.clientX;
    cameraRef.current.startY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Hit-testing against nodes
    const cam = cameraRef.current;
    const worldX = (mouseX - rect.width / 2) / cam.zoom - cam.x;
    const worldY = (mouseY - rect.height / 2) / cam.zoom - cam.y;

    const hit = EVO_NODES.find((node) => {
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 6;
    });

    setHoveredNode(hit || null);
    canvas.style.cursor = hit ? "pointer" : cam.isPanning ? "grabbing" : "grab";

    if (cameraRef.current.isPanning) {
      const dx = e.clientX - cameraRef.current.startX;
      const dy = e.clientY - cameraRef.current.startY;
      cameraRef.current.startX = e.clientX;
      cameraRef.current.startY = e.clientY;
      cameraRef.current.x += dx / cam.zoom;
      cameraRef.current.y += dy / cam.zoom;
      cameraRef.current.targetX = cameraRef.current.x;
      cameraRef.current.targetY = cameraRef.current.y;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasPanning = cameraRef.current.isPanning;
    cameraRef.current.isPanning = false;

    // Check click hit
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cam = cameraRef.current;
    const worldX = (mouseX - rect.width / 2) / cam.zoom - cam.x;
    const worldY = (mouseY - rect.height / 2) / cam.zoom - cam.y;

    const clicked = EVO_NODES.find((node) => {
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 6;
    });

    if (clicked) {
      onSelectNode(clicked);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(Math.max(cameraRef.current.targetZoom * zoomFactor, 0.4), 2.8);
    cameraRef.current.targetZoom = newZoom;
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block touch-none"
      />
    </div>
  );
}
