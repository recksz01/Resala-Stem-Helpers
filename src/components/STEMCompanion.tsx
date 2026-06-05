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
  const [isSleeping, setIsSleeping] = useState(() => {
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("has_visited_companion");
      if (hasVisited) {
        return true;
      }
      localStorage.setItem("has_visited_companion", "true");
    }
    return false;
  });
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
  const isSleepingInit = typeof window !== "undefined" && !!localStorage.getItem("has_visited_companion");
  const spiderPos = useRef(isSleepingInit ? { x: 65, y: 105 } : { x: window.innerWidth / 2, y: window.innerHeight * 0.45 }); // Start centered inside screen for breakout digging or inside pocket
  const spiderTarget = useRef(isSleepingInit ? { x: 65, y: 105 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lagTarget = useRef(isSleepingInit ? { x: 65, y: 105 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 }); // Lag target for 200-500ms smooth organic delay
  
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
  const targetSectionsRef = useRef<{ x: number; y: number; w: number; h: number; title: string }[]>([]);
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
    const isSleepingInit = typeof window !== "undefined" && !!localStorage.getItem("has_visited_companion");
    if (isDone) {
      setIsPreloaderFinished(true);
      if (currentMode.current === "hidden") {
        if (isSleepingInit) {
          currentMode.current = "sleeping";
          spiderPos.current = { x: 65, y: 105 };
          spiderTarget.current = { x: 65, y: 105 };
          lagTarget.current = { x: 65, y: 105 };
        } else {
          currentMode.current = "dropping";
          spawnTimer.current = 50;
          spiderPos.current = { x: window.innerWidth / 2, y: -120 };
        }
      }
    }

    const handlePreloaderFinished = () => {
      // Delay slightly by 700ms to allow the preloader transition blur/fadeout to completely clear!
      setTimeout(() => {
        setIsPreloaderFinished(true);
        const isSleepingInitSub = typeof window !== "undefined" && !!localStorage.getItem("has_visited_companion");
        if (currentMode.current === "hidden") {
          if (isSleepingInitSub) {
            currentMode.current = "sleeping";
            spiderPos.current = { x: 65, y: 105 };
            spiderTarget.current = { x: 65, y: 105 };
            lagTarget.current = { x: 65, y: 105 };
          } else {
            currentMode.current = "dropping";
            spawnTimer.current = 50; // loftier and clearer drop!
            spiderPos.current = { x: window.innerWidth / 2, y: -120 };
          }
        }
      }, 700);
    };

    window.addEventListener("preloaderFinished", handlePreloaderFinished);

    // Fallback polling check every 300ms to verify preloader status
    const pollInterval = setInterval(() => {
      if (!!(window as any).__preloaderFinished) {
        clearInterval(pollInterval);
        setIsPreloaderFinished(true);
        const isSleepingInitSub = typeof window !== "undefined" && !!localStorage.getItem("has_visited_companion");
        if (currentMode.current === "hidden") {
          // Delay briefly for fallback as well to sync beautifully
          setTimeout(() => {
            if (isSleepingInitSub) {
              currentMode.current = "sleeping";
              spiderPos.current = { x: 65, y: 105 };
              spiderTarget.current = { x: 65, y: 105 };
              lagTarget.current = { x: 65, y: 105 };
            } else {
              currentMode.current = "dropping";
              spawnTimer.current = 50;
              spiderPos.current = { x: window.innerWidth / 2, y: -120 };
            }
          }, 700);
        }
      }
    }, 300);

    // Unconditional safety timeout: force spawn after 10 seconds absolute max
    const safetyTimeout = setTimeout(() => {
      setIsPreloaderFinished(true);
      const isSleepingInitSub = typeof window !== "undefined" && !!localStorage.getItem("has_visited_companion");
      if (currentMode.current === "hidden") {
        if (isSleepingInitSub) {
          currentMode.current = "sleeping";
          spiderPos.current = { x: 65, y: 105 };
          spiderTarget.current = { x: 65, y: 105 };
          lagTarget.current = { x: 65, y: 105 };
        } else {
          currentMode.current = "dropping";
          spawnTimer.current = 50;
        }
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for superb smooth performance while maintaining extreme clarity
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      if (ctx.resetTransform) {
        ctx.resetTransform();
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
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
          color: isExtremelyAngry ? "#a855f7" : "#06b6d4", // Purple or Cyan sparks
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
        color: isExtremelyAngry ? "#a855f7" : "#06b6d4"
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
            color: s % 2 === 0 ? "#06b6d4" : "#a855f7", // Purple and Cyan only
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
        color: hitsActiveEl ? "#06b6d4" : "#a855f7" // cyan for clicks, purple for standard
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
          color: hitsActiveEl ? "#06b6d4" : "#a855f7"
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
      try {
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

          // Search major sections for Companion discovery logic!
          const sections = document.querySelectorAll("section");
          const foundSections: { x: number; y: number; w: number; h: number; title: string }[] = [];
          sections.forEach((sec) => {
            const r = sec.getBoundingClientRect();
            if (r.height > 100 && r.top < window.innerHeight && r.bottom > 0) {
              const heading = sec.querySelector("h1, h2, h3, h4");
              let targetX = r.left + r.width / 2;
              let targetY = r.top + r.height / 3; // Focus on the upper central area of section
              if (heading) {
                const hr = heading.getBoundingClientRect();
                targetX = hr.left + hr.width / 2;
                targetY = hr.top + hr.height / 2;
              }
              foundSections.push({
                x: targetX,
                y: targetY,
                w: r.width,
                h: r.height,
                title: heading?.textContent || "section"
              });
            }
          });
          targetSectionsRef.current = foundSections;
        }

        // 2. DYNAMIC SCALE CALCULATIONS
        let targetScale = scaleFactor;
        if (currentMode.current === "sleeping") {
          targetScale = scaleFactor * 0.82; // Strong detailed scale, never shriveled or tiny!
        } else if (currentMode.current === "sleeping_entry") {
          if (sleepEntryTimer.current > 35) {
            targetScale = scaleFactor; // Maintain full scale while heading to the rim
          } else {
            // Smoothly scale down as we backtrack and descend inside
            const crawlProgress = (35 - sleepEntryTimer.current) / 35; // 0 to 1
            targetScale = scaleFactor * (1.0 - crawlProgress * 0.18); 
          }
        } else if (currentMode.current === "wakeup" && wakeupTimer.current > 30) {
          // Smoothly scale up from sleeping scale
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

        // 4. RANDOM CURIOUS WANDERING (Chance to check section focus headers or high-value action buttons when mouse is still!)
        if (currentMode.current === "normal" && idleState.current !== "asleep") {
          idleTimer.current--;
          
          if (idleTimer.current <= 0) {
            // Transition to random behavior
            const dice = Math.random();
            if (dice < 0.15 && targetSectionsRef.current.length > 0) {
              // New exploration: Section Discovery! Let the spider go inspect visual page sections
              const idx = Math.floor(Math.random() * targetSectionsRef.current.length);
              const sec = targetSectionsRef.current[idx];
              currentCuriousTarget.current = {
                x: sec.x,
                y: sec.y
              };
              idleState.current = "curious";
              idleTimer.current = 120 + Math.random() * 80; // Stand still for ~2-3 seconds at the section heading!
              
              // Display clean holographic scan feedback for actual user-facing feedback
              const secTitle = sec.title.trim();
              let scanMsg = "استكشاف قسم نشط... 🔍";
              if (secTitle.includes("مسار") || secTitle.toLowerCase().includes("masar")) {
                scanMsg = "تفقد تفاصيل مهرجان مسار القاهرة 💡🎪";
              } else if (secTitle.includes("story") || secTitle.includes("Story") || secTitle.includes("بناء")) {
                scanMsg = "قراءة قصة مباركة ورسالة الجمعية 📚✨";
              } else if (secTitle.toLowerCase().includes("member") || secTitle.includes("Fame") || secTitle.includes("شرف")) {
                scanMsg = "استكشاف قائمة مبدعي الشهر 👑🏆";
              } else if (secTitle.includes("Focus") || secTitle.toLowerCase().includes("programs")) {
                scanMsg = "مراجعة البرامج الأكاديمية والمقاعد 🌐🚀";
              }
              hologramText.current = scanMsg;
              irritatedTimer.current = 100; // Keep bubble visible while examining section
            } else if (dice < 0.25 && targetButtonsRef.current.length > 0) {
              // Fanciful Curiosity: Pick an active button to inspect!
              const idx = Math.floor(Math.random() * targetButtonsRef.current.length);
              const btn = targetButtonsRef.current[idx];
              currentCuriousTarget.current = {
                x: btn.x + btn.w * (0.2 + Math.random() * 0.6),
                y: btn.y + btn.h * 1.1 // sit slightly below the click area!
              };
              idleState.current = "curious";
              idleTimer.current = 150 + Math.random() * 120; // 3 to 5 seconds
            } else if (dice < 0.45) {
              // Play leg cleaning cycle
              idleState.current = "cleaning";
              idleTimer.current = 80 + Math.random() * 80;
              currentCuriousTarget.current = null;
            } else if (dice < 0.65) {
              // General wander/exploration around the target area
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
            // If sleeping, slither slowly to a cozy corner or stay static
            characterTarget = { x: sp.x, y: sp.y };
          } else if (idleState.current === "looking") {
            // Add organic curved paths on top of cursor line
            const wave = Math.sin(Date.now() * 0.003) * 35;
            const waveCos = Math.cos(Date.now() * 0.002) * 20;
            characterTarget = { x: tg.x + wave, y: tg.y + waveCos };
          }
        }

        // Apply 250-500ms lag tracking to characterTarget
        // Interpolate lagTarget toward the actual organic character target
        const organicLagRatio = 0.06; // Delay factor for butter-smooth weight
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
          irritatedTimer.current = 0; // Clear hologram bubble

          // Spray vibrant gold and emerald celebration sparks!
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

          // Elegant physical elastic bounce with 50 frames
          const progress = Math.min(1.0, (50 - spawnTimer.current) / 50);
          const elastic = 1.0 - Math.cos(progress * Math.PI * 1.5) * Math.exp(-progress * 3.5);
          
          sp.x = idealTargetX;
          sp.y = -120 + (idealTargetY - (-120)) * elastic;
          spiderAngle.current = Math.PI / 2; // Face downwards while descending

          if (Math.random() < 0.45) {
            dustRef.current.push({
              x: sp.x + (Math.random() * 12 - 6),
              y: sp.y + 10,
              alpha: 1.0,
              color: Math.random() > 0.5 ? "#10b981" : "#a855f7",
              size: 1.0 + Math.random() * 1.5
            });
          }

          // Trigger complete land stabilization
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
            
            // Outer ripple on land!
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
          spiderAngle.current += (Math.PI * 0.50 - spiderAngle.current) * 0.12; // Sleep angle
          
          // Spawn Zzz characters floating up from sleeping pocket
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

            const backtrackProgress = (35 - sleepEntryTimer.current) / 35; // 0 to 1
            
            sp.x = sleepX + Math.sin(backtrackProgress * Math.PI * 5.0) * 1.8;
            sp.y = (sleepY - 18) + backtrackProgress * 22; // slide backwards down

            spiderAngle.current += (Math.PI * 0.50 - spiderAngle.current) * 0.12; 
            dynamicLegReach.current += (18 - dynamicLegReach.current) * 0.12; // folds snugly
            
            if (sleepEntryTimer.current === 35) {
              pocketShake.current.time = 24; // trigger soft custom impact drop wiggle!
            }
          }

          if (sleepEntryTimer.current <= 0) {
            currentMode.current = "sleeping";
          }
        } else if (currentMode.current === "wakeup") {
          wakeupTimer.current--;

          if (wakeupTimer.current > 30) {
            const climbT = (65 - wakeupTimer.current) / 35; // 0 to 1
            sp.x = sleepX + Math.sin(climbT * Math.PI * 4.5) * 2; 
            sp.y = (sleepY + 4) - climbT * 18;
            spiderAngle.current = -Math.PI / 2; // face upwards as it climbs out
            
            dynamicLegReach.current += (22 - dynamicLegReach.current) * 0.1; // partial legs open
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
          // Normal Mode:
          dynamicLegReach.current += (42 - dynamicLegReach.current) * 0.1;
        }

        // 4. COMPUTE INTERPOLATED COORDINATES CHASE
        let dx = lagTarget.current.x - sp.x;
        let dy = lagTarget.current.y - sp.y;
        const distance = Math.hypot(dx, dy);

        const isShooting = isWebShooting.current;
        let attractionForce = isShooting ? 0.35 : (currentMode.current === "dropping" ? 0.0 : 0.07);
        let maxSpeed = isShooting ? 30 : (currentMode.current === "dropping" ? 0 : 13.5); // Smoother, lighter movement limits

        if (currentMode.current === "wakeup") {
          if (wakeupTimer.current > 30) {
            vl.x = 0;
            vl.y = 0;
          } else {
            if (wakeupTimer.current === 30) {
              vl.y = -8.5;
              vl.x = 4.5;
            }
            vl.y += 0.34; // gravity accel
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

          // Limiter/friction
          const speed = Math.hypot(vl.x, vl.y);
          const friction = isShooting ? 0.95 : 0.77; // high-inertia ease
          vl.x *= friction;
          vl.y *= friction;

          if (speed > maxSpeed) {
            vl.x = (vl.x / speed) * maxSpeed;
            vl.y = (vl.y / speed) * maxSpeed;
          }

          sp.x += vl.x;
          sp.y += vl.y;

          // Body rotation alignment
          if (currentMode.current !== "dropping" && currentMode.current !== "sleeping") {
            const targetAngle = Math.atan2(dy, dx);
            let diff = targetAngle - spiderAngle.current;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            spiderAngle.current += diff * 0.12; // smooth lazy rotate
          }
        } else {
          // Slow soft settle deceleration
          vl.x *= 0.55;
          vl.y *= 0.55;
          sp.x += vl.x;
          sp.y += vl.y;
          
          // Soft deep breathing
          if (currentMode.current === "sleeping" || emotion === "sleepy") {
            sp.y += Math.sin(Date.now() * 0.0018) * 0.12; // deep slower breathing
            // Spawn sleep drift Zzz in idle sleep
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
            sp.y += Math.sin(Date.now() * 0.004) * 0.18; // active hovering
          }
          
          if (isShooting) {
            isWebShooting.current = false;
          }
        }

        // Handle web laser fadeout
        if (isShooting && webProgress.current > 0) {
          webProgress.current -= 0.06;
          if (webProgress.current <= 0) {
            isWebShooting.current = false;
          }
        }

        // Clear layout canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Helper helper coordinate triggers
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

        // 5. DRAW CLIMB SEED LINE (while spawning)
        if (currentMode.current === "dropping") {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sp.x, 0);
          ctx.lineTo(sp.x, sp.y - 10);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.45)"; 
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.strokeStyle = "rgba(6, 182, 212, 0.7)"; 
          ctx.lineWidth = 0.55;
          ctx.stroke();
          ctx.restore();
        }

        // 6. DRAW COZY DIGITAL COMPANION COCOON BASE (Under Logo navbar element)
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

          // Cocoon base geometry with breathing pulse expansion (COZY NEST LEVEL 3)
          // Expand the pocket bounds gently based on structural breathing loop!
          const nestBreathing = (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") 
            ? Math.sin(Date.now() * 0.0016) * 1.5 // slow rhythmic slumber expansion
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

          // High brightness outline for absolute visibility in light themes
          ctx.lineWidth = 1.35;
          ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 5;
          ctx.stroke();
          ctx.shadowBlur = 0; 
        }
        ctx.restore();

        // 7. DRAW DRIPPING TEARS (crying animation when inside sleep cocoon)
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

        // 8. UPDATE & DRAW RISING SLEEP Zzz SYMBOLS
        for (let i = zListRef.current.length - 1; i >= 0; i--) {
          const z = zListRef.current[i];
          z.y += z.vy;
          z.x += Math.sin(Date.now() * 0.01 + z.y) * 0.18; // drifting drift wave!
          z.life -= 0.009; // slow long fadeout
          
          if (z.life <= 0) {
            zListRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = z.life;
          ctx.fillStyle = "rgba(56, 189, 248, 0.9)"; // Neon cyan sleep Zzz indicators
          ctx.font = `bold ${z.size}px monospace`;
          ctx.fillText(z.text, z.x, z.y);
          ctx.restore();
        }
        ctx.globalAlpha = 1.0; 

        // 9. DRAW MAGICAL SPARKS & WALK DUST
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

        // 10. DRAW RADAR WATER WAVE RIPPLES
        if (rippleRef.current) {
          const rp = rippleRef.current;
          rp.radius += (rp.maxRadius - rp.radius) * 0.12; // Easing path curves
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

        // 11. HACKING FREQUENCY LASER LEASH
        const currentInteractivity = hoverInteractivityRef.current;
        if (currentInteractivity && currentMode.current !== "sleeping") {
          const targetCenterX = currentInteractivity.x + currentInteractivity.width / 2;
          const targetCenterY = currentInteractivity.y + currentInteractivity.height / 2;

          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          
          // High quality vibrating wave
          const segments = 10;
          for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const currX = sp.x + (targetCenterX - sp.x) * t;
            const currY = sp.y + (targetCenterY - sp.y) * t;

            // Vibrating sine line frequency
            const waveAmplitude = Math.sin((Date.now() * 0.02) + i) * 3 * (1 - t) * (t);
            const dxWave = targetCenterX - sp.x;
            const dyWave = targetCenterY - sp.y;
            const lenWave = Math.hypot(dxWave, dyWave);
            const pxWave = -dyWave / (lenWave || 1);
            const pyWave = dxWave / (lenWave || 1);

            ctx.lineTo(currX + pxWave * waveAmplitude, currY + pyWave * waveAmplitude);
          }

          ctx.strokeStyle = "rgba(6, 182, 212, 0.55)"; 
          ctx.lineWidth = 1.35;
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Laser Web Line
        if (isShooting && webProgress.current > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(webTarget.current.x, webTarget.current.y);
          // Emerald/gold light threads for high contrast clicks
          ctx.strokeStyle = `rgba(6, 182, 212, ${webProgress.current})`;
          ctx.lineWidth = 1.8 * webProgress.current;
          ctx.stroke();
          ctx.restore();
        }

        // 12. RUN PROCEDURAL INVERSE KINEMATICS FOR LEGS (at 75% scale factor bounds!)
        const bodyAngle = spiderAngle.current;
        const reach = dynamicLegReach.current;

        legsRef.current.forEach((leg) => {
          const angleOffset = leg.side === "left" 
            ? legAnglesLeft[leg.index] * (Math.PI / 180)
            : legAnglesRight[leg.index] * (Math.PI / 180);

          const attachmentAngle = bodyAngle + angleOffset;
          
          // Root attachment offsets scaled down matching the body
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
            // Fold legs snugly inside the cocoon
            const sMult = spiderScale.current;
            const curlAngle = bodyAngle + (leg.side === "left" ? -Math.PI / 1.7 : Math.PI / 1.7) + (leg.index - 1.5) * 0.18;
            const foldWidth = (12 + leg.index * 1.0) * sMult; 
            leg.idealX = rootX + Math.cos(curlAngle) * foldWidth;
            leg.idealY = rootY + Math.sin(curlAngle) * foldWidth;
            
            leg.footX += (leg.idealX - leg.footX) * 0.15;
            leg.footY += (leg.idealY - leg.footY) * 0.15;
            leg.stepProgress = 1.0;
          } else if (idleState.current === "cleaning" && leg.side === "left" && leg.index === 0) {
            // Play structural "cleaning foot" animation: wave the upper left joint!
            const sMult = spiderScale.current;
            const cleanAngle = bodyAngle - Math.PI / 2 + Math.sin(Date.now() * 0.02) * 0.6;
            leg.idealX = rootX + Math.cos(cleanAngle) * 35 * sMult;
            leg.idealY = rootY + Math.sin(cleanAngle) * 35 * sMult;
            
            leg.footX += (leg.idealX - leg.footX) * 0.18;
            leg.footY += (leg.idealY - leg.footY) * 0.18;
            leg.stepProgress = 1.0;
            
            // Tiny micro Cyan dust at the tip
            if (Math.random() < 0.1) {
              dustRef.current.push({
                x: leg.footX,
                y: leg.footY,
                alpha: 0.8,
                color: "#38bdf8",
                size: 0.8
              });
            }
          } else {
            // Normal walking splay layout
            const splayAngle = bodyAngle + angleOffset * 1.35;
            leg.idealX = rootX + Math.cos(splayAngle) * reach * spiderScale.current;
            leg.idealY = rootY + Math.sin(splayAngle) * reach * spiderScale.current;
          }

          const curDist = Math.hypot(leg.idealX - leg.footX, leg.idealY - leg.footY);
          const stepThreshold = currentMode.current === "sleeping" ? 8 : 35; // lower thresholds for small scale
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
                  color: leg.side === "left" ? "#a855f7" : "#38bdf8", 
                  size: 0.8 + Math.random() * 0.8
                });
              }
            } else {
              const t = leg.stepProgress;
              // Bezier-like curve path lifting
              const curX = leg.stepStartX + (leg.idealX - leg.stepStartX) * t;
              const curY = leg.stepStartY + (leg.idealY - leg.stepStartY) * t;
              
              const liftHeight = Math.sin(t * Math.PI) * (currentMode.current === "sleeping" ? 4 : 12);
              leg.footX = curX;
              leg.footY = curY - liftHeight;
            }
          }

          // DRAW LEG GRAPHICS
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

          // Upper segment (Dark slate / Royal purple inner)
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

          // Lower segment
          ctx.beginPath();
          ctx.moveTo(jointX, jointY);
          ctx.lineTo(leg.footX, leg.footY);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = (isTucked ? 1.2 : 2.4) * spiderScale.current;
          ctx.stroke();

          // Cyan core indicator
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = (isTucked ? 0.5 : 1.0) * spiderScale.current;
          ctx.stroke();

          // Tip glowing indicator node
          ctx.beginPath();
          ctx.arc(leg.footX, leg.footY, (isTucked ? 1.2 : 2.4) * spiderScale.current, 0, Math.PI * 2);
          ctx.fillStyle = "#38bdf8";
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = isTucked ? 2 : 5;
          ctx.fill();
          ctx.shadowBlur = 0; 
        });

        // 13. DRAW CORE BODY Carapace
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(bodyAngle);

        const bodyScale = spiderScale.current;
        ctx.scale(bodyScale, bodyScale);

        // Outer carbon fibers framework
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1.8;
        ctx.fill();
        ctx.stroke();

        // Core engine reactor socket
        ctx.beginPath();
        ctx.arc(-2.5, 0, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();

        // Reactor colors matching EMOTION indicators
        let reactorGlow = "#a855f7"; // neon pink/purple normally
        let glowIntensity = 10;

        if (emotion === "sleepy") {
          const pulse = Math.sin(Date.now() * 0.0015) * 0.35 + 0.5;
          reactorGlow = `rgba(147, 51, 234, ${0.15 + pulse * 0.4})`; // soft sleep glow
          glowIntensity = 3 + pulse * 4;
        } else if (emotion === "curious") {
          reactorGlow = "#38bdf8"; // neon Cyan curious look
          glowIntensity = 12;
        } else if (emotion === "irritated") {
          reactorGlow = "#06b6d4"; // Cyan alert
          glowIntensity = 14;
        } else if (emotion === "annoyed") {
          const pulse = Math.floor(Date.now() / 90) % 2 === 0;
          reactorGlow = pulse ? "#06b6d4" : "#a855f7"; // aggressive flashing Cyan/Purple
          glowIntensity = 18;
        }

        ctx.beginPath();
        ctx.arc(-2.5, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = reactorGlow;
        ctx.shadowColor = reactorGlow.startsWith("rgba") ? "#9333ea" : reactorGlow;
        ctx.shadowBlur = glowIntensity;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visa plate shield
        ctx.beginPath();
        ctx.ellipse(7.5, 0, 3, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        
        // Visor sensors & emotion shapes (HAPPY / ANGRY / CURIOUS)
        if (currentMode.current === "sleeping" || emotion === "sleepy") {
          const isAngry = pokeCount.current >= 5;
          const isMildlyIrritated = pokeCount.current >= 3;

          ctx.save();
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";

          if (isAngry) {
            ctx.strokeStyle = "#a855f7"; // purple angry eyes
            ctx.beginPath();
            // angry left: >
            ctx.moveTo(8, -3.5);
            ctx.lineTo(5.5, -2);
            ctx.lineTo(8, -0.5);
            // angry right: <
            ctx.moveTo(8, 3.5);
            ctx.lineTo(5.5, 2);
            ctx.lineTo(8, 0.5);
            ctx.stroke();
          } else if (isMildlyIrritated) {
            ctx.strokeStyle = "#06b6d4"; // cyan annoyed eyes
            ctx.beginPath();
            ctx.moveTo(7, -2.5);
            ctx.lineTo(5.5, -2.5);
            ctx.moveTo(7, 2.5);
            ctx.lineTo(5.5, 2.5);
            ctx.stroke();
          } else {
            // Closed peaceful crescent curved eyes to look soundly asleep
            ctx.strokeStyle = "#38bdf8"; 
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(6.5, -2.5, 1.5, Math.PI, 0, false); // bottom arch sweep
            ctx.arc(6.5, 2.5, 1.5, Math.PI, 0, false);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          // Active visual eyes
          let eyeColor = "#06b6d4"; // default Cyan
          if (emotion === "curious") eyeColor = "#38bdf8"; // active Cyan scan
          if (currentMode.current === "wakeup") eyeColor = "#a855f7"; // bright Purple wakeup

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

        // 14. FRONT NEST ENTRANCE SILK COVER WITH TRANSLUCENT WEB SHIELD 
        ctx.save();
        {
          const nestX = pX();
          const nestY = pY();
          
          ctx.shadowColor = "rgba(168, 85, 247, 0.35)";
          ctx.shadowBlur = 5;

          const nestBreathing = (currentMode.current === "sleeping" || currentMode.current === "sleeping_entry") 
            ? Math.sin(Date.now() * 0.0016) * 1.5 
            : 0;

          // Front cocoon shell geometry matching the back depth
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
          gradFront.addColorStop(1, "rgba(6, 182, 212, 0.65)"); 
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
          ctx.strokeStyle = "rgba(6, 182, 212, 0.65)"; 
          ctx.stroke();
        }
        ctx.restore();

        // 15. COZY SPEECH BUBBLE POPUPS
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
          if (ctx.roundRect) {
            ctx.roundRect(0, -bubbleH / 2, bubbleW, bubbleH, 6);
          } else {
            const rx = 0;
            const ry = -bubbleH / 2;
            const rw = bubbleW;
            const rh = bubbleH;
            const rr = 6;
            ctx.moveTo(rx + rr, ry);
            ctx.lineTo(rx + rw - rr, ry);
            ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
            ctx.lineTo(rx + rw, ry + rh - rr);
            ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
            ctx.lineTo(rx + rr, ry + rh);
            ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
            ctx.lineTo(rx, ry + rr);
            ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
          }
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

      } catch (err) {
        console.warn("STEMCompanion animation draw frame ignored error:", err);
      }

      // Loop forever
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

  // Keep background silent while the loading is active
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
