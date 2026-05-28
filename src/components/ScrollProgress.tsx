/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useSpring, useMotionValue } from "motion/react";
import { useEffect } from "react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      {/* Dynamic Cursor Light (Purple) */}
      <motion.div
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2 opacity-60"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />
      {/* Dynamic Cursor Light (Red) - Delayed Follow */}
      <motion.div
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          x: useSpring(mouseX, { damping: 40, stiffness: 100 }),
          y: useSpring(mouseY, { damping: 40, stiffness: 100 }),
        }}
      />
    </>
  );
}
