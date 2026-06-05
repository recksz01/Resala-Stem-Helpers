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

interface FloatingZ {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  size: number;
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

  // Array of floating sleep Zzz characters
  const zListRef = useRef<FloatingZ[]>([]);

  // Dynamic reach size of legs to handle smooth tucking/retracting when sleeping
  const dynamicLegReach = useRef(42);

  // Dynamic scale factor for sleeping/spawning sizing (Standard size reduced to ~75%-80% size layout!)
  const spiderScale = useRef(0.76);

  // Core physics references (no React re-renders to ensure 100% buttery smoothness)
  const spiderPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 }); // Start centered inside screen for breakout digging
  const spiderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lagTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); // Lag target for 200-500ms smooth organic delay
  
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

  // Scan targets for STEM Companion curiosity system
  const targetButtonsRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const lastDomScan = useRef(0);
  const currentCuriousTarget = useRef<{ x: number; y: number } | null>(null);

  // Idle and emotion state references
  const lastUserActivity = useRef(Date.now());
  const idleState = useRef<"idle" | "cleaning" | "looking" | "asleep" | "curious">("idle");
  const idleTimer = useRef(0);
  const hoverInteractivityRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Coordinate our spawn precisely with the preloader
  useEffect(() => {
    const isDone = !!(window as any).__preloaderFinished;
    if (isDone) {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        currentMode.current = "dropping";
        spawnTimer.current = 50;
        spiderPos.current = { x: window.innerWidth / 2, y: -120 };
      }
    }

    const handlePreloaderFinished = () => {
      // Delay slightly by 700ms to allow the preloader transition blur/fadeout to completely clear!
      setTimeout(() => {
        setIsPreloaderFinished(true);
        if (currentMode.current === "hidden") {
          currentMode.current = "dropping";
          spawnTimer.current = 50; // loftier and clearer drop!
        }
        spiderPos.current = { x: window.innerWidth / 2, y: -120 };
      }, 700);
    };

    window.addEventListener("preloaderFinished", handlePreloaderFinished);

    // Fallback polling check every 300ms to verify preloader status
    const pollInterval = setInterval(() => {
      if (!!(window as any).__preloaderFinished) {
        clearInterval(pollInterval);
        setIsPreloaderFinished(true);
        if (currentMode.current === "hidden") {
          // Delay briefly for fallback as well to sync beautifully
          setTimeout(() => {
            currentMode.current = "dropping";
            spawnTimer.current = 50;
            spiderPos.current = { x: window.innerWidth / 2, y: -120 };
          }, 700);
        }
      }
    }, 300);

    // Unconditional safety timeout: force spawn after 10 seconds absolute max
    const safetyTimeout = setTimeout(() => {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        currentMode.current = "dropping";
        spawnTimer.current = 50;
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
      // Register activity to keep the companion awake!
      lastUserActivity.current = Date.now();
      
      // Wake up from stand-still sleep if active
      if (idleState.current === "asleep") {
        idleState.current = "idle";
        idleTimer.current = 30;
        // Cute wakeup hop sparks
        for (let s = 0; s < 10; s++) {
          dustRef.current.push({
            x: spiderPos.current.x,
            y: spiderPos.current.y,
            alpha: 1.0,
            color: "#f59e0b", // Gold wakeup alert
            size: 1.0 + Math.random() * 1.5
          });
        }
      }

      // Don't track mouse while sleeping in web pouch
      if (currentMode.current === "sleeping") return;
      spiderTarget.current = { x: e.clientX, y: e.clientY };

      const now = Date.now();
      if (now - lastCheckTime > 150) { // Limit expensive DOM hits to once per 150ms
        lastCheckTime = now;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
          const interactiveEl = el.closest("button, a, [role='button'], .hover-spider-target");
          if (interactiveEl) {
            const rect = interactiveEl.getBoundingClientRect();
            hoverInteractivityRef.current = {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            };
          } else {
            hoverInteractivityRef.current = null;
          }
        }
      }
    };

    // Track touch coordinates dynamically (dragging on phone) with throttling
    const handleTouchMove = (e: TouchEvent) => {
      lastUserActivity.current = Date.now();
      if (idleState.current === "asleep") {
        idleState.current = "idle";
        idleTimer.current = 30;
      }

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
              hoverInteractivityRef.current = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
              };
            } else {
              hoverInteractivityRef.current = null;
            }
          }
        }
      }
    };

    const triggerPocketPoke = (clickX: number, clickY: number) => {
      const isSpiderInPocket = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";
      if (!isSpiderInPocket) return;

      const now = Date.now();
      if (now - pokeCooldown.current < 220) return; // Prevent heavy click spam
      pokeCooldown.current = now;

      // Increment anger count
      pokeCount.current += 1;

      // Start high frequency shaking of pocket structure
      pocketShake.current.time = 18;

      // Localized electric warnings sparks
      const isExtremelyAngry = pokeCount.current >= 5;
      for (let s = 0; s < 12; s++) {
        dustRef.current.push({
          x: clickX,
          y: clickY,
          alpha: 1.0,
          color: isExtremelyAngry ? "#f87171" : "#fbbf24", // Red or amber sparks
          size: 1.5 + Math.random() * 2.0
        });
      }

      // Emit energy shockwave
      rippleRef.current = {
        x: 65,
        y: 105,
        radius: 3,
        maxRadius: 42,
        alpha: 0.95,
        color: isExtremelyAngry ? "#ef4444" : "#f59e0b"
      };

      // Set holographic message bubble
      irritatedTimer.current = 145; // ~2.4 seconds duration
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

    // Click triggers web shoot (if on an active item), rapid acceleration, and a soft water-like ripple
    const handleMouseClick = (e: MouseEvent) => {
      lastUserActivity.current = Date.now();
      const distToPocket = Math.hypot(e.clientX - 65, e.clientY - 105);
      const isSpiderInPocket = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";
      
      if (distToPocket < 32 && isSpiderInPocket) {
        triggerPocketPoke(e.clientX, e.clientY);
        return;
      }

      if (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") return;
      const target = e.target as HTMLElement;
      if (target && target.closest(".dismiss-btn")) return;
 
      // Click interaction: Shoot fiber ONLY if clicking on an interactive page element
      const hitsActiveEl = target.closest("button, a, [role='button'], .hover-spider-target");
      
      webTarget.current = { x: e.clientX, y: e.clientY };
      spiderTarget.current = { x: e.clientX, y: e.clientY };
      
      if (hitsActiveEl) {
        isWebShooting.current = true;
        webProgress.current = 1.0;
        
        // Special soundwave golden energy splash for clicking active buttons
        for (let s = 0; s < 16; s++) {
          dustRef.current.push({
            x: e.clientX,
            y: e.clientY,
            alpha: 1.0,
            color: s % 3 === 0 ? "#10b981" : (s % 3 === 1 ? "#a855f7" : "#ec4899"),
            size: 1.2 + Math.random() * 2.5
          });
        }
      }

      // Elegant cosmic splash ring
      rippleRef.current = {
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: hitsActiveEl ? 65 : 45,
        alpha: 0.8,
        color: hitsActiveEl ? "#10b981" : "#a855f7" 
      };
    };
 
    // Touch tap triggers same response too on mobile
    const handleTouchStart = (e: TouchEvent) => {
      lastUserActivity.current = Date.now();
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
        const hitsActiveEl = target.closest("button, a, [role='button'], .hover-spider-target");

        webTarget.current = { x: touch.clientX, y: touch.clientY };
        spiderTarget.current = { x: touch.clientX, y: touch.clientY };
        
        if (hitsActiveEl) {
          isWebShooting.current = true;
          webProgress.current = 1.0;
        }
 
        rippleRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          radius: 2,
          maxRadius: hitsActiveEl ? 55 : 40,
          alpha: 0.8,
          color: hitsActiveEl ? "#10b981" : "#a855f7"
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("click", handleMouseClick);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Initialize 8 legs (4 left, 4 right)
    const legAnglesLeft = [-130, -80, -30, 20];   // angle offsets in deg
    const legAnglesRight = [130, 80, 30, -20];
    const newLegs: Leg[] = [];

    // Left legs
    for (let i = 0; i < 4; i++) {
       newLegs.push({
         side: "left",
         index: i,
         footX: spiderPos.current.x - 38,
         footY: spiderPos.current.y + (i - 1.5) * 15,
         idealX: 0,
         idealY: 0,
         stepProgress: 1.0,
         stepStartX: 0,
         stepStartY: 0
       });
    }

    // Right legs
    for (let i = 0; i < 4; i++) {
       newLegs.push({
         side: "right",
         index: i,
         footX: spiderPos.current.x + 38,
         footY: spiderPos.current.y + (i - 1.5) * 15,
         idealX: 0,
         idealY: 0,
         stepProgress: 1.0,
         stepStartX: 0,
         stepStartY: 0
       });
    }

    legsRef.current = newLegs;

    // Master Animation Loop
    let animationFrameId: number;

    const updateAndDraw = () => {
      const sp = spiderPos.current;
      const tg = spiderTarget.current;
      const vl = spiderVel.current;

      const sleepX = 65; // Underneath logo top-left
      const sleepY = 105;

      const scaleFactor = 0.76; // Default scale is reduced to 75% size to avoid clutter!

      // 1. DOM SCANNING FOR CURIOUS CLUSTERS (Throttled perfectly to every 2 seconds)
      const nowTime = Date.now();
      if (nowTime - lastDomScan.current > 2000) {
        lastDomScan.current = nowTime;
        // Search buttons
        const elements = document.querySelectorAll("button, a, [role='button'], .hover-spider-target");
        const foundRects: { x: number; y: number; w: number; h: number }[] = [];
        elements.forEach((el) => {
          const text = (el.textContent || "").toLowerCase();
          const cls = (el.className || "").toLowerCase();
          if (
            text.includes("join") ||
            text.includes("register") ||
            text.includes("program") ||
            text.includes("about") ||
            text.includes("story") ||
            text.includes("تواصل") ||
            text.includes("سجل") ||
            text.includes("انضم") ||
            text.includes("عن") ||
            cls.includes("btn") ||
            cls.includes("link") ||
            el.classList.contains("hover-spider-target")
          ) {
            const r = el.getBoundingClientRect();
            if (r.width > 10 && r.height > 10 && r.top > 0) {
              foundRects.push({ x: r.left, y: r.top, w: r.width, h: r.height });
            }
          }
        });
        targetButtonsRef.current = foundRects;
      }

      // 2. DYNAMIC SCALE CALCULATIONS
      let targetScale = scaleFactor;
      if (currentMode.current === "sleeping") {
        targetScale = scaleFactor * 0.82; 
      } else if (currentMode.current === "sleeping_entry") {
        if (sleepEntryTimer.current > 35) {
          targetScale = scaleFactor; 
        } else {
          const crawlProgress = (35 - sleepEntryTimer.current) / 35; // 0 to 1
          targetScale = scaleFactor * (1.0 - crawlProgress * 0.18); 
        }
      } else if (currentMode.current === "wakeup" && wakeupTimer.current > 30) {
        const climbProgress = (65 - wakeupTimer.current) / 35; // 0 to 1
        targetScale = scaleFactor * (0.82 + climbProgress * 0.18);
      } else if (currentMode.current === "dropping") {
        const spawnProgress = Math.min(1.0, (50 - spawnTimer.current) / 50);
        targetScale = scaleFactor * (0.4 + spawnProgress * 0.6);
      }
      spiderScale.current += (targetScale - spiderScale.current) * 0.10;

      // Update pocket shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (pocketShake.current.time > 0) {
        pocketShake.current.time--;
        const intensity = pocketShake.current.time * 0.7;
        shakeX = Math.sin(Date.now() * 0.22) * intensity;
        shakeY = Math.cos(Date.now() * 0.20) * intensity;
      }

      // 3. STATEMACHINE & REAL CHARACTER BEHAVIOR
      const timeSinceActivity = Date.now() - lastUserActivity.current;
      
      // Determine emotional vibe
      let emotion: "happy" | "sleepy" | "irritated" | "curious" | "annoyed" = "happy";
      if (timeSinceActivity > 15000) {
        emotion = "sleepy";
        if (idleState.current !== "asleep" && currentMode.current === "normal") {
          idleState.current = "asleep";
        }
      } else if (pokeCount.current >= 4) {
        emotion = "annoyed";
      } else if (pokeCount.current >= 2) {
        emotion = "irritated";
      } else if (currentCuriousTarget.current !== null) {
        emotion = "curious";
      }

      // 4. RANDOM CURIOUS WANDERING (10% chance)
      if (currentMode.current === "normal" && idleState.current !== "asleep") {
        idleTimer.current--;
        
        if (idleTimer.current <= 0) {
          const dice = Math.random();
          if (dice < 0.12 && targetButtonsRef.current.length > 0) {
            const idx = Math.floor(Math.random() * targetButtonsRef.current.length);
            const btn = targetButtonsRef.current[idx];
            currentCuriousTarget.current = {
              x: btn.x + btn.w * (0.2 + Math.random() * 0.6),
              y: btn.y + btn.h * 1.1 
            };
            idleState.current = "curious";
            idleTimer.current = 150 + Math.random() * 120; 
          } else if (dice < 0.35) {
            idleState.current = "cleaning";
            idleTimer.current = 80 + Math.random() * 80;
            currentCuriousTarget.current = null;
          } else if (dice < 0.55) {
            idleState.current = "looking";
            idleTimer.current = 100 + Math.random() * 100;
            currentCuriousTarget.current = null;
          } else {
            idleState.current = "idle";
            idleTimer.current = 90 + Math.random() * 90;
            currentCuriousTarget.current = null;
          }
        }
      }

      // Determine organic target based on character state
      let characterTarget = { x: tg.x, y: tg.y };
      
      if (currentMode.current === "normal") {
        if (currentCuriousTarget.current && idleState.current === "curious") {
          characterTarget = currentCuriousTarget.current;
        } else if (idleState.current === "asleep") {
          characterTarget = { x: sp.x, y: sp.y };
        } else if (idleState.current === "looking") {
          const wave = Math.sin(Date.now() * 0.003) * 35;
          const waveCos = Math.cos(Date.now() * 0.002) * 20;
          characterTarget = { x: tg.x + wave, y: tg.y + waveCos };
        }
      }

      // Apply 250-500ms lag tracking to characterTarget
      const organicLagRatio = 0.06; 
      lagTarget.current.x += (characterTarget.x - lagTarget.current.x) * organicLagRatio;
      lagTarget.current.y += (characterTarget.y - lagTarget.current.y) * organicLagRatio;

      // Handle pocket triggers
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

      // Handle custom modes
      if (currentMode.current === "dropping") {
        spawnTimer.current--;
        hoverInteractivityRef.current = null;

        const idealTargetX = window.innerWidth / 2;
        const idealTargetY = window.innerHeight * 0.35;

        const progress = Math.min(1.0, (50 - spawnTimer.current) / 50);
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
        hoverInteractivityRef.current = null; 
        
        tg.x = sleepX + shakeX;
        tg.y = sleepY + 4 + shakeY;

        sp.x += (tg.x - sp.x) * 0.1;
        sp.y += (tg.y - sp.y) * 0.1;
        
        dynamicLegReach.current += (16 - dynamicLegReach.current) * 0.12; 
        spiderAngle.current += (Math.PI * 0.50 - spiderAngle.current) * 0.12; 
        
        if (Math.random() < 0.018) {
          zListRef.current.push({
            x: pX() + (Math.random() * 12 - 6),
            y: pY() - 4,
            vy: -0.3 - Math.random() * 0.4,
            life: 1.0,
            text: Math.random() < 0.4 ? "z" : (Math.random() < 0.8 ? "Zz" : "Zzz"),
            size: 6 + Math.random() * 5
          });
        }
      } else if (currentMode.current === "sleeping_entry") {
        hoverInteractivityRef.current = null;

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
          
          dynamicLegReach.current += (40 - dynamicLegReach.current) * 0.12;

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
          dynamicLegReach.current += (18 - dynamicLegReach.current) * 0.12; 
          
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
          
          dynamicLegReach.current += (22 - dynamicLegReach.current) * 0.1; 
        } else {
          dynamicLegReach.current += (42 - dynamicLegReach.current) * 0.15;
          
          let diff = Math.atan2(vl.y, vl.x) - spiderAngle.current;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          spiderAngle.current += diff * 0.12;
        }

        if (wakeupTimer.current <= 0) {
          currentMode.current = "normal";
        }
      } else {
        dynamicLegReach.current += (42 - dynamicLegReach.current) * 0.1;
      }

      // 4. COMPUTE INTERPOLATED COORDINATES CHASE
      let dx = lagTarget.current.x - sp.x;
      let dy = lagTarget.current.y - sp.y;
      const distance = Math.hypot(dx, dy);

      const isShooting = isWebShooting.current;
      let attractionForce = isShooting ? 0.35 : (currentMode.current === "dropping" ? 0.0 : 0.07);
      let maxSpeed = isShooting ? 30 : (currentMode.current === "dropping" ? 0 : 13.5); 

      if (currentMode.current === "wakeup") {
        if (wakeupTimer.current > 30) {
          vl.x = 0;
          vl.y = 0;
        } else {
          if (wakeupTimer.current === 30) {
            vl.y = -8.5;
            vl.x = 4.5;
          }
          vl.y += 0.34; 
          vl.x *= 0.95;
          vl.y *= 0.95;
          sp.x += vl.x;
          sp.y += vl.y;
        }
      } else if (currentMode.current === "dropping") {
        // Managed in state dropping block
      } else if (distance > (currentMode.current === "sleeping" ? 2 : 10)) {
        vl.x += dx * attractionForce;
        vl.y += dy * attractionForce;

        const speed = Math.hypot(vl.x, vl.y);
        const friction = isShooting ? 0.95 : 0.77; 
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
          spiderAngle.current += diff * 0.12; 
        }
      } else {
        vl.x *= 0.55;
        vl.y *= 0.55;
        sp.x += vl.x;
        sp.y += vl.y;
        
        if (currentMode.current === "sleeping" || emotion === "sleepy") {
          sp.y += Math.sin(Date.now() * 0.0018) * 0.12; 
          if (emotion === "sleepy" && Math.random() < 0.012) {
            zListRef.current.push({
              x: sp.x + (Math.random() * 8 - 4),
              y: sp.y - 4,
              vy: -0.35 - Math.random() * 0.3,
              life: 1.0,
              text: "z",
              size: 5 + Math.random() * 4
            });
          }
        } else {
          sp.y += Math.sin(Date.now() * 0.004) * 0.18; 
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

      function pX() {
        let sX = 0;
        if (pocketShake.current.time > 0) {
          sX = Math.sin(Date.now() * 0.22) * pocketShake.current.time * 0.7;
        }
        return sleepX + sX;
      }
      function pY() {
        let sY = 0;
        if (pocketShake.current.time > 0) {
          sY = Math.cos(Date.now() * 0.20) * pocketShake.current.time * 0.7;
        }
        return sleepY + sY;
      }

      if (currentMode.current === "dropping") {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sp.x, 0);
        ctx.lineTo(sp.x, sp.y - 10);
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
        const nestX = pX();
        const nestY = pY();
        
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

        drawCable(nestX - 16, nestY - 6, 24, 48);
        drawCable(nestX - 8, nestY - 6, 24, 76);
        drawCable(nestX + 16, nestY - 6, 82, 76);
        drawCable(nestX + 22, nestY - 3, 125, 66);

        const nestBreathing = (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") 
          ? Math.sin(Date.now() * 0.0016) * 1.5 
          : 0;

        ctx.beginPath();
        ctx.moveTo(nestX - 22, nestY - 8);
        ctx.bezierCurveTo(
          nestX - 22 - nestBreathing, 
          nestY + 24 + nestBreathing, 
          nestX + 22 + nestBreathing, 
          nestY + 24 + nestBreathing, 
          nestX + 22, 
          nestY - 8
        );
        ctx.quadraticCurveTo(nestX, nestY - 2, nestX - 22, nestY - 8);
        ctx.closePath();

        const gradBack = ctx.createLinearGradient(nestX, nestY - 10, nestX, nestY + 24);
        gradBack.addColorStop(0, "rgba(8, 12, 24, 0.99)"); 
        gradBack.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
        gradBack.addColorStop(1, "rgba(30, 41, 59, 0.95)"); 
        ctx.fillStyle = gradBack;
        ctx.fill();

        ctx.lineWidth = 1.35;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 5;
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
        ctx.arc(tear.x, tear.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = zListRef.current.length - 1; i >= 0; i--) {
        const z = zListRef.current[i];
        z.y += z.vy;
        z.x += Math.sin(Date.now() * 0.01 + z.y) * 0.18; 
        z.life -= 0.009; 
        
        if (z.life <= 0) {
          zListRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = z.life;
        ctx.fillStyle = "rgba(56, 189, 248, 0.9)"; 
        ctx.font = `bold ${z.size}px monospace`;
        ctx.fillText(z.text, z.x, z.y);
        ctx.restore();
      }
      ctx.globalAlpha = 1.0; 

      const maxDustLimit = 22;
      if (dustRef.current.length > maxDustLimit) {
        dustRef.current.splice(0, dustRef.current.length - maxDustLimit);
      }
      for (let i = dustRef.current.length - 1; i >= 0; i--) {
        const dust = dustRef.current[i];
        dust.alpha -= 0.045;
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
        rp.radius += (rp.maxRadius - rp.radius) * 0.12; 
        rp.alpha -= 0.038;

        if (rp.alpha <= 0) {
          rippleRef.current = null;
        } else {
          ctx.save();
          ctx.globalAlpha = rp.alpha;
          
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = rp.color;
          ctx.lineWidth = 1.1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `${rp.color}0c`;
          ctx.fill();

          ctx.restore();
          ctx.globalAlpha = 1.0;
        }
      }

      const currentInteractivity = hoverInteractivityRef.current;
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

          const waveAmplitude = Math.sin((Date.now() * 0.02) + i) * 3 * (1 - t) * (t);
          const dxWave = targetCenterX - sp.x;
          const dyWave = targetCenterY - sp.y;
          const lenWave = Math.hypot(dxWave, dyWave);
          const pxWave = -dyWave / (lenWave || 1);
          const pyWave = dxWave / (lenWave || 1);

          ctx.lineTo(currX + pxWave * waveAmplitude, currY + pyWave * waveAmplitude);
        }

        ctx.strokeStyle = "rgba(16, 185, 129, 0.55)"; 
        ctx.lineWidth = 1.35;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (isShooting && webProgress.current > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(webTarget.current.x, webTarget.current.y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${webProgress.current})`;
        ctx.lineWidth = 1.8 * webProgress.current;
        ctx.stroke();
        ctx.restore();
      }

      const bodyAngle = spiderAngle.current;
      const reach = dynamicLegReach.current;

      legsRef.current.forEach((leg) => {
        const angleOffset = leg.side === "left" 
          ? legAnglesLeft[leg.index] * (Math.PI / 180)
          : legAnglesRight[leg.index] * (Math.PI / 180);

        const attachmentAngle = bodyAngle + angleOffset;
        
        const rootX = sp.x + Math.cos(attachmentAngle) * 9.5 * spiderScale.current;
        const rootY = sp.y + Math.sin(attachmentAngle) * 9.5 * spiderScale.current;

        const distToSleep = Math.hypot(sleepX - sp.x, sleepY - sp.y);

        if (currentMode.current === "wakeup" && wakeupTimer.current > 30) {
          const sMult = spiderScale.current;
          const cycle = Date.now() * 0.016;
          const legPhase = leg.index * 1.5 + (leg.side === "left" ? 0 : Math.PI);
          
          leg.footX = sp.x + (leg.side === "left" ? -15 : 15) * sMult + Math.sin(cycle + legPhase) * 7 * sMult;
          leg.footY = sp.y + (leg.index - 1.5) * 6 * sMult + Math.cos(cycle + legPhase) * 9 * sMult;
          
          leg.idealX = leg.footX;
          leg.idealY = leg.footY;
          leg.stepProgress = 1.0;
        } else if (currentMode.current === "sleeping_entry" && sleepEntryTimer.current > 35) {
          const sMult = spiderScale.current;
          const cycle = Date.now() * 0.016;
          const legPhase = leg.index * 1.5 + (leg.side === "left" ? 0 : Math.PI);
          
          leg.footX = sp.x + (leg.side === "left" ? -15 : 15) * sMult + Math.sin(cycle + legPhase) * 7 * sMult;
          leg.footY = sp.y + (leg.index - 1.5) * 6 * sMult + Math.cos(cycle + legPhase) * 9 * sMult;
          
          leg.idealX = leg.footX;
          leg.idealY = leg.footY;
          leg.stepProgress = 1.0;
        } else if ((currentMode.current === "sleeping" && distToSleep < 16) || (currentMode.current === "sleeping_entry" && sleepEntryTimer.current <= 35)) {
          const sMult = spiderScale.current;
          const curlAngle = bodyAngle + (leg.side === "left" ? -Math.PI / 1.7 : Math.PI / 1.7) + (leg.index - 1.5) * 0.18;
          const foldWidth = (12 + leg.index * 1.0) * sMult; 
          leg.idealX = rootX + Math.cos(curlAngle) * foldWidth;
          leg.idealY = rootY + Math.sin(curlAngle) * foldWidth;
          
          leg.footX += (leg.idealX - leg.footX) * 0.15;
          leg.footY += (leg.idealY - leg.footY) * 0.15;
          leg.stepProgress = 1.0;
        } else if (idleState.current === "cleaning" && leg.side === "left" && leg.index === 0) {
          const sMult = spiderScale.current;
          const cleanAngle = bodyAngle - Math.PI / 2 + Math.sin(Date.now() * 0.02) * 0.6;
          leg.idealX = rootX + Math.cos(cleanAngle) * 35 * sMult;
          leg.idealY = rootY + Math.sin(cleanAngle) * 35 * sMult;
          
          leg.footX += (leg.idealX - leg.footX) * 0.18;
          leg.footY += (leg.idealY - leg.footY) * 0.18;
          leg.stepProgress = 1.0;
          
          if (Math.random() < 0.1) {
            dustRef.current.push({
              x: leg.footX,
              y: leg.footY,
              alpha: 0.8,
              color: "#fbbf24",
              size: 0.8
            });
          }
        } else {
          const splayAngle = bodyAngle + angleOffset * 1.35;
          leg.idealX = rootX + Math.cos(splayAngle) * reach * spiderScale.current;
          leg.idealY = rootY + Math.sin(splayAngle) * reach * spiderScale.current;
        }

        const curDist = Math.hypot(leg.idealX - leg.footX, leg.idealY - leg.footY);
        const stepThreshold = currentMode.current === "sleeping" ? 8 : 35; 
        if (curDist > stepThreshold && leg.stepProgress >= 1.0) {
          const otherStepping = legsRef.current.some(
            (other) => other.side === leg.side && other.index !== leg.index && other.stepProgress < 0.6
          );

          if (!otherStepping || curDist > 65) {
            leg.stepStartX = leg.footX;
            leg.stepStartY = leg.footY;
            leg.stepProgress = 0.0;
          }
        }

        if (leg.stepProgress < 1.0) {
          const defaultStepSpeed = currentMode.current === "sleeping" ? 0.22 : 0.14;
          const stepSpeed = defaultStepSpeed + Math.min(0.18, Math.hypot(vl.x, vl.y) * 0.015);
          leg.stepProgress += stepSpeed;

          if (leg.stepProgress >= 1.0) {
            leg.stepProgress = 1.0;
            leg.footX = leg.idealX;
            leg.footY = leg.idealY;

            if (currentMode.current !== "sleeping" && Math.hypot(vl.x, vl.y) > 0.8) {
              dustRef.current.push({
                x: leg.footX,
                y: leg.footY,
                alpha: 0.5,
                color: leg.side === "left" ? "#a855f7" : "#ec4899", 
                size: 0.8 + Math.random() * 0.8
              });
            }
          } else {
            const t = leg.stepProgress;
            const curX = leg.stepStartX + (leg.idealX - leg.stepStartX) * t;
            const curY = leg.stepStartY + (leg.idealY - leg.stepStartY) * t;
            
            const liftHeight = Math.sin(t * Math.PI) * (currentMode.current === "sleeping" ? 4 : 12);
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

        const bendOffset = (leg.side === "left" ? -18 : 18) * (reach / 42) * spiderScale.current;
        const jointX = midX + perpX * bendOffset;
        const jointY = midY + perpY * bendOffset - (10 * (reach / 42)) * spiderScale.current;

        const isTucked = currentMode.current === "sleeping" || currentMode.current === "sleeping_entry";

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(jointX, jointY);
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = (isTucked ? 1.8 : 3.2) * spiderScale.current;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.strokeStyle = "#6b21a8";
        ctx.lineWidth = (isTucked ? 0.8 : 1.6) * spiderScale.current;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(jointX, jointY);
        ctx.lineTo(leg.footX, leg.footY);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = (isTucked ? 1.2 : 2.4) * spiderScale.current;
        ctx.stroke();

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = (isTucked ? 0.5 : 1.0) * spiderScale.current;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(leg.footX, leg.footY, (isTucked ? 1.2 : 2.4) * spiderScale.current, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = isTucked ? 2 : 5;
        ctx.fill();
        ctx.shadowBlur = 0; 
      });

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(bodyAngle);

      const bodyScale = spiderScale.current;
      ctx.scale(bodyScale, bodyScale);

      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.8;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-2.5, 0, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      let reactorGlow = "#a855f7"; 
      let glowIntensity = 10;

      if (emotion === "sleepy") {
        const pulse = Math.sin(Date.now() * 0.0015) * 0.35 + 0.5;
        reactorGlow = `rgba(147, 51, 234, ${0.15 + pulse * 0.4})`; 
        glowIntensity = 3 + pulse * 4;
      } else if (emotion === "curious") {
        reactorGlow = "#10b981"; 
        glowIntensity = 12;
      } else if (emotion === "irritated") {
        reactorGlow = "#f59e0b"; 
        glowIntensity = 14;
      } else if (emotion === "annoyed") {
        const pulse = Math.floor(Date.now() / 90) % 2 === 0;
        reactorGlow = pulse ? "#ef4444" : "#a855f7"; 
        glowIntensity = 18;
      }

      ctx.beginPath();
      ctx.arc(-2.5, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = reactorGlow;
      ctx.shadowColor = reactorGlow.startsWith("rgba") ? "#9333ea" : reactorGlow;
      ctx.shadowBlur = glowIntensity;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.ellipse(7.5, 0, 3, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      
      if (currentMode.current === "sleeping" || emotion === "sleepy") {
        const isAngry = pokeCount.current >= 5;
        const isMildlyIrritated = pokeCount.current >= 3;

        ctx.save();
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";

        if (isAngry) {
          ctx.strokeStyle = "#f87171"; 
          ctx.beginPath();
          ctx.moveTo(8, -3.5);
          ctx.lineTo(5.5, -2);
          ctx.lineTo(8, -0.5);
          ctx.moveTo(8, 3.5);
          ctx.lineTo(5.5, 2);
          ctx.lineTo(8, 0.5);
          ctx.stroke();
        } else if (isMildlyIrritated) {
          ctx.strokeStyle = "#facc15"; 
          ctx.beginPath();
          ctx.moveTo(7, -2.5);
          ctx.lineTo(5.5, -2.5);
          ctx.moveTo(7, 2.5);
          ctx.lineTo(5.5, 2.5);
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#38bdf8"; 
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(6.5, -2.5, 1.5, Math.PI, 0, false); 
          ctx.arc(6.5, 2.5, 1.5, Math.PI, 0, false);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        let eyeColor = "#ef4444"; 
        if (emotion === "curious") eyeColor = "#10b981"; 
        if (currentMode.current === "wakeup") eyeColor = "#22c55e"; 

        ctx.beginPath();
        ctx.arc(7, -2.2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 4;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(7, 2.2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; 
      }

      ctx.restore();

      ctx.save();
      {
        const nestX = pX();
        const nestY = pY();
        
        ctx.shadowColor = "rgba(168, 85, 247, 0.35)";
        ctx.shadowBlur = 5;

        const nestBreathing = (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") 
          ? Math.sin(Date.now() * 0.0016) * 1.5 
          : 0;

        ctx.beginPath();
        ctx.moveTo(nestX - 22, nestY - 8);
        ctx.bezierCurveTo(
          nestX - 22 - nestBreathing, 
          nestY + 24 + nestBreathing, 
          nestX + 22 + nestBreathing, 
          nestY + 24 + nestBreathing, 
          nestX + 22, 
          nestY - 8
        );
        ctx.quadraticCurveTo(nestX, nestY - 2, nestX - 22, nestY - 8);
        ctx.closePath();
        
        const gradFront = ctx.createLinearGradient(nestX, nestY - 10, nestX, nestY + 24);
        gradFront.addColorStop(0, "rgba(15, 23, 42, 0.45)"); 
        gradFront.addColorStop(0.5, "rgba(107, 33, 168, 0.38)"); 
        gradFront.addColorStop(1, "rgba(16, 185, 129, 0.65)"); 
        ctx.fillStyle = gradFront;
        ctx.fill();

        ctx.lineWidth = 1.35;
        ctx.strokeStyle = "rgba(168, 85, 247, 0.85)"; 
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(nestX - 19, nestY + 2);
        ctx.bezierCurveTo(nestX - 12, nestY + 16, nestX + 12, nestY + 16, nestX + 19, nestY + 2);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.55)";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(nestX - 15, nestY + 8);
        ctx.bezierCurveTo(nestX - 8, nestY + 20, nestX + 8, nestY + 20, nestX + 15, nestY + 8);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.65)"; 
        ctx.stroke();
      }
      ctx.restore();

      if (irritatedTimer.current > 0) {
        irritatedTimer.current--;

        ctx.save();
        const bubX = pX() + 26;
        const bubY = pY() - 10;
        
        ctx.translate(bubX, bubY);
        
        const flicker = Math.sin(Date.now() * 0.15) * 0.1 + 0.9;
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
            <span>🕷️</span> إيقاظ مرافق STEM ⚡
          </button>
        ) : (
          <button
            onClick={() => setIsSleeping(true)}
            className="bg-[#0f172a]/95 hover:bg-purple-950/90 border border-slate-700/60 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-[10px] px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-lg active:scale-95"
            title="إرسال المرافق الرقمي لشبكته ليستريح"
            dir="rtl"
          >
            <span>🕷️</span> إراحة مرافق STEM
          </button>
        )}
      </div>
    </>
  );
}
