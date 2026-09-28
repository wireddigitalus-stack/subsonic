"use client";

import React, { useRef, useEffect, useState } from "react";
import { EvoNode, EvoLink, EVO_NODES, EVO_LINKS, EVO_CLUSTERS } from "@/lib/evovision-data";

interface EvoVisionCanvasProps {
  selectedNode: EvoNode | null;
  onSelectNode: (node: EvoNode) => void;
  activeFilter: string | null;
  spacemanEnabled?: boolean;
  onToggleSpaceman?: (enabled: boolean) => void;
  is3DMode?: boolean;
  autoRotate?: boolean;
  onToggle3D?: (active: boolean) => void;
  onToggleAutoRotate?: (active: boolean) => void;
  onDismissSelection?: () => void;
  recenterSignal?: number;
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

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface SpacemanSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

interface SpacemanState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotSpeed: number;
  scale: number;
  targetScale: number;
  opacity: number;
  isVanishing: boolean;
  active: boolean;
  sparkles: SpacemanSparkle[];
}

// Generate data pulse packets flowing at a smooth, dignified, and visible pace
function createInitialParticles(): Particle[] {
  const particles: Particle[] = [];
  EVO_LINKS.forEach((link) => {
    // 2 staggered pulse dots per link for continuous, balanced data flow
    [0.15, 0.65].forEach((offset) => {
      particles.push({
        linkId: link.id,
        progress: (offset + Math.random() * 0.2) % 1,
        // Dignified, smooth flow speed (~6-8 seconds to traverse the link)
        speed: 0.0022 + Math.random() * 0.001,
        color: link.color,
        size: Math.random() * 1.5 + 2.8,
      });
    });
  });
  return particles;
}

export function EvoVisionCanvas({
  selectedNode,
  onSelectNode,
  activeFilter,
  spacemanEnabled = true,
  onToggleSpaceman,
  is3DMode = false,
  autoRotate = true,
  onToggle3D,
  onToggleAutoRotate,
  onDismissSelection,
  recenterSignal = 0,
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
  const [hoveredSpaceman, setHoveredSpaceman] = useState(false);

  // Keep live refs for uninterrupted 60 FPS animation loop
  const selectedNodeRef = useRef(selectedNode);
  selectedNodeRef.current = selectedNode;
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;
  const hoveredNodeRef = useRef(hoveredNode);
  hoveredNodeRef.current = hoveredNode;
  const hoveredSpacemanRef = useRef(hoveredSpaceman);
  hoveredSpacemanRef.current = hoveredSpaceman;

  // 3D Perspective & Rotation parameters
  const is3DModeRef = useRef(is3DMode);
  is3DModeRef.current = is3DMode;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const orbit3DRef = useRef({
    pitch: 0,           // 0 rad (flat 2D) -> 0.95 rad (~54 deg tilted 3D plane)
    targetPitch: 0,
    yaw: 0,             // rotation around Z-axis
    targetYaw: null as number | null,
    isResettingYaw: false,
    yawSpeed: 0.0016,   // smooth majestic revolution
  });

  useEffect(() => {
    orbit3DRef.current.targetPitch = is3DMode ? 0.95 : 0;
  }, [is3DMode]);

  // Handle Recenter signal: smooth camera reset and return to original canonical orientation (0 rad)
  const prevRecenterRef = useRef(recenterSignal);
  useEffect(() => {
    if (recenterSignal && recenterSignal !== prevRecenterRef.current) {
      prevRecenterRef.current = recenterSignal;
      const o3d = orbit3DRef.current;
      // Calculate nearest canonical multiple of 2*PI for shortest angular glide back to starting orientation
      const nearestMultiple = Math.round(o3d.yaw / (Math.PI * 2));
      o3d.targetYaw = nearestMultiple * (Math.PI * 2);
      o3d.isResettingYaw = true;

      // Recenter camera smoothly
      cameraRef.current.targetX = 0;
      cameraRef.current.targetY = 0;
      cameraRef.current.targetZoom = 1.0;
    }
  }, [recenterSignal]);

  // Projected node coordinates map for 100% accurate hit-testing in 2D or 3D
  const projectedNodeMap = useRef<
    Map<string, { px: number; py: number; scale: number; z: number; radius: number }>
  >(new Map());

  // Background stars cache
  const starsRef = useRef<Star[]>([]);
  // Travelling energy packets (flowing at smooth, dignified speed)
  const particlesRef = useRef<Particle[]>(createInitialParticles());
  // Periodic shooting stars
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextShootingStarTimeRef = useRef<number>(2.5);

  // Spaceman astronaut image & state
  const spacemanImgRef = useRef<HTMLImageElement | null>(null);
  const spacemanStateRef = useRef<SpacemanState>({
    x: 180,
    y: -90,
    vx: 0.22,
    vy: 0.07,
    angle: -0.15,
    rotSpeed: 0.0025,
    scale: 0.28,
    targetScale: 0.28,
    opacity: 0.88,
    isVanishing: false,
    active: true,
    sparkles: [],
  });

  // Sync external spaceman toggle
  const prevSpacemanEnabledRef = useRef(spacemanEnabled);
  useEffect(() => {
    if (prevSpacemanEnabledRef.current !== spacemanEnabled) {
      prevSpacemanEnabledRef.current = spacemanEnabled;
      const sm = spacemanStateRef.current;
      if (spacemanEnabled && !sm.active) {
        // Respawn spaceman floating in distance
        sm.active = true;
        sm.isVanishing = false;
        sm.x = -cameraRef.current.x - 280;
        sm.y = -cameraRef.current.y + 120;
        sm.scale = 0.05;
        sm.targetScale = 0.28;
        sm.opacity = 0.2;
      } else if (!spacemanEnabled && sm.active && !sm.isVanishing) {
        // Trigger vanish poof
        sm.isVanishing = true;
        for (let i = 0; i < 22; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 2.5 + 1;
          sm.sparkles.push({
            x: sm.x,
            y: sm.y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            alpha: 1,
            size: Math.random() * 2.5 + 1,
          });
        }
      }
    }
  }, [spacemanEnabled]);

  // Load spaceman image
  useEffect(() => {
    const img = new Image();
    img.src = "/images/sm.png";
    img.onload = () => {
      spacemanImgRef.current = img;
    };
  }, []);

  // Node position map for instant lookup without waiting for mount
  const nodeMap = useRef<Map<string, EvoNode>>(
    new Map(EVO_NODES.map((n) => [n.id, n]))
  );

  // Initialize stars background cache
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 2200,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    starsRef.current = stars;
  }, []);

  // Smooth camera tween when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      cameraRef.current.targetX = -selectedNode.x;
      cameraRef.current.targetY = -selectedNode.y;
      cameraRef.current.targetZoom = selectedNode.cluster === "HUB" ? 1.05 : 1.25;
    } else {
      cameraRef.current.targetX = 0;
      cameraRef.current.targetY = 0;
      cameraRef.current.targetZoom = 1.0;
    }
  }, [selectedNode]);

  // Main 60 FPS continuous render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Auto-sync canvas resolution for retina displays
      const displayW = Math.round(width * dpr);
      const displayH = Math.round(height * dpr);
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Smooth camera interpolation
      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * 0.08;
      cam.y += (cam.targetY - cam.y) * 0.08;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;

      // Smooth 3D camera interpolation
      const o3d = orbit3DRef.current;
      o3d.pitch += (o3d.targetPitch - o3d.pitch) * 0.05;

      if (o3d.isResettingYaw && o3d.targetYaw !== null) {
        const diff = o3d.targetYaw - o3d.yaw;
        o3d.yaw += diff * 0.08;
        if (Math.abs(diff) < 0.001) {
          o3d.yaw = 0;
          o3d.targetYaw = null;
          o3d.isResettingYaw = false;
        }
      } else if (autoRotateRef.current && (o3d.pitch > 0.02 || is3DModeRef.current)) {
        o3d.yaw += o3d.yawSpeed;
      }

      // 3D projection mathematical transformation helper
      const project3D = (x: number, y: number, zOffset: number = 0) => {
        const pitch = o3d.pitch;
        const yaw = o3d.yaw;

        // 1. Yaw rotation around central hub (0, 0)
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const x1 = x * cosY - y * sinY;
        const y1 = x * sinY + y * cosY;

        // 2. Pitch incline tilt around X axis
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const x2 = x1;
        const y2 = y1 * cosP - zOffset * sinP;
        const z2 = y1 * sinP + zOffset * cosP;

        // 3. Perspective projection
        const focalDist = 1350;
        const depthScale = focalDist / (focalDist + z2);

        return {
          px: x2 * depthScale,
          py: y2 * depthScale,
          z: z2,
          scale: depthScale,
          alphaFactor: Math.max(0.35, Math.min(1.0, 0.75 + (1 - z2 / 850) * 0.25)),
        };
      };

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

      // ─── 1B. Periodic Shooting Stars ──────────────────────────────
      if (time >= nextShootingStarTimeRef.current) {
        // Spawn a new shooting star across the cosmic horizon
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.45;
        shootingStarsRef.current.push({
          x: (Math.random() - 0.5) * 2200 - 450,
          y: -950 + (Math.random() - 0.5) * 350,
          length: 140 + Math.random() * 90,
          speed: 20 + Math.random() * 12,
          angle,
          alpha: 0,
          life: 0,
          maxLife: 60 + Math.random() * 25,
        });
        // Schedule next shooting star in 8 to 16 seconds
        nextShootingStarTimeRef.current = time + 8 + Math.random() * 8;
      }

      // Update and render shooting stars
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i];
        ss.life++;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        // Smooth parabolic fade-in and fade-out
        const progress = ss.life / ss.maxLife;
        ss.alpha = Math.sin(progress * Math.PI);

        if (ss.life >= ss.maxLife) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        // Ion streak trail
        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha * 0.95})`);
        grad.addColorStop(0.2, `rgba(56, 189, 248, ${ss.alpha * 0.8})`);
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // High-energy head spark
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
        ctx.shadowColor = "#38BDF8";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── 1C. Floating Little Space Man (Astronaut sm.png) ──────────
      const sm = spacemanStateRef.current;
      const smImg = spacemanImgRef.current;

      if (sm.active && smImg) {
        // Floating zero-gravity physics
        sm.x += sm.vx + Math.sin(time * 0.4) * 0.12;
        sm.y += sm.vy + Math.cos(time * 0.3) * 0.15;
        sm.angle += sm.rotSpeed;

        // Frontier screen-space coordinate tracking for smooth edge fade-out / fade-in
        const screenSmX = (sm.x + cam.x) * cam.zoom + width / 2;
        const screenSmY = (sm.y + cam.y) * cam.zoom + height / 2;

        const fadeMargin = 160; // 160px smooth fade zone before reaching the frontier
        const distLeft = screenSmX;
        const distRight = width - screenSmX;
        const distTop = screenSmY;
        const distBottom = height - screenSmY;
        const minDistToEdge = Math.min(distLeft, distRight, distTop, distBottom);

        // Smooth frontier screen wrap: wrap to opposite exterior edge once fully invisible
        if (screenSmX > width + 100) {
          sm.x = (-90 - width / 2) / cam.zoom - cam.x;
        } else if (screenSmX < -100) {
          sm.x = (width + 90 - width / 2) / cam.zoom - cam.x;
        }

        if (screenSmY > height + 100) {
          sm.y = (-90 - height / 2) / cam.zoom - cam.y;
        } else if (screenSmY < -100) {
          sm.y = (height + 90 - height / 2) / cam.zoom - cam.y;
        }

        // Calculate smooth edge fade factor (1.0 in center -> 0.0 at screen frontier edge)
        const edgeFadeFactor = Math.max(0, Math.min(1, minDistToEdge / fadeMargin));

        // Handle smooth spawn or vanishing poof
        if (sm.isVanishing) {
          sm.angle += 0.18;
          sm.scale *= 0.85;
          sm.opacity *= 0.85;
          if (sm.scale < 0.01) {
            sm.active = false;
            sm.isVanishing = false;
            if (onToggleSpaceman) onToggleSpaceman(false);
          }
        } else {
          if (sm.scale < sm.targetScale) {
            sm.scale += (sm.targetScale - sm.scale) * 0.08;
          }
          if (sm.opacity < 0.88) {
            sm.opacity += (0.88 - sm.opacity) * 0.08;
          }
        }

        // Draw astronaut with edge-frontier fade factor
        const renderOpacity = sm.isVanishing ? sm.opacity : sm.opacity * edgeFadeFactor;

        if (renderOpacity > 0.01) {
          ctx.save();
          ctx.translate(sm.x, sm.y);
          ctx.rotate(sm.angle);
          ctx.scale(sm.scale, sm.scale);
          ctx.globalAlpha = Math.max(0, Math.min(1, renderOpacity));

          // Soft cyan aura halo around spaceman
          ctx.shadowColor = "#38BDF8";
          ctx.shadowBlur = hoveredSpacemanRef.current ? 35 : 18;

          const w = smImg.width;
          const h = smImg.height;
          ctx.drawImage(smImg, -w / 2, -h / 2);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // Render vanish sparkles
      if (sm.sparkles.length > 0) {
        for (let i = sm.sparkles.length - 1; i >= 0; i--) {
          const spk = sm.sparkles[i];
          spk.x += spk.vx;
          spk.y += spk.vy;
          spk.alpha *= 0.92;
          if (spk.alpha < 0.02) {
            sm.sparkles.splice(i, 1);
            continue;
          }
          ctx.fillStyle = `rgba(56, 189, 248, ${spk.alpha})`;
          ctx.shadowColor = "#38BDF8";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(spk.x, spk.y, spk.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ─── 2. Orbiting Stardust Rings & Holographic Celestial Grid in 3D ──
      // Subtle 3D celestial coordinate grid discs when tilted
      if (o3d.pitch > 0.04) {
        ctx.save();
        const gridAlpha = 0.14 * (o3d.pitch / 0.95);
        ctx.strokeStyle = `rgba(6, 182, 212, ${gridAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        [420, 720, 1020].forEach((r) => {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += Math.PI / 32) {
            const p = project3D(Math.cos(a) * r, Math.sin(a) * r);
            if (a === 0) ctx.moveTo(p.px, p.py);
            else ctx.lineTo(p.px, p.py);
          }
          ctx.closePath();
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
      }

      const ringRadius = 140;
      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * Math.PI * 2 + time * 0.2;
        const rad = ringRadius + Math.sin(angle * 3 + time) * 12;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        const rProj = project3D(px, py);
        const pAlpha = (0.2 + (Math.sin(angle * 2 + time * 3) + 1) * 0.25) * rProj.alphaFactor;
        ctx.fillStyle = `rgba(6, 182, 212, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(rProj.px, rProj.py, Math.max(0.8, 1.8 * rProj.scale), 0, Math.PI * 2);
        ctx.fill();
      }

      // Secondary wider planetary dust ring
      const ring2Radius = 260;
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2 - time * 0.12;
        const rad = ring2Radius + Math.cos(angle * 2 + time) * 10;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        const rProj = project3D(px, py);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.25 * rProj.alphaFactor})`;
        ctx.beginPath();
        ctx.arc(rProj.px, rProj.py, Math.max(0.6, 1.2 * rProj.scale), 0, Math.PI * 2);
        ctx.fill();
      }

      const activeFilterVal = activeFilterRef.current;
      const selectedNodeVal = selectedNodeRef.current;
      const hoveredNodeVal = hoveredNodeRef.current;

      // Project all nodes and update projected lookup map for 100% accurate hit-testing
      const projectedNodes = EVO_NODES.map((node) => {
        const proj = project3D(node.x, node.y);
        return {
          node,
          px: proj.px,
          py: proj.py,
          scale: proj.scale,
          z: proj.z,
          alphaFactor: proj.alphaFactor,
        };
      });

      projectedNodeMap.current.clear();
      projectedNodes.forEach((pn) => {
        projectedNodeMap.current.set(pn.node.id, {
          px: pn.px,
          py: pn.py,
          scale: pn.scale,
          z: pn.z,
          radius: pn.node.radius * pn.scale,
        });
      });

      // Track camera to selected node if selected
      if (selectedNodeVal) {
        const selPn = projectedNodeMap.current.get(selectedNodeVal.id);
        if (selPn) {
          cam.targetX = -selPn.px;
          cam.targetY = -selPn.py;
          cam.targetZoom = selectedNodeVal.cluster === "HUB" ? 1.05 : 1.25;
        }
      }

      // ─── 3. Organic Synaptic Links (Curved Beziers in 3D) ───────────
      EVO_LINKS.forEach((link) => {
        const src = nodeMap.current.get(link.sourceId);
        const tgt = nodeMap.current.get(link.targetId);
        if (!src || !tgt) return;

        const srcProj = project3D(src.x, src.y);
        const tgtProj = project3D(tgt.x, tgt.y);

        const isDimmed =
          activeFilterVal &&
          src.cluster !== activeFilterVal &&
          tgt.cluster !== activeFilterVal;

        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normX = -dy / (dist || 1);
        const normY = dx / (dist || 1);
        const curveFactor = (link.curvature || 0.08) * 80;
        const cpX = midX + normX * curveFactor;
        const cpY = midY + normY * curveFactor;
        const cpProj = project3D(cpX, cpY, 20);

        const avgScale = (srcProj.scale + tgtProj.scale) / 2;
        const avgAlpha = (srcProj.alphaFactor + tgtProj.alphaFactor) / 2;

        // Outer glow path
        ctx.strokeStyle = link.color;
        ctx.globalAlpha = (isDimmed ? 0.05 : 0.25) * avgAlpha;
        ctx.lineWidth = Math.max(1.5, 3.5 * avgScale);
        ctx.beginPath();
        ctx.moveTo(srcProj.px, srcProj.py);
        ctx.quadraticCurveTo(cpProj.px, cpProj.py, tgtProj.px, tgtProj.py);
        ctx.stroke();

        // Inner core path
        ctx.strokeStyle = "#FFFFFF";
        ctx.globalAlpha = (isDimmed ? 0.03 : 0.6) * avgAlpha;
        ctx.lineWidth = Math.max(0.6, 1 * avgScale);
        ctx.beginPath();
        ctx.moveTo(srcProj.px, srcProj.py);
        ctx.quadraticCurveTo(cpProj.px, cpProj.py, tgtProj.px, tgtProj.py);
        ctx.stroke();

        // Latency pill text along the link
        if (link.latencyLabel && !isDimmed) {
          ctx.globalAlpha = 0.75 * cpProj.alphaFactor;
          ctx.font = `${Math.max(7, Math.round(9 * cpProj.scale))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          ctx.fillStyle = link.color;
          ctx.textAlign = "center";
          ctx.fillText(link.latencyLabel, cpProj.px, cpProj.py - 4);
        }
      });

      // ─── 4. Travelling Energy Pulse Packets in 3D ───────────────────
      particlesRef.current.forEach((p) => {
        const link = EVO_LINKS.find((l) => l.id === p.linkId);
        if (!link) return;
        const src = nodeMap.current.get(link.sourceId);
        const tgt = nodeMap.current.get(link.targetId);
        if (!src || !tgt) return;

        // Is this link dimmed by filter?
        const isDimmed =
          activeFilterVal &&
          src.cluster !== activeFilterVal &&
          tgt.cluster !== activeFilterVal;

        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;

        const t = p.progress;
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normX = -dy / (dist || 1);
        const normY = dx / (dist || 1);
        const curveFactor = (link.curvature || 0.08) * 80;
        const cpX = midX + normX * curveFactor;
        const cpY = midY + normY * curveFactor;

        // Quadratic Bezier formula
        const bx = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * cpX + t * t * tgt.x;
        const by = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * cpY + t * t * tgt.y;
        const archZ = 20 * Math.sin(t * Math.PI);
        const pProj = project3D(bx, by, archZ);

        // Render glowing energy packet dot
        ctx.globalAlpha = (isDimmed ? 0.08 : 0.95) * pProj.alphaFactor;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 * pProj.scale;
        ctx.beginPath();
        ctx.arc(pProj.px, pProj.py, Math.max(1.8, p.size * pProj.scale), 0, Math.PI * 2);
        ctx.fill();

        // Neon outer color rim
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.8, 1.2 * pProj.scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Sort back-to-front (highest z is deepest in background, rendered first)
      const sortedNodes = [...projectedNodes].sort((a, b) => b.z - a.z);

      // ─── 5. Bioluminescent Nodes in 3D Perspective ─────────────────
      sortedNodes.forEach(({ node, px, py, scale, z, alphaFactor }) => {
        const isDimmed = activeFilterVal && node.cluster !== activeFilterVal && node.id !== "hub-main";
        const isSelected = selectedNodeVal?.id === node.id;
        const isHovered = hoveredNodeVal?.id === node.id;

        const nodeR = node.radius * scale;

        ctx.globalAlpha = (isDimmed ? 0.2 : 1) * alphaFactor;

        // Multi-layer glowing halo
        const haloGrad = ctx.createRadialGradient(
          px,
          py,
          nodeR * 0.4,
          px,
          py,
          nodeR * (isSelected ? 2.4 : isHovered ? 2.0 : 1.7)
        );
        haloGrad.addColorStop(0, node.glowColor || "rgba(6, 182, 212, 0.4)");
        haloGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(px, py, nodeR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node Inner Sphere Body
        const bodyGrad = ctx.createRadialGradient(
          px - nodeR * 0.35,
          py - nodeR * 0.35,
          nodeR * 0.1,
          px,
          py,
          nodeR
        );

        if (node.id === "hub-main") {
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
        ctx.arc(px, py, nodeR, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight rim
        ctx.strokeStyle = isSelected ? "#FFFFFF" : node.color;
        ctx.lineWidth = Math.max(1, (isSelected ? 3 : 1.5) * scale);
        ctx.shadowColor = node.color;
        ctx.shadowBlur = (isSelected ? 18 : 8) * scale;
        ctx.beginPath();
        ctx.arc(px, py, nodeR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center callsign inside orb
        if (nodeR >= 14) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const orbFontSize = Math.round(
            (node.radius >= 40 ? 13 : node.radius >= 26 ? 10 : 8) * scale
          );
          ctx.font = `${node.radius >= 40 ? "900 " : "bold "}${Math.max(7, orbFontSize)}px ui-monospace, monospace`;
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#000000";
          ctx.shadowBlur = 4;
          const orbText = node.callsign
            ? node.callsign.slice(0, 6)
            : node.label.slice(0, 3).toUpperCase();
          ctx.fillText(orbText, px, py);
          ctx.textBaseline = "alphabetic";
          ctx.shadowBlur = 0;
        }

        // Selection pulsing ring
        if (isSelected) {
          const pulseR = nodeR + (6 + Math.sin(time * 6) * 3) * scale;
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = Math.max(1.5, 2 * scale);
          ctx.shadowColor = "#06B6D4";
          ctx.shadowBlur = 12 * scale;
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Node Label Typography with clear pill backing
        ctx.textAlign = "center";
        const isMajorCluster = node.radius >= 40;
        const labelFontSize = Math.round((isMajorCluster ? 13 : 11) * scale);
        ctx.font = `${isMajorCluster ? "900 " : "bold "}${Math.max(8, labelFontSize)}px ui-monospace, SFMono-Regular, Menlo, monospace`;

        const textMetrics = ctx.measureText(node.label);
        const textWidth = Math.max(textMetrics.width, (node.sublabel ? 80 : 40) * scale);
        const pillHeight = (node.sublabel ? 30 : 18) * scale;
        const pillY = py + nodeR + 6 * scale;

        // Dark frosted backdrop pill
        ctx.fillStyle = "rgba(4, 8, 19, 0.78)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const pillX = px - textWidth / 2 - 8 * scale;
        const pillW = textWidth + 16 * scale;
        const pillR = Math.max(2, 6 * scale);
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(pillX, pillY, pillW, pillHeight, pillR);
        } else {
          ctx.rect(pillX, pillY, pillW, pillHeight);
        }
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, px, pillY + (node.sublabel ? 12 : 13) * scale);
        ctx.shadowBlur = 0;

        if (node.sublabel) {
          ctx.font = `${Math.max(7, Math.round(9 * scale))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          ctx.fillStyle = node.color;
          ctx.fillText(node.sublabel, px, pillY + 24 * scale);
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run continuously at 60 FPS without tearing down on state changes

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

    // Hit-testing against nodes and spaceman in world coordinates
    const cam = cameraRef.current;
    const worldX = (mouseX - rect.width / 2) / cam.zoom - cam.x;
    const worldY = (mouseY - rect.height / 2) / cam.zoom - cam.y;

    // Check spaceman hit
    const sm = spacemanStateRef.current;
    const smDx = worldX - sm.x;
    const smDy = worldY - sm.y;
    const screenSmX = (sm.x + cam.x) * cam.zoom + rect.width / 2;
    const screenSmY = (sm.y + cam.y) * cam.zoom + rect.height / 2;
    const isSmVisibleOnScreen = screenSmX > 20 && screenSmX < rect.width - 20 && screenSmY > 20 && screenSmY < rect.height - 20;
    const isSmHovered = sm.active && !sm.isVanishing && isSmVisibleOnScreen && Math.sqrt(smDx * smDx + smDy * smDy) <= 50;
    setHoveredSpaceman(isSmHovered);

    const hit = EVO_NODES.find((node) => {
      const pn = projectedNodeMap.current.get(node.id);
      if (!pn) return false;
      const dx = worldX - pn.px;
      const dy = worldY - pn.py;
      return Math.sqrt(dx * dx + dy * dy) <= pn.radius + 8;
    });

    setHoveredNode(hit || null);
    canvas.style.cursor = isSmHovered || hit ? "pointer" : cam.isPanning ? "grabbing" : "grab";

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
    cameraRef.current.isPanning = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cam = cameraRef.current;
    const worldX = (mouseX - rect.width / 2) / cam.zoom - cam.x;
    const worldY = (mouseY - rect.height / 2) / cam.zoom - cam.y;

    // Check Spaceman click -> Vanish in poof of cosmic sparkles!
    const sm = spacemanStateRef.current;
    const smDx = worldX - sm.x;
    const smDy = worldY - sm.y;
    const screenSmX = (sm.x + cam.x) * cam.zoom + rect.width / 2;
    const screenSmY = (sm.y + cam.y) * cam.zoom + rect.height / 2;
    const isSmVisibleOnScreen = screenSmX > 20 && screenSmX < rect.width - 20 && screenSmY > 20 && screenSmY < rect.height - 20;

    if (sm.active && !sm.isVanishing && isSmVisibleOnScreen && Math.sqrt(smDx * smDx + smDy * smDy) <= 50) {
      sm.isVanishing = true;
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 3 + 1;
        sm.sparkles.push({
          x: sm.x,
          y: sm.y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          alpha: 1,
          size: Math.random() * 2.5 + 1.2,
        });
      }
      return;
    }

    // Check Node click
    const clicked = EVO_NODES.find((node) => {
      const pn = projectedNodeMap.current.get(node.id);
      if (!pn) return false;
      const dx = worldX - pn.px;
      const dy = worldY - pn.py;
      return Math.sqrt(dx * dx + dy * dy) <= pn.radius + 8;
    });

    if (clicked) {
      onSelectNode(clicked);
    }
  };

  // Double-click in blank canvas space to quickly dismiss side pop card
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cam = cameraRef.current;
    const worldX = (mouseX - rect.width / 2) / cam.zoom - cam.x;
    const worldY = (mouseY - rect.height / 2) / cam.zoom - cam.y;

    // Check if clicked any node
    const hitNode = EVO_NODES.find((node) => {
      const pn = projectedNodeMap.current.get(node.id);
      if (!pn) return false;
      const dx = worldX - pn.px;
      const dy = worldY - pn.py;
      return Math.sqrt(dx * dx + dy * dy) <= pn.radius + 8;
    });

    // Check if clicked spaceman
    const sm = spacemanStateRef.current;
    const smDx = worldX - sm.x;
    const smDy = worldY - sm.y;
    const isSmHit = sm.active && !sm.isVanishing && Math.sqrt(smDx * smDx + smDy * smDy) <= 50;

    // If double-clicked in blank space (no node or spaceman hit)
    if (!hitNode && !isSmHit && onDismissSelection) {
      onDismissSelection();
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
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="w-full h-full block touch-none"
      />
    </div>
  );
}
