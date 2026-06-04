/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";

// Types represent spider physics & animation states
interface Leg {
  side: "left" | "right";
  index: number;
  footX: number;
  footY: number;
  idealX: number;
  idealY: number;
  stepProgress: number;
  stepStartX: number;
  stepStartY: number;
}

// Ultra-faint footstep spark/dust to make the walk feel "magical" but completely unobtrusive
interface LegDust {
  x: number;
  y: number;
  alpha: number;
  color: string;
  size: number;
}

// Single clean ripple to animate on-click drops elegantly without blocking text
interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function STEMCompanion() {
  const [isPreloaderFinished, setIsPreloaderFinished] = useState(() => {
    return typeof window !== "undefined" && !!(window as any).__preloaderFinished;
  });
  const [isSleeping, setIsSleeping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Modes: "hidden" | "dropping" | "normal" | "sleeping" | "wakeup" | "sleeping_entry"
  const currentMode = useRef<"hidden" | "dropping" | "normal" | "sleeping" | "wakeup" | "sleeping_entry">("hidden");

  // Track the wakeup countdown/frame timer
  const wakeupTimer = useRef(0);

  // Track the sleep entry countdown/frame timer
  const sleepEntryTimer = useRef(0);

  // Track continuous frames inside the dropping mode
  const spawnTimer = useRef(0);

  // Custom arrays for crying/sad tear pixels
  const tearsRef = useRef<{ x: number; y: number; vy: number; alpha: number; speed: number }[]>([]);

  // Dynamic reach size of legs to handle smooth tucking/retracting when sleeping
  const dynamicLegReach = useRef(55);

  // Dynamic scale factor for sleeping/spawning sizing
  const spiderScale = useRef(1.0);

  // Core physics references (no React re-renders to ensure 100% buttery smoothness)
  const spiderPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 }); 
  const spiderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const spiderAngle = useRef(0);
  const spiderVel = useRef({ x: 0, y: 0 });
  const isWebShooting = useRef(false);
  const webTarget = useRef({ x: 0, y: 0 });
  const webProgress = useRef(0);

  // Pocket irritation game refs
  const pokeCount = useRef(0);
  const pokeCooldown = useRef(0);
  const pocketShake = useRef({ x: 0, y: 0, time: 0 });
  const irritatedTimer = useRef(0);
  const hologramText = useRef("");

  // Procedural legs reference
  const legsRef = useRef<Leg[]>([]);

  // Array of tiny, subtle walk sparks and single active elegant click ripples
  const dustRef = useRef<LegDust[]>([]);
  const rippleRef = useRef<ClickRipple | null>(null);

  // Hover detection for interactive UI buttons/links
  const hoveredInteractivityRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Coordinate our spawn precisely with the preloader
  useEffect(() => {
    const isDone = !!(window as any).__preloaderFinished;
    if (isDone) {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        currentMode.current = "dropping";
        spawnTimer.current = 40;
      }
      spiderPos.current = { x: spiderTarget.current.x || window.innerWidth / 2, y: -120 };
    }

    const handlePreloaderFinished = () => {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        currentMode.current = "dropping";
        spawnTimer.current = 40;
      }
      spiderPos.current = { x: spiderTarget.current.x || window.innerWidth / 2, y: -120 };
    };

    window.addEventListener("preloaderFinished", handlePreloaderFinished);

    // Fallback polling check every 300ms to verify preloader status
    const pollInterval = setInterval(() => {
      if (!!(window as any).__preloaderFinished) {
        setIsPreloaderFinished(true);
        if (currentMode.current === "hidden") {
          currentMode.current = "dropping";
          spawnTimer.current = 40;
        }
        clearInterval(pollInterval);
      }
    }, 300);

    // Unconditional safety timeout: force spawn after 10 seconds absolute max
    const safetyTimeout = setTimeout(() => {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        currentMode.current = "dropping";
        spawnTimer.current = 40;
      }
    }, 10000);

    return () => {
      window.removeEventListener("preloaderFinished", handlePreloaderFinished);
      clearInterval(pollInterval);
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isPreloaderFinished) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle full-screen resizing safely with High-DPI support
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); 
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates dynamically & detect hovered interactive buttons with throttling
    let lastCheckTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (currentMode.current === "sleeping") return;
      spiderTarget.current = { x: e.clientX, y: e.clientY };

      const now = Date.now();
      if (now - lastCheckTime > 150) { 
        lastCheckTime = now;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
          const interactiveEl = el.closest("button, a, [role='button'], .hover-spider-target");
          if (interactiveEl) {
            const rect = interactiveEl.getBoundingClientRect();
            hoveredInteractivityRef.current = {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            };
          } else {
            hoveredInteractivityRef.current = null;
          }
        }
      }
    };

    // Track touch coordinates dynamically with throttling
    const handleTouchMove = (e: TouchEvent) => {
      if (currentMode.current === "sleeping") return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        spiderTarget.current = { x: touch.clientX, y: touch.clientY };

        const now = Date.now();
        if (now - lastCheckTime > 150) {
          lastCheckTime = now;
          const el = document.elementFromPoint(touch.clientX, touch.clientY);
          if (el) {
            const interactiveEl = el.closest("button, a, [role='button'], .hover-spider-target");
            if (interactiveEl) {
              const rect = interactiveEl.getBoundingClientRect();
              hoveredInteractivityRef.current = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
              };
            } else {
              hoveredInteractivityRef.current = null;
            }
          }
        }
      }
    };

    const triggerPocketPoke = (clickX: number, clickY: number) => {
      const isSpiderInPocket = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";
      if (!isSpiderInPocket) return;

      const now = Date.now();
      if (now - pokeCooldown.current < 220) return; 
      pokeCooldown.current = now;

      pokeCount.current += 1;
      pocketShake.current.time = 18;

      const isExtremelyAngry = pokeCount.current >= 5;
      for (let s = 0; s < 12; s++) {
        dustRef.current.push({
          x: clickX,
          y: clickY,
          alpha: 1.0,
          color: isExtremelyAngry ? "#f87171" : "#fbbf24", 
          size: 1.5 + Math.random() * 2.0
        });
      }

      rippleRef.current = {
        x: 65,
        y: 105,
        radius: 3,
        maxRadius: 42,
        alpha: 0.95,
        color: isExtremelyAngry ? "#ef4444" : "#f59e0b"
      };

      irritatedTimer.current = 145; 
      const count = pokeCount.current;
      if (count === 1) {
        hologramText.current = "أوي! دعني أنم بسلام... 💤";
      } else if (count === 2) {
        hologramText.current = "توقف عن لمس الجيب العنكبوتي! 😠";
      } else if (count === 3) {
        hologramText.current = "إنذار: سيتم تفعيل بروتوكول الدفاع المشدد! ⚡⚠️";
      } else if (count === 4) {
        hologramText.current = "أنا لست لعبة! سأقوم بقرصك لو كررتها! 🕷️🔥";
      } else {
        hologramText.current = "سحقاً لك! تبليغ عن مستخدم مزعج 🖕 #@*&!";
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      const distToPocket = Math.hypot(e.clientX - 65, e.clientY - 105);
      const isSpiderInPocket = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";
      if (distToPocket < 32 && isSpiderInPocket) {
        triggerPocketPoke(e.clientX, e.clientY);
        return;
      }

      if (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") return;
      const target = e.target as HTMLElement;
      if (target && target.closest(".dismiss-btn")) return;
 
      webTarget.current = { x: e.clientX, y: e.clientY };
      spiderTarget.current = { x: e.clientX, y: e.clientY };
      isWebShooting.current = true;
      webProgress.current = 1.0;
 
      rippleRef.current = {
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: 50,
        alpha: 0.8,
        color: "#a855f7" 
      };
    };
 
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const distToPocket = Math.hypot(touch.clientX - 65, touch.clientY - 105);
        const isSpiderInPocket = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";
        if (distToPocket < 32 && isSpiderInPocket) {
          triggerPocketPoke(touch.clientX, touch.clientY);
          return;
        }
      }

      if (currentMode.current === "sleeping") return;
      const target = e.target as HTMLElement;
      if (target && target.closest(".dismiss-btn")) return;
 
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        webTarget.current = { x: touch.clientX, y: touch.clientY };
        spiderTarget.current = { x: touch.clientX, y: touch.clientY };
        isWebShooting.current = true;
        webProgress.current = 1.0;
 
        rippleRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          radius: 2,
          maxRadius: 45,
          alpha: 0.8,
          color: "#a855f7"
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("click", handleMouseClick);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    const legAnglesLeft = [-130, -80, -30, 20];   
    const legAnglesRight = [130, 80, 30, -20];
    const newLegs: Leg[] = [];

    for (let i = 0; i < 4; i++) {
      newLegs.push({
        side: "left",
        index: i,
        footX: spiderPos.current.x - 50,
        footY: spiderPos.current.y + (i - 1.5) * 20,
        idealX: 0,
        idealY: 0,
        stepProgress: 1.0,
        stepStartX: 0,
        stepStartY: 0
      });
    }

    for (let i = 0; i < 4; i++) {
      newLegs.push({
        side: "right",
        index: i,
        footX: spiderPos.current.x + 50,
        footY: spiderPos.current.y + (i - 1.5) * 20,
        idealX: 0,
        idealY: 0,
        stepProgress: 1.0,
        stepStartX: 0,
        stepStartY: 0
      });
    }

    legsRef.current = newLegs;

    let animationFrameId: number;

    const updateAndDraw = () => {
      const sp = spiderPos.current;
      const tg = spiderTarget.current;
      const vl = spiderVel.current;

      const sleepX = 65; 
      const sleepY = 105;

      let targetScale = 1.0;
      if (currentMode.current === "sleeping") {
        targetScale = 0.82; 
      } else if (currentMode.current === "sleeping_entry") {
        if (sleepEntryTimer.current > 35) {
          targetScale = 1.0; 
        } else {
          const crawlProgress = (35 - sleepEntryTimer.current) / 35; 
          targetScale = 1.0 - crawlProgress * 0.18; 
        }
      } else if (currentMode.current === "wakeup" && wakeupTimer.current > 30) {
        const climbProgress = (65 - wakeupTimer.current) / 35; 
        targetScale = 0.82 + climbProgress * 0.18;
      } else if (currentMode.current === "dropping") {
        const spawnProgress = Math.min(1.0, (40 - spawnTimer.current) / 40);
        targetScale = 0.4 + spawnProgress * 0.6;
      }
      spiderScale.current += (targetScale - spiderScale.current) * 0.12;

      let shakeX = 0;
      let shakeY = 0;
      if (pocketShake.current.time > 0) {
        pocketShake.current.time--;
        const intensity = pocketShake.current.time * 0.7;
        shakeX = Math.sin(Date.now() * 0.22) * intensity;
        shakeY = Math.cos(Date.now() * 0.20) * intensity;
      }

      if (isSleeping) {
        if (currentMode.current !== "sleeping" && currentMode.current !== "sleeping_entry") {
          currentMode.current = "sleeping_entry";
          sleepEntryTimer.current = 80;
        }
      } else if (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") {
        currentMode.current = "wakeup";
        wakeupTimer.current = 65; 
        pokeCount.current = 0; 
        irritatedTimer.current = 0; 

        for (let s = 0; s < 25; s++) {
          dustRef.current.push({
            x: sp.x,
            y: sp.y,
            alpha: 1.0,
            color: s % 2 === 0 ? "#10b981" : "#a855f7",
            size: 1.5 + Math.random() * 2.5
          });
        }
      }

      if (currentMode.current === "dropping") {
        spawnTimer.current--;
        hoveredInteractivityRef.current = null;

        const idealTargetX = tg.x || window.innerWidth / 2;
        const idealTargetY = tg.y || window.innerHeight * 0.45;

        const progress = Math.min(1.0, (40 - spawnTimer.current) / 40);
        const elastic = 1.0 - Math.cos(progress * Math.PI * 1.5) * Math.exp(-progress * 3.5);
        
        sp.x = idealTargetX;
        sp.y = -120 + (idealTargetY - (-120)) * elastic;
        spiderAngle.current = Math.PI / 2; 

        if (Math.random() < 0.45) {
          dustRef.current.push({
            x: sp.x + (Math.random() * 12 - 6),
            y: sp.y + 10,
            alpha: 1.0,
            color: Math.random() > 0.5 ? "#10b981" : "#a855f7",
            size: 1.0 + Math.random() * 1.5
          });
        }

        if (spawnTimer.current <= 0) {
          currentMode.current = "normal";
          
          for (let s = 0; s < 15; s++) {
            dustRef.current.push({
              x: sp.x,
              y: sp.y,
              alpha: 0.95,
              color: s % 2 === 0 ? "#10b981" : "#a855f7",
              size: 1.5 + Math.random() * 2.0
            });
          }
          
          rippleRef.current = {
            x: sp.x,
            y: sp.y,
            radius: 3,
            maxRadius: 75,
            alpha: 0.9,
            color: "#10b981"
          };
        }
      } else if (currentMode.current === "sleeping") {
        hoveredInteractivityRef.current = null; 
        
        tg.x = sleepX + shakeX;
        tg.y = sleepY + 4 + shakeY;
        
        dynamicLegReach.current += (24 - dynamicLegReach.current) * 0.12; 
        spiderAngle.current += (Math.PI * 0.50 - spiderAngle.current) * 0.12; 
        
        if (pokeCount.current < 2 && Math.random() < 0.08) {
          tearsRef.current.push({
            x: sp.x + (Math.random() * 8 - 4), 
            y: sp.y + 4,
            vy: 0.6 + Math.random() * 1.4,
            alpha: 1.0,
            speed: 0.016 + Math.random() * 0.01
          });
        }
      } else if (currentMode.current === "sleeping_entry") {
        hoveredInteractivityRef.current = null;

        if (sleepEntryTimer.current > 35) {
          tg.x = sleepX + shakeX;
          tg.y = sleepY - 18 + shakeY;
          
          const distanceToRim = Math.hypot(tg.x - sp.x, tg.y - sp.y);
          if (distanceToRim > 100) {
            const targetAngle = Math.atan2(tg.y - sp.y, tg.x - sp.x);
            let diff = targetAngle - spiderAngle.current;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            spiderAngle.current += diff * 0.15;
          } else {
            let diff = -Math.PI / 2 - spiderAngle.current;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            spiderAngle.current += diff * 0.15;
          }
          
          dynamicLegReach.current += (52 - dynamicLegReach.current) * 0.12;

          if (distanceToRim < 30) {
            sleepEntryTimer.current--;
          } else {
            if (sleepEntryTimer.current > 36) {
              sleepEntryTimer.current--;
            }
          }
        } else {
          sleepEntryTimer.current--;
          tg.x = sleepX + shakeX;
          tg.y = sleepY + 4 + shakeY;

          const backtrackProgress = (35 - sleepEntryTimer.current) / 35; 
          
          sp.x = sleepX + Math.sin(backtrackProgress * Math.PI * 5.0) * 1.8;
          sp.y = (sleepY - 18) + backtrackProgress * 22; 

          spiderAngle.current += (Math.PI * 0.50 - spiderAngle.current) * 0.12; 
          dynamicLegReach.current += (24 - dynamicLegReach.current) * 0.12; 
          
          if (sleepEntryTimer.current === 35) {
            pocketShake.current.time = 24; 
          }
        }

        if (sleepEntryTimer.current <= 0) {
          currentMode.current = "sleeping";
        }
      } else if (currentMode.current === "wakeup") {
        wakeupTimer.current--;

        if (wakeupTimer.current > 30) {
          const climbT = (65 - wakeupTimer.current) / 35; 
          sp.x = sleepX + Math.sin(climbT * Math.PI * 4.5) * 2; 
          sp.y = (sleepY + 4) - climbT * 18;
          spiderAngle.current = -Math.PI / 2; 
          
          dynamicLegReach.current += (28 - dynamicLegReach.current) * 0.1; 
        } else {
          dynamicLegReach.current += (55 - dynamicLegReach.current) * 0.15;
          
          let diff = Math.atan2(vl.y, vl.x) - spiderAngle.current;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          spiderAngle.current += diff * 0.12;
        }

        if (wakeupTimer.current <= 0) {
          currentMode.current = "normal";
        }
      } else {
        dynamicLegReach.current += (55 - dynamicLegReach.current) * 0.1;
      }

      let dx = tg.x - sp.x;
      let dy = tg.y - sp.y;
      const distance = Math.hypot(dx, dy);

      const isShooting = isWebShooting.current;
      let attractionForce = isShooting ? 0.35 : (currentMode.current === "dropping" ? 0.0 : 0.08);
      let maxSpeed = isShooting ? 35 : (currentMode.current === "dropping" ? 0 : 18);

      if (currentMode.current === "wakeup") {
        if (wakeupTimer.current > 30) {
          vl.x = 0;
          vl.y = 0;
        } else {
          if (wakeupTimer.current === 30) {
            vl.y = -10.5;
            vl.x = 5.5;
          }
          vl.y += 0.38; 
          vl.x *= 0.95;
          vl.y *= 0.95;
          sp.x += vl.x;
          sp.y += vl.y;
        }
      } else if (currentMode.current === "dropping") {
        // Handled in Dropping State custom physics
      } else if (distance > (currentMode.current === "sleeping" ? 2 : 15)) {
        vl.x += dx * attractionForce;
        vl.y += dy * attractionForce;

        const speed = Math.hypot(vl.x, vl.y);
        const friction = isShooting ? 0.95 : 0.78;
        vl.x *= friction;
        vl.y *= friction;

        if (speed > maxSpeed) {
          vl.x = (vl.x / speed) * maxSpeed;
          vl.y = (vl.y / speed) * maxSpeed;
        }

        sp.x += vl.x;
        sp.y += vl.y;

        if (currentMode.current !== "dropping" && currentMode.current !== "sleeping") {
          const targetAngle = Math.atan2(dy, dx);
          let diff = targetAngle - spiderAngle.current;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          spiderAngle.current += diff * 0.15;
        }
      } else {
        vl.x *= 0.6;
        vl.y *= 0.6;
        sp.x += vl.x;
        sp.y += vl.y;
        
        if (currentMode.current === "sleeping") {
          sp.y += Math.sin(Date.now() * 0.003) * 0.15; 
        } else {
          sp.y += Math.sin(Date.now() * 0.005) * 0.25; 
        }
        
        if (isShooting) {
          isWebShooting.current = false;
        }
      }

      if (isShooting && webProgress.current > 0) {
        webProgress.current -= 0.06;
        if (webProgress.current <= 0) {
          isWebShooting.current = false;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentMode.current === "dropping") {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sp.x, 0);
        ctx.lineTo(sp.x, sp.y - 12);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.45)"; 
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"; 
        ctx.lineWidth = 0.55;
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      {
        let shakeX = 0;
        let shakeY = 0;
        if (pocketShake.current.time > 0) {
          const intensity = pocketShake.current.time * 0.7;
          shakeX = Math.sin(Date.now() * 0.22) * intensity;
          shakeY = Math.cos(Date.now() * 0.20) * intensity;
        }

        const pX = 65 + shakeX;
        const pY = 105 + shakeY;
        
        const drawCable = (x1: number, y1: number, x2: number, y2: number) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "rgba(15, 23, 42, 0.65)";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.strokeStyle = "rgba(168, 85, 247, 0.75)";
          ctx.lineWidth = 0.65;
          ctx.stroke();
        };

        drawCable(pX - 16, pY - 8, 24, 48);
        drawCable(pX - 8, pY - 8, 24, 76);
        drawCable(pX + 16, pY - 8, 82, 76);
        drawCable(pX + 22, pY - 4, 125, 66);

        ctx.beginPath();
        ctx.moveTo(pX - 22, pY - 8);
        ctx.bezierCurveTo(pX - 22, pY + 24, pX + 22, pY + 24, pX + 22, pY - 8);
        ctx.quadraticCurveTo(pX, pY - 2, pX - 22, pY - 8);
        ctx.closePath();

        const gradBack = ctx.createLinearGradient(pX, pY - 10, pX, pY + 24);
        gradBack.addColorStop(0, "rgba(8, 12, 24, 0.99)"); 
        gradBack.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
        gradBack.addColorStop(1, "rgba(30, 41, 59, 0.95)"); 
        ctx.fillStyle = gradBack;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0; 
      }
      ctx.restore();

      for (let i = tearsRef.current.length - 1; i >= 0; i--) {
        const tear = tearsRef.current[i];
        tear.y += tear.vy;
        tear.alpha -= tear.speed;
        
        if (tear.alpha <= 0) {
          tearsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = tear.alpha;
        ctx.fillStyle = "#38bdf8"; 
        ctx.beginPath();
        ctx.arc(tear.x, tear.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1.0; 

      const maxDustLimit = 25;
      if (dustRef.current.length > maxDustLimit) {
        dustRef.current.splice(0, dustRef.current.length - maxDustLimit);
      }
      for (let i = dustRef.current.length - 1; i >= 0; i--) {
        const dust = dustRef.current[i];
        dust.alpha -= 0.04;
        if (dust.alpha <= 0) {
          dustRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = dust.alpha;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1.0; 

      if (rippleRef.current) {
        const rp = rippleRef.current;
        rp.radius += (rp.maxRadius - rp.radius) * 0.1;
        rp.alpha -= 0.035;

        if (rp.alpha <= 0) {
          rippleRef.current = null;
        } else {
          ctx.save();
          ctx.globalAlpha = rp.alpha;
          
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = rp.color;
          ctx.lineWidth = 1.2;
          ctx.shadowColor = rp.color;
          ctx.shadowBlur = 10;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `${rp.color}11`;
          ctx.fill();

          ctx.restore();
          ctx.globalAlpha = 1.0;
        }
      }

      const currentInteractivity = hoveredInteractivityRef.current;
      if (currentInteractivity && currentMode.current !== "sleeping") {
        const targetCenterX = currentInteractivity.x + currentInteractivity.width / 2;
        const targetCenterY = currentInteractivity.y + currentInteractivity.height / 2;

        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        
        const segments = 10;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const currX = sp.x + (targetCenterX - sp.x) * t;
          const currY = sp.y + (targetCenterY - sp.y) * t;

          const waveAmplitude = Math.sin((Date.now() * 0.02) + i) * 4 * (1 - t) * (t);
          const dxWave = targetCenterX - sp.x;
          const dyWave = targetCenterY - sp.y;
          const lenWave = Math.hypot(dxWave, dyWave);
          const pxWave = -dyWave / (lenWave || 1);
          const pyWave = dxWave / (lenWave || 1);

          ctx.lineTo(currX + pxWave * waveAmplitude, currY + pyWave * waveAmplitude);
        }

        ctx.strokeStyle = "rgba(16, 185, 129, 0.55)"; 
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (isShooting && webProgress.current > 0) {
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(webTarget.current.x, webTarget.current.y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${webProgress.current})`;
        ctx.lineWidth = 2 * webProgress.current;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; 
      }

      const bodyAngle = spiderAngle.current;
      const reach = dynamicLegReach.current;

      legsRef.current.forEach((leg) => {
        const angleOffset = leg.side === "left" 
          ? legAnglesLeft[leg.index] * (Math.PI / 180)
          : legAnglesRight[leg.index] * (Math.PI / 180);

        const attachmentAngle = bodyAngle + angleOffset;
        
        const rootX = sp.x + Math.cos(attachmentAngle) * 12 * spiderScale.current;
        const rootY = sp.y + Math.sin(attachmentAngle) * 12 * spiderScale.current;

        const distToSleep = Math.hypot(sleepX - sp.x, sleepY - sp.y);

        if (currentMode.current === "wakeup" && wakeupTimer.current > 30) {
          const sMult = spiderScale.current;
          leg.footX = sp.x + (leg.side === "left" ? -18 : 18) * sMult + Math.sin(Date.now() * 0.08 + leg.index) * 6 * sMult;
          leg.footY = 105 + 2 + Math.cos(Date.now() * 0.08 + leg.index) * 8 * sMult;
          
          leg.idealX = leg.footX;
          leg.idealY = leg.footY;
        } else if ((currentMode.current === "sleeping" && distToSleep < 16) || (currentMode.current === "sleeping_entry" && sleepEntryTimer.current <= 35)) {
          const sMult = spiderScale.current;
          const curlAngle = bodyAngle + (leg.side === "left" ? -Math.PI / 1.7 : Math.PI / 1.7) + (leg.index - 1.5) * 0.18;
          const foldWidth = (16 + leg.index * 1.2) * sMult; 
          leg.idealX = rootX + Math.cos(curlAngle) * foldWidth;
          leg.idealY = rootY + Math.sin(curlAngle) * foldWidth;
          
          leg.footX += (leg.idealX - leg.footX) * 0.16;
          leg.footY += (leg.idealY - leg.footY) * 0.16;
          leg.stepProgress = 1.0;
        } else {
          const splayAngle = bodyAngle + angleOffset * 1.3;
          leg.idealX = rootX + Math.cos(splayAngle) * reach * spiderScale.current;
          leg.idealY = rootY + Math.sin(splayAngle) * reach * spiderScale.current;
        }

        const curDist = Math.hypot(leg.idealX - leg.footX, leg.idealY - leg.footY);

        const stepThreshold = currentMode.current === "sleeping" ? 10 : 45;
        if (curDist > stepThreshold && leg.stepProgress >= 1.0) {
          const otherStepping = legsRef.current.some(
            (other) => other.side === leg.side && other.index !== leg.index && other.stepProgress < 0.6
          );

          if (!otherStepping || curDist > 85) {
            leg.stepStartX = leg.footX;
            leg.stepStartY = leg.footY;
            leg.stepProgress = 0.0;
          }
        }

        if (leg.stepProgress < 1.0) {
          const defaultStepSpeed = currentMode.current === "sleeping" ? 0.2 : 0.12;
          const stepSpeed = defaultStepSpeed + Math.min(0.18, Math.hypot(vl.x, vl.y) * 0.015);
          leg.stepProgress += stepSpeed;

          if (leg.stepProgress >= 1.0) {
            leg.stepProgress = 1.0;
            leg.footX = leg.idealX;
            leg.footY = leg.idealY;

            if (currentMode.current !== "sleeping" && Math.hypot(vl.x, vl.y) > 1) {
              dustRef.current.push({
                x: leg.footX,
                y: leg.footY,
                alpha: 0.5,
                color: leg.side === "left" ? "#a855f7" : "#ec4899", 
                size: 1.0 + Math.random() * 1.0
              });
            }
          } else {
            const t = leg.stepProgress;
            const curX = leg.stepStartX + (leg.idealX - leg.stepStartX) * t;
            const curY = leg.stepStartY + (leg.idealY - leg.stepStartY) * t;
            
            const liftHeight = Math.sin(t * Math.PI) * (currentMode.current === "sleeping" ? 6 : 18);
            leg.footX = curX;
            leg.footY = curY - liftHeight;
          }
        }

        const midX = (rootX + leg.footX) / 2;
        const midY = (rootY + leg.footY) / 2;
        
        const dxFoot = leg.footX - rootX;
        const dyFoot = leg.footY - rootY;
        const footLen = Math.hypot(dxFoot, dyFoot);
        
        const perpX = -dyFoot / (footLen || 1);
        const perpY = dxFoot / (footLen || 1);

        const bendOffset = (leg.side === "left" ? -22 : 22) * (reach / 55) * spiderScale.current;
        const jointX = midX + perpX * bendOffset;
        const jointY = midY + perpY * bendOffset - (12 * (reach / 55)) * spiderScale.current;

        const isTucked = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(jointX, jointY);
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = (isTucked ? 2.3 : 4) * spiderScale.current;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.strokeStyle = "#6b21a8";
        ctx.lineWidth = (isTucked ? 1.0 : 2) * spiderScale.current;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(jointX, jointY);
        ctx.lineTo(leg.footX, leg.footY);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = (isTucked ? 1.6 : 3) * spiderScale.current;
        ctx.stroke();

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = (isTucked ? 0.6 : 1.2) * spiderScale.current;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(leg.footX, leg.footY, (isTucked ? 1.6 : 3) * spiderScale.current, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = isTucked ? 3 * spiderScale.current : 8 * spiderScale.current;
        ctx.fill();
        ctx.shadowBlur = 0; 
      });

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(bodyAngle);

      const bodyScale = (currentMode.current === "sleeping" || currentMode.current === "wakeup" || currentMode.current === "sleeping_entry") ? spiderScale.current : 1.0;
      ctx.scale(bodyScale, bodyScale);

      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-3, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-3, 0, 5, 0, Math.PI * 2);
      
      const isInterfacing = !!currentInteractivity;
      let reactorGlow = isInterfacing ? "#10b981" : "#a855f7"; 
      let glowIntensity = isInterfacing ? 16 : 12;

      if (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") {
        const breath = Math.sin(Date.now() * 0.002) * 0.4 + 0.6; 
        reactorGlow = `rgba(147, 51, 234, ${0.2 + breath * 0.5})`; 
        glowIntensity = 5 + breath * 4;
      } else if (currentMode.current === "wakeup") {
        const pulse = Math.floor(Date.now() / 50) % 2 === 0;
        reactorGlow = pulse ? "#10b981" : "#06b6d4"; 
        glowIntensity = 22;
      }

      ctx.fillStyle = reactorGlow;
      ctx.shadowColor = reactorGlow === "rgba(147, 51, 234, 0.4)" ? "#9333ea" : reactorGlow;
      ctx.shadowBlur = glowIntensity;
      ctx.fill();
      ctx.shadowBlur = 0; 

      ctx.beginPath();
      ctx.ellipse(10, 0, 4, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      
      if (currentMode.current === "sleeping") {
        const isVeryIrritated = pokeCount.current >= 5;
        const isMildlyIrritated = pokeCount.current >= 3;

        ctx.save();
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";

        if (isVeryIrritated) {
          ctx.strokeStyle = "#f87171"; 
          ctx.beginPath();
          ctx.moveTo(10, -5);
          ctx.lineTo(7, -2.5);
          ctx.lineTo(10, -0.5);
          ctx.moveTo(10, 5);
          ctx.lineTo(7, 2.5);
          ctx.lineTo(10, 0.5);
          ctx.stroke();

          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 6px sans-serif";
          ctx.fillText("🖕", 1, 1);
        } else if (isMildlyIrritated) {
          ctx.strokeStyle = "#facc15"; 
          ctx.beginPath();
          ctx.moveTo(9, -3.5);
          ctx.lineTo(7, -3.5);
          ctx.moveTo(9, 3.5);
          ctx.lineTo(7, 3.5);
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#38bdf8"; 
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(10, -4);
          ctx.lineTo(8, -1.5);
          ctx.moveTo(10, 4);
          ctx.lineTo(8, 1.5);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        let eyeColor = isInterfacing ? "#10b981" : "#ef4444";
        if (currentMode.current === "wakeup") {
          eyeColor = "#22c55e"; 
        }

        ctx.beginPath();
        ctx.arc(9, -3, 2, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(9, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; 
      }

      ctx.restore();

      ctx.save();
      {
        let shakeX = 0;
        let shakeY = 0;
        if (pocketShake.current.time > 0) {
          const intensity = pocketShake.current.time * 0.7;
          shakeX = Math.sin(Date.now() * 0.22) * intensity;
          shakeY = Math.cos(Date.now() * 0.2) * intensity;
        }

        const pX = 65 + shakeX;
        const pY = 105 + shakeY;
        
        ctx.shadowColor = "rgba(168, 85, 247, 0.35)";
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(pX - 22, pY - 8);
        ctx.bezierCurveTo(pX - 22, pY + 24, pX + 22, pY + 24, pX + 22, pY - 8);
        ctx.quadraticCurveTo(pX, pY - 2, pX - 22, pY - 8);
        ctx.closePath();
        
        const gradFront = ctx.createLinearGradient(pX, pY - 10, pX, pY + 24);
        gradFront.addColorStop(0, "rgba(15, 23, 42, 0.45)"); 
        gradFront.addColorStop(0.5, "rgba(107, 33, 168, 0.38)"); 
        gradFront.addColorStop(1, "rgba(16, 185, 129, 0.65)"); 
        ctx.fillStyle = gradFront;
        ctx.fill();

        ctx.lineWidth = 1.35;
        ctx.strokeStyle = "rgba(168, 85, 247, 0.85)"; 
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX - 19, pY + 2);
        ctx.bezierCurveTo(pX - 12, pY + 16, pX + 12, pY + 16, pX + 19, pY + 2);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.55)";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX - 15, pY + 8);
        ctx.bezierCurveTo(pX - 8, pY + 20, pX + 8, pY + 20, pX + 15, pY + 8);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.65)"; 
        ctx.stroke();
      }
      ctx.restore();

      if (irritatedTimer.current > 0) {
        irritatedTimer.current--;

        ctx.save();
        let shakeX = 0;
        let shakeY = 0;
        if (pocketShake.current.time > 0) {
          const intensity = pocketShake.current.time * 0.7;
          shakeX = Math.sin(Date.now() * 0.22) * intensity;
          shakeY = Math.cos(Date.now() * 0.20) * intensity;
        }

        const bX = 65 + 26 + shakeX;
        const bY = 105 - 12 + shakeY;
        
        ctx.translate(bX, bY);
        
        const flicker = Math.sin(Date.now() * 0.15) * 0.12 + 0.88;
        ctx.globalAlpha = flicker * Math.min(1.0, irritatedTimer.current / 15);
        
        ctx.font = "bold 11px sans-serif";
        const text = hologramText.current;
        const textWidth = ctx.measureText(text).width;
        const padX = 12;
        const padY = 6;
        const bubbleW = textWidth + padX * 2;
        const bubbleH = 22;
        
        const isAngry = pokeCount.current >= 5;
        const hologramColor = isAngry ? "rgba(239, 68, 68, 0.9)" : "rgba(168, 85, 247, 0.85)";
        const hologramFill = isAngry ? "rgba(24, 10, 10, 0.96)" : "rgba(15, 10, 30, 0.96)";
        
        ctx.beginPath();
        ctx.roundRect(0, -bubbleH / 2, bubbleW, bubbleH, 6);
        ctx.fillStyle = hologramFill;
        ctx.strokeStyle = hologramColor;
        ctx.lineWidth = 1.35;
        ctx.shadowColor = hologramColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6, -4);
        ctx.lineTo(0, -8);
        ctx.closePath();
        ctx.fillStyle = hologramFill;
        ctx.strokeStyle = hologramColor;
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = isAngry ? "#fca5a5" : "#e9d5ff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, padX, 0);
        
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPreloaderFinished, isSleeping]);

  if (!isPreloaderFinished) {
    return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999] select-none"
        style={{ width: "100%", height: "100%" }}
      />
      
      <div className="fixed bottom-4 right-4 z-[10000] dismiss-btn">
        {isSleeping ? (
          <button
            onClick={() => setIsSleeping(false)}
            className="bg-purple-950/95 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[10px] px-3.5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-105 active:scale-95 animate-bounce"
            dir="rtl"
          >
            <span>🕷️</span> إيقاظ العنكبوت ⚡
          </button>
        ) : (
          <button
            onClick={() => setIsSleeping(true)}
            className="bg-[#0f172a]/95 hover:bg-red-950/90 border border-slate-700/60 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-[10px] px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-lg active:scale-95"
            title="إرسال العنكبوت لشبكته ليستريح"
            dir="rtl"
          >
            <span>🕷️</span> تعطيل العنكبوت
          </button>
        )}
      </div>
    </>
  );
                           }
