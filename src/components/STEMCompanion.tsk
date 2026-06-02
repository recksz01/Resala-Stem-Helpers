/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";

// Types represent spider physics & animation states
interface Leg {
  side: "left" | "right";
  index: number;
  // Current 3D-like foot position in world coordinates
  footX: number;
  footY: number;
  // Ideal world coordinate where the foot wants to rest relative to body
  idealX: number;
  idealY: number;
  // Progress of the active step [0..1]
  stepProgress: number;
  // Start position for the step transition
  stepStartX: number;
  stepStartY: number;
}

export default function STEMCompanion() {
  const [isDisabled, setIsDisabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core physics references (no React re-renders to ensure 100% buttery smoothness)
  const spiderPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const spiderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const spiderAngle = useRef(0);
  const spiderVel = useRef({ x: 0, y: 0 });
  const isWebShooting = useRef(false);
  const webTarget = useRef({ x: 0, y: 0 });
  const webProgress = useRef(0);

  // Procedural legs reference
  const legsRef = useRef<Leg[]>([]);

  useEffect(() => {
    if (isDisabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle full-screen resizing safely
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates dynamically
    const handleMouseMove = (e: MouseEvent) => {
      spiderTarget.current = { x: e.clientX, y: e.clientY };
    };

    // Track touch coordinates dynamically (dragging on phone)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        spiderTarget.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    // Click triggers web shoot and rapid acceleration
    const handleMouseClick = (e: MouseEvent) => {
      // Don't trigger if clicking the mute/dismiss button
      const target = e.target as HTMLElement;
      if (target && target.closest(".dismiss-btn")) return;

      webTarget.current = { x: e.clientX, y: e.clientY };
      spiderTarget.current = { x: e.clientX, y: e.clientY };
      isWebShooting.current = true;
      webProgress.current = 1.0;
    };

    // Touch tap triggers web shoot too on mobile
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest(".dismiss-btn")) return;

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        webTarget.current = { x: touch.clientX, y: touch.clientY };
        spiderTarget.current = { x: touch.clientX, y: touch.clientY };
        isWebShooting.current = true;
        webProgress.current = 1.0;
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
        footX: spiderPos.current.x - 50,
        footY: spiderPos.current.y + (i - 1.5) * 20,
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

    // Master Animation Loop
    let animationFrameId: number;

    const updateAndDraw = () => {
      const sp = spiderPos.current;
      const tg = spiderTarget.current;
      const vl = spiderVel.current;

      // 1. Compute physical movement and chasing force
      let dx = tg.x - sp.x;
      let dy = tg.y - sp.y;
      const distance = Math.hypot(dx, dy);

      // Web tether pulls the spider extremely fast to the point
      let attractionForce = isWebShooting.current ? 0.35 : 0.08;
      let maxSpeed = isWebShooting.current ? 35 : 18;
      
      if (distance > 15) {
        // Accelerate towards cursor
        vl.x += dx * attractionForce;
        vl.y += dy * attractionForce;

        // Limiter/friction
        const speed = Math.hypot(vl.x, vl.y);
        const friction = isWebShooting.current ? 0.95 : 0.78;
        vl.x *= friction;
        vl.y *= friction;

        if (speed > maxSpeed) {
          vl.x = (vl.x / speed) * maxSpeed;
          vl.y = (vl.y / speed) * maxSpeed;
        }

        // Apply position
        sp.x += vl.x;
        sp.y += vl.y;

        // Orient body towards vector direction
        const targetAngle = Math.atan2(dy, dx);
        
        // Wrap-around interpolation for rotation angle
        let diff = targetAngle - spiderAngle.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        spiderAngle.current += diff * 0.15;
      } else {
        // Smooth deceleration to idle
        vl.x *= 0.6;
        vl.y *= 0.6;
        sp.x += vl.x;
        sp.y += vl.y;
        
        // Gentle hover/breathing in idle
        sp.y += Math.sin(Date.now() * 0.005) * 0.25;
        
        if (isWebShooting.current) {
          isWebShooting.current = false;
        }
      }

      // Handle web laser fadeout
      if (isWebShooting.current && webProgress.current > 0) {
        webProgress.current -= 0.06;
        if (webProgress.current <= 0) {
          isWebShooting.current = false;
        }
      }

      // 2. Clear canvas with alpha trails or completely crisp transparent clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render web-thread if active
      if (isWebShooting.current && webProgress.current > 0) {
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(webTarget.current.x, webTarget.current.y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${webProgress.current})`;
        ctx.lineWidth = 3 * webProgress.current;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 3. Update procedurally animated legs
      const bodyAngle = spiderAngle.current;
      const legReach = 55; // maximum stretch size

      legsRef.current.forEach((leg) => {
        // Compute the structural attachment root coordinate on the cyber body
        const angleOffset = leg.side === "left" 
          ? legAnglesLeft[leg.index] * (Math.PI / 180)
          : legAnglesRight[leg.index] * (Math.PI / 180);

        const attachmentAngle = bodyAngle + angleOffset;
        
        // Leg root attachment point
        const rootX = sp.x + Math.cos(attachmentAngle) * 12;
        const rootY = sp.y + Math.sin(attachmentAngle) * 12;

        // Target resting position based on body orientation & motion vector
        // Splay legs outward to look more biological & scary-cool
        const splayAngle = bodyAngle + angleOffset * 1.3;
        leg.idealX = rootX + Math.cos(splayAngle) * legReach;
        leg.idealY = rootY + Math.sin(splayAngle) * legReach;

        // Distance from current foot anchor point in the room to its ideal target anchor
        const curDist = Math.hypot(leg.idealX - leg.footX, leg.idealY - leg.footY);

        // If the foot is stretched too far and not already in motion, start a step transition
        if (curDist > 45 && leg.stepProgress >= 1.0) {
          // Add rhythmic timing offsets: legs should step in pairs (gait patterns)
          // We check if other legs nearby are already stepping so they don't slide.
          const otherStepping = legsRef.current.some(
            (other) => other.side === leg.side && other.index !== leg.index && other.stepProgress < 0.6
          );

          if (!otherStepping || curDist > 85) {
            leg.stepStartX = leg.footX;
            leg.stepStartY = leg.footY;
            leg.stepProgress = 0.0;
          }
        }

        // Animate stepping motion using bezier interpolation for realistic lifelike scurry curve
        if (leg.stepProgress < 1.0) {
          // Increase step speed based on body movement velocity
          const stepSpeed = 0.12 + Math.min(0.18, Math.hypot(vl.x, vl.y) * 0.015);
          leg.stepProgress += stepSpeed;

          if (leg.stepProgress >= 1.0) {
            leg.stepProgress = 1.0;
            leg.footX = leg.idealX;
            leg.footY = leg.idealY;
          } else {
            // Spheroid arc (lift the leg up in z-axis equivalent while moving)
            const t = leg.stepProgress;
            // Interpolate position linearly X, Y
            const curX = leg.stepStartX + (leg.idealX - leg.stepStartX) * t;
            const curY = leg.stepStartY + (leg.idealY - leg.stepStartY) * t;
            
            // Add curved lift (y subtraction is up in screen space)
            const liftHeight = Math.sin(t * Math.PI) * 18;
            leg.footX = curX;
            leg.footY = curY - liftHeight;
          }
        }

        // --- DRAW COVETED SPIDER LEG STRUCTURE ---
        // Joint (Knee) computation - Inverse Kinematics approximation
        // The joint bends high and outwards to make the legs look mechanical
        const midX = (rootX + leg.footX) / 2;
        const midY = (rootY + leg.footY) / 2;
        
        // Perpendicular offset unit vector to form a structural knee bend
        const dxFoot = leg.footX - rootX;
        const dyFoot = leg.footY - rootY;
        const footLen = Math.hypot(dxFoot, dyFoot);
        
        const perpX = -dyFoot / (footLen || 1);
        const perpY = dxFoot / (footLen || 1);

        // Knee bends higher up the body
        const bendOffset = leg.side === "left" ? -22 : 22;
        const jointX = midX + perpX * bendOffset;
        const jointY = midY + perpY * bendOffset - 12; // lift joint upwards for arachnid posture

        // Draw upper leg segment (Thigh / Coxa)
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(jointX, jointY);
        ctx.strokeStyle = "#1e293b"; // Dark slate metal
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.strokeStyle = "#6b21a8"; // Purple accent
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw lower leg segment (Shin / Tibia) to anchor point
        ctx.beginPath();
        ctx.moveTo(jointX, jointY);
        ctx.lineTo(leg.footX, leg.footY);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.strokeStyle = "#ef4444"; // Red claw tips
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw glowing tip indicator (tarsus point)
        ctx.beginPath();
        ctx.arc(leg.footX, leg.footY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 4. DRAW CENTRAL ROBOTIC GLOWING BODY
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(bodyAngle);

      // Outer metal frame
      ctx.beginPath();
      // Draw sleek aerodynamic almond shaped bio-hull
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = "linear-gradient(135deg, #475569, #1e293b)";
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Mechanical cyber core carapace shield
      ctx.beginPath();
      ctx.arc(-3, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      // Cyber purple glowing reactor light (Center Core)
      ctx.beginPath();
      ctx.arc(-3, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#a855f7";
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Front visor plate (eyes facing forward)
      ctx.beginPath();
      ctx.ellipse(10, 0, 4, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      
      // Dual infrared sensor eyes (glowing red)
      // Left micro-eye
      ctx.beginPath();
      ctx.arc(9, -3, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 6;
      ctx.fill();
      
      // Right micro-eye
      ctx.beginPath();
      ctx.arc(9, 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      ctx.restore();

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
  }, [isDisabled]);

  if (isDisabled) {
    return (
      <button
        onClick={() => setIsDisabled(false)}
        className="fixed bottom-4 right-4 bg-purple-950/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-purple-500/40 flex items-center gap-1.5 cursor-pointer hover:bg-purple-900 transition-all z-[9999] shadow-[0_0_20px_rgba(107,33,168,0.6)] animate-bounce"
        dir="rtl"
      >
        <span>🕷️</span> تشغيل العنكبوت المطور
      </button>
    );
  }

  return (
    <>
      {/* Full screen canvas for smooth vector rendering */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999] select-none"
        style={{ width: "100%", height: "100%" }}
      />
      
      {/* Elegant controller toggle to hide/dismiss the spider */}
      <div className="fixed bottom-4 right-4 z-[10000] dismiss-btn">
        <button
          onClick={() => setIsDisabled(true)}
          className="bg-[#0f172a]/95 hover:bg-red-950/90 border border-slate-700/60 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-lg"
          title="إخفاء العنكبوت مؤقتاً"
          dir="rtl"
        >
          <span>🕷️</span> تعطيل العنكبوت
        </button>
      </div>
    </>
  );
}
